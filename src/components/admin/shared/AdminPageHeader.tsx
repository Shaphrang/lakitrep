import type { ReactNode } from "react";

export function AdminPageHeader({
  title,
  description,
  actions,
}: {
  title: string;
  description?: string;
  actions?: ReactNode;
}) {
  return (
    <div className="mb-6 rounded-2xl border border-[#ddd4c6] bg-[linear-gradient(120deg,#fbf8f2_0%,#f2ede3_100%)] p-4 shadow-sm sm:mb-7 sm:p-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-[0.68rem] uppercase tracking-[0.22em] text-[#6f7f72]">Admin Workspace</p>
          <h1 className="mt-1 font-serif text-3xl leading-tight text-[#214531] sm:text-4xl">{title}</h1>
          {description ? <p className="mt-2 max-w-2xl text-sm text-[#4f6055]">{description}</p> : null}
        </div>
        {actions ? <div className="shrink-0">{actions}</div> : null}
      </div>
    </div>
  );
}
