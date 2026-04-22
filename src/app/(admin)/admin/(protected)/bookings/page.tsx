import { AdminPageHeader } from "@/components/admin/shared/AdminPageHeader";
import { BookingTable } from "@/features/admin/bookings/components/BookingTable";
import { getAllBookings } from "@/features/admin/bookings/services/bookings-service";
import { requireAdmin } from "@/lib/auth/admin";

export default async function BookingsPage() {
  await requireAdmin();
  const bookings = await getAllBookings();
  return <div><AdminPageHeader title="Bookings" description="View and manage booking requests." /><BookingTable bookings={bookings} /></div>;
}