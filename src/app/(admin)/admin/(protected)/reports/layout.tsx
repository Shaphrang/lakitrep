import type { ReactNode } from "react";
import { requireAdminPermission } from "@/lib/auth/admin";

export default async function ReportsLayout({ children }: { children: ReactNode }) {
  await requireAdminPermission("reports.view");
  return children;
}
