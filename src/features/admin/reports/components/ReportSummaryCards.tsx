import { currency, percent } from "../reports.utils";

type ReportCard = {
  label: string;
  value: number | string | null | undefined;
  kind?: "currency" | "percent" | "number" | "text";
  helper?: string;
};

function displayValue(card: ReportCard) {
  if (card.value === null || card.value === undefined || card.value === "") {
    return "—";
  }

  if (card.kind === "currency") {
    return currency(Number(card.value || 0));
  }

  if (card.kind === "percent") {
    return percent(Number(card.value || 0));
  }

  return String(card.value);
}

export function ReportSummaryCards({ cards }: { cards: ReportCard[] }) {
  return (
    <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {cards.map((card) => (
        <article
          key={card.label}
          className="rounded-2xl border border-[#ddd4c6] bg-white p-4 shadow-sm"
        >
          <p className="text-xs font-medium uppercase tracking-[0.12em] text-[#6e7f72]">
            {card.label}
          </p>

          <p className="mt-2 text-2xl font-semibold text-[#21392c]">
            {displayValue(card)}
          </p>

          {card.helper ? (
            <p className="mt-1 text-xs leading-relaxed text-[#7b877f]">
              {card.helper}
            </p>
          ) : null}
        </article>
      ))}
    </section>
  );
}