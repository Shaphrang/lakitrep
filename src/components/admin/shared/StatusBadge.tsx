export function StatusBadge({ status }: { status: string }) {
  const normalized = status.toLowerCase();
  const colorMap: Record<string, string> = {
    active: "border-[#98b89d] bg-[#edf6ee] text-[#21513a]",
    inactive: "border-[#d5d2c9] bg-[#f1efea] text-[#5e645e]",
    maintenance: "border-[#e3c590] bg-[#fdf4e4] text-[#8a5a23]",
    confirmed: "border-[#9dc8b0] bg-[#eaf7ef] text-[#236743]",
    pending: "border-[#e4cf94] bg-[#fff8e6] text-[#916b1f]",
    cancelled: "border-[#e7b2b2] bg-[#fdeeee] text-[#8f3c3c]",
    completed: "border-[#8fc09e] bg-[#e7f5ea] text-[#1f5f3d]",
    rejected: "border-[#e2b0b0] bg-[#fbecec] text-[#8d3b3b]",
  };

  return (
    <span className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold capitalize ${colorMap[normalized] ?? "border-[#d5d2c9] bg-[#f1efea] text-[#5e645e]"}`}>
      {status}
    </span>
  );
}
