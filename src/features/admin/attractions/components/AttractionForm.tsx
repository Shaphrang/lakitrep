import { createAttractionsAction, deleteAttractionsAction, updateAttractionsAction } from "@/actions/admin/attractions";
import { ImageUploadField } from "@/components/admin/media/ImageUploadField";
import { MultiImageUploadField } from "@/components/admin/media/MultiImageUploadField";
import { FormActions } from "@/components/admin/shared/FormActions";

export function AttractionForm({ attraction, propertyOptions }: { attraction?: Record<string, unknown> | null; propertyOptions: { id: string; name: string }[] }) {
  return (
    <>
      <form action={attraction ? updateAttractionsAction : createAttractionsAction} className="space-y-4 rounded-lg border border-slate-200 bg-white p-5">
        {attraction ? <input type="hidden" name="id" value={String(attraction.id)} /> : null}
        <label className="block text-sm"><span className="mb-1 block">Property</span><select name="property_id" defaultValue={String(attraction?.property_id ?? "")} required className="w-full rounded-md border border-slate-300 px-3 py-2">{propertyOptions.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}</select></label>
        <label className="block text-sm"><span className="mb-1 block">Name</span><input name="name" defaultValue={String(attraction?.name ?? "")} required className="w-full rounded-md border border-slate-300 px-3 py-2" /></label>
        <label className="block text-sm"><span className="mb-1 block">Description</span><textarea name="description" defaultValue={String(attraction?.description ?? "")} rows={4} className="w-full rounded-md border border-slate-300 px-3 py-2" /></label>
        <label className="block text-sm"><span className="mb-1 block">Distance Text</span><input name="distance_text" defaultValue={String(attraction?.distance_text ?? "")} className="w-full rounded-md border border-slate-300 px-3 py-2" /></label>
        <input type="hidden" name="sort_order" value={String(attraction?.sort_order ?? 0)} />
        <ImageUploadField label="Cover Image" folder="attractions/cover" name="cover_image" defaultValue={String(attraction?.cover_image ?? "")} />
        <MultiImageUploadField label="Gallery Images" folder="attractions/gallery" name="gallery_images" defaultValues={Array.isArray(attraction?.gallery_images) ? (attraction?.gallery_images as string[]) : []} />
        <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="is_active" defaultChecked={Boolean(attraction?.is_active ?? true)} /> Active</label>
        <FormActions submitLabel={attraction ? "Update Attraction" : "Create Attraction"} />
      </form>
      {attraction ? <form action={deleteAttractionsAction} className="mt-3"><input type="hidden" name="id" value={String(attraction.id)} /><button type="submit" className="rounded-md border border-red-300 px-4 py-2 text-sm text-red-700">Delete Attraction</button></form> : null}
    </>
  );
}
