import { notFound } from "next/navigation";
import { AdminPageHeader } from "@/components/admin/shared/AdminPageHeader";
import { InvoicePrintButton } from "@/components/admin/invoices/InvoicePrintButton";
import { getSupabaseServerClient } from "@/lib/supabase/server";

export default async function InvoiceDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await getSupabaseServerClient();

  const { data: invoice } = await supabase
    .from("invoices")
    .select(
      "id,invoice_number,invoice_date,subtotal,discount_amount,total_amount,amount_paid,amount_pending,status,bookings(id,booking_code,check_in_date,check_out_date,nights,adults,children,infants,total_amount,discount_amount,extra_charges_total,final_total,amount_paid,amount_pending,guest:booking_guests!bookings_booking_guest_id_fkey(full_name,phone),cottages(name))",
    )
    .eq("id", id)
    .maybeSingle();

  if (!invoice) notFound();

  const bookingRaw = Array.isArray(invoice.bookings) ? invoice.bookings[0] : invoice.bookings;
  const booking = (bookingRaw ?? {}) as Record<string, unknown>;
  const bookingId = String(booking.id ?? "");

  const [{ data: charges }, { data: payments }] = await Promise.all([
    supabase.from("booking_charges").select("charge_type,description,quantity,unit_price,amount").eq("booking_id", bookingId).order("created_at"),
    supabase.from("booking_payments").select("payment_date,payment_type,payment_mode,amount,reference_number,notes").eq("booking_id", bookingId).order("created_at"),
  ]);

  return (
    <div className="space-y-4">
      <AdminPageHeader title={`Invoice ${String(invoice.invoice_number ?? "")}`} description="Printable billing statement for resort staff." />
      <div className="rounded-2xl border border-[#ddd4c6] bg-white p-5 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#eee6da] pb-3">
          <div>
            <h2 className="text-2xl font-semibold text-[#1f442f]">La Ki Trep Resort</h2>
            <p className="text-sm text-[#58675d]">Invoice #{String(invoice.invoice_number ?? "-")}</p>
          </div>
          <InvoicePrintButton />
        </div>

        <div className="mt-4 grid gap-3 text-sm md:grid-cols-2">
          <p><strong>Invoice Date:</strong> {String(invoice.invoice_date ?? "-")}</p>
          <p><strong>Booking Code:</strong> {String(booking.booking_code ?? "-")}</p>
          <p><strong>Guest:</strong> {String((booking.guest as { full_name?: string } | null)?.full_name ?? "-")}</p>
          <p><strong>Phone:</strong> {String((booking.guest as { phone?: string } | null)?.phone ?? "-")}</p>
          <p><strong>Cottage:</strong> {String((booking.cottages as { name?: string } | null)?.name ?? "-")}</p>
          <p><strong>Stay:</strong> {String(booking.check_in_date ?? "-")} → {String(booking.check_out_date ?? "-")}</p>
          <p><strong>Nights:</strong> {String(booking.nights ?? "-")}</p>
          <p><strong>Guests:</strong> {Number(booking.adults ?? 0) + Number(booking.children ?? 0) + Number(booking.infants ?? 0)}</p>
        </div>

        <div className="mt-4 overflow-hidden rounded-xl border border-[#e5dccf]">
          <table className="w-full text-sm">
            <tbody>
              <tr className="border-b border-[#eee6da]"><td className="px-3 py-2">Room Charges</td><td className="px-3 py-2 text-right">₹{Number(booking.total_amount ?? 0).toLocaleString("en-IN")}</td></tr>
              <tr className="border-b border-[#eee6da]"><td className="px-3 py-2">Extra Charges</td><td className="px-3 py-2 text-right">₹{Number(booking.extra_charges_total ?? 0).toLocaleString("en-IN")}</td></tr>
              <tr className="border-b border-[#eee6da]"><td className="px-3 py-2">Discount</td><td className="px-3 py-2 text-right">-₹{Number(booking.discount_amount ?? 0).toLocaleString("en-IN")}</td></tr>
              <tr className="border-b border-[#eee6da] bg-[#f2f8f2] font-semibold"><td className="px-3 py-2">Final Total</td><td className="px-3 py-2 text-right">₹{Number(booking.final_total ?? 0).toLocaleString("en-IN")}</td></tr>
              <tr className="border-b border-[#eee6da]"><td className="px-3 py-2">Amount Paid</td><td className="px-3 py-2 text-right">₹{Number(booking.amount_paid ?? 0).toLocaleString("en-IN")}</td></tr>
              <tr className="bg-[#fff4e8] font-semibold text-[#b95a00]"><td className="px-3 py-2">Pending Amount</td><td className="px-3 py-2 text-right">₹{Number(booking.amount_pending ?? 0).toLocaleString("en-IN")}</td></tr>
            </tbody>
          </table>
        </div>

        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <div>
            <h3 className="font-semibold text-[#1f442f]">Extra Charges</h3>
            {(charges ?? []).length === 0 ? <p className="text-sm text-[#66766b]">No extra charges added yet.</p> : (
              <ul className="mt-2 space-y-1 text-sm">
                {(charges ?? []).map((charge, idx) => (
                  <li key={idx}>{String(charge.description ?? charge.charge_type ?? "Charge")}: ₹{Number(charge.amount ?? 0).toLocaleString("en-IN")}</li>
                ))}
              </ul>
            )}
          </div>
          <div>
            <h3 className="font-semibold text-[#1f442f]">Payment History</h3>
            {(payments ?? []).length === 0 ? <p className="text-sm text-[#66766b]">No payments recorded yet.</p> : (
              <ul className="mt-2 space-y-1 text-sm">
                {(payments ?? []).map((payment, idx) => (
                  <li key={idx}>{String(payment.payment_date ?? "-")} — {String(payment.payment_type ?? "-").replaceAll("_", " ")} ({String(payment.payment_mode ?? "-")}) ₹{Number(payment.amount ?? 0).toLocaleString("en-IN")}</li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
