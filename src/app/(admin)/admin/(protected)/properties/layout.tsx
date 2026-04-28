import type { ReactNode } from "react";
import { requireAdminPermission } from "@/lib/auth/admin";

export default async function PropertiesLayout({ children }: { children: ReactNode }) {
  await requireAdminPermission("properties.manage");
  return children;
}
