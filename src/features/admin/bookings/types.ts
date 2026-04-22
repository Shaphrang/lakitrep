export type BookingStatus = "pending" | "confirmed" | "cancelled" | "completed" | "rejected";

export type Booking = {
  id: string;
  booking_code: string;
  status: BookingStatus;
  check_in_date: string;
  check_out_date: string;
  adults: number;
  children: number;
  infants: number;
  property_name: string;
  cottage_name: string;
  guest_name: string;
  guest_phone: string;
};
