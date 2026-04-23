import type { GalleryImage } from "../home.types";

type EventsSectionProps = {
  eventImage: GalleryImage | null;
  whatsappEventLink: string;
};

export function EventsSection({ eventImage, whatsappEventLink }: EventsSectionProps) {
  return (
    <section className="mx-auto max-w-7xl px-4 pb-10 sm:px-6 sm:pb-12 lg:pb-16">
      <div className="grid gap-4 rounded-3xl border border-[#ddd2c2] bg-gradient-to-br from-[#faf5eb] via-[#fdfaf3] to-[#f3ece0] p-4 sm:p-6 lg:grid-cols-[1.05fr_0.95fr]">
        <div>{eventImage ? <img src={eventImage.url} alt={eventImage.alt} className="h-64 w-full rounded-2xl object-cover" loading="lazy" /> : null}</div>
        <article>
          <h2 className="font-serif text-3xl text-[#214531] sm:text-4xl">Events & Group Bookings</h2>
          <p className="mt-2 text-sm text-[#536258]">Private celebrations and retreat-style gatherings coordinated directly on WhatsApp.</p>
          <ul className="mt-4 space-y-2 text-sm text-[#395142]">
            <li>• Birthday parties, anniversaries, bachelorettes, corporate retreats, and day events.</li>
            <li>• Full property booking available across all 5 cottages (up to 11 adults).</li>
            <li>• Day events without stay: up to 25 guests (venue + pool + restaurant).</li>
            <li>• Groups exceeding 10 persons must book all cottages.</li>
            <li>• Restaurant-only groups: up to 6 outside diners, subject to availability.</li>
            <li>• Outside food/catering and outside alcohol are not permitted.</li>
          </ul>
          <a
            href={whatsappEventLink}
            target="_blank"
            rel="noreferrer"
            className="mt-5 inline-flex min-h-11 items-center justify-center rounded-xl bg-[#2c7a59] px-5 py-3 text-sm font-semibold text-white shadow-[0_10px_24px_rgba(26,89,67,0.22)] transition hover:bg-[#24684c]"
          >
            Enquire for Events on WhatsApp
          </a>
        </article>
      </div>
    </section>
  );
}
