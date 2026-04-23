import type { FaqItem, HomePolicy } from "../home.types";

type PoliciesFaqSectionProps = {
  topPolicies: HomePolicy[];
  faqItems: FaqItem[];
};

export function PoliciesFaqSection({ topPolicies, faqItems }: PoliciesFaqSectionProps) {
  return (
    <section className="mx-auto max-w-7xl px-4 pb-10 sm:px-6 sm:pb-12 lg:pb-16">
      <h2 className="font-serif text-3xl text-[#214531] sm:text-4xl">Policies & Stay FAQs</h2>
      {topPolicies.length > 0 ? (
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          {topPolicies.map((policy) => (
            <article key={policy.id} className="rounded-2xl border border-[#e2d8c8] bg-[#faf6ef] p-4">
              <h3 className="font-semibold text-[#2f4f3a]">{policy.title}</h3>
              <p className="mt-2 line-clamp-4 text-sm text-[#58665c]">{policy.content}</p>
            </article>
          ))}
        </div>
      ) : null}
      <div className="mt-4 space-y-3">
        {faqItems.map((item) => (
          <details key={item.title} className="group rounded-2xl border border-[#dfd6c9] bg-[#fdfbf7] p-4 open:shadow-sm">
            <summary className="cursor-pointer list-none font-semibold text-[#274634]">{item.title}</summary>
            <ul className="mt-3 space-y-2 text-sm text-[#55645a]">
              {item.points.map((point) => (
                <li key={point}>• {point}</li>
              ))}
            </ul>
          </details>
        ))}
      </div>
    </section>
  );
}
