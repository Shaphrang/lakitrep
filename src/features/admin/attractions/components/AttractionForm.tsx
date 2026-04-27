import { createAttractionsAction, deleteAttractionsAction, updateAttractionsAction } from "@/actions/admin/attractions";
import { ImageUploadField } from "@/components/admin/media/ImageUploadField";
import { MultiImageUploadField } from "@/components/admin/media/MultiImageUploadField";
import { FormActions } from "@/components/admin/shared/FormActions";
import { SubmitButton } from "@/components/admin/shared/SubmitButton";

const inputClass = "mt-1 w-full rounded-xl border border-[#d8cfbf] bg-[#fdfbf7] px-3 py-2.5 text-sm text-[#21392c]";
const sectionClass = "space-y-4 rounded-2xl border border-[#e1d9cc] bg-white p-4 sm:p-5";

export function AttractionForm({ attraction, propertyOptions }: { attraction?: Record<string, unknown> | null; propertyOptions: { id: string; name: string }[] }) {
  return (
    <>
      <form action={attraction ? updateAttractionsAction : createAttractionsAction} className="space-y-4">
        {attraction ? <input type="hidden" name="id" value={String(attraction.id)} /> : null}
        <section className={sectionClass}>
          <h2 className="font-semibold text-[#274734]">Attraction Details</h2>
          <label className="block text-sm">Property<select name="property_id" defaultValue={String(attraction?.property_id ?? "")} required className={inputClass}>{propertyOptions.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}</select></label>
          <label className="block text-sm">Name<input name="name" defaultValue={String(attraction?.name ?? "")} required className={inputClass} /></label>
          <label className="block text-sm">Description<textarea name="description" defaultValue={String(attraction?.description ?? "")} rows={4} className={inputClass} /></label>
          <label className="block text-sm">Distance Text<input name="distance_text" defaultValue={String(attraction?.distance_text ?? "")} className={inputClass} /></label>
          <input type="hidden" name="sort_order" value={String(attraction?.sort_order ?? 0)} />
        </section>

        <section className={sectionClass}>
          <h2 className="font-semibold text-[#274734]">Media & Visibility</h2>
          <ImageUploadField label="Cover Image" folder="attractions/cover" name="cover_image" defaultValue={String(attraction?.cover_image ?? "")} />
          <MultiImageUploadField label="Gallery Images" folder="attractions/gallery" name="gallery_images" defaultValues={Array.isArray(attraction?.gallery_images) ? (attraction?.gallery_images as string[]) : []} />
          <label className="flex items-center gap-2 text-sm text-[#33533f]"><input type="checkbox" name="is_active" defaultChecked={Boolean(attraction?.is_active ?? true)} /> Active</label>
          <FormActions submitLabel={attraction ? "Update Attraction" : "Create Attraction"} />
        </section>
      </form>
      {attraction ? <form action={deleteAttractionsAction} className="mt-4"><input type="hidden" name="id" value={String(attraction.id)} /><SubmitButton pendingText="Deleting..." className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#e2b0b0] bg-[#fbeeee] px-4 py-2 text-sm font-medium text-[#8f3f3f]">Delete Attraction</SubmitButton></form> : null}
    </>
  );
}
