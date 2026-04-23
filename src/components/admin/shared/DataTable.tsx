import type { ReactNode } from "react";

export type DataTableColumn<T> = {
  key: keyof T | string;
  header: string;
  render?: (row: T) => ReactNode;
};

export function DataTable<T extends { id: string }>({
  columns,
  rows,
  emptyMessage = "No records found.",
}: {
  columns: DataTableColumn<T>[];
  rows: T[];
  emptyMessage?: string;
}) {
  return (
    <div className="overflow-hidden rounded-2xl border border-[#ddd4c6] bg-white/95 shadow-[0_12px_36px_-30px_rgba(12,23,16,0.85)]">
      <div className="overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-[#f4efe4] text-[#536458]">
            <tr>
              {columns.map((col) => (
                <th key={String(col.key)} className="whitespace-nowrap px-4 py-3.5 text-xs font-semibold uppercase tracking-[0.16em]">
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-4 py-10 text-center text-[#6f7d74]">
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              rows.map((row) => (
                <tr key={row.id} className="border-t border-[#eee6da] align-top transition hover:bg-[#faf7f1]">
                  {columns.map((col) => (
                    <td key={String(col.key)} className="px-4 py-3.5 text-[#2f4137]">
                      {col.render ? col.render(row) : String((row as Record<string, unknown>)[String(col.key)] ?? "-")}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
