import Link from "next/link";

export default function AdminAccessDeniedPage() {
  return (
    <div className="mx-auto max-w-xl rounded-2xl border border-[#d8d2c6] bg-white/90 p-6 text-[#1f3529] shadow-sm">
      <h1 className="font-serif text-2xl text-[#1a2f24]">Access denied</h1>
      <p className="mt-3 text-sm text-[#4a5f52]">
        You do not have permission to view this page. Please go back to the allowed operations area.
      </p>
      <div className="mt-6">
        <Link
          href="/admin/bookings"
          className="inline-flex items-center rounded-xl bg-[linear-gradient(135deg,#2e5a3d_0%,#1f3f2f_100%)] px-4 py-2.5 text-sm font-semibold text-white shadow-sm"
        >
          Go to bookings
        </Link>
      </div>
    </div>
  );
}
