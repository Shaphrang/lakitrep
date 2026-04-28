import type { ReactNode } from "react";
import { requireAdminPermission } from "@/lib/auth/admin";

export default async function AttractionsLayout({ children }: { children: ReactNode }) {
  await requireAdminPermission("attractions.manage");
  return children;
}
