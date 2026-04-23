import { logoutAdminAction } from "@/actions/admin/auth";

export function AdminHeader({ adminLabel, onMenuClick }: { adminLabel: string; onMenuClick: () => void }) {
  return (
    <header className="sticky top-0 z-30 border-b border-[#ddd4c6] bg-[#f7f3ea]/90 backdrop-blur-md">
      <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between px-4 sm:px-6 lg:h-[72px] lg:px-8">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onMenuClick}
            className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-[#d8cfbf] bg-white text-[#1f3529] shadow-sm lg:hidden"
            aria-label="Toggle navigation"
          >
            ☰
          </button>
          <div>
            <p className="text-[0.68rem] uppercase tracking-[0.2em] text-[#6f7f72]">La Ki Trep</p>
            <p className="text-sm font-semibold text-[#274734] sm:text-base">Resort Admin Dashboard</p>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <div className="hidden rounded-full border border-[#d8cfbf] bg-white px-3 py-1.5 text-xs font-medium text-[#355740] shadow-sm sm:block">
            {adminLabel}
          </div>
          <form action={logoutAdminAction}>
            <button
              type="submit"
              className="rounded-xl border border-[#c9baa2] bg-[#f0e4cb] px-3 py-2 text-xs font-semibold text-[#2d4c38] transition hover:bg-[#e8d6b1]"
            >
              Logout
            </button>
          </form>
        </div>
      </div>
    </header>
  );
}
