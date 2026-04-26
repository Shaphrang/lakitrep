import Link from "next/link";
import { REPORT_DATE_PRESETS } from "../reports.constants";

type Option = {
  value: string;
  label: string;
};

export function ReportsFilterBar({
  preset,
  from,
  to,
  search,
  searchPlaceholder,
  filters,
  csvHref,
  clearHref = "/admin/reports/revenue",
}: {
  preset: string;
  from: string;
  to: string;
  search?: string;
  searchPlaceholder?: string;
  filters?: {
    name: string;
    label: string;
    value: string;
    options: Option[];
  }[];
  csvHref?: string;
  clearHref?: string;
}) {
  const inputClass =
    "mt-1 w-full rounded-xl border border-[#d8cfbf] bg-[#fdfbf7] px-3 py-2 text-sm text-[#21392c] outline-none transition focus:border-[#2e5a3d] focus:ring-2 focus:ring-[#2e5a3d]/15";

  return (
    <form
      method="GET"
      className="rounded-2xl border border-[#ddd4c6] bg-white p-4 shadow-sm"
    >
      <div className="mb-3">
        <h2 className="text-sm font-semibold text-[#21392c]">
          Revenue Filters
        </h2>
        <p className="text-xs text-[#6f7d74]">
          Filter revenue by created date, cottage, payment method, payment
          status, and search.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-12">
        <label className="text-sm text-[#344b3d] lg:col-span-2">
          Date preset
          <select name="preset" defaultValue={preset} className={inputClass}>
            {REPORT_DATE_PRESETS.map((datePreset) => (
              <option key={datePreset.value} value={datePreset.value}>
                {datePreset.label}
              </option>
            ))}
          </select>
        </label>

        <label className="text-sm text-[#344b3d] lg:col-span-2">
          From
          <input
            type="date"
            name="from"
            defaultValue={from}
            className={inputClass}
          />
        </label>

        <label className="text-sm text-[#344b3d] lg:col-span-2">
          To
          <input
            type="date"
            name="to"
            defaultValue={to}
            className={inputClass}
          />
        </label>

        <label className="text-sm text-[#344b3d] lg:col-span-3">
          Search
          <input
            name="q"
            defaultValue={search ?? ""}
            placeholder={
              searchPlaceholder ?? "Search booking, guest, phone, cottage"
            }
            className={inputClass}
          />
        </label>

        {filters?.map((filter) => (
          <label
            key={filter.name}
            className="text-sm text-[#344b3d] lg:col-span-2"
          >
            {filter.label}
            <select
              name={filter.name}
              defaultValue={filter.value}
              className={inputClass}
            >
              {filter.options.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
        ))}

        <div className="flex flex-wrap items-end gap-2 lg:col-span-12">
          <button
            type="submit"
            className="rounded-xl bg-[#2e5a3d] px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-[#244832]"
          >
            Apply Filters
          </button>

          <Link
            href={clearHref}
            className="rounded-xl border border-[#d8cfbf] bg-[#fdfbf7] px-4 py-2 text-sm font-semibold text-[#2b4637] transition hover:bg-[#f4efe4]"
          >
            Clear All Filters
          </Link>

          {csvHref ? (
            <a
              href={csvHref}
              className="rounded-xl border border-[#2e5a3d] bg-white px-4 py-2 text-sm font-semibold text-[#2e5a3d] transition hover:bg-[#eef5ef]"
            >
              Export CSV
            </a>
          ) : null}
        </div>
      </div>
    </form>
  );
}