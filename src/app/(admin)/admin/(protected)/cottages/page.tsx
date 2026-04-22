import Link from "next/link";
import { AdminPageHeader } from "@/components/admin/shared/AdminPageHeader";
import { CottageTable } from "@/features/admin/cottages/components/CottageTable";
import { getAllCottages } from "@/features/admin/cottages/services/cottages-service";
import { requireAdmin } from "@/lib/auth/admin";

export default async function CottagesPage() {
  await requireAdmin();
  const cottages = await getAllCottages();
  return <div><AdminPageHeader title="Cottages" description="Manage cottages." actions={<Link href="/admin/cottages/new" className="rounded-md bg-slate-900 px-4 py-2 text-sm text-white">New Cottage</Link>} /><CottageTable cottages={cottages} /></div>;
}