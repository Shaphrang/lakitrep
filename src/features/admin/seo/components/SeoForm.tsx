import { FormActions } from "@/components/admin/shared/FormActions";
import type { SeoEntry } from "../types";

export function SeoForm({ seo }: { seo?: SeoEntry }) {
  return (
    <form className="rounded-lg border border-slate-200 bg-white p-5">
      <label className="block text-sm"><span className="mb-1 block">Page Key</span><input defaultValue={seo?.pageKey} className="w-full rounded-md border border-slate-300 px-3 py-2" /></label>
      <label className="mt-4 block text-sm"><span className="mb-1 block">Title</span><input defaultValue={seo?.title} className="w-full rounded-md border border-slate-300 px-3 py-2" /></label>
      <label className="mt-4 block text-sm"><span className="mb-1 block">Description</span><textarea defaultValue={seo?.description} rows={4} className="w-full rounded-md border border-slate-300 px-3 py-2" /></label>
      <label className="mt-4 block text-sm"><span className="mb-1 block">Canonical URL</span><input defaultValue={seo?.canonicalUrl} className="w-full rounded-md border border-slate-300 px-3 py-2" /></label>
      <FormActions submitLabel={seo ? "Update SEO" : "Create SEO"} />
    </form>
  );
}
