import type { GalleryImage } from "../home.types";

type EventsSectionProps = {
  eventImage: GalleryImage | null;
  whatsappEventLink: string;
};

export function EventsSection({ eventImage, whatsappEventLink }: EventsSectionProps) {
  return (
    <section className="mx-auto max-w-7xl px-4 pb-10 sm:px-6 sm:pb-12 lg:pb-16">
      <div className="overflow-hidden rounded-[30px] border border-[#d9cdbb] bg-[linear-gradient(135deg,#fffaf1_0%,#f5ead8_52%,#ead9bd_100%)] p-3 shadow-[0_20px_60px_rgba(36,67,50,0.12)] sm:p-5 lg:p-6">
        <div className="grid gap-3 sm:grid-cols-[0.95fr_1.05fr] sm:gap-5 lg:gap-7">
          <div className="relative hidden min-h-full overflow-hidden rounded-[24px] bg-[#efe4d2] shadow-[0_14px_34px_rgba(36,67,50,0.14)] sm:block">
            {eventImage ? (
              <img
                src={eventImage.url}
                alt={eventImage.alt}
                className="h-full min-h-[230px] w-full object-cover sm:min-h-[360px]"
                loading="lazy"
              />
            ) : (
              <div className="flex h-full min-h-[230px] items-center justify-center px-3 text-center text-xs text-[#647369] sm:min-h-[360px] sm:text-sm">
                Event image unavailable
              </div>
            )}

            <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(18,34,24,0.02)_0%,rgba(18,34,24,0.12)_45%,rgba(18,34,24,0.56)_100%)]" />

            <div className="absolute bottom-3 left-3 right-3 rounded-2xl border border-white/25 bg-white/18 p-3 text-white shadow-lg backdrop-blur-md sm:bottom-5 sm:left-5 sm:right-5 sm:p-4">
              <p className="text-[0.6rem] font-semibold uppercase tracking-[0.2em] sm:text-xs">
                Private gatherings
              </p>
              <p className="mt-1 font-serif text-lg leading-tight sm:text-3xl">
                Celebrate quietly, beautifully.
              </p>
            </div>
          </div>

          <article className="flex flex-col justify-center rounded-[24px] border border-white/70 bg-[#fffdf8]/85 p-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.8)] sm:p-6 lg:p-8">
            <p className="text-[0.6rem] font-semibold uppercase tracking-[0.2em] text-[#9b7645] sm:text-xs">
              Events & Groups
            </p>

            <h2 className="mt-1 font-serif text-[1.35rem] leading-tight text-[#214531] sm:text-4xl lg:text-5xl">
              Events & Group Bookings
            </h2>

            <p className="mt-2 text-[0.7rem] leading-5 text-[#536258] sm:text-base sm:leading-7">
              Private celebrations and retreat-style gatherings coordinated directly on WhatsApp.
            </p>

            <div className="mt-3 grid gap-1.5 text-[0.62rem] leading-4 text-[#395142] sm:mt-5 sm:gap-2 sm:text-sm sm:leading-6">
              {[
                "Birthday parties, anniversaries, bachelorettes, corporate retreats, and day events.",
                "Full property booking available across all 5 cottages.",
                "Day events without stay: up to 25 guests.",
                "Groups exceeding 10 persons must book all cottages.",
                "Restaurant-only groups: up to 6 outside diners.",
                "Outside food/catering and outside alcohol are not permitted.",
              ].map((item) => (
                <div
                  key={item}
                  className="rounded-xl border border-[#eadfcd] bg-[linear-gradient(135deg,#fffaf1_0%,#f4ebdd_100%)] px-2 py-1.5 shadow-sm sm:px-3 sm:py-2"
                >
                  {item}
                </div>
              ))}
            </div>

            <div className="mt-4 flex justify-center sm:mt-6">
              <a
                href={whatsappEventLink}
                target="_blank"
                rel="noreferrer"
                className="inline-flex min-h-10 items-center justify-center rounded-full bg-[#25D366] px-4 py-2 text-[0.7rem] font-bold text-white shadow-[0_12px_28px_rgba(37,211,102,0.35)] transition hover:bg-[#1ebe5d] sm:min-h-12 sm:px-7 sm:text-sm"
              >
                Enquire on WhatsApp
              </a>
            </div>
          </article>
        </div>
      </div>
    </section>
  );
}