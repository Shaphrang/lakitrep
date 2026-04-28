import type { ReactNode } from "react";
import { requireAdminPermission } from "@/lib/auth/admin";

export default async function SeoLayout({ children }: { children: ReactNode }) {
  await requireAdminPermission("seo.manage");
  return children;
}
