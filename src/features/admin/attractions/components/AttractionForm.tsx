import { FormActions } from "@/components/admin/shared/FormActions";
import type { Attraction } from "../types";

export function AttractionForm({ attraction }: { attraction?: Attraction }) {
  return (
    <form className="rounded-lg border border-slate-200 bg-white p-5">
      <div className="grid gap-4 md:grid-cols-2">
        <label className="text-sm"><span className="mb-1 block">Name</span><input defaultValue={attraction?.name} className="w-full rounded-md border border-slate-300 px-3 py-2" /></label>
        <label className="text-sm"><span className="mb-1 block">Slug</span><input defaultValue={attraction?.slug} className="w-full rounded-md border border-slate-300 px-3 py-2" /></label>
      </div>
      <label className="mt-4 block text-sm"><span className="mb-1 block">Duration</span><input defaultValue={attraction?.duration} className="w-full rounded-md border border-slate-300 px-3 py-2" /></label>
      <label className="mt-4 block text-sm"><span className="mb-1 block">Short Description</span><textarea defaultValue={attraction?.shortDescription} rows={4} className="w-full rounded-md border border-slate-300 px-3 py-2" /></label>
      <FormActions submitLabel={attraction ? "Update Attraction" : "Create Attraction"} />
    </form>
  );
}
