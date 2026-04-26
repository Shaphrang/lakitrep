"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { currencyOrDash, formatDateOnly, percentOrDash, toCsv } from "../reports.utils";

type ColumnFormat =
  | "currency_inr"
  | "percent_1"
  | "nights_1"
  | "date"
  | "billing_action";

type Col<T> = {
  key: keyof T;
  label: string;
  sortable?: boolean;
  format?: ColumnFormat;
};

function isMissing(value: unknown) {
  return value === null || value === undefined || value === "";
}

function formatCell<T extends { id: string; bookingId?: string }>(
  row: T,
  col: Col<T>,
) {
  const value = row[col.key];

  if (col.format === "currency_inr") {
    return currencyOrDash(value);
  }

  if (col.format === "percent_1") {
    return percentOrDash(value);
  }

  if (col.format === "nights_1") {
    if (isMissing(value)) return "—";
    return `${Number(value || 0).toFixed(1)} nights`;
  }

  if (col.format === "date") {
    return formatDateOnly(String(value ?? ""));
  }

  if (col.format === "billing_action") {
    const bookingId = row.bookingId || row.id;

    return (
      <Link
        href={`/admin/billing/${bookingId}`}
        className="rounded-lg bg-[#2e5a3d] px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-[#244832]"
      >
        Open Billing
      </Link>
    );
  }

  if (isMissing(value)) return "—";

  return String(value);
}

function formatCsvCell<T extends { id: string; bookingId?: string }>(
  row: T,
  col: Col<T>,
) {
  const value = row[col.key];

  if (col.format === "currency_inr") return currencyOrDash(value);
  if (col.format === "percent_1") return percentOrDash(value);
  if (col.format === "date") return formatDateOnly(String(value ?? ""));
  if (col.format === "billing_action") {
    const bookingId = row.bookingId || row.id;
    return `/admin/billing/${bookingId}`;
  }

  return value ?? "";
}

function getSortValue(value: unknown) {
  if (value === null || value === undefined) return "";

  if (typeof value === "number") return value;

  const asString = String(value);
  const asNumber = Number(asString.replace(/[₹,\s]/g, ""));

  if (!Number.isNaN(asNumber) && asString.trim() !== "") {
    return asNumber;
  }

  const asDate = new Date(asString);
  if (!Number.isNaN(asDate.getTime())) {
    return asDate.getTime();
  }

  return asString.toLowerCase();
}

function downloadCsv(fileName: string, rows: Record<string, unknown>[]) {
  const csv = toCsv(rows);
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  link.click();

  URL.revokeObjectURL(url);
}

export function ReportTableClient<T extends { id: string; bookingId?: string }>({
  title,
  rows,
  columns,
  searchKeys,
  fileName,
  emptyText = "No data available for selected filters.",
}: {
  title: string;
  rows: T[];
  columns: Col<T>[];
  searchKeys: (keyof T)[];
  fileName: string;
  emptyText?: string;
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
      data = data.filter((row) =>
        searchKeys.some((key) =>
          String(row[key] ?? "")
            .toLowerCase()
            .includes(q),
        ),
      );
    }

    return [...data].sort((a, b) => {
      const av = getSortValue(a[sortBy]);
      const bv = getSortValue(b[sortBy]);

      let order = 0;

      if (typeof av === "number" && typeof bv === "number") {
        order = av - bv;
      } else {
        order = String(av).localeCompare(String(bv), undefined, {
          numeric: true,
        });
      }

      return sortDir === "asc" ? order : -order;
    });
  }, [query, rows, searchKeys, sortBy, sortDir]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const paged = filtered.slice((page - 1) * pageSize, page * pageSize);

  const csvRows = filtered.map((row) => {
    const output: Record<string, unknown> = {};

    columns.forEach((col) => {
      output[col.label] = formatCsvCell(row, col);
    });

    return output;
  });

  return (
    <section className="space-y-3 rounded-2xl border border-[#ddd4c6] bg-white p-4 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h3 className="font-semibold text-[#21392c]">{title}</h3>
          <p className="text-xs text-[#6f7d74]">
            {filtered.length} record{filtered.length === 1 ? "" : "s"}
          </p>
        </div>

        <button
          type="button"
          onClick={() => downloadCsv(fileName, csvRows)}
          disabled={filtered.length === 0}
          className="rounded-xl bg-[#2e5a3d] px-3 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
        >
          Export CSV
        </button>
      </div>

      <div className="flex flex-wrap gap-2">
        <input
          value={query}
          onChange={(event) => {
            setQuery(event.target.value);
            setPage(1);
          }}
          placeholder="Search inside table..."
          className="min-w-[220px] rounded-xl border border-[#d8cfbf] bg-[#fdfbf7] px-3 py-2 text-sm outline-none focus:border-[#2e5a3d] focus:ring-2 focus:ring-[#2e5a3d]/15"
        />

        <select
          value={String(pageSize)}
          onChange={(event) => {
            setPageSize(Number(event.target.value));
            setPage(1);
          }}
          className="rounded-xl border border-[#d8cfbf] bg-[#fdfbf7] px-3 py-2 text-sm"
        >
          <option value="10">10 / page</option>
          <option value="20">20 / page</option>
          <option value="50">50 / page</option>
        </select>

        <button
          type="button"
          className="rounded-xl border border-[#d8cfbf] px-3 py-2 text-sm font-medium text-[#2b4637]"
          onClick={() => {
            setQuery("");
            setSortBy(columns[0].key);
            setSortDir("desc");
            setPage(1);
          }}
        >
          Reset Table
        </button>
      </div>

      {rows.length === 0 ? (
        <p className="rounded-xl border border-dashed border-[#c7baa1] bg-[#fdfbf7] p-4 text-sm text-[#6f7d74]">
          {emptyText}
        </p>
      ) : null}

      <div className="overflow-x-auto rounded-xl border border-[#eee6da]">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-[#f4efe4] text-[#536458]">
            <tr>
              {columns.map((column) => (
                <th
                  key={String(column.key)}
                  className="whitespace-nowrap px-3 py-2"
                >
                  {column.sortable ? (
                    <button
                      type="button"
                      className="font-semibold"
                      onClick={() => {
                        if (sortBy === column.key) {
                          setSortDir(sortDir === "asc" ? "desc" : "asc");
                        } else {
                          setSortBy(column.key);
                          setSortDir("asc");
                        }
                      }}
                    >
                      {column.label}
                      {sortBy === column.key
                        ? sortDir === "asc"
                          ? " ↑"
                          : " ↓"
                        : ""}
                    </button>
                  ) : (
                    <span className="font-semibold">{column.label}</span>
                  )}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {paged.map((row) => (
              <tr key={row.id} className="border-t border-[#eee6da]">
                {columns.map((column) => (
                  <td
                    key={String(column.key)}
                    className="whitespace-nowrap px-3 py-2 text-[#21392c]"
                  >
                    {formatCell(row, column)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {rows.length > 0 && paged.length === 0 ? (
        <p className="text-sm text-[#9a5f20]">
          No results after table search. Try reset.
        </p>
      ) : null}

      <div className="flex flex-wrap items-center justify-between gap-2 text-sm text-[#536458]">
        <p>
          Page {page} of {totalPages} · {filtered.length} rows
        </p>

        <div className="flex gap-2">
          <button
            type="button"
            className="rounded-lg border px-3 py-1 disabled:cursor-not-allowed disabled:opacity-50"
            disabled={page <= 1}
            onClick={() => setPage((current) => Math.max(1, current - 1))}
          >
            Previous
          </button>

          <button
            type="button"
            className="rounded-lg border px-3 py-1 disabled:cursor-not-allowed disabled:opacity-50"
            disabled={page >= totalPages}
            onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
          >
            Next
          </button>
        </div>
      </div>
    </section>
  );
}