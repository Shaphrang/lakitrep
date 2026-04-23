import Link from "next/link";
import { AdminPageHeader } from "@/components/admin/shared/AdminPageHeader";
import { getAllAttractions } from "@/features/admin/attractions/services/attractions-service";
import { getAllBookings } from "@/features/admin/bookings/services/bookings-service";
import { getAllCottages } from "@/features/admin/cottages/services/cottages-service";
import { getAllPolicies } from "@/features/admin/policies/services/policies-service";
import { getAllProperties } from "@/features/admin/properties/services/properties-service";
import { getAllSeoEntries } from "@/features/admin/seo/services/seo-service";

export default async function AdminDashboardPage() {
  const [properties, cottages, attractions, bookings, policies, seo] = await Promise.all([
    getAllProperties(),
    getAllCottages(),
    getAllAttractions(),
    getAllBookings(),
    getAllPolicies(),
    getAllSeoEntries(),
  ]);

  const cards = [
    { name: "Properties", count: properties.length, href: "/admin/properties", hint: "Core resort details" },
    { name: "Cottages", count: cottages.length, href: "/admin/cottages", hint: "Inventory and pricing" },
    { name: "Attractions", count: attractions.length, href: "/admin/attractions", hint: "Nearby experiences" },
    { name: "Bookings", count: bookings.length, href: "/admin/bookings", hint: "Incoming requests" },
    { name: "Policies", count: policies.length, href: "/admin/policies", hint: "Stay rules and notes" },
    { name: "SEO", count: seo.length, href: "/admin/seo", hint: "Page metadata" },
  ];

  return (
    <div>
      <AdminPageHeader title="Dashboard" description="A calm overview of the resort operations and content." />
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {cards.map((item) => (
          <article
            key={item.name}
            className="rounded-2xl border border-[#ddd4c6] bg-[linear-gradient(145deg,#fffdfa_0%,#f4efe4_100%)] p-5 shadow-[0_18px_32px_-28px_rgba(18,30,22,0.9)]"
          >
            <p className="text-xs uppercase tracking-[0.18em] text-[#758478]">{item.hint}</p>
            <h2 className="mt-2 font-serif text-3xl text-[#244633]">{item.count}</h2>
            <p className="mt-1 text-sm font-medium text-[#3f5348]">{item.name}</p>
            <Link href={item.href} className="mt-4 inline-flex text-sm font-semibold text-[#2d5c3d] hover:text-[#214531]">
              Open section →
            </Link>
          </article>
        ))}
      </section>
    </div>
  );
}
