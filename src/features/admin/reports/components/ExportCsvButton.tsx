"use client";

import { toCsv } from "../reports.utils";

export function ExportCsvButton({ fileName, rows }: { fileName: string; rows: Record<string, unknown>[] }) {
  return (
    <button
      type="button"
      onClick={() => {
        const csv = toCsv(rows);
        const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", fileName);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }}
      className="rounded-xl border border-[#2e5a3d] px-3 py-2 text-sm font-semibold text-[#2e5a3d]"
    >
      Export CSV
    </button>
  );
}
