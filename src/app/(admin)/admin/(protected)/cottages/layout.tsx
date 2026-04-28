import type { ReactNode } from "react";
import { requireAdminPermission } from "@/lib/auth/admin";

export default async function CottagesLayout({ children }: { children: ReactNode }) {
  await requireAdminPermission("cottages.manage");
  return children;
}
