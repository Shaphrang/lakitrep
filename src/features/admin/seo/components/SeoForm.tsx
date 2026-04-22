import { createSeoAction, deleteSeoAction, updateSeoAction } from "@/actions/admin/seo";
import { ImageUploadField } from "@/components/admin/media/ImageUploadField";
import { FormActions } from "@/components/admin/shared/FormActions";

export function SeoForm({ seo, propertyOptions }: { seo?: Record<string, unknown> | null; propertyOptions: { id: string; name: string }[] }) {
  return (
    <>
      <form action={seo ? updateSeoAction : createSeoAction} className="space-y-4 rounded-lg border border-slate-200 bg-white p-5">
        {seo ? <input type="hidden" name="id" value={String(seo.id)} /> : null}
        <label className="block text-sm"><span className="mb-1 block">Property</span><select name="property_id" defaultValue={String(seo?.property_id ?? "")} required className="w-full rounded-md border border-slate-300 px-3 py-2">{propertyOptions.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}</select></label>
        <label className="block text-sm"><span className="mb-1 block">Page Key</span><input name="page_key" defaultValue={String(seo?.page_key ?? "")} className="w-full rounded-md border border-slate-300 px-3 py-2" /></label>
        <label className="block text-sm"><span className="mb-1 block">Meta Title</span><input name="meta_title" defaultValue={String(seo?.meta_title ?? "")} className="w-full rounded-md border border-slate-300 px-3 py-2" /></label>
        <label className="block text-sm"><span className="mb-1 block">Meta Description</span><textarea name="meta_description" defaultValue={String(seo?.meta_description ?? "")} rows={4} className="w-full rounded-md border border-slate-300 px-3 py-2" /></label>
        <label className="block text-sm"><span className="mb-1 block">Meta Keywords (comma separated)</span><input name="meta_keywords" defaultValue={Array.isArray(seo?.meta_keywords) ? (seo?.meta_keywords as string[]).join(",") : ""} className="w-full rounded-md border border-slate-300 px-3 py-2" /></label>
        <label className="block text-sm"><span className="mb-1 block">Canonical URL</span><input name="canonical_url" defaultValue={String(seo?.canonical_url ?? "")} className="w-full rounded-md border border-slate-300 px-3 py-2" /></label>
        <ImageUploadField label="OG Image" folder="seo/og" name="og_image" defaultValue={String(seo?.og_image ?? "")} />
        <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="is_active" defaultChecked={Boolean(seo?.is_active ?? true)} /> Active</label>
        <FormActions submitLabel={seo ? "Update SEO" : "Create SEO"} />
      </form>
      {seo ? <form action={deleteSeoAction} className="mt-3"><input type="hidden" name="id" value={String(seo.id)} /><button type="submit" className="rounded-md border border-red-300 px-4 py-2 text-sm text-red-700">Delete SEO Row</button></form> : null}
    </>
  );
}
