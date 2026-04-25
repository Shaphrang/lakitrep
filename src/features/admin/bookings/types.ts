export type BookingStatus =
  | "pending"
  | "new_request"
  | "contacted"
  | "confirmed"
  | "advance_paid"
  | "checked_in"
  | "checked_out"
  | "cancelled"
  | "no_show"
  | "completed"
  | "rejected";

export type PaymentStatus = "unpaid" | "advance_paid" | "partially_paid" | "paid" | "pending" | "refunded" | "paid_on_arrival" | "waived";

export type Booking = {
  id: string;
  booking_code: string;
  status: BookingStatus;
  payment_status: PaymentStatus | string;
  source: string;
  check_in_date: string;
  check_out_date: string;
  adults: number;
  children: number;
  infants: number;
  nights: number;
  total_amount: number;
  final_total: number;
  amount_paid: number;
  amount_pending: number;
  property_name: string;
  cottage_name: string;
  guest_name: string;
  guest_phone: string;
};
