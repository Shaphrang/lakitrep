import { REPORT_DATE_PRESETS } from "../reports.constants";

type Option = { value: string; label: string };

export function ReportsFilterBar({
  preset,
  from,
  to,
  search,
  searchPlaceholder,
  filters,
  csvHref,
}: {
  preset: string;
  from: string;
  to: string;
  search?: string;
  searchPlaceholder?: string;
  filters?: { name: string; label: string; value: string; options: Option[] }[];
  csvHref?: string;
}) {
  const inputClass = "rounded-xl border border-[#d8cfbf] bg-[#fdfbf7] px-3 py-2 text-sm text-[#21392c]";

  return (
    <form className="grid gap-2 rounded-2xl border border-[#ddd4c6] bg-white p-4 lg:grid-cols-12">
      <label className="text-sm lg:col-span-2">
        Date preset
        <select name="preset" defaultValue={preset} className={`${inputClass} mt-1 w-full`}>
          {REPORT_DATE_PRESETS.map((datePreset) => (
            <option key={datePreset.value} value={datePreset.value}>
              {datePreset.label}
            </option>
          ))}
        </select>
      </label>

      <label className="text-sm lg:col-span-2">
        From
        <input type="date" name="from" defaultValue={from} className={`${inputClass} mt-1 w-full`} />
      </label>

      <label className="text-sm lg:col-span-2">
        To
        <input type="date" name="to" defaultValue={to} className={`${inputClass} mt-1 w-full`} />
      </label>

      <label className="text-sm lg:col-span-3">
        Search
        <input
          name="q"
          defaultValue={search ?? ""}
          placeholder={searchPlaceholder ?? "Search"}
          className={`${inputClass} mt-1 w-full`}
        />
      </label>

      {filters?.map((filter) => (
        <label key={filter.name} className="text-sm lg:col-span-2">
          {filter.label}
          <select name={filter.name} defaultValue={filter.value} className={`${inputClass} mt-1 w-full`}>
            {filter.options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
      ))}

      <div className="flex items-end gap-2 lg:col-span-1">
        <button type="submit" className="w-full rounded-xl border border-[#d8cfbf] px-3 py-2 text-sm font-semibold text-[#2b4637]">
          Filter
        </button>
      </div>

      {csvHref ? (
        <a href={csvHref} className="rounded-xl bg-[#2e5a3d] px-3 py-2 text-center text-sm font-semibold text-white lg:col-span-2 lg:justify-self-end">
          Export CSV
        </a>
      ) : null}
    </form>
  );
}
