import Link from "next/link";
import type { GalleryPreviewCard } from "../home.types";

type GalleryPreviewSectionProps = {
  cards: GalleryPreviewCard[];
  totalGalleryImages: number;
};

export function GalleryPreviewSection({ cards, totalGalleryImages }: GalleryPreviewSectionProps) {
  return (
    <section className="mx-auto max-w-7xl px-4 pb-10 sm:px-6 sm:pb-12 lg:pb-16">
      <div>
        <p className="text-xs uppercase tracking-[0.25em] text-[#0f7c69]">Moments at La Ki Trep</p>
        <h2 className="mt-2 font-serif text-3xl text-[#214531] sm:text-4xl lg:text-5xl">
          Explore the spaces, views, and experiences that shape the stay.
        </h2>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-[#5a685e] sm:text-base">
          From cottage corners and poolside afternoons to dining spaces and scenic surroundings, take a closer look at the atmosphere of La Ki Trep.
        </p>
      </div>

      {cards.length > 0 ? (
        <>
          <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-12">
            {cards.map((item) => (
              <Link
                key={item.key}
                href={`/gallery#${item.key}`}
                className={`group relative overflow-hidden rounded-[28px] shadow-[0_12px_30px_rgba(34,67,49,0.10)] transition-transform duration-300 hover:-translate-y-0.5 ${item.className}`}
              >
                <img
                  src={item.image.url}
                  alt={item.image.alt}
                  className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                  loading="lazy"
                />

                <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(17,41,31,0.08)_0%,rgba(26,74,54,0.22)_38%,rgba(22,70,49,0.78)_100%)]" />

                <div className="absolute inset-x-0 bottom-0 p-4 text-white sm:p-5">
                  <p className="text-[10px] font-medium uppercase tracking-[0.24em] text-white/80">View gallery</p>
                  <h3 className="mt-1 max-w-[85%] font-serif text-lg leading-6 sm:text-xl sm:leading-7">{item.label}</h3>
                </div>
              </Link>
            ))}
          </div>

          <div className="mt-4 flex items-center justify-between gap-3 text-xs text-[#6b776f] sm:text-sm">
            <p>{totalGalleryImages} published images across cottage and property categories</p>
            <Link href="/gallery" className="font-semibold text-[#2e5f3e]">
              View all images →
            </Link>
          </div>
        </>
      ) : (
        <div className="mt-8 rounded-2xl border border-dashed border-[#d8cdbd] bg-[#faf6ee] p-6 text-sm text-[#5a685e]">
          Gallery images will appear here once media is published.
        </div>
      )}
    </section>
  );
}
