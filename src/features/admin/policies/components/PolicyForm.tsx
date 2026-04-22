import { FormActions } from "@/components/admin/shared/FormActions";
import type { Policy } from "../types";

export function PolicyForm({ policy }: { policy?: Policy }) {
  return (
    <form className="rounded-lg border border-slate-200 bg-white p-5">
      <label className="block text-sm"><span className="mb-1 block">Title</span><input defaultValue={policy?.title} className="w-full rounded-md border border-slate-300 px-3 py-2" /></label>
      <label className="mt-4 block text-sm"><span className="mb-1 block">Slug</span><input defaultValue={policy?.slug} className="w-full rounded-md border border-slate-300 px-3 py-2" /></label>
      <label className="mt-4 block text-sm"><span className="mb-1 block">Content</span><textarea defaultValue={policy?.content} rows={6} className="w-full rounded-md border border-slate-300 px-3 py-2" /></label>
      <FormActions submitLabel={policy ? "Update Policy" : "Create Policy"} />
    </form>
  );
}
