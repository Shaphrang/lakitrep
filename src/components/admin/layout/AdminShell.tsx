"use client";

import type { ReactNode } from "react";
import { useState } from "react";
import { usePathname } from "next/navigation";
import { AdminHeader } from "@/components/admin/layout/AdminHeader";
import { AdminSidebar } from "@/components/admin/layout/AdminSidebar";
import type { AdminRole } from "@/lib/auth/permissions";

export function AdminShell({
  children,
  adminLabel,
  adminRole,
}: {
  children: ReactNode;
  adminLabel: string;
  adminRole: AdminRole;
}) {
  const pathname = usePathname();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  if (pathname === "/admin/login") {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,#f2ecdf_0%,#f6f3ec_36%,#edf2ec_100%)] text-[#1f3529]">
      <AdminSidebar
        adminRole={adminRole}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      <div className="lg:pl-64">
        <AdminHeader
          adminLabel={adminLabel}
          onMenuClick={() => setIsSidebarOpen((prev) => !prev)}
        />

        <main className="mx-auto w-full max-w-7xl px-4 py-5 sm:px-6 sm:py-6 lg:px-8 lg:py-8">
          {children}
        </main>
      </div>
    </div>
  );
}
