"use client";

import { useState } from "react";
import { LoadingSpinner } from "@/components/admin/shared/LoadingSpinner";
import { toCsv } from "../reports.utils";

export function ExportCsvButton({ fileName, rows }: { fileName: string; rows: Record<string, unknown>[] }) {
  const [isExporting, setIsExporting] = useState(false);

  return (
    <button
      type="button"
      disabled={isExporting}
      aria-busy={isExporting}
      onClick={() => {
        if (isExporting) return;
        setIsExporting(true);
        try {
          const csv = toCsv(rows);
          const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
          const url = URL.createObjectURL(blob);
          const link = document.createElement("a");
          link.href = url;
          link.setAttribute("download", fileName);
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        } finally {
          setTimeout(() => setIsExporting(false), 300);
        }
      }}
      className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#2e5a3d] px-3 py-2 text-sm font-semibold text-[#2e5a3d] disabled:cursor-not-allowed disabled:opacity-70"
    >
      {isExporting ? (
        <>
          <LoadingSpinner />
          Exporting...
        </>
      ) : (
        "Export CSV"
      )}
    </button>
  );
}
