import { createCottagesAction, deleteCottagesAction, updateCottagesAction } from "@/actions/admin/cottages";
import { ImageUploadField } from "@/components/admin/media/ImageUploadField";
import { MultiImageUploadField } from "@/components/admin/media/MultiImageUploadField";
import { FormActions } from "@/components/admin/shared/FormActions";

export function CottageForm({ cottage, propertyOptions }: { cottage?: Record<string, unknown> | null; propertyOptions: { id: string; name: string }[] }) {
  return (
    <>
      <form action={cottage ? updateCottagesAction : createCottagesAction} className="space-y-4 rounded-lg border border-slate-200 bg-white p-5">
        {cottage ? <input type="hidden" name="id" value={String(cottage.id)} /> : null}
        <div className="grid gap-4 md:grid-cols-2">
          <label className="text-sm"><span className="mb-1 block">Property</span><select name="property_id" defaultValue={String(cottage?.property_id ?? "")} required className="w-full rounded-md border border-slate-300 px-3 py-2">{propertyOptions.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}</select></label>
          <label className="text-sm"><span className="mb-1 block">Code</span><input name="code" defaultValue={String(cottage?.code ?? "")} required className="w-full rounded-md border border-slate-300 px-3 py-2" /></label>
          <label className="text-sm"><span className="mb-1 block">Name</span><input name="name" defaultValue={String(cottage?.name ?? "")} required className="w-full rounded-md border border-slate-300 px-3 py-2" /></label>
          <label className="text-sm"><span className="mb-1 block">Slug</span><input name="slug" defaultValue={String(cottage?.slug ?? "")} required className="w-full rounded-md border border-slate-300 px-3 py-2" /></label>
          <label className="text-sm"><span className="mb-1 block">Category</span><input name="category" defaultValue={String(cottage?.category ?? "")} required className="w-full rounded-md border border-slate-300 px-3 py-2" /></label>
          <label className="text-sm"><span className="mb-1 block">Bed Type</span><input name="bed_type" defaultValue={String(cottage?.bed_type ?? "")} className="w-full rounded-md border border-slate-300 px-3 py-2" /></label>
        </div>
        <label className="block text-sm"><span className="mb-1 block">Short Description</span><textarea name="short_description" defaultValue={String(cottage?.short_description ?? "")} rows={3} className="w-full rounded-md border border-slate-300 px-3 py-2" /></label>
        <label className="block text-sm"><span className="mb-1 block">Full Description</span><textarea name="full_description" defaultValue={String(cottage?.full_description ?? "")} rows={4} className="w-full rounded-md border border-slate-300 px-3 py-2" /></label>
        <div className="grid gap-4 md:grid-cols-4">
          <label className="text-sm"><span className="mb-1 block">Max Adults</span><input name="max_adults" type="number" defaultValue={String(cottage?.max_adults ?? 2)} className="w-full rounded-md border border-slate-300 px-3 py-2" /></label>
          <label className="text-sm"><span className="mb-1 block">Max Children</span><input name="max_children" type="number" defaultValue={String(cottage?.max_children ?? 0)} className="w-full rounded-md border border-slate-300 px-3 py-2" /></label>
          <label className="text-sm"><span className="mb-1 block">Max Infants</span><input name="max_infants" type="number" defaultValue={String(cottage?.max_infants ?? 0)} className="w-full rounded-md border border-slate-300 px-3 py-2" /></label>
          <label className="text-sm"><span className="mb-1 block">Max Total Guests</span><input name="max_total_guests" type="number" defaultValue={String(cottage?.max_total_guests ?? 2)} className="w-full rounded-md border border-slate-300 px-3 py-2" /></label>
        </div>
        <div className="grid gap-4 md:grid-cols-4">
          <label className="text-sm"><span className="mb-1 block">Weekday Price</span><input name="weekday_price" type="number" step="0.01" defaultValue={String(cottage?.weekday_price ?? 0)} className="w-full rounded-md border border-slate-300 px-3 py-2" /></label>
          <label className="text-sm"><span className="mb-1 block">Weekend Price</span><input name="weekend_price" type="number" step="0.01" defaultValue={String(cottage?.weekend_price ?? 0)} className="w-full rounded-md border border-slate-300 px-3 py-2" /></label>
          <label className="text-sm"><span className="mb-1 block">Child Price</span><input name="child_price" type="number" step="0.01" defaultValue={String(cottage?.child_price ?? 0)} className="w-full rounded-md border border-slate-300 px-3 py-2" /></label>
          <label className="text-sm"><span className="mb-1 block">Extra Bed Price</span><input name="extra_bed_price" type="number" step="0.01" defaultValue={String(cottage?.extra_bed_price ?? 0)} className="w-full rounded-md border border-slate-300 px-3 py-2" /></label>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <label className="text-sm"><span className="mb-1 block">Amenities (one per line)</span><textarea name="amenities" defaultValue={Array.isArray(cottage?.amenities) ? (cottage?.amenities as string[]).join("\n") : ""} rows={4} className="w-full rounded-md border border-slate-300 px-3 py-2" /></label>
          <label className="text-sm"><span className="mb-1 block">Component Codes (comma separated)</span><input name="component_codes" defaultValue={Array.isArray(cottage?.component_codes) ? (cottage?.component_codes as string[]).join(",") : ""} className="w-full rounded-md border border-slate-300 px-3 py-2" /></label>
          <label className="text-sm"><span className="mb-1 block">Pricing Note</span><textarea name="pricing_note" defaultValue={String(cottage?.pricing_note ?? "")} rows={3} className="w-full rounded-md border border-slate-300 px-3 py-2" /></label>
          <label className="text-sm"><span className="mb-1 block">Status</span><select name="status" defaultValue={String(cottage?.status ?? "active")} className="w-full rounded-md border border-slate-300 px-3 py-2"><option value="active">active</option><option value="inactive">inactive</option><option value="maintenance">maintenance</option></select></label>
        </div>
        <ImageUploadField label="Cover Image" folder="cottages/cover" name="cover_image" defaultValue={String(cottage?.cover_image ?? "")} />
        <MultiImageUploadField label="Gallery Images" folder="cottages/gallery" name="gallery_images" defaultValues={Array.isArray(cottage?.gallery_images) ? (cottage?.gallery_images as string[]) : []} />
        <div className="grid gap-3 md:grid-cols-4 text-sm">
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
      </form>
      {cottage ? <form action={deleteCottagesAction} className="mt-3"><input type="hidden" name="id" value={String(cottage.id)} /><button type="submit" className="rounded-md border border-red-300 px-4 py-2 text-sm text-red-700">Delete Cottage</button></form> : null}
    </>
  );
}
