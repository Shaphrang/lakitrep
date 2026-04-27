import { createCottagesAction, deleteCottagesAction, updateCottagesAction } from "@/actions/admin/cottages";
import { ImageUploadField } from "@/components/admin/media/ImageUploadField";
import { MultiImageUploadField } from "@/components/admin/media/MultiImageUploadField";
import { FormActions } from "@/components/admin/shared/FormActions";
import { SubmitButton } from "@/components/admin/shared/SubmitButton";

const inputClass = "mt-1 w-full rounded-xl border border-[#d8cfbf] bg-[#fdfbf7] px-3 py-2.5 text-sm text-[#21392c]";
const sectionClass = "space-y-4 rounded-2xl border border-[#e1d9cc] bg-white p-4 sm:p-5";

export function CottageForm({ cottage, propertyOptions }: { cottage?: Record<string, unknown> | null; propertyOptions: { id: string; name: string }[] }) {
  return (
    <>
      <form action={cottage ? updateCottagesAction : createCottagesAction} className="space-y-4">
        {cottage ? <input type="hidden" name="id" value={String(cottage.id)} /> : null}

        <section className={sectionClass}>
          <h2 className="font-semibold text-[#274734]">Basics</h2>
          <div className="grid gap-4 md:grid-cols-2">
            <label className="text-sm">Property<select name="property_id" defaultValue={String(cottage?.property_id ?? "")} required className={inputClass}>{propertyOptions.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}</select></label>
            <label className="text-sm">Code<input name="code" defaultValue={String(cottage?.code ?? "")} required className={inputClass} /></label>
            <label className="text-sm">Name<input name="name" defaultValue={String(cottage?.name ?? "")} required className={inputClass} /></label>
            <label className="text-sm">Slug<input name="slug" defaultValue={String(cottage?.slug ?? "")} required className={inputClass} /></label>
            <label className="text-sm">Category<input name="category" defaultValue={String(cottage?.category ?? "")} required className={inputClass} /></label>
            <label className="text-sm">Bed Type<input name="bed_type" defaultValue={String(cottage?.bed_type ?? "")} className={inputClass} /></label>
          </div>
          <label className="block text-sm">Short Description<textarea name="short_description" defaultValue={String(cottage?.short_description ?? "")} rows={3} className={inputClass} /></label>
          <label className="block text-sm">Full Description<textarea name="full_description" defaultValue={String(cottage?.full_description ?? "")} rows={4} className={inputClass} /></label>
        </section>

        <section className={sectionClass}>
          <h2 className="font-semibold text-[#274734]">Capacity & Pricing</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <label className="text-sm">Max Adults<input name="max_adults" type="number" defaultValue={String(cottage?.max_adults ?? 2)} className={inputClass} /></label>
            <label className="text-sm">Max Children<input name="max_children" type="number" defaultValue={String(cottage?.max_children ?? 0)} className={inputClass} /></label>
            <label className="text-sm">Max Infants<input name="max_infants" type="number" defaultValue={String(cottage?.max_infants ?? 0)} className={inputClass} /></label>
            <label className="text-sm">Max Total Guests<input name="max_total_guests" type="number" defaultValue={String(cottage?.max_total_guests ?? 2)} className={inputClass} /></label>
            <label className="text-sm">Weekday Price<input name="weekday_price" type="number" step="0.01" defaultValue={String(cottage?.weekday_price ?? 0)} className={inputClass} /></label>
            <label className="text-sm">Weekend Price<input name="weekend_price" type="number" step="0.01" defaultValue={String(cottage?.weekend_price ?? 0)} className={inputClass} /></label>
            <label className="text-sm">Child Price<input name="child_price" type="number" step="0.01" defaultValue={String(cottage?.child_price ?? 0)} className={inputClass} /></label>
            <label className="text-sm">Extra Bed Price<input name="extra_bed_price" type="number" step="0.01" defaultValue={String(cottage?.extra_bed_price ?? 0)} className={inputClass} /></label>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <label className="text-sm">Amenities (one per line)<textarea name="amenities" defaultValue={Array.isArray(cottage?.amenities) ? (cottage?.amenities as string[]).join("\n") : ""} rows={4} className={inputClass} /></label>
            <label className="text-sm">Component Codes (comma separated)<input name="component_codes" defaultValue={Array.isArray(cottage?.component_codes) ? (cottage?.component_codes as string[]).join(",") : ""} className={inputClass} /></label>
            <label className="text-sm">Pricing Note<textarea name="pricing_note" defaultValue={String(cottage?.pricing_note ?? "")} rows={3} className={inputClass} /></label>
            <label className="text-sm">Status<select name="status" defaultValue={String(cottage?.status ?? "active")} className={inputClass}><option value="active">active</option><option value="inactive">inactive</option><option value="maintenance">maintenance</option></select></label>
          </div>
        </section>

        <section className={sectionClass}>
          <h2 className="font-semibold text-[#274734]">Media & Flags</h2>
          <ImageUploadField label="Cover Image" folder="cottages/cover" name="cover_image" defaultValue={String(cottage?.cover_image ?? "")} />
          <MultiImageUploadField label="Gallery Images" folder="cottages/gallery" name="gallery_images" defaultValues={Array.isArray(cottage?.gallery_images) ? (cottage?.gallery_images as string[]) : []} />
          <div className="grid gap-3 text-sm text-[#33533f] sm:grid-cols-2 lg:grid-cols-3">
            <label className="flex items-center gap-2"><input type="checkbox" name="has_ac" defaultChecked={Boolean(cottage?.has_ac)} />Has AC</label>
            <label className="flex items-center gap-2"><input type="checkbox" name="breakfast_included" defaultChecked={Boolean(cottage?.breakfast_included ?? true)} />Breakfast Included</label>
            <label className="flex items-center gap-2"><input type="checkbox" name="extra_bed_allowed" defaultChecked={Boolean(cottage?.extra_bed_allowed)} />Extra Bed Allowed</label>
            <label className="flex items-center gap-2"><input type="checkbox" name="is_combined_unit" defaultChecked={Boolean(cottage?.is_combined_unit)} />Combined Unit</label>
            <label className="flex items-center gap-2"><input type="checkbox" name="is_featured" defaultChecked={Boolean(cottage?.is_featured)} />Featured</label>
            <label className="flex items-center gap-2"><input type="checkbox" name="is_bookable" defaultChecked={Boolean(cottage?.is_bookable ?? true)} />Bookable</label>
          </div>
          <input type="hidden" name="room_count" value={String(cottage?.room_count ?? 1)} />
          <input type="hidden" name="sort_order" value={String(cottage?.sort_order ?? 0)} />
          <FormActions submitLabel={cottage ? "Update Cottage" : "Create Cottage"} />
        </section>
      </form>

      {cottage ? (
        <form action={deleteCottagesAction} className="mt-4">
          <input type="hidden" name="id" value={String(cottage.id)} />
          <SubmitButton pendingText="Deleting..." className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#e2b0b0] bg-[#fbeeee] px-4 py-2 text-sm font-medium text-[#8f3f3f]">Delete Cottage</SubmitButton>
        </form>
      ) : null}
    </>
  );
}
