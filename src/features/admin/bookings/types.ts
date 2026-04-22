export type BookingStatus = "pending" | "confirmed" | "cancelled";

export type Booking = {
  id: string;
  reference: string;
  guestName: string;
  checkIn: string;
  checkOut: string;
  cottageName: string;
  totalAmount: number;
  status: BookingStatus;
};
