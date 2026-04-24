import type { HomeExperience } from "../home.types";

type AttractionsSectionProps = {
  experiences: HomeExperience[];
};

export function AttractionsSection({ experiences }: AttractionsSectionProps) {
  return (
    <section className="mx-auto max-w-7xl px-4 pb-10 sm:px-6 sm:pb-12 lg:pb-16">
      <div className="overflow-hidden rounded-[28px] border border-[#ded4c3] bg-[linear-gradient(135deg,#fffaf1_0%,#f7ecd9_55%,#efe0c6_100%)] p-4 shadow-[0_18px_55px_rgba(36,67,50,0.1)] sm:p-6 lg:p-8">
        <div className="mb-5 flex items-end justify-between gap-4">
          <div>
            <p className="text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-[#9b7645] sm:text-xs">
              Explore Nearby
            </p>

            <h2 className="mt-1 font-serif text-2xl leading-tight text-[#214531] sm:text-4xl">
              Around La Ki Trep
            </h2>

            <p className="mt-2 max-w-2xl text-xs leading-5 text-[#5b675f] sm:text-base sm:leading-7">
              Slow days, scenic drives, and local experiences near the resort.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2 sm:gap-4">
          {experiences.slice(0, 6).map((experience, index) => (
            <article
              key={experience.name}
              className="group overflow-hidden rounded-2xl border border-white/70 bg-[linear-gradient(145deg,#fffdf8_0%,#f7eddc_55%,#efe1c8_100%)] shadow-[0_12px_30px_rgba(36,67,50,0.12)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_22px_50px_rgba(36,67,50,0.18)] sm:rounded-[26px]"
            >
              <div className="relative aspect-[4/4.4] overflow-hidden bg-[#efe6d8] sm:aspect-[4/3]">
                {experience.image ? (
                  <img
                    src={experience.image}
                    alt={experience.name}
                    className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                    loading={index === 0 ? "eager" : "lazy"}
                    decoding="async"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center px-2 text-center text-[0.55rem] text-[#647369] sm:text-sm">
                    Attraction image unavailable
                  </div>
                )}

                <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(18,34,24,0.02)_0%,rgba(18,34,24,0.08)_35%,rgba(18,34,24,0.68)_100%)]" />

                <div className="absolute inset-x-0 bottom-0 p-2 sm:p-4">
                  <h3 className="line-clamp-2 font-serif text-[0.8rem] leading-tight text-white drop-shadow-sm sm:text-2xl">
                    {experience.name}
                  </h3>
                </div>
              </div>

              <div className="bg-[linear-gradient(180deg,#fffdf8_0%,#f3eadb_100%)] p-2 sm:p-4">
                <p className="line-clamp-2 text-[0.6rem] leading-4 text-[#55645a] sm:line-clamp-3 sm:text-sm sm:leading-6">
                  {experience.note}
                </p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}