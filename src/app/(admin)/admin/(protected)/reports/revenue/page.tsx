import { AdminPageHeader } from "@/components/admin/shared/AdminPageHeader";
import { ReportsFilterBar } from "@/features/admin/reports/components/ReportsFilterBar";
import { ReportEmptyState } from "@/features/admin/reports/components/ReportEmptyState";
import { ReportSummaryCards } from "@/features/admin/reports/components/ReportSummaryCards";
import { ReportTableClient } from "@/features/admin/reports/components/ReportTableClient";
import { ReportsNav } from "@/features/admin/reports/components/ReportsNav";
import {
  getRevenueReportDataset,
} from "@/features/admin/reports/services/reports.service";
import { resolveReportDateRange } from "@/features/admin/reports/services/reports-params";
import { currency, formatDateOnly } from "@/features/admin/reports/reports.utils";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function RevenueReportPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;

  const { preset, from, to } = await resolveReportDateRange(
    Promise.resolve(params),
  );

  const search = typeof params.q === "string" ? params.q : "";
  const cottageId =
    typeof params.cottageId === "string" ? params.cottageId : "all";
  const paymentMethod =
    typeof params.paymentMethod === "string" ? params.paymentMethod : "all";
  const paymentStatus =
    typeof params.paymentStatus === "string" ? params.paymentStatus : "all";

  const dataset = await getRevenueReportDataset({
    from,
    to,
    q: search,
    cottageId,
    paymentMethod,
    paymentStatus,
  });

  const paymentMethodOptions = [
    { value: "all", label: "All payment methods" },
    ...Array.from(
      new Set(dataset.paymentRows.map((payment) => payment.paymentMethod)),
    )
      .filter(Boolean)
      .map((value) => ({
        value,
        label: value.replaceAll("_", " "),
      })),
  ];

  const paymentStatusOptions = [
    { value: "all", label: "All payment status" },
    { value: "paid", label: "Paid" },
    { value: "partially_paid", label: "Partially Paid" },
    { value: "partial", label: "Partial" },
    { value: "unpaid", label: "Unpaid" },
    { value: "pending", label: "Pending" },
  ];

  const cottageOptions = [
    { value: "all", label: "All cottages" },
    ...dataset.cottages.map((cottage) => ({
      value: cottage.id,
      label: cottage.name,
    })),
  ];

  return (
    <div className="space-y-4">
      <AdminPageHeader
        title="Revenue Report"
        description="Simple view of revenue, collections, pending amount, payment methods, extra charges, discounts, and cottage-wise earnings."
      />

      <ReportsNav />

      <ReportsFilterBar
        preset={preset}
        from={from}
        to={to}
        search={search}
        searchPlaceholder="Search booking, guest, phone, cottage, invoice, reference"
        clearHref="/admin/reports/revenue"
        filters={[
          {
            name: "cottageId",
            label: "Cottage",
            value: cottageId,
            options: cottageOptions,
          },
          {
            name: "paymentMethod",
            label: "Payment method",
            value: paymentMethod,
            options: paymentMethodOptions,
          },
          {
            name: "paymentStatus",
            label: "Payment status",
            value: paymentStatus,
            options: paymentStatusOptions,
          },
        ]}
      />

      <section className="rounded-2xl border border-[#ddd4c6] bg-[linear-gradient(120deg,#fbf8f2_0%,#f2ede3_100%)] p-4">
        <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-[#21392c]">
              Revenue Overview
            </h2>
            <p className="text-sm text-[#65756a]">
              Date filter is based on created date. Showing records from{" "}
              <span className="font-medium text-[#21392c]">
                {formatDateOnly(from)}
              </span>{" "}
              to{" "}
              <span className="font-medium text-[#21392c]">
                {formatDateOnly(to)}
              </span>
              .
            </p>
          </div>

          <p className="text-xs text-[#6f7d74]">
            Last updated: {formatDateOnly(dataset.lastUpdated)}
          </p>
        </div>
      </section>

      <ReportSummaryCards
        cards={[
          {
            label: "Total Revenue",
            value: dataset.summary.totalRevenue,
            kind: "currency",
            helper: "Final billed amount",
          },
          {
            label: "Total Collection",
            value: dataset.summary.totalCollection,
            kind: "currency",
            helper: "Payments received in selected date range",
          },
          {
            label: "Pending / Outstanding",
            value: dataset.summary.outstandingTotal,
            kind: "currency",
            helper: "Amount still to be received",
          },
          {
            label: "Net Revenue",
            value: dataset.summary.netRevenue,
            kind: "currency",
            helper: "Revenue after discount",
          },
          {
            label: "Extra Charges",
            value: dataset.summary.extraChargesTotal,
            kind: "currency",
            helper: "Additional charges added",
          },
          {
            label: "Discounts",
            value: dataset.summary.discountTotal,
            kind: "currency",
            helper: "Total discount given",
          },
          {
            label: "Paid Bookings",
            value: dataset.summary.paidBookingsCount,
            kind: "number",
            helper: "Fully paid bookings",
          },
          {
            label: "Pending Bookings",
            value: dataset.summary.pendingBookingsCount,
            kind: "number",
            helper: "Bookings with pending amount",
          },
        ]}
      />

      {dataset.summary.outstandingTotal > 0 ? (
        <section className="rounded-2xl border border-[#e6cda2] bg-[#fff9ed] p-4">
          <h3 className="font-semibold text-[#7a4b12]">
            Amount Pending to be Received
          </h3>
          <p className="mt-1 text-2xl font-bold text-[#7a4b12]">
            {currency(dataset.summary.outstandingTotal)}
          </p>
          <p className="mt-1 text-sm text-[#8a6b42]">
            This is the total pending amount from selected revenue records.
            Please check the Outstanding / Pending Amount table below.
          </p>
        </section>
      ) : null}

      <section className="grid gap-4 xl:grid-cols-2">
        <ReportTableClient
          title="Payment Method Summary"
          fileName="payment-method-summary.csv"
          rows={dataset.paymentMethods}
          searchKeys={["method"]}
          columns={[
            { key: "method", label: "Payment Method", sortable: true },
            { key: "count", label: "Payments", sortable: true },
            {
              key: "amount",
              label: "Collection",
              sortable: true,
              format: "currency_inr",
            },
          ]}
          emptyText="No payment collection found for the selected filters."
        />

        <ReportTableClient
          title="Cottage-wise Revenue"
          fileName="cottage-wise-revenue.csv"
          rows={dataset.cottageBreakdown}
          searchKeys={["cottageName"]}
          columns={[
            { key: "cottageName", label: "Cottage", sortable: true },
            { key: "bookings", label: "Bookings", sortable: true },
            {
              key: "revenue",
              label: "Revenue",
              sortable: true,
              format: "currency_inr",
            },
            {
              key: "collection",
              label: "Collection",
              sortable: true,
              format: "currency_inr",
            },
            {
              key: "outstanding",
              label: "Outstanding",
              sortable: true,
              format: "currency_inr",
            },
          ]}
          emptyText="No cottage revenue found for the selected filters."
        />
      </section>

      <ReportTableClient
        title="Revenue Summary"
        fileName="revenue-report.csv"
        rows={dataset.revenueRows}
        searchKeys={[
          "bookingCode",
          "guestName",
          "phone",
          "cottageName",
          "invoiceNumber",
          "source",
        ]}
        columns={[
          {
            key: "createdDate",
            label: "Created Date",
            sortable: true,
            format: "date",
          },
          { key: "bookingCode", label: "Booking Code", sortable: true },
          { key: "guestName", label: "Guest", sortable: true },
          { key: "phone", label: "Phone" },
          { key: "cottageName", label: "Cottage", sortable: true },
          {
            key: "finalBill",
            label: "Final Bill",
            sortable: true,
            format: "currency_inr",
          },
          {
            key: "paidAmount",
            label: "Paid Amount",
            sortable: true,
            format: "currency_inr",
          },
          {
            key: "outstanding",
            label: "Outstanding",
            sortable: true,
            format: "currency_inr",
          },
          { key: "paymentStatus", label: "Payment Status", sortable: true },
          { key: "source", label: "Source", sortable: true },
          { key: "action", label: "Action", format: "billing_action" },
        ]}
        emptyText="No revenue records found for the selected filters."
      />

      <ReportTableClient
        title="Outstanding / Pending Amount"
        fileName="outstanding-revenue-report.csv"
        rows={dataset.outstandingRows}
        searchKeys={["bookingCode", "guestName", "phone", "cottageName"]}
        columns={[
          { key: "bookingCode", label: "Booking Code", sortable: true },
          { key: "guestName", label: "Guest", sortable: true },
          { key: "phone", label: "Phone" },
          { key: "cottageName", label: "Cottage", sortable: true },
          {
            key: "finalBill",
            label: "Final Bill",
            sortable: true,
            format: "currency_inr",
          },
          {
            key: "paidAmount",
            label: "Paid",
            sortable: true,
            format: "currency_inr",
          },
          {
            key: "pendingAmount",
            label: "Pending",
            sortable: true,
            format: "currency_inr",
          },
          { key: "paymentStatus", label: "Payment Status", sortable: true },
          { key: "action", label: "Action", format: "billing_action" },
        ]}
        emptyText="No pending amount found for the selected filters."
      />

      <ReportTableClient
        title="Payments / Collections"
        fileName="payments-collections-report.csv"
        rows={dataset.paymentRows}
        searchKeys={[
          "bookingCode",
          "guestName",
          "phone",
          "cottageName",
          "paymentMethod",
          "reference",
        ]}
        columns={[
          {
            key: "paymentDate",
            label: "Payment Date",
            sortable: true,
            format: "date",
          },
          { key: "bookingCode", label: "Booking Code", sortable: true },
          { key: "guestName", label: "Guest", sortable: true },
          { key: "phone", label: "Phone" },
          { key: "cottageName", label: "Cottage", sortable: true },
          { key: "paymentMethod", label: "Payment Method", sortable: true },
          {
            key: "amountPaid",
            label: "Amount Paid",
            sortable: true,
            format: "currency_inr",
          },
          { key: "paymentStatus", label: "Status", sortable: true },
          { key: "reference", label: "Reference" },
          { key: "remarks", label: "Remarks" },
        ]}
        emptyText="No payment records found for the selected filters."
      />

      {dataset.extraChargeRows.length ? (
        <ReportTableClient
          title="Extra Charges"
          fileName="extra-charges-report.csv"
          rows={dataset.extraChargeRows}
          searchKeys={[
            "bookingCode",
            "guestName",
            "phone",
            "cottageName",
            "chargeType",
            "description",
          ]}
          columns={[
            {
              key: "createdDate",
              label: "Created Date",
              sortable: true,
              format: "date",
            },
            { key: "bookingCode", label: "Booking Code", sortable: true },
            { key: "guestName", label: "Guest", sortable: true },
            { key: "cottageName", label: "Cottage", sortable: true },
            { key: "chargeType", label: "Charge Type", sortable: true },
            { key: "description", label: "Description" },
            {
              key: "amount",
              label: "Amount",
              sortable: true,
              format: "currency_inr",
            },
          ]}
          emptyText="No extra charges found for the selected filters."
        />
      ) : (
        <ReportEmptyState
          title="No extra charges"
          description="No extra charge records were found for the selected date range and filters."
        />
      )}

      {dataset.discountRows.length ? (
        <ReportTableClient
          title="Discounts"
          fileName="discounts-report.csv"
          rows={dataset.discountRows}
          searchKeys={["bookingCode", "guestName", "cottageName"]}
          columns={[
            {
              key: "createdDate",
              label: "Created Date",
              sortable: true,
              format: "date",
            },
            { key: "bookingCode", label: "Booking Code", sortable: true },
            { key: "guestName", label: "Guest", sortable: true },
            { key: "cottageName", label: "Cottage", sortable: true },
            {
              key: "originalAmount",
              label: "Original Amount",
              sortable: true,
              format: "currency_inr",
            },
            {
              key: "discountAmount",
              label: "Discount",
              sortable: true,
              format: "currency_inr",
            },
            { key: "discountReason", label: "Reason" },
            {
              key: "finalAmount",
              label: "Final Amount",
              sortable: true,
              format: "currency_inr",
            },
          ]}
          emptyText="No discounts found for the selected filters."
        />
      ) : (
        <ReportEmptyState
          title="No discounts"
          description="No discount records were found for the selected date range and filters."
        />
      )}
    </div>
  );
}