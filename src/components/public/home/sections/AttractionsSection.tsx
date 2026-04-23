import type { HomeExperience } from "../home.types";

type AttractionsSectionProps = {
  experiences: HomeExperience[];
};

export function AttractionsSection({ experiences }: AttractionsSectionProps) {
  return (
    <section className="mx-auto max-w-7xl px-4 pb-10 sm:px-6 sm:pb-12 lg:pb-16">
      <h2 className="font-serif text-3xl text-[#214531] sm:text-4xl">Around La Ki Trep</h2>
      <p className="mt-2 text-sm text-[#5b675f] sm:text-base">Slow days, scenic drives, and local experiences near the resort.</p>
      <div className="mt-5 grid grid-cols-2 gap-3 lg:grid-cols-3">
        {experiences.map((experience, index) => (
          <article key={experience.name} className="overflow-hidden rounded-2xl border border-[#dfd6c9] bg-[#fdfbf7] shadow-sm">
            <div className="relative aspect-[4/3] bg-[#efe6d8]">
              {experience.image ? (
                <img
                  src={experience.image}
                  alt={experience.name}
                  className="h-full w-full object-cover"
                  loading={index === 0 ? "eager" : "lazy"}
                  decoding="async"
                />
              ) : (
                <div className="flex h-full items-center justify-center text-sm text-[#647369]">Attraction image unavailable</div>
              )}
            </div>
            <div className="p-4">
              <p className="text-[11px] uppercase tracking-[0.15em] text-[#6a7a70]">{experience.distance}</p>
              <h3 className="mt-1 font-serif text-xl text-[#244532]">{experience.name}</h3>
              <p className="mt-2 line-clamp-3 text-sm text-[#55645a]">{experience.note}</p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
