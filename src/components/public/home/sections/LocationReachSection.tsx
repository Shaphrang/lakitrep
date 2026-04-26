import { BookNowButton } from "@/components/public/booking/BookNowButton";

type LocationReachSectionProps = {
  whatsappDirectionsLink: string;
  hasWhatsappContact: boolean;
};

type InfoCard = {
  title: string;
  heading: string;
  details?: string;
};

const LOCATION_CARDS: InfoCard[] = [
  {
    title: "Nearest Town / City",
    heading: "Umran, Ri Bhoi District",
  },
  {
    title: "From Shillong",
    heading: "Approx. 35–45 km",
    details: "Around 1–1.5 hours by road, depending on route and traffic.",
  },
  {
    title: "From Guwahati",
    heading: "Approx. 80–90 km",
    details: "Around 1.5–2.5 hours by road, depending on traffic.",
  },
  {
    title: "From Airport",
    heading: "Shillong / Umroi Airport: approx. 25–35 km",
    details: "Guwahati Airport: approx. 95–105 km.",
  },
];

export function LocationReachSection({ whatsappDirectionsLink, hasWhatsappContact }: LocationReachSectionProps) {
  return (
    <section className="mx-auto max-w-7xl px-4 pb-10 sm:px-6 sm:pb-12 lg:pb-14">
      <div className="overflow-hidden rounded-3xl border border-[#d8ccb7] bg-[linear-gradient(135deg,#fdf9f1_0%,#f7efe2_52%,#f2e8d7_100%)] p-4 shadow-[0_18px_42px_rgba(35,67,50,0.1)] sm:p-6 lg:p-8">
        <div className="grid gap-4 lg:grid-cols-[1.05fr_1fr] lg:items-start lg:gap-8">
          <article className="order-1">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#7a876f]">Find us easily</p>
            <h2 className="mt-1 font-serif text-3xl leading-tight text-[#214531] sm:text-4xl">Location &amp; How to Reach</h2>
            <p className="mt-3 max-w-xl text-sm leading-6 text-[#52665a] sm:text-base">
              La Ki Trep is located near Umran in Ri Bhoi District, making it accessible from Shillong, Guwahati,
              and nearby airports by road.
            </p>

            <div className="mt-4 rounded-3xl border border-[#dcbf7b]/30 bg-[#1f3b2a] p-4 text-[#f5efdf] shadow-sm sm:mt-6 sm:p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#e4d2ac]">How to Reach</p>
              <p className="mt-2 text-sm leading-6 text-[#f0e7d2] sm:text-[0.95rem]">
                The resort is accessible by road from Shillong, Guwahati, and Shillong Airport. Guests are requested
                to pre-book and contact the resort on WhatsApp for directions. For privacy and guest safety, the exact
                map pin is shared only after booking confirmation.
              </p>

              <div className="mt-4">
                {hasWhatsappContact ? (
                  <a
                    href={whatsappDirectionsLink}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex min-h-11 w-full items-center justify-center rounded-xl border border-[#dcbf7b]/50 bg-[#25D366] px-4 py-2 text-sm font-bold text-white shadow-[0_12px_30px_rgba(37,211,102,0.32)] transition hover:bg-[#1ebe5d] sm:w-auto"
                  >
                    WhatsApp for Directions
                  </a>
                ) : (
                  <BookNowButton
                    className="min-h-11 w-full rounded-xl bg-[#d5bf91] px-4 py-2 text-sm font-semibold text-[#1f3528] sm:w-auto"
                    label="Contact for Directions"
                    lockCottage={false}
                  />
                )}
              </div>
            </div>
          </article>

          <div className="order-2 grid gap-3 sm:grid-cols-2 sm:gap-4">
            {LOCATION_CARDS.map((card) => (
              <article
                key={card.title}
                className="rounded-3xl border border-[#d9cfbf] bg-[#fbf8f2] p-4 shadow-sm sm:p-5"
              >
                <p className="text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-[#9a6a1f]">{card.title}</p>
                <p className="mt-2 font-serif text-lg leading-6 text-[#214531] sm:text-xl">{card.heading}</p>
                {card.details ? <p className="mt-2 text-sm leading-6 text-[#56695d]">{card.details}</p> : null}
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
