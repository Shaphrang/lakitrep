export type ReportDatePreset = "today" | "yesterday" | "this_week" | "this_month" | "this_quarter" | "this_year" | "last_month" | "custom";

export type ReportFilters = {
  query: string;
  datePreset: ReportDatePreset;
  from?: string;
  to?: string;
  status?: string;
  paymentStatus?: string;
  source?: string;
  cottageId?: string;
  customer?: string;
  invoiceStatus?: string;
  sortBy?: string;
  sortDir?: "asc" | "desc";
  page: number;
  pageSize: number;
};

export type ReportBookingRow = {
  id: string;
  bookingCode: string;
  guestName: string;
  phone: string;
  email: string;
  cottageId: string;
  cottageName: string;
  source: string;
  status: string;
  paymentStatus: string;
  checkIn: string;
  checkOut: string;
  createdAt: string;
  nights: number;
  adults: number;
  children: number;
  totalGuests: number;
  baseAmount: number;
  extraCharges: number;
  discount: number;
  tax: number;
  finalAmount: number;
  paidAmount: number;
  outstandingAmount: number;
  invoiceNumber: string;
  invoiceDate: string;
  invoiceStatus: string;
  cancelledDate?: string;
};

export type ReportPaymentRow = {
  id: string;
  paymentDate: string;
  bookingCode: string;
  guestName: string;
  phone: string;
  method: string;
  paymentType: string;
  amount: number;
  collectedBy: string;
  transactionReference: string;
  status: string;
  remarks: string;
};

export type ReportChargeRow = {
  id: string;
  bookingCode: string;
  guestName: string;
  cottage: string;
  chargeType: string;
  description: string;
  amount: number;
  dateAdded: string;
};

export type ReportDataset = {
  bookings: ReportBookingRow[];
  payments: ReportPaymentRow[];
  charges: ReportChargeRow[];
  cottages: { id: string; name: string; status: string; isBookable: boolean }[];
  blockedNights: { cottageId: string; date: string }[];
  lastUpdated: string;
  limitations: string[];
};
