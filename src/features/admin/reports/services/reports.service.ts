import { unstable_noStore as noStore } from "next/cache";
import { enumerateDates, outstandingAmount } from "../reports.utils";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import type { ReportDataset } from "../reports.types";
import {
  toEndOfDayIso,
  toNumber,
  toStartOfDayIso,
} from "../reports.utils";

type CheckInOutFilters = {
  from?: string;
  to?: string;
  q?: string;
  cottageId?: string;
  paymentStatus?: string;
};

function first<T>(value: Relation<T>): T | null {
  if (Array.isArray(value)) return value[0] ?? null;
  return value ?? null;
}

function cleanText(value: unknown, fallback = "—") {
  if (value === null || value === undefined || value === "") return fallback;
  return String(value);
}

function amountValue(...values: unknown[]) {
  for (const value of values) {
    if (value !== null && value !== undefined && value !== "") {
      return toNumber(value);
    }
  }

  return 0;
}

export async function getCheckInCheckoutReportDataset(
  filters: CheckInOutFilters,
) {
  noStore();

  const supabase = await getSupabaseServerClient();

  const from = filters.from || new Date().toISOString().slice(0, 10);
  const to = filters.to || from;

  let query = supabase
    .from("bookings")
    .select(
      `
      id,
      booking_code,
      status,
      source,
      payment_status,
      check_in_date,
      check_out_date,
      created_at,
      adults,
      children,
      infants,
      total_amount,
      discount_amount,
      extra_charges_total,
      final_total,
      amount_paid,
      amount_pending,
      cottage_id,
      booking_guest_id,
      guest:booking_guests!bookings_booking_guest_id_fkey(
        full_name,
        phone,
        email
      ),
      cottages(
        id,
        name
      )
    `,
    )
    .or(
      `and(check_in_date.gte.${from},check_in_date.lte.${to}),and(check_out_date.gte.${from},check_out_date.lte.${to})`,
    )
    .order("check_in_date", { ascending: true })
    .limit(5000);

  if (filters.cottageId && filters.cottageId !== "all") {
    query = query.eq("cottage_id", filters.cottageId);
  }

  if (filters.paymentStatus && filters.paymentStatus !== "all") {
    query = query.eq("payment_status", filters.paymentStatus);
  }

  const [bookingsRes, cottagesRes] = await Promise.all([
    query,
    supabase.from("cottages").select("id,name").order("name"),
  ]);

  if (bookingsRes.error) {
    throw new Error(
      `Failed to load check-in/check-out report: ${bookingsRes.error.message}`,
    );
  }

  if (cottagesRes.error) {
    throw new Error(`Failed to load cottages: ${cottagesRes.error.message}`);
  }

  const bookings = bookingsRes.data ?? [];

  const bookingIds = bookings.map((booking) => String(booking.id));

  let paymentRows: { booking_id: string | null; amount: number | null }[] = [];

  if (bookingIds.length > 0) {
    const paymentsRes = await supabase
      .from("booking_payments")
      .select("booking_id,amount,payment_type")
      .in("booking_id", bookingIds)
      .limit(10000);

    if (!paymentsRes.error) {
      paymentRows = paymentsRes.data ?? [];
    }
  }

  const paidByBookingId = new Map<string, number>();

  for (const payment of paymentRows) {
    const bookingId = String(payment.booking_id ?? "");
    if (!bookingId) continue;

    paidByBookingId.set(
      bookingId,
      (paidByBookingId.get(bookingId) ?? 0) + toNumber(payment.amount),
    );
  }

  const rows = bookings.map((booking) => {
    const guest = first(
      booking.guest as Relation<{
        full_name?: string;
        phone?: string;
        email?: string;
      }>,
    );

    const cottage = first(
      booking.cottages as Relation<{
        id?: string;
        name?: string;
      }>,
    );

    const baseAmount = amountValue(booking.total_amount);
    const extraCharges = amountValue(booking.extra_charges_total);
    const discount = amountValue(booking.discount_amount);
    const calculatedFinal = Math.max(0, baseAmount + extraCharges - discount);

    const finalBill = amountValue(
      booking.final_total,
      booking.amount_pending && booking.amount_paid
        ? toNumber(booking.amount_pending) + toNumber(booking.amount_paid)
        : undefined,
      calculatedFinal,
      booking.total_amount,
    );

    const paidAmount =
      paidByBookingId.get(String(booking.id)) ??
      amountValue(booking.amount_paid);

    const balance = outstandingAmount(finalBill, paidAmount);

    return {
      id: String(booking.id),
      bookingId: String(booking.id),
      bookingCode: cleanText(booking.booking_code),
      guestName: cleanText(guest?.full_name),
      phone: cleanText(guest?.phone),
      cottageId: cleanText(cottage?.id || booking.cottage_id, ""),
      cottageName: cleanText(cottage?.name),
      checkIn: cleanText(booking.check_in_date),
      checkOut: cleanText(booking.check_out_date),
      guests:
        amountValue(booking.adults) +
        amountValue(booking.children) +
        amountValue(booking.infants),
      bookingStatus: cleanText(booking.status),
      paymentStatus: cleanText(booking.payment_status),
      finalBill,
      paidAmount,
      balance,
      source: cleanText(booking.source),
      action: "billing",
    };
  });

  const q = String(filters.q ?? "").trim().toLowerCase();

  const filteredRows = q
    ? rows.filter((row) =>
        [
          row.bookingCode,
          row.guestName,
          row.phone,
          row.cottageName,
          row.source,
        ].some((value) => String(value).toLowerCase().includes(q)),
      )
    : rows;

  const arrivals = filteredRows.filter(
    (row) => row.checkIn >= from && row.checkIn <= to,
  );

  const departures = filteredRows.filter(
    (row) => row.checkOut >= from && row.checkOut <= to,
  );

  return {
    rows: filteredRows,
    arrivals,
    departures,
    cottages: (cottagesRes.data ?? []).map((cottage) => ({
      id: String(cottage.id),
      name: String(cottage.name ?? "—"),
    })),
  };
}

type Relation<T> = T | T[] | null | undefined;

function one<T>(value: Relation<T>): T | null {
  if (Array.isArray(value)) return value[0] ?? null;
  return value ?? null;
}

function text(value: unknown, fallback = "—") {
  if (value === null || value === undefined || value === "") return fallback;
  return String(value);
}

function amountFrom(...values: unknown[]) {
  for (const value of values) {
    if (value !== null && value !== undefined && value !== "") {
      return toNumber(value);
    }
  }

  return 0;
}

export type RevenueReportFilters = {
  from?: string;
  to?: string;
  q?: string;
  cottageId?: string;
  paymentMethod?: string;
  paymentStatus?: string;
};

export async function getRevenueReportDataset(filters: RevenueReportFilters) {
  noStore();

  const supabase = await getSupabaseServerClient();

  const fromIso = toStartOfDayIso(filters.from);
  const toIso = toEndOfDayIso(filters.to);

  let bookingsQuery = supabase
    .from("bookings")
    .select(
      `
      id,
      booking_code,
      source,
      status,
      payment_status,
      check_in_date,
      check_out_date,
      created_at,
      nights,
      adults,
      children,
      infants,
      total_amount,
      discount_amount,
      extra_charges_total,
      final_total,
      amount_paid,
      amount_pending,
      cottage_id,
      booking_guest_id,
      guest:booking_guests!bookings_booking_guest_id_fkey(
        full_name,
        phone,
        email
      ),
      cottages(
        id,
        name
      ),
      invoices(
        invoice_number,
        invoice_date,
        status,
        tax_amount,
        created_at
      )
    `,
    )
    .order("created_at", { ascending: false })
    .limit(5000);

  if (fromIso) bookingsQuery = bookingsQuery.gte("created_at", fromIso);
  if (toIso) bookingsQuery = bookingsQuery.lte("created_at", toIso);

  if (filters.cottageId && filters.cottageId !== "all") {
    bookingsQuery = bookingsQuery.eq("cottage_id", filters.cottageId);
  }

  if (filters.paymentStatus && filters.paymentStatus !== "all") {
    bookingsQuery = bookingsQuery.eq("payment_status", filters.paymentStatus);
  }

  let paymentsQuery = supabase
    .from("booking_payments")
    .select(
      `
      id,
      booking_id,
      created_at,
      payment_date,
      amount,
      payment_mode,
      payment_type,
      reference_number,
      notes,
      received_by,
      bookings(
        id,
        booking_code,
        cottage_id,
        payment_status,
        guest:booking_guests!bookings_booking_guest_id_fkey(
          full_name,
          phone
        ),
        cottages(
          id,
          name
        )
      )
    `,
    )
    .order("created_at", { ascending: false })
    .limit(5000);

  if (fromIso) paymentsQuery = paymentsQuery.gte("created_at", fromIso);
  if (toIso) paymentsQuery = paymentsQuery.lte("created_at", toIso);

  if (filters.paymentMethod && filters.paymentMethod !== "all") {
    paymentsQuery = paymentsQuery.eq("payment_mode", filters.paymentMethod);
  }

  let chargesQuery = supabase
    .from("booking_charges")
    .select(
      `
      id,
      booking_id,
      charge_type,
      description,
      amount,
      created_at,
      bookings(
        id,
        booking_code,
        cottage_id,
        guest:booking_guests!bookings_booking_guest_id_fkey(
          full_name,
          phone
        ),
        cottages(
          id,
          name
        )
      )
    `,
    )
    .order("created_at", { ascending: false })
    .limit(5000);

  if (fromIso) chargesQuery = chargesQuery.gte("created_at", fromIso);
  if (toIso) chargesQuery = chargesQuery.lte("created_at", toIso);

  const [bookingsRes, paymentsRes, chargesRes, cottagesRes] =
    await Promise.all([
      bookingsQuery,
      paymentsQuery,
      chargesQuery,
      supabase
        .from("cottages")
        .select("id,name,status,is_bookable")
        .order("name"),
    ]);

  if (bookingsRes.error) {
    throw new Error(`Failed to load revenue bookings: ${bookingsRes.error.message}`);
  }

  if (paymentsRes.error) {
    throw new Error(`Failed to load revenue payments: ${paymentsRes.error.message}`);
  }

  if (chargesRes.error) {
    throw new Error(`Failed to load revenue charges: ${chargesRes.error.message}`);
  }

  if (cottagesRes.error) {
    throw new Error(`Failed to load cottages: ${cottagesRes.error.message}`);
  }

  const rawBookings = bookingsRes.data ?? [];
  const rawPayments = paymentsRes.data ?? [];
  const rawCharges = chargesRes.data ?? [];

  const selectedBookingIds = rawBookings.map((booking) => String(booking.id));

  let allPaymentsForSelectedBookings: {
    booking_id: string | null;
    amount: number | null;
    payment_type: string | null;
  }[] = [];

  if (selectedBookingIds.length > 0) {
    const allPaymentsRes = await supabase
      .from("booking_payments")
      .select("booking_id,amount,payment_type")
      .in("booking_id", selectedBookingIds)
      .limit(10000);

    if (!allPaymentsRes.error) {
      allPaymentsForSelectedBookings = allPaymentsRes.data ?? [];
    }
  }

  const paidByBookingId = new Map<string, number>();

  for (const payment of allPaymentsForSelectedBookings) {
    const bookingId = String(payment.booking_id ?? "");
    if (!bookingId) continue;

    const paymentType = String(payment.payment_type ?? "");
    const amount = toNumber(payment.amount);

    const signedAmount = paymentType === "refund" ? -amount : amount;

    paidByBookingId.set(
      bookingId,
      (paidByBookingId.get(bookingId) ?? 0) + signedAmount,
    );
  }

  let revenueRows = rawBookings.map((row) => {
    const guest = one(row.guest as Relation<{ full_name?: string; phone?: string; email?: string }>);
    const cottage = one(row.cottages as Relation<{ id?: string; name?: string }>);
    const invoice = one(row.invoices as Relation<{
      invoice_number?: string;
      invoice_date?: string;
      status?: string;
      tax_amount?: number;
      created_at?: string;
    }>);

    const baseAmount = amountFrom(row.total_amount);
    const extraCharges = amountFrom(row.extra_charges_total);
    const discount = amountFrom(row.discount_amount);
    const tax = amountFrom(invoice?.tax_amount);

    const calculatedFinal = Math.max(0, baseAmount + extraCharges + tax - discount);

    const finalBill = amountFrom(
      row.final_total,
      row.amount_pending && row.amount_paid
        ? toNumber(row.amount_pending) + toNumber(row.amount_paid)
        : undefined,
      calculatedFinal,
      row.total_amount,
    );

    const bookingId = String(row.id);
    const paidAmount =
      paidByBookingId.get(bookingId) ?? amountFrom(row.amount_paid);

    const pendingAmount = outstandingAmount(finalBill, paidAmount);

    return {
      id: bookingId,
      bookingId,
      createdAt: text(row.created_at, ""),
      createdDate: text(row.created_at, ""),
      bookingCode: text(row.booking_code),
      guestName: text(guest?.full_name),
      phone: text(guest?.phone),
      email: text(guest?.email),
      cottageId: text(cottage?.id, ""),
      cottageName: text(cottage?.name),
      source: text(row.source, "other"),
      bookingStatus: text(row.status, "pending"),
      paymentStatus: text(row.payment_status, "unpaid"),
      checkIn: text(row.check_in_date),
      checkOut: text(row.check_out_date),
      nights: amountFrom(row.nights),
      guests:
        amountFrom(row.adults) +
        amountFrom(row.children) +
        amountFrom(row.infants),
      roomAmount: baseAmount,
      extraCharges,
      discount,
      tax,
      finalBill,
      paidAmount,
      outstanding: pendingAmount,
      invoiceNumber: text(invoice?.invoice_number, "Not generated"),
      invoiceStatus: text(invoice?.status, "not_generated"),
      action: "billing",
    };
  });

  let paymentRows = rawPayments.map((row) => {
    const booking = one(row.bookings as Relation<{
      id?: string;
      booking_code?: string;
      cottage_id?: string;
      payment_status?: string;
      guest?: { full_name?: string; phone?: string };
      cottages?: { id?: string; name?: string };
    }>);

    const guest = booking?.guest;
    const cottage = one(booking?.cottages as Relation<{ id?: string; name?: string }>);

    return {
      id: String(row.id),
      bookingId: text(row.booking_id, ""),
      createdAt: text(row.created_at, ""),
      paymentDate: text(row.created_at || row.payment_date, ""),
      bookingCode: text(booking?.booking_code),
      guestName: text(guest?.full_name),
      phone: text(guest?.phone),
      cottageId: text(cottage?.id || booking?.cottage_id, ""),
      cottageName: text(cottage?.name),
      paymentMethod: text(row.payment_mode, "other"),
      paymentType: text(row.payment_type, "part_payment"),
      amountPaid: amountFrom(row.amount),
      paymentStatus: row.payment_type === "refund" ? "refunded" : "received",
      bookingPaymentStatus: text(booking?.payment_status, "unpaid"),
      reference: text(row.reference_number),
      remarks: text(row.notes),
    };
  });

  let extraChargeRows = rawCharges.map((row) => {
    const booking = one(row.bookings as Relation<{
      id?: string;
      booking_code?: string;
      cottage_id?: string;
      guest?: { full_name?: string; phone?: string };
      cottages?: { id?: string; name?: string };
    }>);

    const guest = booking?.guest;
    const cottage = one(booking?.cottages as Relation<{ id?: string; name?: string }>);

    return {
      id: String(row.id),
      bookingId: text(row.booking_id, ""),
      createdAt: text(row.created_at, ""),
      createdDate: text(row.created_at, ""),
      bookingCode: text(booking?.booking_code),
      guestName: text(guest?.full_name),
      phone: text(guest?.phone),
      cottageId: text(cottage?.id || booking?.cottage_id, ""),
      cottageName: text(cottage?.name),
      chargeType: text(row.charge_type, "other"),
      description: text(row.description),
      amount: amountFrom(row.amount),
    };
  });

  const q = String(filters.q ?? "").trim().toLowerCase();

  const matchesSearch = (values: unknown[]) => {
    if (!q) return true;
    return values.some((value) =>
      String(value ?? "").toLowerCase().includes(q),
    );
  };

  if (q) {
    revenueRows = revenueRows.filter((row) =>
      matchesSearch([
        row.bookingCode,
        row.guestName,
        row.phone,
        row.cottageName,
        row.invoiceNumber,
        row.source,
      ]),
    );

    paymentRows = paymentRows.filter((row) =>
      matchesSearch([
        row.bookingCode,
        row.guestName,
        row.phone,
        row.cottageName,
        row.paymentMethod,
        row.reference,
      ]),
    );

    extraChargeRows = extraChargeRows.filter((row) =>
      matchesSearch([
        row.bookingCode,
        row.guestName,
        row.phone,
        row.cottageName,
        row.chargeType,
        row.description,
      ]),
    );
  }

  if (filters.cottageId && filters.cottageId !== "all") {
    paymentRows = paymentRows.filter(
      (row) => row.cottageId === filters.cottageId,
    );

    extraChargeRows = extraChargeRows.filter(
      (row) => row.cottageId === filters.cottageId,
    );
  }

  if (filters.paymentStatus && filters.paymentStatus !== "all") {
    paymentRows = paymentRows.filter(
      (row) => row.bookingPaymentStatus === filters.paymentStatus,
    );
  }

  const paymentMethodBookingIds =
    filters.paymentMethod && filters.paymentMethod !== "all"
      ? new Set(paymentRows.map((row) => row.bookingId))
      : null;

  if (paymentMethodBookingIds) {
    revenueRows = revenueRows.filter((row) =>
      paymentMethodBookingIds.has(row.bookingId),
    );
  }

  const discountRows = revenueRows
    .filter((row) => row.discount > 0)
    .map((row) => ({
      id: row.id,
      bookingId: row.bookingId,
      createdAt: row.createdAt,
      createdDate: row.createdDate,
      bookingCode: row.bookingCode,
      guestName: row.guestName,
      cottageName: row.cottageName,
      originalAmount: row.roomAmount + row.extraCharges + row.tax,
      discountAmount: row.discount,
      discountReason: "—",
      finalAmount: row.finalBill,
    }));

  const outstandingRows = revenueRows
    .filter((row) => row.outstanding > 0)
    .map((row) => ({
      id: row.id,
      bookingId: row.bookingId,
      bookingCode: row.bookingCode,
      guestName: row.guestName,
      phone: row.phone,
      cottageName: row.cottageName,
      finalBill: row.finalBill,
      paidAmount: row.paidAmount,
      pendingAmount: row.outstanding,
      paymentStatus: row.paymentStatus,
      action: "billing",
    }));

  const totalRevenue = revenueRows.reduce((sum, row) => sum + row.finalBill, 0);
  const totalCollection = paymentRows.reduce(
    (sum, row) =>
      sum + (row.paymentType === "refund" ? -row.amountPaid : row.amountPaid),
    0,
  );
  const outstandingTotal = revenueRows.reduce(
    (sum, row) => sum + row.outstanding,
    0,
  );
  const extraChargesTotal = extraChargeRows.reduce(
    (sum, row) => sum + row.amount,
    0,
  );
  const discountTotal = discountRows.reduce(
    (sum, row) => sum + row.discountAmount,
    0,
  );

  const paidBookingsCount = revenueRows.filter(
    (row) => row.outstanding <= 0 && row.finalBill > 0,
  ).length;

  const pendingBookingsCount = revenueRows.filter(
    (row) => row.outstanding > 0,
  ).length;

  const paymentMethods = Array.from(
    new Set(paymentRows.map((row) => row.paymentMethod).filter(Boolean)),
  ).map((method) => {
    const rows = paymentRows.filter((row) => row.paymentMethod === method);
    return {
      id: method,
      method,
      amount: rows.reduce((sum, row) => sum + row.amountPaid, 0),
      count: rows.length,
    };
  });

  const cottageBreakdown = Array.from(
    new Set(revenueRows.map((row) => row.cottageId).filter(Boolean)),
  ).map((cottageId) => {
    const rows = revenueRows.filter((row) => row.cottageId === cottageId);

    return {
      id: cottageId,
      cottageName: rows[0]?.cottageName ?? "—",
      revenue: rows.reduce((sum, row) => sum + row.finalBill, 0),
      collection: rows.reduce((sum, row) => sum + row.paidAmount, 0),
      outstanding: rows.reduce((sum, row) => sum + row.outstanding, 0),
      bookings: rows.length,
    };
  });

  return {
    summary: {
      totalRevenue,
      totalCollection,
      outstandingTotal,
      extraChargesTotal,
      discountTotal,
      netRevenue: totalRevenue,
      paidBookingsCount,
      pendingBookingsCount,
      bookingCount: revenueRows.length,
    },
    revenueRows,
    paymentRows,
    extraChargeRows,
    discountRows,
    outstandingRows,
    paymentMethods,
    cottageBreakdown,
    cottages: (cottagesRes.data ?? []).map((cottage) => ({
      id: String(cottage.id),
      name: String(cottage.name ?? "—"),
    })),
    lastUpdated: new Date().toISOString(),
  };
}

export async function getReportDataset(from?: string, to?: string): Promise<ReportDataset> {
  noStore();
  const supabase = await getSupabaseServerClient();
  let bookingsQuery = supabase
    .from("bookings")
    .select("id,booking_code,source,status,payment_status,check_in_date,check_out_date,created_at,nights,adults,children,infants,total_amount,discount_amount,extra_charges_total,final_total,amount_paid,amount_pending,actual_check_out_at,guest:booking_guests!bookings_booking_guest_id_fkey(full_name,phone,email),cottages(id,name),invoices(invoice_number,invoice_date,status,tax_amount)")
    .order("created_at", { ascending: false })
    .limit(5000);

  if (from) bookingsQuery = bookingsQuery.gte("check_in_date", from);
  if (to) bookingsQuery = bookingsQuery.lte("check_out_date", to);

  const [bookingsRes, paymentsRes, chargesRes, cottagesRes, blocksRes] = await Promise.all([
    bookingsQuery,
    supabase.from("booking_payments").select("id,booking_id,payment_date,amount,payment_mode,payment_type,reference_number,notes,received_by,bookings(booking_code,guest:booking_guests!bookings_booking_guest_id_fkey(full_name,phone))").order("payment_date", { ascending: false }).limit(5000),
    supabase.from("booking_charges").select("id,booking_id,charge_type,description,amount,created_at,bookings(booking_code,guest:booking_guests!bookings_booking_guest_id_fkey(full_name),cottages(name))").order("created_at", { ascending: false }).limit(5000),
    supabase.from("cottages").select("id,name,status,is_bookable").order("name"),
    supabase.from("cottage_blocks").select("cottage_id,start_date,end_date").limit(5000),
  ]);

  if (bookingsRes.error) throw new Error(`Failed to load report bookings: ${bookingsRes.error.message}`);
  if (paymentsRes.error) throw new Error(`Failed to load report payments: ${paymentsRes.error.message}`);
  if (chargesRes.error) throw new Error(`Failed to load report charges: ${chargesRes.error.message}`);

  const bookings = (bookingsRes.data ?? []).map((row) => {
    const invoice = Array.isArray(row.invoices) ? row.invoices[0] : null;
    return {
      id: String(row.id),
      bookingCode: String(row.booking_code ?? "-"),
      guestName: String((row.guest as { full_name?: string } | null)?.full_name ?? "-"),
      phone: String((row.guest as { phone?: string } | null)?.phone ?? "-"),
      email: String((row.guest as { email?: string } | null)?.email ?? "-"),
      cottageId: String((row.cottages as { id?: string } | null)?.id ?? ""),
      cottageName: String((row.cottages as { name?: string } | null)?.name ?? "-"),
      source: String(row.source ?? "other"),
      status: String(row.status ?? "pending"),
      paymentStatus: String(row.payment_status ?? "unpaid"),
      checkIn: String(row.check_in_date ?? "-"),
      checkOut: String(row.check_out_date ?? "-"),
      createdAt: String(row.created_at ?? ""),
      nights: Number(row.nights ?? 0),
      adults: Number(row.adults ?? 0),
      children: Number(row.children ?? 0),
      totalGuests: Number(row.adults ?? 0) + Number(row.children ?? 0) + Number(row.infants ?? 0),
      baseAmount: Number(row.total_amount ?? 0),
      extraCharges: Number(row.extra_charges_total ?? 0),
      discount: Number(row.discount_amount ?? 0),
      tax: Number((invoice as { tax_amount?: number } | null)?.tax_amount ?? 0),
      finalAmount: Number(row.final_total ?? row.total_amount ?? 0),
      paidAmount: Number(row.amount_paid ?? 0),
      outstandingAmount: outstandingAmount(Number(row.final_total ?? 0), Number(row.amount_paid ?? 0)),
      invoiceNumber: String((invoice as { invoice_number?: string } | null)?.invoice_number ?? "Not generated"),
      invoiceDate: String((invoice as { invoice_date?: string } | null)?.invoice_date ?? "—"),
      invoiceStatus: String((invoice as { status?: string } | null)?.status ?? "not_generated"),
      cancelledDate: row.status === "cancelled" ? String(row.actual_check_out_at ?? row.created_at ?? "") : "",
    };
  });

  const payments = (paymentsRes.data ?? []).map((row) => ({
    id: String(row.id),
    paymentDate: String(row.payment_date ?? "-"),
    bookingCode: String((row.bookings as { booking_code?: string } | null)?.booking_code ?? "-"),
    guestName: String(((row.bookings as { guest?: { full_name?: string } } | null)?.guest?.full_name) ?? "-"),
    phone: String(((row.bookings as { guest?: { phone?: string } } | null)?.guest?.phone) ?? "-"),
    method: String(row.payment_mode ?? "other"),
    paymentType: String(row.payment_type ?? "part_payment"),
    amount: Number(row.amount ?? 0),
    collectedBy: row.received_by ? "Admin" : "—",
    transactionReference: String(row.reference_number ?? "—"),
    status: row.payment_type === "refund" ? "refunded" : "received",
    remarks: String(row.notes ?? "—"),
  }));

  const charges = (chargesRes.data ?? []).map((row) => ({
    id: String(row.id),
    bookingCode: String((row.bookings as { booking_code?: string } | null)?.booking_code ?? "-"),
    guestName: String(((row.bookings as { guest?: { full_name?: string } } | null)?.guest?.full_name) ?? "-"),
    cottage: String(((row.bookings as { cottages?: { name?: string } } | null)?.cottages?.name) ?? "-"),
    chargeType: String(row.charge_type ?? "other"),
    description: String(row.description ?? "—"),
    amount: Number(row.amount ?? 0),
    dateAdded: String(row.created_at ?? "-"),
  }));

  const blockRangeStart = from ?? new Date().toISOString().slice(0, 10);
  const blockRangeEnd = to ?? new Date(Date.now() + 1000 * 60 * 60 * 24 * 90).toISOString().slice(0, 10);

  const blockedNights = (blocksRes.data ?? []).flatMap((block) => {
    const start = String(block.start_date ?? "");
    const end = String(block.end_date ?? "");
    if (!start || !end) return [];
    return enumerateDates(start, end).map((date) => ({ cottageId: String(block.cottage_id), date }));
  }).filter((row) => row.date >= blockRangeStart && row.date <= blockRangeEnd);

  const limitations: string[] = [];
  if (!charges.length) limitations.push("No extra charges are currently recorded for this range.");
  if (!bookings.some((row) => row.discount > 0)) limitations.push("Discount reason / approved by fields are not tracked in current schema.");
  if (!bookings.some((row) => row.status === "cancelled")) limitations.push("Cancellation reason and cancelled-by fields are not available in the current schema.");

  return {
    bookings,
    payments,
    charges,
    cottages: (cottagesRes.data ?? []).map((c) => ({ id: String(c.id), name: String(c.name ?? "-"), status: String(c.status ?? "inactive"), isBookable: Boolean(c.is_bookable) })),
    blockedNights,
    lastUpdated: new Date().toISOString(),
    limitations,
  };
}

