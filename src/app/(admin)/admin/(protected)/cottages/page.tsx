import Link from "next/link";
import { AdminPageHeader } from "@/components/admin/shared/AdminPageHeader";
import { CottageTable } from "@/features/admin/cottages/components/CottageTable";
import { getAllCottages } from "@/features/admin/cottages/services/cottages-service";

export default async function CottagesPage() {
  const cottages = await getAllCottages();
  return (
    <div>
      <AdminPageHeader
        title="Cottages"
        description="Manage cottage categories, capacities, media, and nightly rates."
        actions={
          <Link
            href="/admin/cottages/new"
            className="inline-flex items-center rounded-xl bg-[linear-gradient(135deg,#2e5a3d_0%,#1f3f2f_100%)] px-4 py-2.5 text-sm font-semibold text-white shadow-sm"
          >
            New Cottage
          </Link>
        }
      />
      <CottageTable cottages={cottages} />
    </div>
  );
}
