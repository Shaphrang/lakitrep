export function StatusBadge({ status }: { status: string }) {
  const colorMap: Record<string, string> = {
    active: "bg-emerald-100 text-emerald-700",
    inactive: "bg-slate-200 text-slate-700",
    maintenance: "bg-orange-100 text-orange-700",
    confirmed: "bg-blue-100 text-blue-700",
    pending: "bg-amber-100 text-amber-700",
    cancelled: "bg-rose-100 text-rose-700",
    completed: "bg-emerald-100 text-emerald-700",
    rejected: "bg-rose-100 text-rose-700",
  };

  return <span className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${colorMap[status] ?? "bg-slate-100 text-slate-700"}`}>{status}</span>;
}
