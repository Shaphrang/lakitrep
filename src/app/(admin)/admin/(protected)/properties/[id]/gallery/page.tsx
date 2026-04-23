//src\app\(admin)\admin\(protected)\properties\[id]\gallery\page.tsx
import Link from "next/link";
import { AdminPageHeader } from "@/components/admin/shared/AdminPageHeader";
import { GalleryManager } from "@/components/admin/gallery/GalleryManager";
import { getPropertyGalleryMedia } from "@/features/gallery/gallery-service";
import { getPropertyById } from "@/features/admin/properties/services/properties-service";

export default async function PropertyGalleryPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [property, media] = await Promise.all([getPropertyById(id), getPropertyGalleryMedia(id)]);

  if (!property) {
    return <div className="rounded-xl bg-red-50 p-4 text-sm text-red-700">Property not found.</div>;
  }

  return (
    <div className="space-y-4">
      <AdminPageHeader
        title={`Gallery Manager: ${property.name}`}
        description="Manage category-wise property photos, metadata, featured status, and display order."
      />
      <Link href={`/admin/properties/${id}`} className="inline-flex rounded-xl border border-[#d8cfbf] bg-white px-3 py-2 text-sm text-[#294533]">
        ← Back to property
      </Link>
      <GalleryManager propertyId={id} initialItems={media} />
    </div>
  );
}
