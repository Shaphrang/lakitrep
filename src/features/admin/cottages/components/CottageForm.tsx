import { FormActions } from "@/components/admin/shared/FormActions";
import type { Cottage } from "../types";

export function CottageForm({ cottage }: { cottage?: Cottage }) {
  return (
    <form className="rounded-lg border border-slate-200 bg-white p-5">
      <div className="grid gap-4 md:grid-cols-2">
        <label className="text-sm"><span className="mb-1 block">Name</span><input defaultValue={cottage?.name} className="w-full rounded-md border border-slate-300 px-3 py-2" /></label>
        <label className="text-sm"><span className="mb-1 block">Code</span><input defaultValue={cottage?.code} className="w-full rounded-md border border-slate-300 px-3 py-2" /></label>
        <label className="text-sm"><span className="mb-1 block">Slug</span><input defaultValue={cottage?.slug} className="w-full rounded-md border border-slate-300 px-3 py-2" /></label>
        <label className="text-sm"><span className="mb-1 block">Category</span><input defaultValue={cottage?.category} className="w-full rounded-md border border-slate-300 px-3 py-2" /></label>
      </div>
      <label className="mt-4 block text-sm"><span className="mb-1 block">Short Description</span><textarea defaultValue={cottage?.shortDescription} rows={3} className="w-full rounded-md border border-slate-300 px-3 py-2" /></label>
      <label className="mt-4 block text-sm"><span className="mb-1 block">Full Description</span><textarea defaultValue={cottage?.fullDescription} rows={4} className="w-full rounded-md border border-slate-300 px-3 py-2" /></label>
      <div className="mt-4 grid gap-4 md:grid-cols-3">
        <label className="text-sm"><span className="mb-1 block">Base Price</span><input defaultValue={cottage?.basePrice} type="number" className="w-full rounded-md border border-slate-300 px-3 py-2" /></label>
        <label className="text-sm"><span className="mb-1 block">Weekend Price</span><input defaultValue={cottage?.weekendPrice} type="number" className="w-full rounded-md border border-slate-300 px-3 py-2" /></label>
        <label className="text-sm"><span className="mb-1 block">Max Guests</span><input defaultValue={cottage?.maxGuests} type="number" className="w-full rounded-md border border-slate-300 px-3 py-2" /></label>
      </div>
      <FormActions submitLabel={cottage ? "Update Cottage" : "Create Cottage"} />
    </form>
  );
}
