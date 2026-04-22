/* eslint-disable @typescript-eslint/no-explicit-any */
import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PROPERTY_SLUG } from "@/lib/admin/constants";
import { resolveImageUrl } from "@/lib/admin/storage";

export default async function CottagesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const supabase = await createClient();
  const { data: property } = await supabase.from("properties").select("id").eq("slug", PROPERTY_SLUG).maybeSingle();

  if (!property) return notFound();

  let query = supabase
    .from("cottages")
    .select(
      "id,name,code,slug,category,max_total_guests,is_featured,is_bookable,status,cottage_prices(weekday_rate,weekend_rate),cottage_images(storage_path,is_cover,sort_order)",
    )
    .eq("property_id", property.id)
    .order("sort_order", { ascending: true });

  if (q) {
    query = query.or(`name.ilike.%${q}%,code.ilike.%${q}%,category.ilike.%${q}%`);
  }

  const { data: cottages, error } = await query;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">Cottages</h1>
          <p className="text-sm text-zinc-500">Manage cottage details, pricing, amenities, and images.</p>
        </div>
        <Link href="/admin/cottages/new" className="inline-flex h-10 items-center justify-center rounded-md bg-zinc-900 px-4 text-sm font-medium text-white hover:bg-zinc-800">New Cottage</Link>
      </div>

      <Card>
        <CardContent className="pt-6">
          <form className="flex gap-2">
            <input
              name="q"
              defaultValue={q}
              placeholder="Search name, code, category"
              className="h-10 w-full rounded-md border border-zinc-200 bg-white px-3 text-sm"
            />
            <Button type="submit" variant="secondary">
              Search
            </Button>
          </form>
        </CardContent>
      </Card>

      {error ? (
        <Card>
          <CardContent className="pt-6 text-red-600">Failed to load cottages.</CardContent>
        </Card>
      ) : null}

      <div className="hidden overflow-x-auto rounded-xl border border-zinc-200 bg-white lg:block">
        <table className="min-w-full text-sm">
          <thead className="bg-zinc-50 text-left">
            <tr>
              <th className="p-3">Name</th>
              <th className="p-3">Code</th>
              <th className="p-3">Category</th>
              <th className="p-3">Capacity</th>
              <th className="p-3">Rates</th>
              <th className="p-3">Status</th>
              <th className="p-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {cottages?.map((cottage: any) => {
              const cover = cottage.cottage_images?.find((img: any) => img.is_cover) ?? cottage.cottage_images?.[0];
              const price = Array.isArray(cottage.cottage_prices) ? cottage.cottage_prices[0] : cottage.cottage_prices;

              return (
                <tr key={cottage.id} className="border-t border-zinc-100">
                  <td className="p-3">
                    <div className="flex items-center gap-3">
                      {cover?.storage_path ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={resolveImageUrl(cover.storage_path)} alt={cottage.name} className="h-10 w-14 rounded object-cover" />
                      ) : (
                        <div className="h-10 w-14 rounded bg-zinc-100" />
                      )}
                      <span>{cottage.name}</span>
                    </div>
                  </td>
                  <td className="p-3">{cottage.code}</td>
                  <td className="p-3">{cottage.category}</td>
                  <td className="p-3">{cottage.max_total_guests}</td>
                  <td className="p-3">₹{price?.weekday_rate ?? 0} / ₹{price?.weekend_rate ?? 0}</td>
                  <td className="p-3 text-xs">
                    <span>{cottage.status}</span>
                    {cottage.is_featured ? <span className="ml-2 rounded bg-zinc-900 px-2 py-1 text-white">featured</span> : null}
                    {!cottage.is_bookable ? (
                      <span className="ml-2 rounded bg-amber-100 px-2 py-1 text-amber-800">not bookable</span>
                    ) : null}
                  </td>
                  <td className="p-3">
                    <Link href={`/admin/cottages/${cottage.id}`} className="inline-flex h-8 items-center rounded-md bg-zinc-100 px-3 text-xs font-medium text-zinc-900 hover:bg-zinc-200">Edit</Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {!error && (cottages?.length ?? 0) === 0 ? (
        <Card>
          <CardContent className="pt-6 text-sm text-zinc-600">No cottages found. Create your first cottage to get started.</CardContent>
        </Card>
      ) : null}

      <div className="grid gap-3 lg:hidden">
        {cottages?.map((cottage: any) => {
          const cover = cottage.cottage_images?.find((img: any) => img.is_cover) ?? cottage.cottage_images?.[0];
          const price = Array.isArray(cottage.cottage_prices) ? cottage.cottage_prices[0] : cottage.cottage_prices;
          return (
            <Card key={cottage.id}>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">{cottage.name}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-1 text-sm text-zinc-600">
                {cover?.storage_path ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={resolveImageUrl(cover.storage_path)} alt={cottage.name} className="mb-2 h-36 w-full rounded object-cover" />
                ) : null}
                <p>
                  {cottage.code} • {cottage.category}
                </p>
                <p>Capacity: {cottage.max_total_guests}</p>
                <p>Rates: ₹{price?.weekday_rate ?? 0} / ₹{price?.weekend_rate ?? 0}</p>
                <div className="pt-2">
                  <Link href={`/admin/cottages/${cottage.id}`} className="inline-flex h-10 w-full items-center justify-center rounded-md bg-zinc-100 px-4 text-sm font-medium text-zinc-900 hover:bg-zinc-200">Edit</Link>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
