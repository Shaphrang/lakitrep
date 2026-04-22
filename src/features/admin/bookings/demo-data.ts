import type { Booking } from "./types";

export const bookingDemoData: Booking[] = [
  { id: "book-1", reference: "LK-1001", guestName: "Ava Martinez", checkIn: "2026-05-10", checkOut: "2026-05-13", cottageName: "Riverfront Villa", totalAmount: 640, status: "confirmed" },
  { id: "book-2", reference: "LK-1002", guestName: "Noah Reed", checkIn: "2026-05-18", checkOut: "2026-05-20", cottageName: "Garden Nest", totalAmount: 290, status: "pending" },
  { id: "book-3", reference: "LK-1003", guestName: "Emma Brown", checkIn: "2026-06-01", checkOut: "2026-06-05", cottageName: "Riverfront Villa", totalAmount: 880, status: "cancelled" },
];
