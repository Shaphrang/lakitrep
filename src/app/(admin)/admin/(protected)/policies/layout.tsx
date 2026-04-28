import type { ReactNode } from "react";
import { requireAdminPermission } from "@/lib/auth/admin";

export default async function PoliciesLayout({ children }: { children: ReactNode }) {
  await requireAdminPermission("policies.manage");
  return children;
}
