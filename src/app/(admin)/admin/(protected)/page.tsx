import { AdminPageHeader } from "@/components/admin/shared/AdminPageHeader";
import { getAllAttractions } from "@/features/admin/attractions/services/attractions-service";
import { getAllBookings } from "@/features/admin/bookings/services/bookings-service";
import { getAllCottages } from "@/features/admin/cottages/services/cottages-service";
import { getAllPolicies } from "@/features/admin/policies/services/policies-service";
import { getAllProperties } from "@/features/admin/properties/services/properties-service";
import { getAllSeoEntries } from "@/features/admin/seo/services/seo-service";

export default async function AdminDashboardPage() {  const [properties, cottages, attractions, bookings, policies, seo] = await Promise.all([
    getAllProperties(),
    getAllCottages(),
    getAllAttractions(),
    getAllBookings(),
    getAllPolicies(),
    getAllSeoEntries(),
  ]);

  return (
    <div>
      <AdminPageHeader title="Dashboard" description="Live Supabase-backed admin overview." />
      <section className="grid gap-4 md:grid-cols-3">
        {[{name:"Properties",count:properties.length},{name:"Cottages",count:cottages.length},{name:"Attractions",count:attractions.length},{name:"Bookings",count:bookings.length},{name:"Policies",count:policies.length},{name:"SEO",count:seo.length}].map((item) => (
          <article key={item.name} className="rounded-lg border border-slate-200 bg-white p-4">
            <h2 className="font-semibold">{item.name}</h2>
            <p className="mt-1 text-sm text-slate-600">{item.count} records</p>
          </article>
        ))}
      </section>
    </div>
  );
}