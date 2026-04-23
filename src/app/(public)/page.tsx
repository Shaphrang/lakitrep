import type { ButtonHTMLAttributes, ReactNode } from "react";
import {
  BedDouble,
  CalendarDays,
  Car,
  ChevronDown,
  ChevronRight,
  Flame,
  House,
  Mail,
  MapPin,
  Menu,
  Phone,
  Trees,
  Users,
  UtensilsCrossed,
  Waves,
} from "lucide-react";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode;
};

function Button({
  className = "",
  children,
  type = "button",
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={`inline-flex items-center justify-center transition-all duration-300 ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

type BoxProps = {
  className?: string;
  children: ReactNode;
};

function Card({ className = "", children }: BoxProps) {
  return <div className={className}>{children}</div>;
}

function CardContent({ className = "", children }: BoxProps) {
  return <div className={className}>{children}</div>;
}

function LeafMark({ className = "h-8 w-8" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 64 64"
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        d="M31.5 10C20 12 12 21.5 12 33c0 12.2 9.8 22 22 22 11.6 0 21.2-9 22-20.4C46.6 34 35 27.3 31.5 10Z"
        stroke="currentColor"
        strokeWidth="2.5"
      />
      <path
        d="M29 19c-3.8 4.8-5.8 9.4-6 14"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      <path
        d="M37.5 24c-5.1 4.3-8.8 9.6-11 16"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      <path
        d="M43 31c-4.6 3.4-8.2 7.7-10.5 12.5"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      <path
        d="M10 49c6.6-3.7 12.9-5.3 19-4.7"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

function WhatsAppIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M20.52 3.48A11.84 11.84 0 0 0 12.07 0C5.48 0 .13 5.35.13 11.94c0 2.1.55 4.15 1.6 5.95L0 24l6.28-1.64a11.87 11.87 0 0 0 5.79 1.48h.01c6.59 0 11.94-5.35 11.94-11.94 0-3.19-1.24-6.19-3.5-8.42ZM12.08 21.8a9.8 9.8 0 0 1-4.99-1.37l-.36-.21-3.73.98 1-3.64-.24-.37A9.84 9.84 0 0 1 2.26 12c0-5.42 4.4-9.82 9.82-9.82 2.62 0 5.09 1.02 6.94 2.87A9.74 9.74 0 0 1 21.9 12c0 5.42-4.4 9.8-9.82 9.8Zm5.39-7.36c-.29-.14-1.73-.85-2-.95-.27-.1-.47-.14-.67.14-.2.29-.76.95-.94 1.15-.17.2-.34.22-.63.07-.29-.14-1.2-.44-2.29-1.4-.85-.76-1.42-1.69-1.59-1.98-.17-.29-.02-.44.13-.58.14-.14.29-.34.43-.51.14-.17.19-.29.29-.48.1-.2.05-.37-.02-.51-.07-.14-.67-1.61-.92-2.21-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.51.07-.78.37-.27.29-1.03 1.01-1.03 2.46 0 1.45 1.05 2.85 1.19 3.05.14.2 2.06 3.15 4.99 4.41.7.3 1.24.47 1.66.61.7.22 1.34.19 1.85.12.56-.08 1.73-.71 1.97-1.4.24-.69.24-1.28.17-1.41-.06-.12-.26-.19-.55-.33Z" />
    </svg>
  );
}

function InstagramIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      className={className}
      aria-hidden="true"
    >
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}

function BrandLogo() {
  return (
    <div className="flex items-center gap-3 text-[#d3b068]">
      <div className="flex h-11 w-11 items-center justify-center rounded-full border border-[#d3b068]/35 bg-[#d3b068]/8">
        <LeafMark className="h-6 w-6" />
      </div>
      <div className="leading-none">
        <div className="font-serif text-[30px] tracking-tight text-[#f4eedf]">
          La Ki Trep Resort
        </div>
      </div>
    </div>
  );
}

function SectionTitle({
  eyebrow,
  title,
}: {
  eyebrow?: string;
  title: string;
}) {
  return (
    <div className="text-center">
      {eyebrow ? (
        <div className="mb-3 text-[11px] font-semibold uppercase tracking-[0.35em] text-[#8d9467]">
          {eyebrow}
        </div>
      ) : null}
      <h2 className="font-serif text-[34px] leading-tight text-[#31472f] sm:text-[48px]">
        {title}
      </h2>
    </div>
  );
}

const navItems = ["Home", "About", "Cottages", "Dining", "Gallery", "Contact"];

const bookingFields = [
  { label: "Check-in", value: "Select date", icon: CalendarDays },
  { label: "Check-out", value: "Select date", icon: CalendarDays },
  { label: "Guests", value: "Select guests", icon: Users },
  { label: "Cottage Type", value: "Select type", icon: House },
];

const aboutFeatures = [
  { title: "5 Private Cottages", icon: House },
  { title: "Swimming Pool", icon: Waves },
  { title: "In-house Restaurant", icon: UtensilsCrossed },
  { title: "Outdoor Spaces", icon: Trees },
];

const cottages = [
  {
    name: "Premium Cottage A",
    subtitle: "2 units",
    description:
      "Spacious AC cottage with pool or garden view, balcony sit-out and breakfast included.",
    guests: "2 Adults + 1 Infant",
    weekday: "₹6,000",
    weekend: "₹8,000",
    image:
      "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80",
  },
  {
    name: "Premium Cottage B",
    subtitle: "1 unit",
    description:
      "Spacious AC cottage with garden hedge seating and private sit-out for bonfires.",
    guests: "2 Adults + 1 Infant",
    weekday: "₹6,000",
    weekend: "₹8,000",
    image:
      "https://images.unsplash.com/photo-1578683010236-d716f9a3f461?auto=format&fit=crop&w=1200&q=80",
  },
  {
    name: "Cottage 4",
    subtitle: "Standard cottage",
    description:
      "Comfortable non-AC cottage with terrace sit-out and extra bed on request.",
    guests: "2 Adults + 1 Infant",
    weekday: "₹5,000",
    weekend: "₹6,000",
    image:
      "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80",
  },
  {
    name: "Family Cottage",
    subtitle: "Cottage 4 + 5 combined",
    description:
      "Two cottages with a shared private compound, ideal for families or small groups.",
    guests: "Up to 5 Adults",
    weekday: "₹8,000",
    weekend: "₹10,000",
    image:
      "https://images.unsplash.com/photo-1523217582562-09d0def993a6?auto=format&fit=crop&w=1200&q=80",
  },
];

const amenities = [
  { title: "Complimentary Breakfast", icon: UtensilsCrossed },
  { title: "In-house Restaurant", icon: UtensilsCrossed },
  { title: "Swimming Pool", icon: Waves },
  { title: "Designated Parking", icon: Car },
  { title: "Bonfire on Request", icon: Flame },
  { title: "Local Sightseeing Assistance", icon: MapPin },
];

const nearbyPlaces = [
  {
    title: "Umiam Lake / Barapani",
    image:
      "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=900&q=80",
  },
  {
    title: "Umiam Boating Point",
    image:
      "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=900&q=80",
  },
  {
    title: "Lum Nehru Park",
    image:
      "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=900&q=80",
  },
  {
    title: "Lum Sohpetbneng",
    image:
      "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=900&q=80",
  },
  {
    title: "Umden-Diwon Eri Silk Village",
    image:
      "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=900&q=80",
  },
];

const galleryImages = [
  "https://images.unsplash.com/photo-1510798831971-661eb04b3739?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80",
];

const quickLinksLeft = ["Home", "About", "Cottages"];
const quickLinksRight = ["Dining", "Gallery", "Contact"];

export default function Page() {
  return (
    <div className="min-h-screen bg-[#f5f1e8] text-[#2e2d28]">
      <header className="relative overflow-hidden text-white">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage:
              "url('https://ztvgdchapyllkihgyuch.supabase.co/storage/v1/object/public/lakitrep-media/properties/cover/1776927428822-921392a4-6c47-4e26-a4dd-b7e4e6f7dbfc.webp')",
          }}
        />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(12,20,12,0.82)_0%,rgba(16,24,16,0.62)_35%,rgba(16,24,16,0.30)_65%,rgba(16,24,16,0.62)_100%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(185,155,86,0.15),transparent_24%),linear-gradient(to_bottom,rgba(0,0,0,0.08),rgba(0,0,0,0.28))]" />

        <div className="relative mx-auto max-w-[1440px] px-4 pb-20 pt-5 sm:px-6 lg:px-10 lg:pb-28">
          <nav className="flex items-center justify-between gap-4">
            <BrandLogo />

            <div className="hidden items-center gap-10 text-[15px] font-medium text-white/85 lg:flex">
              {navItems.map((item) => (
                <a
                  key={item}
                  href={`#${item.toLowerCase()}`}
                  className="transition hover:text-[#d8bb73]"
                >
                  {item}
                </a>
              ))}
            </div>

            <div className="flex items-center gap-3">
              <Button className="hidden h-12 rounded-xl border border-[#d7be80]/25 bg-[#3d5f32] px-6 text-sm font-semibold text-white shadow-[0_10px_30px_rgba(0,0,0,0.18)] hover:bg-[#34542b] lg:inline-flex">
                <WhatsAppIcon className="mr-2 h-4 w-4" />
                Book on WhatsApp
              </Button>

              <button className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-white/10 bg-white/10 text-white lg:hidden">
                <Menu className="h-5 w-5" />
              </button>
            </div>
          </nav>

          <div className="grid gap-10 pt-12 lg:grid-cols-[1.05fr_480px] lg:items-center lg:pt-16">
            <div className="max-w-[700px]">
              <h1 className="font-serif text-[52px] leading-[1.02] tracking-[-0.03em] text-[#f7f2e9] sm:text-[70px] xl:text-[84px]">
                A Quiet Boutique Escape in Meghalaya
              </h1>

              <p className="mt-6 max-w-[600px] text-lg leading-8 text-white/85 sm:text-[24px] sm:leading-[1.55]">
                Private cottages, a swimming pool, in-house dining, and slow,
                peaceful stays in the hills of Umran.
              </p>

              <div className="mt-6 flex items-center gap-3 text-[#d4b56c]">
                <span className="h-px w-12 bg-[#cdaa59]" />
                <span className="text-[15px] font-semibold">
                  Only 5 cottages • Pre-booking required
                </span>
              </div>

              <div className="mt-8 flex flex-wrap gap-4">
                <Button className="h-14 rounded-2xl bg-[#35562d] px-7 text-base font-semibold text-white shadow-[0_12px_30px_rgba(0,0,0,0.2)] hover:bg-[#2f4c28]">
                  <WhatsAppIcon className="mr-2 h-5 w-5" />
                  Book via WhatsApp
                </Button>

                <Button className="h-14 rounded-2xl border border-white/35 bg-transparent px-7 text-base font-semibold text-white hover:bg-white/10">
                  Explore Cottages
                </Button>
              </div>
            </div>

            <Card className="overflow-hidden rounded-[24px] border border-[#e6decf] bg-[#f6f2ea] shadow-[0_22px_70px_rgba(0,0,0,0.22)]">
              <CardContent className="p-6 sm:p-7">
                <div className="grid gap-4 sm:grid-cols-2">
                  {bookingFields.map((field) => {
                    const Icon = field.icon;

                    return (
                      <div key={field.label}>
                        <div className="mb-2 text-sm font-medium text-[#6c6a61]">
                          {field.label}
                        </div>
                        <div className="flex h-14 items-center justify-between rounded-xl border border-[#ddd5c7] bg-white px-4 text-[#686558]">
                          <div className="flex items-center gap-3">
                            <Icon className="h-4 w-4 text-[#7f8366]" />
                            <span className="text-sm">{field.value}</span>
                          </div>
                          <ChevronDown className="h-4 w-4 text-[#8a877c]" />
                        </div>
                      </div>
                    );
                  })}
                </div>

                <Button className="mt-5 h-14 w-full rounded-xl bg-[#35562d] text-base font-semibold text-white hover:bg-[#2f4c28]">
                  Send Booking Request
                </Button>

                <div className="mt-3 text-center text-sm font-medium text-[#8a877c]">
                  Pre-booking required
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </header>

      <main>
        <section
          id="about"
          className="mx-auto max-w-[1440px] px-4 py-10 sm:px-6 lg:px-10 lg:py-14"
        >
          <div className="grid gap-10 lg:grid-cols-[1.02fr_1fr] lg:items-center">
            <div className="overflow-hidden rounded-[22px] border border-[#e6ddcf] bg-white shadow-[0_10px_30px_rgba(70,62,42,0.08)]">
              <img
                src="https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1600&q=80"
                alt="Outdoor sit-out at La Ki Trep"
                className="h-[320px] w-full object-cover sm:h-[430px]"
              />
            </div>

            <div>
              <div className="mb-3 text-[12px] font-semibold uppercase tracking-[0.32em] text-[#8f9870]">
                About La Ki Trep
              </div>

              <h2 className="max-w-[700px] font-serif text-[40px] leading-tight text-[#31472f] sm:text-[56px]">
                Private, Peaceful, Intentionally Limited
              </h2>

              <p className="mt-5 max-w-[680px] text-[17px] leading-8 text-[#666257] sm:text-[19px]">
                La Ki Trep Resort is a private cottage stay spread across a
                scenic property in Umran, Ri Bhoi. With only five cottages, the
                experience is intentionally calm, personal and uncrowded — ideal
                for couples, small families, private retreats and intimate
                getaways.
              </p>

              <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
                {aboutFeatures.map((item) => {
                  const Icon = item.icon;
                  return (
                    <div
                      key={item.title}
                      className="rounded-[18px] border border-[#e8dfd1] bg-[#faf7f1] px-4 py-5 text-center"
                    >
                      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#edf0e5] text-[#60704f]">
                        <Icon className="h-6 w-6" />
                      </div>
                      <div className="mt-3 text-[15px] leading-6 text-[#5c5a52]">
                        {item.title}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        <section
          id="cottages"
          className="mx-auto max-w-[1440px] px-4 py-4 sm:px-6 lg:px-10"
        >
          <SectionTitle title="Stay in Our Cottages" />

          <div className="mt-8 grid gap-6 xl:grid-cols-4">
            {cottages.map((cottage) => (
              <Card
                key={cottage.name}
                className="overflow-hidden rounded-[20px] border border-[#e7dece] bg-white shadow-[0_10px_26px_rgba(70,62,42,0.07)]"
              >
                <div className="relative">
                  <img
                    src={cottage.image}
                    alt={cottage.name}
                    className="h-[220px] w-full object-cover"
                  />
                  <div className="absolute left-4 top-4 rounded-lg bg-[#576b3f] px-3 py-1 text-xs font-semibold text-white shadow-md">
                    Breakfast Included
                  </div>
                </div>

                <CardContent className="p-5">
                  <h3 className="font-serif text-[31px] leading-none text-[#31472f]">
                    {cottage.name}
                  </h3>
                  <div className="mt-2 text-[15px] font-medium text-[#7b786f]">
                    {cottage.subtitle}
                  </div>

                  <p className="mt-3 min-h-[88px] text-[15px] leading-7 text-[#615d54]">
                    {cottage.description}
                  </p>

                  <div className="mt-4 flex items-center gap-2 text-[15px] text-[#7d796f]">
                    <Users className="h-4 w-4 text-[#7f8a61]" />
                    <span>{cottage.guests}</span>
                  </div>

                  <div className="mt-5 border-t border-[#ece4d7] pt-4 text-[18px] text-[#4c4b45]">
                    <span className="font-semibold text-[#31472f]">
                      {cottage.weekday}
                    </span>{" "}
                    weekday{" "}
                    <span className="mx-1 text-[#b8b1a3]">•</span>
                    <span className="font-semibold text-[#31472f]">
                      {cottage.weekend}
                    </span>{" "}
                    weekend
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        <section
          id="dining"
          className="mx-auto max-w-[1440px] px-4 py-10 sm:px-6 lg:px-10"
        >
          <SectionTitle title="Amenities & Experiences" />

          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
            {amenities.map((item) => {
              const Icon = item.icon;
              return (
                <Card
                  key={item.title}
                  className="rounded-[18px] border border-[#e7dece] bg-[#faf7f1] px-4 py-6 text-center shadow-sm"
                >
                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#edf0e5] text-[#617251]">
                    <Icon className="h-7 w-7" />
                  </div>
                  <div className="mt-4 text-[18px] leading-6 text-[#4f4c45]">
                    {item.title}
                  </div>
                </Card>
              );
            })}
          </div>

          <div className="mt-5 text-center text-[15px] text-[#817d71]">
            Lunch 1–4 PM <span className="mx-2">•</span> Dinner 6–10 PM{" "}
            <span className="mx-2">•</span> Pool access for in-house guests 8 AM–6
            PM
          </div>
        </section>

        <section className="mx-auto max-w-[1440px] px-4 py-4 sm:px-6 lg:px-10">
          <div className="grid gap-6 xl:grid-cols-[1.05fr_1fr]">
            <Card className="rounded-[22px] border border-[#e6ddcf] bg-[#faf7f1] p-6 shadow-[0_10px_26px_rgba(70,62,42,0.06)]">
              <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
                <div>
                  <h3 className="font-serif text-[36px] leading-tight text-[#31472f]">
                    Private Events &amp; Group Getaways
                  </h3>
                  <p className="mt-4 text-[16px] leading-7 text-[#666257]">
                    La Ki Trep is ideal for birthdays, anniversaries,
                    bachelorettes, corporate retreats and small private day
                    events. Full property bookings available.
                  </p>

                  <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
                    {[
                      "Up to 11 adults with stay",
                      "Day events up to 25 guests",
                      "In-house catering only",
                      "WhatsApp for group rates",
                    ].map((item) => (
                      <div
                        key={item}
                        className="rounded-[16px] border border-[#e7dece] bg-white px-3 py-4 text-center text-[13px] leading-5 text-[#69645a]"
                      >
                        {item}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="overflow-hidden rounded-[18px]">
                  <img
                    src="https://images.unsplash.com/photo-1519225421980-715cb0215aed?auto=format&fit=crop&w=1200&q=80"
                    alt="Private event dinner setup"
                    className="h-full min-h-[240px] w-full object-cover"
                  />
                </div>
              </div>
            </Card>

            <Card className="rounded-[22px] border border-[#e6ddcf] bg-[#faf7f1] p-6 shadow-[0_10px_26px_rgba(70,62,42,0.06)]">
              <h3 className="font-serif text-[36px] leading-tight text-[#31472f]">
                Explore Nearby
              </h3>

              <div className="mt-5 grid gap-3 grid-cols-2 md:grid-cols-3 xl:grid-cols-5">
                {nearbyPlaces.map((place) => (
                  <div
                    key={place.title}
                    className="overflow-hidden rounded-[16px] border border-[#e4dbcd] bg-white"
                  >
                    <img
                      src={place.image}
                      alt={place.title}
                      className="h-[110px] w-full object-cover"
                    />
                    <div className="px-3 py-3 text-center text-[13px] leading-5 text-[#5f5a50]">
                      {place.title}
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </section>

        <section
          id="gallery"
          className="mx-auto max-w-[1440px] px-4 py-10 sm:px-6 lg:px-10"
        >
          <SectionTitle title="A Glimpse of La Ki Trep" />

          <div className="mt-8 grid gap-4 grid-cols-2 md:grid-cols-3 xl:grid-cols-6">
            {galleryImages.map((src, index) => (
              <div
                key={`${src}-${index}`}
                className="group overflow-hidden rounded-[16px] border border-[#e6ddcf] bg-white shadow-sm"
              >
                <img
                  src={src}
                  alt={`La Ki Trep gallery ${index + 1}`}
                  className="h-[150px] w-full object-cover transition duration-500 group-hover:scale-105"
                />
              </div>
            ))}
          </div>

          <div className="mt-7 flex justify-center">
            <Button className="h-12 rounded-xl bg-[#35562d] px-7 text-sm font-semibold text-white hover:bg-[#2f4c28]">
              <LeafMark className="mr-2 h-4 w-4" />
              View Full Gallery
            </Button>
          </div>
        </section>

        <section className="mx-auto max-w-[1440px] px-4 pb-6 pt-2 sm:px-6 lg:px-10">
          <div className="overflow-hidden rounded-[22px] border border-[#557044]/15 bg-[linear-gradient(90deg,#2f4d2a_0%,#3a5d33_34%,#2f4c29_68%,#40623a_100%)] text-white shadow-[0_14px_40px_rgba(31,48,23,0.16)]">
            <div className="grid gap-5 px-5 py-6 lg:grid-cols-[1.3fr_240px_220px_auto] lg:items-center lg:px-8">
              <div className="relative overflow-hidden rounded-[18px] border border-white/10 bg-white/5 px-5 py-5">
                <div className="pointer-events-none absolute -left-6 bottom-0 text-[#b99a57]/20">
                  <LeafMark className="h-20 w-20" />
                </div>
                <h3 className="relative font-serif text-[36px] leading-tight text-[#f7f0df]">
                  Plan Your Quiet Getaway
                </h3>
                <p className="relative mt-2 max-w-[700px] text-[14px] leading-7 text-white/80 sm:text-[15px]">
                  Bookings are handled directly on WhatsApp. Walk-ins are not
                  permitted. The exact location is shared after booking
                  confirmation to protect guest privacy.
                </p>
              </div>

              <div className="rounded-[18px] border border-white/10 bg-white/5 px-5 py-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-full border border-[#d5bd7a]/30 bg-[#d5bd7a]/10 text-[#e1c881]">
                    <WhatsAppIcon className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="text-sm text-white/70">WhatsApp</div>
                    <div className="text-xl font-semibold">6009044450</div>
                  </div>
                </div>
              </div>

              <div className="rounded-[18px] border border-white/10 bg-white/5 px-5 py-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-full border border-[#d5bd7a]/30 bg-[#d5bd7a]/10 text-[#e1c881]">
                    <InstagramIcon className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="text-sm text-white/70">Instagram</div>
                    <div className="text-xl font-semibold">@lakitrep</div>
                  </div>
                </div>
              </div>

              <div className="flex justify-start lg:justify-end">
                <Button className="h-14 rounded-2xl bg-[#d8a84a] px-7 text-base font-semibold text-[#fffdf7] hover:bg-[#ca9a3f]">
                  <WhatsAppIcon className="mr-2 h-5 w-5" />
                  Book Now on WhatsApp
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer
        id="contact"
        className="border-t border-[#e4dccf] bg-[#f8f4ec] text-[#3f3d37]"
      >
        <div className="mx-auto max-w-[1440px] px-4 py-10 sm:px-6 lg:px-10">
          <div className="grid gap-10 lg:grid-cols-[1.2fr_0.8fr_0.8fr_1fr]">
            <div>
              <div className="flex items-center gap-3 text-[#b4954b]">
                <div className="flex h-11 w-11 items-center justify-center rounded-full border border-[#ccb06c]/35 bg-[#ccb06c]/8">
                  <LeafMark className="h-6 w-6" />
                </div>
                <div className="font-serif text-[30px] leading-none text-[#9f8650]">
                  La Ki Trep Resort
                </div>
              </div>

              <p className="mt-4 max-w-[320px] text-[17px] leading-8 text-[#666257]">
                A quiet boutique resort in Meghalaya
              </p>
            </div>

            <div>
              <h3 className="text-sm font-semibold uppercase tracking-[0.28em] text-[#8f9870]">
                Quick Links
              </h3>
              <ul className="mt-5 space-y-3 text-[15px] text-[#5f5a50]">
                {quickLinksLeft.map((item) => (
                  <li key={item}>
                    <a href="#" className="transition hover:text-[#35562d]">
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="text-sm font-semibold uppercase tracking-[0.28em] text-[#8f9870]">
                More
              </h3>
              <ul className="mt-5 space-y-3 text-[15px] text-[#5f5a50]">
                {quickLinksRight.map((item) => (
                  <li key={item}>
                    <a href="#" className="transition hover:text-[#35562d]">
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="text-sm font-semibold uppercase tracking-[0.28em] text-[#8f9870]">
                Contact
              </h3>

              <div className="mt-5 space-y-3 text-[15px] leading-7 text-[#5f5a50]">
                <div className="flex items-start gap-3">
                  <MapPin className="mt-1 h-4 w-4 text-[#8a9466]" />
                  <span>Umran, Ri Bhoi District, Meghalaya</span>
                </div>

                <div className="flex items-start gap-3">
                  <Phone className="mt-1 h-4 w-4 text-[#8a9466]" />
                  <span>WhatsApp: 6009044450</span>
                </div>

                <div className="flex items-start gap-3">
                  <InstagramIcon className="mt-1 h-4 w-4 text-[#8a9466]" />
                  <span>Instagram: @lakitrep</span>
                </div>

                <div className="flex items-start gap-3">
                  <Mail className="mt-1 h-4 w-4 text-[#8a9466]" />
                  <span>Precise location shared after booking confirmation.</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}