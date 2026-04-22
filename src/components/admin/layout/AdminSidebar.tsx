import Link from "next/link";

const adminNavItems = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/properties", label: "Properties" },
  { href: "/admin/cottages", label: "Cottages" },
  { href: "/admin/attractions", label: "Attractions" },
  { href: "/admin/bookings", label: "Bookings" },
  { href: "/admin/policies", label: "Policies" },
  { href: "/admin/seo", label: "SEO" },
];

export function AdminSidebar() {
  return (
    <aside className="w-64 border-r border-slate-200 bg-white p-4">
      <div className="mb-6">
        <p className="text-xs uppercase text-slate-500">La Ki Trep Resort</p>
        <h2 className="text-lg font-semibold">Admin Panel</h2>
      </div>
      <nav className="space-y-1">
        {adminNavItems.map((item) => (
          <Link key={item.href} href={item.href} className="block rounded-md px-3 py-2 text-sm text-slate-700 transition hover:bg-slate-100">
            {item.label}
          </Link>
        ))}
      </nav>
    </aside>
  );
}
