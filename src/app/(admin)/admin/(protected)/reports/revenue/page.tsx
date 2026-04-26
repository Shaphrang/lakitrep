import { AdminPageHeader } from "@/components/admin/shared/AdminPageHeader";
import { ReportsFilterBar } from "@/features/admin/reports/components/ReportsFilterBar";
import { ReportEmptyState } from "@/features/admin/reports/components/ReportEmptyState";
import { ReportSummaryCards } from "@/features/admin/reports/components/ReportSummaryCards";
import { ReportTableClient } from "@/features/admin/reports/components/ReportTableClient";
import { ReportsNav } from "@/features/admin/reports/components/ReportsNav";
import { getReportDataset } from "@/features/admin/reports/services/reports.service";
import { resolveReportDateRange } from "@/features/admin/reports/services/reports-params";
import { safeDivide } from "@/features/admin/reports/reports.utils";

export default async function RevenueReportPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const params = await searchParams;
  const { preset, from, to } = await resolveReportDateRange(Promise.resolve(params));
  const search = typeof params.q === "string" ? params.q.toLowerCase() : "";
  const paymentStatus = typeof params.paymentStatus === "string" ? params.paymentStatus : "all";

  const dataset = await getReportDataset(from, to);
  const bookings = dataset.bookings.filter((booking) => {
    if (paymentStatus !== "all" && booking.paymentStatus !== paymentStatus) return false;
    if (!search) return true;
    return [booking.bookingCode, booking.guestName, booking.phone, booking.cottageName].some((value) => value.toLowerCase().includes(search));
  });

  const payments = dataset.payments.filter((payment) => {
    if (!search) return true;
    return [payment.bookingCode, payment.guestName, payment.phone, payment.method, payment.transactionReference].some((value) => value.toLowerCase().includes(search));
  });

  const charges = dataset.charges.filter((charge) => {
    if (!search) return true;
    return [charge.bookingCode, charge.guestName, charge.description, charge.chargeType].some((value) => value.toLowerCase().includes(search));
  });

  const discounts = bookings
    .filter((booking) => booking.discount > 0)
    .map((booking) => ({
      id: booking.id,
      bookingCode: booking.bookingCode,
      guestName: booking.guestName,
      originalAmount: booking.baseAmount + booking.extraCharges,
      discountAmount: booking.discount,
      discountReason: "—",
      finalAmount: booking.finalAmount,
      date: booking.createdAt.slice(0, 10),
    }));

  const finalBillAmount = bookings.reduce((sum, booking) => sum + booking.finalAmount, 0);
  const paidAmount = bookings.reduce((sum, booking) => sum + booking.paidAmount, 0);
  const balanceAmount = finalBillAmount - paidAmount;

  return (
    <div className="space-y-4">
      <AdminPageHeader title="Revenue Report" description="Revenue summary with payments, extra charges, and discounts in one page." />
      <ReportsNav />
      <ReportsFilterBar
        preset={preset}
        from={from}
        to={to}
        search={typeof params.q === "string" ? params.q : ""}
        searchPlaceholder="Search booking, guest, phone, reference"
        filters={[
          {
            name: "paymentStatus",
            label: "Payment status",
            value: paymentStatus,
            options: [{ value: "all", label: "All" }, ...Array.from(new Set(dataset.bookings.map((booking) => booking.paymentStatus))).map((value) => ({ value, label: value }))],
          },
        ]}
      />

      <ReportSummaryCards
        cards={[
          { label: "Total Revenue", value: finalBillAmount, kind: "currency" },
          { label: "Total Collection", value: paidAmount, kind: "currency" },
          { label: "Outstanding Amount", value: balanceAmount, kind: "currency" },
          { label: "Average Booking Value", value: safeDivide(finalBillAmount, bookings.length), kind: "currency" },
          { label: "Final Bill Amount", value: finalBillAmount, kind: "currency" },
          { label: "Paid Amount", value: paidAmount, kind: "currency" },
          { label: "Balance Amount", value: balanceAmount, kind: "currency" },
        ]}
      />

      <ReportTableClient
        title="Payments & Collections"
        fileName="revenue-report.csv"
        rows={payments}
        searchKeys={["bookingCode", "guestName", "phone", "method", "status", "transactionReference"]}
        columns={[
          { key: "paymentDate", label: "Payment Date", sortable: true },
          { key: "bookingCode", label: "Booking Code", sortable: true },
          { key: "guestName", label: "Guest", sortable: true },
          { key: "method", label: "Payment Method", sortable: true },
          { key: "amount", label: "Amount Paid", sortable: true, format: "currency_inr" },
          { key: "status", label: "Payment Status", sortable: true },
          { key: "transactionReference", label: "Reference" },
        ]}
      />

      {charges.length ? (
        <ReportTableClient
          title="Extra Charges"
          fileName="revenue-report.csv"
          rows={charges}
          searchKeys={["bookingCode", "guestName", "chargeType", "description"]}
          columns={[
            { key: "bookingCode", label: "Booking Code", sortable: true },
            { key: "guestName", label: "Guest", sortable: true },
            { key: "chargeType", label: "Charge Type", sortable: true },
            { key: "description", label: "Description" },
            { key: "amount", label: "Amount", sortable: true, format: "currency_inr" },
            { key: "dateAdded", label: "Date Added", sortable: true },
          ]}
        />
      ) : (
        <ReportEmptyState title="No extra charges" description="No extra charge entries were found for the selected filters and date range." />
      )}

      {discounts.length ? (
        <ReportTableClient
          title="Discounts"
          fileName="revenue-report.csv"
          rows={discounts}
          searchKeys={["bookingCode", "guestName"]}
          columns={[
            { key: "bookingCode", label: "Booking Code", sortable: true },
            { key: "guestName", label: "Guest", sortable: true },
            { key: "originalAmount", label: "Original Amount", sortable: true, format: "currency_inr" },
            { key: "discountAmount", label: "Discount Amount", sortable: true, format: "currency_inr" },
            { key: "discountReason", label: "Discount Reason" },
            { key: "finalAmount", label: "Final Amount", sortable: true, format: "currency_inr" },
            { key: "date", label: "Date", sortable: true },
          ]}
        />
      ) : (
        <ReportEmptyState title="No discounts" description="No discounts were recorded for the selected filters and date range." />
      )}
    </div>
  );
}
