import type { GalleryImage } from "../home.types";

type StorySectionProps = {
  fullDescription: string | null;
  aboutImagePrimary: GalleryImage | null;
  aboutImageSecondary: GalleryImage | null;
  aboutImageAccent: GalleryImage | null;
};

export function StorySection({
  fullDescription,
  aboutImagePrimary,
  aboutImageSecondary,
  aboutImageAccent,
}: StorySectionProps) {
  return (
    <section className="mx-auto max-w-7xl px-4 pb-10 sm:px-6 sm:pb-12 lg:pb-16">
      <div className="grid grid-cols-[2fr_1fr] gap-3 lg:grid-cols-[1.05fr_0.95fr] lg:gap-6 lg:items-stretch">
        <div className="flex h-full flex-col justify-between lg:order-1">
          <div>
            <p className="text-[0.58rem] uppercase tracking-[0.16em] text-[#6d7f70] sm:text-xs sm:tracking-[0.22em]">
              Our Story
            </p>

            <h2 className="mt-1 font-serif text-[1.2rem] leading-tight text-[#214531] sm:mt-2 sm:text-4xl lg:text-5xl">
              Small by choice, private by design.
            </h2>

            <p
              className="mt-2 line-clamp-6 text-[0.68rem] leading-5 text-[#4f5f54] sm:mt-4 sm:line-clamp-none sm:text-base sm:leading-7"
              style={{ textAlign: "justify" }}
            >
              {fullDescription ||
                "La Ki Trep is a boutique retreat in Umran, Ri Bhoi—created for guests who prefer quiet spaces, thoughtful hosting, and slower days in nature."}
            </p>
          </div>

          <div className="mt-3 grid gap-2 sm:mt-5 sm:grid-cols-2 sm:gap-3">
            <div className="rounded-lg border border-[#e5dbc9] bg-[#fcf8f0] px-2 py-2 text-[0.62rem] leading-4 text-[#31513d] sm:rounded-xl sm:px-4 sm:py-3 sm:text-sm">
              Intimate boutique scale with only five cottages.
            </div>

            <div className="rounded-lg border border-[#e5dbc9] bg-[#fcf8f0] px-2 py-2 text-[0.62rem] leading-4 text-[#31513d] sm:rounded-xl sm:px-4 sm:py-3 sm:text-sm">
              Best suited for meaningful getaways and private group stays.
            </div>
          </div>
        </div>

        <div className="lg:order-2">
          <div className="grid gap-2 sm:grid-cols-2 sm:gap-3">
            {aboutImagePrimary ? (
              <img
                src={aboutImagePrimary.url}
                alt={aboutImagePrimary.alt}
                className="h-24 w-full rounded-xl object-cover shadow-md sm:col-span-2 sm:h-64 sm:rounded-2xl"
                loading="lazy"
              />
            ) : null}

            {aboutImageSecondary ? (
              <img
                src={aboutImageSecondary.url}
                alt={aboutImageSecondary.alt}
                className="h-20 w-full rounded-xl object-cover shadow-sm sm:h-48 sm:rounded-2xl"
                loading="lazy"
              />
            ) : null}

            {aboutImageAccent ? (
              <img
                src={aboutImageAccent.url}
                alt={aboutImageAccent.alt}
                className="h-20 w-full rounded-xl object-cover shadow-sm sm:h-48 sm:rounded-2xl"
                loading="lazy"
              />
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}