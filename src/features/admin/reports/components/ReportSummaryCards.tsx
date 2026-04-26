import { currency, percent } from "../reports.utils";

export function ReportSummaryCards({
  cards,
}: {
  cards: { label: string; value: number | string; kind?: "currency" | "percent" | "number"; helper?: string }[];
}) {
  return (
    <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {cards.map((card) => (
        <article key={card.label} className="rounded-2xl border border-[#ddd4c6] bg-white p-4">
          <p className="text-xs text-[#6e7f72]">{card.label}</p>
          <p className="mt-1 text-xl font-semibold text-[#21392c]">
            {card.kind === "currency" ? currency(Number(card.value)) : card.kind === "percent" ? percent(Number(card.value)) : String(card.value)}
          </p>
          {card.helper ? <p className="mt-1 text-xs text-[#7b877f]">{card.helper}</p> : null}
        </article>
      ))}
    </section>
  );
}
