import { bookingDemoData } from "../demo-data";
import type { Booking } from "../types";

// TODO: replace mock service with Supabase query.
let records = [...bookingDemoData];

export async function getAllBookings(): Promise<Booking[]> { return records; }
export async function getBookingById(id: string): Promise<Booking | undefined> { return records.find((x) => x.id === id); }
export async function createBooking(input: Omit<Booking, "id">): Promise<Booking> { const created = { id: `book-${Date.now()}`, ...input }; records = [created, ...records]; return created; }
export async function updateBooking(id: string, input: Partial<Omit<Booking, "id">>): Promise<Booking | undefined> { records = records.map((x) => (x.id === id ? { ...x, ...input } : x)); return records.find((x) => x.id === id); }
export async function deleteBooking(id: string): Promise<boolean> { const before = records.length; records = records.filter((x) => x.id !== id); return records.length < before; }
