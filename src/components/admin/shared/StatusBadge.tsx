export function StatusBadge({ status }: { status: string }) {
  const normalized = status.toLowerCase();
  const colorMap: Record<string, string> = {
    active: "border-[#98b89d] bg-[#edf6ee] text-[#21513a]",
    inactive: "border-[#d5d2c9] bg-[#f1efea] text-[#5e645e]",
    maintenance: "border-[#e3c590] bg-[#fdf4e4] text-[#8a5a23]",
    new_request: "border-[#d9ccaa] bg-[#fff8ea] text-[#805d1f]",
    contacted: "border-[#c8dbec] bg-[#eef6fe] text-[#2b5f8c]",
    confirmed: "border-[#9dc8b0] bg-[#eaf7ef] text-[#236743]",
    advance_paid: "border-[#a6c9bb] bg-[#edf8f3] text-[#265a43]",
    checked_in: "border-[#9ec9a9] bg-[#eaf7ef] text-[#1d5c3a]",
    checked_out: "border-[#8fc09e] bg-[#e7f5ea] text-[#1f5f3d]",
    pending: "border-[#e4cf94] bg-[#fff8e6] text-[#916b1f]",
    unpaid: "border-[#ead9b1] bg-[#fff9eb] text-[#8f6c2c]",
    paid: "border-[#9dc8b0] bg-[#eaf7ef] text-[#236743]",
    partially_paid: "border-[#d5d3a3] bg-[#faf9e8] text-[#65601f]",
    cancelled: "border-[#e7b2b2] bg-[#fdeeee] text-[#8f3c3c]",
    no_show: "border-[#e6b9b9] bg-[#fcf1f1] text-[#873f3f]",
    completed: "border-[#8fc09e] bg-[#e7f5ea] text-[#1f5f3d]",
    rejected: "border-[#e2b0b0] bg-[#fbecec] text-[#8d3b3b]",
  };

  return (
    <span
      className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold capitalize ${colorMap[normalized] ?? "border-[#d5d2c9] bg-[#f1efea] text-[#5e645e]"}`}
    >
      {status.replaceAll("_", " ")}
    </span>
  );
}
