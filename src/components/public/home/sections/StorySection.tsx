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
      <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr] lg:items-stretch">
        <div className="order-2 flex h-full flex-col justify-between lg:order-1">
          <div>
            <p className="text-xs uppercase tracking-[0.22em] text-[#6d7f70]">Our Story</p>
            <h2 className="mt-2 font-serif text-3xl text-[#214531] sm:text-4xl lg:text-5xl">Small by choice, private by design.</h2>
            <p className="mt-4 text-sm leading-7 text-[#4f5f54] sm:text-base" style={{ textAlign: "justify" }}>
              {fullDescription ||
                "La Ki Trep is a boutique retreat in Umran, Ri Bhoi—created for guests who prefer quiet spaces, thoughtful hosting, and slower days in nature."}
            </p>
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <div className="rounded-xl border border-[#e5dbc9] bg-[#fcf8f0] px-4 py-3 text-sm text-[#31513d]">
              Intimate boutique scale with only five cottages.
            </div>
            <div className="rounded-xl border border-[#e5dbc9] bg-[#fcf8f0] px-4 py-3 text-sm text-[#31513d]">
              Best suited for meaningful getaways and private group stays.
            </div>
          </div>
        </div>

        <div className="order-1 lg:order-2">
          <div className="relative grid gap-3 sm:grid-cols-2">
            {aboutImagePrimary ? (
              <img
                src={aboutImagePrimary.url}
                alt={aboutImagePrimary.alt}
                className="h-52 w-full rounded-2xl object-cover shadow-md sm:col-span-2 sm:h-64"
                loading="lazy"
              />
            ) : null}

            {aboutImageSecondary ? (
              <img
                src={aboutImageSecondary.url}
                alt={aboutImageSecondary.alt}
                className="h-40 w-full rounded-2xl object-cover shadow-sm sm:h-48"
                loading="lazy"
              />
            ) : null}

            {aboutImageAccent ? (
              <img
                src={aboutImageAccent.url}
                alt={aboutImageAccent.alt}
                className="h-40 w-full rounded-2xl object-cover shadow-sm sm:h-48"
                loading="lazy"
              />
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}
