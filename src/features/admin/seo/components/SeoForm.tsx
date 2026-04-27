import { createSeoAction, deleteSeoAction, updateSeoAction } from "@/actions/admin/seo";
import { ImageUploadField } from "@/components/admin/media/ImageUploadField";
import { FormActions } from "@/components/admin/shared/FormActions";
import { SubmitButton } from "@/components/admin/shared/SubmitButton";

const inputClass = "mt-1 w-full rounded-xl border border-[#d8cfbf] bg-[#fdfbf7] px-3 py-2.5 text-sm text-[#21392c]";

export function SeoForm({ seo, propertyOptions }: { seo?: Record<string, unknown> | null; propertyOptions: { id: string; name: string }[] }) {
  return (
    <>
      <form action={seo ? updateSeoAction : createSeoAction} className="space-y-4 rounded-2xl border border-[#e1d9cc] bg-white p-4 sm:p-5">
        {seo ? <input type="hidden" name="id" value={String(seo.id)} /> : null}
        <h2 className="font-semibold text-[#274734]">SEO Metadata</h2>
        <label className="block text-sm">Property<select name="property_id" defaultValue={String(seo?.property_id ?? "")} required className={inputClass}>{propertyOptions.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}</select></label>
        <label className="block text-sm">Page Key<input name="page_key" defaultValue={String(seo?.page_key ?? "")} className={inputClass} /></label>
        <label className="block text-sm">Meta Title<input name="meta_title" defaultValue={String(seo?.meta_title ?? "")} className={inputClass} /></label>
        <label className="block text-sm">Meta Description<textarea name="meta_description" defaultValue={String(seo?.meta_description ?? "")} rows={4} className={inputClass} /></label>
        <label className="block text-sm">Meta Keywords (comma separated)<input name="meta_keywords" defaultValue={Array.isArray(seo?.meta_keywords) ? (seo?.meta_keywords as string[]).join(",") : ""} className={inputClass} /></label>
        <label className="block text-sm">Canonical URL<input name="canonical_url" defaultValue={String(seo?.canonical_url ?? "")} className={inputClass} /></label>
        <ImageUploadField label="OG Image" folder="seo/og" name="og_image" defaultValue={String(seo?.og_image ?? "")} />
        <label className="flex items-center gap-2 text-sm text-[#33533f]"><input type="checkbox" name="is_active" defaultChecked={Boolean(seo?.is_active ?? true)} /> Active</label>
        <FormActions submitLabel={seo ? "Update SEO" : "Create SEO"} />
      </form>
      {seo ? <form action={deleteSeoAction} className="mt-4"><input type="hidden" name="id" value={String(seo.id)} /><SubmitButton pendingText="Deleting..." className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#e2b0b0] bg-[#fbeeee] px-4 py-2 text-sm font-medium text-[#8f3f3f]">Delete SEO Row</SubmitButton></form> : null}
    </>
  );
}
