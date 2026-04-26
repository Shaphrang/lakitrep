"use client";

import { useMemo, useState } from "react";
import { ExportCsvButton } from "./ExportCsvButton";

type Col<T> = { key: keyof T; label: string; sortable?: boolean; format?: "currency_inr" | "percent_1" | "nights_1" | "booking_actions" };

function formatCell<T extends { id: string }>(row: T, col: Col<T>) {
  const value = row[col.key];

  if (col.format === "currency_inr") return `₹${Number(value ?? 0).toLocaleString("en-IN")}`;
  if (col.format === "percent_1") return `${Number(value ?? 0).toFixed(1)}%`;
  if (col.format === "nights_1") return `${Number(value ?? 0).toFixed(1)} nights`;
  if (col.format === "booking_actions") return `Open booking: /admin/bookings/${row.id} | billing: /admin/billing/${row.id}`;

  return String(value ?? "—");
}

export function ReportTableClient<T extends { id: string }>({
  title,
  rows,
  columns,
  searchKeys,
  fileName,
}: {
  title: string;
  rows: T[];
  columns: Col<T>[];
  searchKeys: (keyof T)[];
  fileName: string;
}) {
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [sortBy, setSortBy] = useState<keyof T>(columns[0].key);
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    let data = rows;
    if (q) {
      data = data.filter((row) => searchKeys.some((k) => String(row[k] ?? "").toLowerCase().includes(q)));
    }

    data = [...data].sort((a, b) => {
      const av = a[sortBy];
      const bv = b[sortBy];
      const order = String(av).localeCompare(String(bv), undefined, { numeric: true });
      return sortDir === "asc" ? order : -order;
    });
    return data;
  }, [query, rows, searchKeys, sortBy, sortDir]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const paged = filtered.slice((page - 1) * pageSize, page * pageSize);

  return (
    <section className="space-y-3 rounded-2xl border border-[#ddd4c6] bg-white p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="font-semibold">{title}</h3>
        <ExportCsvButton fileName={fileName} rows={filtered as Record<string, unknown>[]} />
      </div>
      <div className="flex flex-wrap gap-2">
        <input value={query} onChange={(e) => { setQuery(e.target.value); setPage(1); }} placeholder="Search..." className="rounded-xl border border-[#d8cfbf] bg-[#fdfbf7] px-3 py-2 text-sm" />
        <select value={String(pageSize)} onChange={(e) => { setPageSize(Number(e.target.value)); setPage(1); }} className="rounded-xl border border-[#d8cfbf] bg-[#fdfbf7] px-3 py-2 text-sm">
          <option value="10">10 / page</option><option value="20">20 / page</option><option value="50">50 / page</option>
        </select>
        <button type="button" className="rounded-xl border border-[#d8cfbf] px-3 py-2 text-sm" onClick={() => { setQuery(""); setSortBy(columns[0].key); setSortDir("desc"); setPage(1); }}>Reset filters</button>
      </div>
      {rows.length === 0 ? <p className="rounded-xl border border-dashed border-[#c7baa1] p-4 text-sm text-[#6f7d74]">No data available for selected date range.</p> : null}
      <div className="overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-[#f4efe4] text-[#536458]"><tr>{columns.map((c) => <th key={String(c.key)} className="whitespace-nowrap px-3 py-2"><button className="font-semibold" onClick={() => { if (!c.sortable) return; if (sortBy === c.key) setSortDir(sortDir === "asc" ? "desc" : "asc"); else { setSortBy(c.key); setSortDir("asc"); } }}>{c.label}</button></th>)}</tr></thead>
          <tbody>{paged.map((row) => <tr key={row.id} className="border-t border-[#eee6da]">{columns.map((c) => <td key={String(c.key)} className="whitespace-nowrap px-3 py-2">{formatCell(row, c)}</td>)}</tr>)}</tbody>
        </table>
      </div>
      {rows.length > 0 && paged.length === 0 ? <p className="text-sm text-[#9a5f20]">No results after filters. Try reset.</p> : null}
      <div className="flex items-center justify-between text-sm">
        <p>Page {page} of {totalPages} · {filtered.length} rows</p>
        <div className="flex gap-2">
          <button className="rounded-lg border px-3 py-1" disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>Previous</button>
          <button className="rounded-lg border px-3 py-1" disabled={page >= totalPages} onClick={() => setPage((p) => Math.min(totalPages, p + 1))}>Next</button>
        </div>
      </div>
    </section>
  );
}
