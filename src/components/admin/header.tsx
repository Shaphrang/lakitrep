import { LogOut } from "lucide-react";
import { logoutAdmin } from "@/lib/auth/actions";
import { Button } from "@/components/ui/button";

type AdminHeaderProps = {
  title: string;
  description?: string;
  adminName?: string | null;
};

export function AdminHeader({ title, description, adminName }: AdminHeaderProps) {
  return (
    <div className="flex w-full items-center justify-between gap-4">
      <div className="min-w-0">
        <h2 className="truncate text-lg font-semibold text-zinc-900 dark:text-zinc-100">{title}</h2>
        {description ? (
          <p className="truncate text-sm text-zinc-500 dark:text-zinc-400">{description}</p>
        ) : null}
      </div>
      <div className="flex items-center gap-3">
        {adminName ? <span className="hidden text-sm text-zinc-600 md:inline">{adminName}</span> : null}
        <form action={logoutAdmin}>
          <Button variant="secondary" className="gap-2">
            <LogOut className="size-4" />
            Logout
          </Button>
        </form>
      </div>
    </div>
  );
}
