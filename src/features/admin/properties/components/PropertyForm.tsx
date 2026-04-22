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

export function PropertyForm({ property }: { property?: PropertyRecord }) {
  return (
    <>
      <form action={property ? updatePropertiesAction : createPropertiesAction} className="space-y-4 rounded-lg border border-slate-200 bg-white p-5">
        {property ? <input type="hidden" name="id" value={property.id} /> : null}
        <div className="grid gap-4 md:grid-cols-2">
          <label className="text-sm"><span className="mb-1 block">Name</span><input name="name" defaultValue={property?.name} required className="w-full rounded-md border border-slate-300 px-3 py-2" /></label>
          <label className="text-sm"><span className="mb-1 block">Slug</span><input name="slug" defaultValue={property?.slug} required className="w-full rounded-md border border-slate-300 px-3 py-2" /></label>
          <label className="text-sm"><span className="mb-1 block">Tagline</span><input name="tagline" defaultValue={property?.tagline ?? ""} className="w-full rounded-md border border-slate-300 px-3 py-2" /></label>
          <label className="text-sm"><span className="mb-1 block">Type</span><input name="property_type" defaultValue={property?.property_type ?? ""} className="w-full rounded-md border border-slate-300 px-3 py-2" /></label>
        </div>
        <label className="block text-sm"><span className="mb-1 block">Short Intro</span><textarea name="short_intro" defaultValue={property?.short_intro ?? ""} rows={3} className="w-full rounded-md border border-slate-300 px-3 py-2" /></label>
        <label className="block text-sm"><span className="mb-1 block">Full Description</span><textarea name="full_description" defaultValue={property?.full_description ?? ""} rows={5} className="w-full rounded-md border border-slate-300 px-3 py-2" /></label>
        <div className="grid gap-4 md:grid-cols-2">
          <label className="text-sm"><span className="mb-1 block">Address</span><input name="address_line" defaultValue={property?.address_line ?? ""} className="w-full rounded-md border border-slate-300 px-3 py-2" /></label>
          <label className="text-sm"><span className="mb-1 block">District</span><input name="district" defaultValue={property?.district ?? ""} className="w-full rounded-md border border-slate-300 px-3 py-2" /></label>
          <label className="text-sm"><span className="mb-1 block">State</span><input name="state" defaultValue={property?.state ?? "Meghalaya"} className="w-full rounded-md border border-slate-300 px-3 py-2" /></label>
          <label className="text-sm"><span className="mb-1 block">Country</span><input name="country" defaultValue={property?.country ?? "India"} className="w-full rounded-md border border-slate-300 px-3 py-2" /></label>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <label className="text-sm"><span className="mb-1 block">Phone</span><input name="phone_number" defaultValue={property?.phone_number ?? ""} className="w-full rounded-md border border-slate-300 px-3 py-2" /></label>
          <label className="text-sm"><span className="mb-1 block">Email</span><input name="email" type="email" defaultValue={property?.email ?? ""} className="w-full rounded-md border border-slate-300 px-3 py-2" /></label>
        </div>
        <ImageUploadField label="Cover Image" folder="properties/cover" name="cover_image" defaultValue={property?.cover_image} />
        <MultiImageUploadField label="Gallery Images" folder="properties/gallery" name="gallery_images" defaultValues={property?.gallery_images ?? []} />
        <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="is_active" defaultChecked={property?.is_active ?? true} /> Active</label>
        <FormActions submitLabel={property ? "Update Property" : "Create Property"} />
      </form>
      {property ? (
        <form action={deletePropertiesAction} className="mt-3">
          <input type="hidden" name="id" value={property.id} />
          <button type="submit" className="rounded-md border border-red-300 px-4 py-2 text-sm text-red-700">Delete Property</button>
        </form>
      ) : null}
    </>
  );
}
