import { AdminPageHeader } from "@/components/admin/shared/AdminPageHeader";

export default function AdminDashboardPage() {
  return (
    <div>
      <AdminPageHeader
        title="Dashboard"
        description="Admin-first scaffold is ready. Use modules in the sidebar to manage mock data."
      />
      <section className="grid gap-4 md:grid-cols-3">
        {[
          "Properties",
          "Cottages",
          "Attractions",
          "Bookings",
          "Policies",
          "SEO",
        ].map((name) => (
          <article key={name} className="rounded-lg border border-slate-200 bg-white p-4">
            <h2 className="font-semibold">{name}</h2>
            <p className="mt-1 text-sm text-slate-600">Module scaffolded with demo services and action stubs.</p>
          </article>
        ))}
      </section>
    </div>
  );
}
