import { createPropertiesAction, deletePropertiesAction, updatePropertiesAction } from "@/actions/admin/properties";
import { ImageUploadField } from "@/components/admin/media/ImageUploadField";
import { MultiImageUploadField } from "@/components/admin/media/MultiImageUploadField";
import { FormActions } from "@/components/admin/shared/FormActions";

type PropertyRecord = {
  id: string;
  name: string;
  slug: string;
  tagline: string | null;
  short_intro: string | null;
  full_description: string | null;
  property_type: string | null;
  address_line: string | null;
  district: string | null;
  state: string | null;
  country: string | null;
  phone_number: string | null;
  email: string | null;
  cover_image: string | null;
  gallery_images: string[];
  is_active: boolean;
};

const inputClass = "mt-1 w-full rounded-xl border border-[#d8cfbf] bg-[#fdfbf7] px-3 py-2.5 text-sm text-[#21392c]";
const sectionClass = "space-y-4 rounded-2xl border border-[#e1d9cc] bg-white p-4 sm:p-5";

export function PropertyForm({ property }: { property?: PropertyRecord }) {
  return (
    <>
      <form action={property ? updatePropertiesAction : createPropertiesAction} className="space-y-4">
        {property ? <input type="hidden" name="id" value={property.id} /> : null}

        <section className={sectionClass}>
          <h2 className="font-semibold text-[#274734]">Property Basics</h2>
          <div className="grid gap-4 md:grid-cols-2">
            <label className="text-sm">Name<input name="name" defaultValue={property?.name} required className={inputClass} /></label>
            <label className="text-sm">Slug<input name="slug" defaultValue={property?.slug} required className={inputClass} /></label>
            <label className="text-sm">Tagline<input name="tagline" defaultValue={property?.tagline ?? ""} className={inputClass} /></label>
            <label className="text-sm">Type<input name="property_type" defaultValue={property?.property_type ?? ""} className={inputClass} /></label>
          </div>
          <label className="block text-sm">Short Intro<textarea name="short_intro" defaultValue={property?.short_intro ?? ""} rows={3} className={inputClass} /></label>
          <label className="block text-sm">Full Description<textarea name="full_description" defaultValue={property?.full_description ?? ""} rows={5} className={inputClass} /></label>
        </section>

        <section className={sectionClass}>
          <h2 className="font-semibold text-[#274734]">Location & Contact</h2>
          <div className="grid gap-4 md:grid-cols-2">
            <label className="text-sm">Address<input name="address_line" defaultValue={property?.address_line ?? ""} className={inputClass} /></label>
            <label className="text-sm">District<input name="district" defaultValue={property?.district ?? ""} className={inputClass} /></label>
            <label className="text-sm">State<input name="state" defaultValue={property?.state ?? "Meghalaya"} className={inputClass} /></label>
            <label className="text-sm">Country<input name="country" defaultValue={property?.country ?? "India"} className={inputClass} /></label>
            <label className="text-sm">Phone<input name="phone_number" defaultValue={property?.phone_number ?? ""} className={inputClass} /></label>
            <label className="text-sm">Email<input name="email" type="email" defaultValue={property?.email ?? ""} className={inputClass} /></label>
          </div>
        </section>

        <section className={sectionClass}>
          <h2 className="font-semibold text-[#274734]">Media & Visibility</h2>
          <ImageUploadField label="Cover Image" folder="properties/cover" name="cover_image" defaultValue={property?.cover_image} />
          <MultiImageUploadField label="Gallery Images" folder="properties/gallery" name="gallery_images" defaultValues={property?.gallery_images ?? []} />
          <label className="flex items-center gap-2 text-sm text-[#33533f]"><input type="checkbox" name="is_active" defaultChecked={property?.is_active ?? true} /> Active</label>
          <FormActions submitLabel={property ? "Update Property" : "Create Property"} />
        </section>
      </form>

      {property ? (
        <form action={deletePropertiesAction} className="mt-4">
          <input type="hidden" name="id" value={property.id} />
          <button type="submit" className="rounded-xl border border-[#e2b0b0] bg-[#fbeeee] px-4 py-2 text-sm font-medium text-[#8f3f3f]">
            Delete Property
          </button>
        </form>
      ) : null}
    </>
  );
}
