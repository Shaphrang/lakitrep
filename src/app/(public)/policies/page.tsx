import type { Metadata } from "next";
import { getPolicies, getPrimaryProperty, getSeoByPageKey } from "@/lib/public-site";

export const revalidate = 300;

export async function generateMetadata(): Promise<Metadata> {
  const property = await getPrimaryProperty();
  if (!property) return { title: "Policies" };
  const seo = await getSeoByPageKey(property.id, "policies");
  return {
    title: seo?.meta_title || `Policies | ${property.name}`,
    description: seo?.meta_description || "Resort stay policies and helpful booking notes.",
  };
}

export default async function PoliciesPage() {
  const property = await getPrimaryProperty();
  if (!property) return <main className="mx-auto max-w-6xl px-4 py-16 sm:px-6">No property found.</main>;

  const policies = await getPolicies(property.id);

  return (
    <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6 sm:py-10">
      <h1 className="text-3xl font-semibold text-white sm:text-4xl">Policies</h1>
      <p className="mt-2 text-sm text-stone-200 sm:text-base">Please review before confirming your stay.</p>

      <div className="mt-6 space-y-3">
        {policies.map((policy) => (
          <article key={policy.id} className="rounded-2xl bg-white p-5 text-emerald-950 sm:p-6">
            <h2 className="text-lg font-semibold">{policy.title}</h2>
            <p className="mt-2 whitespace-pre-line text-sm text-stone-700 sm:text-base">{policy.content}</p>
          </article>
        ))}
      </div>
    </main>
  );
}
