import { FormActions } from "@/components/admin/shared/FormActions";
import type { Property } from "../types";

export function PropertyForm({ property }: { property?: Property }) {
  return (
    <form className="rounded-lg border border-slate-200 bg-white p-5">
      <div className="grid gap-4 md:grid-cols-2">
        <label className="text-sm"><span className="mb-1 block text-slate-700">Name</span><input defaultValue={property?.name} className="w-full rounded-md border border-slate-300 px-3 py-2" /></label>
        <label className="text-sm"><span className="mb-1 block text-slate-700">Slug</span><input defaultValue={property?.slug} className="w-full rounded-md border border-slate-300 px-3 py-2" /></label>
      </div>
      <label className="mt-4 block text-sm"><span className="mb-1 block text-slate-700">Location</span><input defaultValue={property?.location} className="w-full rounded-md border border-slate-300 px-3 py-2" /></label>
      <label className="mt-4 block text-sm"><span className="mb-1 block text-slate-700">Short Description</span><textarea defaultValue={property?.shortDescription} className="w-full rounded-md border border-slate-300 px-3 py-2" rows={4} /></label>
      <FormActions submitLabel={property ? "Update Property" : "Create Property"} />
    </form>
  );
}
