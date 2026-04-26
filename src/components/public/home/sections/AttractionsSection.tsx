import Link from "next/link";
import { BookNowButton } from "@/components/public/booking/BookNowButton";
import { getFirstImage, resolveMediaUrl, type PublicAttraction } from "@/lib/public-site";

type AttractionsSectionProps = {
  attractions: PublicAttraction[];
  whatsappDirectionsLink: string;
  hasWhatsappContact: boolean;
};

type ParsedDistanceInfo = {
  roadDistance?: string;
  driveTime?: string;
  walkInfo?: string;
  note?: string;
  raw?: string;
};

function parseDistanceText(distanceText: string | null): ParsedDistanceInfo {
  const raw = distanceText?.trim();
  if (!raw) return {};

  const tokens = raw
    .split("·")
    .map((part) => part.trim())
    .filter(Boolean);

  if (tokens.length === 0) return { raw };

  const parsed: ParsedDistanceInfo = {};

  for (const token of tokens) {
    const lower = token.toLowerCase();

    if (!parsed.roadDistance && lower.includes("km") && lower.includes("road")) {
      parsed.roadDistance = token;
      continue;
    }

    if (!parsed.driveTime && (lower.includes("drive") || lower.includes("hr drive") || lower.includes("hrs drive"))) {
      parsed.driveTime = token;
      continue;
    }

    if (!parsed.walkInfo && lower.includes("walk")) {
      parsed.walkInfo = token;
      continue;
    }

    parsed.note = parsed.note ? `${parsed.note} · ${token}` : token;
  }

  if (!parsed.roadDistance && !parsed.driveTime && !parsed.walkInfo) {
    return { raw };
  }

  return parsed;
}

function getAttractionTags(name: string): string[] {
  const lower = name.toLowerCase();

  if (lower.includes("umiam") && lower.includes("boat")) {
    return ["Boating", "Water Activities", "Family"];
  }

  if (lower.includes("umiam") || lower.includes("barapani") || lower.includes("lake")) {
    return ["Lake View", "Scenic", "Nearby"];
  }

  if (lower.includes("lum nehru") || lower.includes("park")) {
    return ["Park", "Picnic", "Lake-side"];
  }

  if (lower.includes("sohpetbneng")) {
    return ["Sacred Hill", "Viewpoint", "Culture"];
  }

  if (lower.includes("tea") || lower.includes("golf") || lower.includes("umran")) {
    return ["Nearby", "Tea Garden", "Leisure"];
  }

  if (lower.includes("umden") || lower.includes("eri") || lower.includes("silk") || lower.includes("diwon")) {
    return ["Eri Silk", "Culture", "Half-Day"];
  }

  return ["Nature", "Local Experience"];
}

function getAttractionGroup(name: string): "nearby" | "half-day" {
  const lower = name.toLowerCase();
  if (lower.includes("umden") || lower.includes("diwon") || lower.includes("eri") || lower.includes("silk")) {
    return "half-day";
  }

  return "nearby";
}

function AttractionImage({ name, src, priority = false }: { name: string; src: string | null; priority?: boolean }) {
  if (!src) {
    return (
      <div className="flex aspect-[16/10] items-center justify-center rounded-2xl bg-[linear-gradient(145deg,#2a4e37_0%,#3d6b4e_50%,#b99a63_100%)] p-5 text-center text-sm font-medium text-[#f8f2e5]">
        {name}
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={`${name} near La Ki Trep`}
      className="aspect-[16/10] w-full rounded-2xl object-cover"
      loading={priority ? "eager" : "lazy"}
      decoding="async"
    />
  );
}

function AttractionCard({ attraction }: { attraction: PublicAttraction }) {
  const image = resolveMediaUrl(getFirstImage(attraction.cover_image, attraction.gallery_images));
  const distance = parseDistanceText(attraction.distance_text);
  const tags = getAttractionTags(attraction.name).slice(0, 3);

  return (
    <article className="flex h-full flex-col rounded-3xl border border-[#ded2bf] bg-[#fffdf9] p-3 shadow-[0_12px_36px_rgba(36,67,50,0.08)] sm:p-4">
      <AttractionImage name={attraction.name} src={image} />

      <div className="mt-3 flex h-full flex-col">
        <h3 className="font-serif text-xl leading-tight text-[#214531]">{attraction.name}</h3>

        <p className="mt-2 line-clamp-3 text-sm leading-6 text-[#4f6156]">
          {attraction.description || "A nearby highlight to pair with your stay itinerary."}
        </p>

        <div className="mt-3 rounded-2xl border border-[#e7dccb] bg-[#faf5eb] p-2.5">
          <p className="text-[0.7rem] font-semibold uppercase tracking-[0.18em] text-[#9a6a1f]">Travel Info</p>
          <div className="mt-1.5 flex flex-wrap gap-1.5">
            {distance.roadDistance ? <span className="rounded-full bg-[#f1e8d7] px-2.5 py-1 text-xs text-[#335540]">{distance.roadDistance}</span> : null}
            {distance.driveTime ? <span className="rounded-full bg-[#f1e8d7] px-2.5 py-1 text-xs text-[#335540]">{distance.driveTime}</span> : null}
            {distance.walkInfo ? <span className="rounded-full bg-[#f1e8d7] px-2.5 py-1 text-xs text-[#335540]">{distance.walkInfo}</span> : null}
            {!distance.roadDistance && !distance.driveTime && !distance.walkInfo && distance.raw ? (
              <span className="text-xs leading-5 text-[#506256]">{distance.raw}</span>
            ) : null}
          </div>
          {distance.note ? <p className="mt-1.5 text-xs text-[#5a6a60]">{distance.note}</p> : null}
        </div>

        <div className="mt-3 flex flex-wrap gap-1.5">
          {tags.map((tag) => (
            <span key={tag} className="rounded-full border border-[#d8ccb7] bg-white px-2.5 py-1 text-[0.68rem] font-medium uppercase tracking-[0.08em] text-[#3c5a47]">
              {tag}
            </span>
          ))}
        </div>
      </div>
    </article>
  );
}

export function AttractionsSection({ attractions, whatsappDirectionsLink, hasWhatsappContact }: AttractionsSectionProps) {
  if (attractions.length === 0) return null;

  const featured = attractions[0];
  const nearbyAttractions = attractions.filter((item) => getAttractionGroup(item.name) === "nearby");
  const halfDayAttractions = attractions.filter((item) => getAttractionGroup(item.name) === "half-day");
  const featuredImage = resolveMediaUrl(getFirstImage(featured.cover_image, featured.gallery_images));
  const featuredDistance = parseDistanceText(featured.distance_text);
  const featuredTags = getAttractionTags(featured.name);

  return (
    <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-14" aria-labelledby="attractions-heading">
      <div className="mb-6 sm:mb-8">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#9a6a1f]">Nearby Experiences</p>
        <h2 id="attractions-heading" className="mt-2 font-serif text-3xl text-[#214531] sm:text-5xl">Explore Around La Ki Trep</h2>
        <p className="mt-3 max-w-3xl text-sm leading-6 text-[#506256] sm:text-base sm:leading-7">
          From Umiam Lake and boating points to sacred hills, tea garden leisure and Ri Bhoi countryside experiences, La Ki Trep makes it easy to plan relaxed outings during your stay.
        </p>
      </div>

      <article className="grid overflow-hidden rounded-3xl border border-[#d9cfbf] bg-[linear-gradient(135deg,#1f3c2a_0%,#2d5a3d_52%,#b89461_100%)] shadow-[0_22px_55px_rgba(31,59,42,0.24)] md:grid-cols-2">
        <div className="relative h-full min-h-[260px]">
          <AttractionImage name={featured.name} src={featuredImage} priority />
          <div className="absolute inset-0 rounded-none bg-[linear-gradient(180deg,rgba(19,36,25,0.04)_15%,rgba(19,36,25,0.72)_100%)]" />
        </div>

        <div className="p-5 text-[#f7f0df] sm:p-8">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#e8d6b2]">Featured outing</p>
          <h3 className="mt-2 font-serif text-3xl leading-tight text-white">{featured.name}</h3>
          <p className="mt-3 line-clamp-3 text-sm leading-6 text-[#efe5d1] sm:text-base">
            {featured.description || "A scenic nearby experience to add to your stay."}
          </p>

          <div className="mt-4 flex flex-wrap gap-2">
            {[featuredDistance.roadDistance, featuredDistance.driveTime, featuredDistance.walkInfo]
              .filter(Boolean)
              .map((item) => (
                <span key={item} className="rounded-full border border-white/25 bg-white/10 px-3 py-1 text-xs">
                  {item}
                </span>
              ))}
            {featuredDistance.note ? <span className="text-xs text-[#f2e8d2]">{featuredDistance.note}</span> : null}
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            {featuredTags.map((tag) => (
              <span key={tag} className="rounded-full border border-[#e6d3ad]/50 bg-[#2f5a3e]/60 px-3 py-1 text-xs uppercase tracking-[0.12em] text-[#f8efd9]">
                {tag}
              </span>
            ))}
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <Link href="/attractions" className="inline-flex min-h-11 items-center justify-center rounded-xl bg-[#d5bf91] px-4 py-2.5 text-sm font-semibold text-[#213728] transition hover:bg-[#e3cfab]">
              View Attractions
            </Link>
            <Link href="/book" className="inline-flex min-h-11 items-center justify-center rounded-xl border border-white/35 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-white/10">
              Book Your Stay
            </Link>
          </div>
        </div>
      </article>

      <div className="mt-8 space-y-8">
        <div>
          <h3 className="text-lg font-semibold text-[#214531] sm:text-xl">Nearby Attractions</h3>
          <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {nearbyAttractions.map((attraction) => (
              <AttractionCard key={attraction.id} attraction={attraction} />
            ))}
          </div>
        </div>

        {halfDayAttractions.length > 0 ? (
          <div>
            <h3 className="text-lg font-semibold text-[#214531] sm:text-xl">Half-Day Cultural Experience</h3>
            <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {halfDayAttractions.map((attraction) => (
                <AttractionCard key={attraction.id} attraction={attraction} />
              ))}
            </div>
          </div>
        ) : null}
      </div>

      <div className="mt-8 rounded-3xl border border-[#ddd0bd] bg-[#f9f3e9] p-4 sm:p-5">
        <p className="text-sm leading-6 text-[#4f6156]">
          Distances and timings are approximate and may vary depending on route, weather and traffic. Most attractions are best visited by vehicle. The exact resort map pin is shared only after booking confirmation.
        </p>

        <div className="mt-4 flex flex-wrap gap-2.5">
          {hasWhatsappContact ? (
            <a
              href={whatsappDirectionsLink}
              target="_blank"
              rel="noreferrer"
              className="inline-flex min-h-11 items-center justify-center rounded-xl bg-[#25D366] px-4 py-2 text-sm font-semibold text-white"
            >
              WhatsApp for Guidance
            </a>
          ) : (
            <BookNowButton
              className="min-h-11 rounded-xl bg-[#2f5a3d] px-4 py-2 text-sm font-semibold text-white"
              label="Ask us for directions"
              lockCottage={false}
            />
          )}

          <Link href="/book" className="inline-flex min-h-11 items-center justify-center rounded-xl border border-[#2f5a3d] px-4 py-2 text-sm font-semibold text-[#2f5a3d]">
            Book Your Stay
          </Link>
        </div>
      </div>
    </section>
  );
}
