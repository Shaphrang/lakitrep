
import React from "react";
import Link from "next/link";
import {
  BedDouble,
  CalendarDays,
  Car,
  ChevronDown,
  ChevronRight,
  Facebook,
  Flame,
  Globe,
  Instagram,
  Mail,
  MapPin,
  Menu,
  Mountain,
  Phone,
  Star,
  Trees,
  Users,
  Wifi,
  UtensilsCrossed,
  BadgeCheck,
  WalletCards,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const bookingFields = [
  {
    label: "Check-in",
    value: "24 May 2025",
    icon: CalendarDays,
  },
  {
    label: "Check-out",
    value: "26 May 2025",
    icon: CalendarDays,
  },
  {
    label: "Guests",
    value: "2 Adults",
    icon: Users,
  },
  {
    label: "Room Type",
    value: "Deluxe Room",
    icon: BedDouble,
  },
];

const roomCards = [
  {
    title: "Deluxe Room",
    description: "Spacious room with private balcony and mountain view.",
    price: "₹5,499",
    image:
      "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=80",
  },
  {
    title: "Premium Room",
    description: "Elegant interiors with panoramic views and all modern amenities.",
    price: "₹6,999",
    image:
      "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=80",
  },
  {
    title: "Luxury Suite",
    description: "Luxury suite with living area, balcony and stunning valley views.",
    price: "₹9,999",
    image:
      "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=80",
  },
];

const amenities = [
  {
    title: "Breakfast",
    description: "Delicious & fresh morning meals",
    icon: UtensilsCrossed,
  },
  {
    title: "Bonfire",
    description: "Cozy evenings under the stars",
    icon: Flame,
  },
  {
    title: "Scenic Views",
    description: "Breathtaking views all around",
    icon: Mountain,
  },
  {
    title: "Pickup & Drop",
    description: "Hassle-free transfers on request",
    icon: Car,
  },
  {
    title: "Wi‑Fi",
    description: "High-speed internet throughout stay",
    icon: Wifi,
  },
  {
    title: "Local Tours",
    description: "Explore the best of the local attractions",
    icon: MapPin,
  },
];

const galleryImages = [
  "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1494526585095-c41746248156?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=900&q=80",
];

const quickLinks = ["Home", "About Us", "Rooms", "Services", "Gallery", "Contact Us"];

const aboutHighlights = [
  "Peaceful Location",
  "Warm Hospitality",
  "Modern Comforts",
  "Memorable Stays",
];

function SectionEyebrow({ children }: { children: React.ReactNode }) {
  return (
    <div className="mb-3 flex items-center justify-center gap-3 text-center text-[11px] font-semibold uppercase tracking-[0.35em] text-[#b7904f]">
      <span>{children}</span>
      <span className="h-px w-6 bg-[#c6a56a]" />
    </div>
  );
}

function BrandMark() {
  return (
    <div className="flex flex-col leading-none text-[#d3ab69]">
      <div className="mb-1 flex items-center gap-2">
        <div className="flex gap-[2px]">
          <span className="block h-2 w-4 rotate-[-20deg] rounded-full bg-[#d3ab69]" />
          <span className="mt-[-2px] block h-3 w-5 rounded-full bg-[#d3ab69] [clip-path:polygon(50%_0,100%_100%,0_100%)]" />
          <span className="block h-2 w-4 rotate-[20deg] rounded-full bg-[#d3ab69]" />
        </div>
      </div>
      <span className="font-serif text-[26px] font-medium tracking-wide sm:text-[34px]">Serene Valley</span>
      <span className="mt-1 text-[10px] uppercase tracking-[0.55em] text-[#f0e5cf]">Homestay</span>
    </div>
  );
}

function DecorativeLeaf() {
  return (
    <div className="pointer-events-none absolute left-0 top-1/2 hidden -translate-y-1/2 opacity-30 lg:block">
      <svg width="110" height="240" viewBox="0 0 110 240" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M50 236C62 181 74 143 104 94" stroke="#D4C4AB" strokeWidth="1.5" />
        <path d="M49 210C30 190 23 164 30 136" stroke="#D4C4AB" strokeWidth="1.5" />
        <path d="M49 182C28 171 14 151 10 124" stroke="#D4C4AB" strokeWidth="1.5" />
        <path d="M50 153C34 145 24 129 21 108" stroke="#D4C4AB" strokeWidth="1.5" />
        <path d="M52 130C69 114 83 91 88 61" stroke="#D4C4AB" strokeWidth="1.5" />
        <path d="M51 104C38 90 33 70 35 47" stroke="#D4C4AB" strokeWidth="1.5" />
        <path d="M49 80C29 67 21 46 24 19" stroke="#D4C4AB" strokeWidth="1.5" />
      </svg>
    </div>
  );
}

export default function PublicHomePage() {
  return (
    <div className="min-h-screen bg-[#f7f4ee] text-[#2d2a26]">
      <header className="relative overflow-hidden bg-[#15202a] text-white">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=2000&q=80')",
          }}
        />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(14,22,30,0.86)_0%,rgba(14,22,30,0.62)_42%,rgba(14,22,30,0.28)_68%,rgba(14,22,30,0.48)_100%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(212,171,105,0.18),transparent_28%),linear-gradient(to_bottom,rgba(0,0,0,0.02),rgba(0,0,0,0.25))]" />

        <div className="relative mx-auto max-w-[1420px] px-4 pb-24 pt-6 sm:px-6 lg:px-10 lg:pb-36">
          <nav className="flex items-center justify-between gap-4">
            <BrandMark />

            <div className="hidden items-center gap-10 text-[17px] font-medium text-white/90 lg:flex">
              {[
                "Home",
                "About",
                "Rooms",
                "Services",
                "Gallery",
                "Contact",
              ].map((item, index) => (
                <a
                  key={item}
                  href={`#${item.toLowerCase()}`}
                  className={`relative transition hover:text-[#d9b476] ${
                    index === 0 ? "text-[#d9b476]" : ""
                  }`}
                >
                  {item}
                  {index === 0 && (
                    <span className="absolute left-0 top-full mt-3 h-[2px] w-8 rounded-full bg-[#d9b476]" />
                  )}
                </a>
              ))}
            </div>

            <div className="flex items-center gap-3">
              <Button className="hidden h-14 rounded-xl border border-[#d6ae6a]/20 bg-[#d1a85c] px-8 text-[17px] font-semibold text-[#fffdf7] shadow-[0_18px_40px_rgba(0,0,0,0.18)] transition hover:bg-[#c49b50] lg:inline-flex">
                Book Now
                <WalletCards className="ml-2 h-4 w-4" />
              </Button>
              <button className="inline-flex h-12 w-12 items-center justify-center rounded-xl border border-white/10 bg-white/10 text-white backdrop-blur lg:hidden">
                <Menu className="h-5 w-5" />
              </button>
            </div>
          </nav>

          <div className="grid items-center gap-10 pt-16 lg:grid-cols-[minmax(0,680px)_1fr] lg:pt-24">
            <div className="max-w-[760px]">
              <div className="mb-8 h-px w-28 bg-[#c8a55c]/70" />
              <h1 className="max-w-[720px] font-serif text-[56px] leading-[1.04] tracking-[-0.03em] text-[#f8f4ee] sm:text-[72px] xl:text-[86px]">
                Experience <span className="text-[#d2a65c]">Luxury</span> in Nature
              </h1>
              <div className="mt-6 h-[3px] w-44 bg-[linear-gradient(90deg,#d3ab67_0%,rgba(211,171,103,0.15)_100%)]" />
              <p className="mt-10 max-w-[650px] text-xl leading-9 text-white/86 sm:text-[29px] sm:leading-[1.5]">
                A serene escape in the lap of nature.
                <br />
                Where comfort meets breathtaking views.
              </p>
            </div>
            <div />
          </div>
        </div>
      </header>

      <main className="relative">
        <section className="relative z-20 mx-auto -mt-12 max-w-[1320px] px-4 sm:px-6 lg:px-8">
          <Card className="overflow-hidden rounded-[24px] border border-[#ebe4d9] bg-[#fbfaf7] shadow-[0_18px_70px_rgba(34,29,20,0.12)]">
            <CardContent className="grid gap-2 p-0 lg:grid-cols-[1fr_1fr_1fr_1fr_auto]">
              {bookingFields.map((field) => {
                const Icon = field.icon;
                return (
                  <div
                    key={field.label}
                    className="flex min-h-[112px] items-center gap-4 border-b border-[#eee7dc] px-6 py-6 lg:border-b-0 lg:border-r"
                  >
                    <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#f2ebdf] text-[#b28d52]">
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-medium text-[#6b6459]">{field.label}</div>
                      <div className="mt-2 flex items-center justify-between gap-2 text-[17px] font-medium text-[#3e3a33]">
                        <span className="truncate">{field.value}</span>
                        <ChevronDown className="h-4 w-4 shrink-0 text-[#857b6d]" />
                      </div>
                    </div>
                  </div>
                );
              })}

              <div className="flex min-h-[112px] flex-col items-stretch justify-center gap-3 px-6 py-6 lg:min-w-[250px]">
                <Button className="h-14 rounded-xl bg-[#34422a] text-base font-semibold text-white shadow-md transition hover:bg-[#2d3824]">
                  Request Booking
                </Button>
                <div className="flex items-center justify-center gap-2 text-sm font-medium text-[#8a7f73]">
                  <WalletCards className="h-4 w-4 text-[#c39d58]" />
                  Pay on Arrival
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        <section id="about" className="relative mx-auto max-w-[1320px] px-4 pb-16 pt-16 sm:px-6 lg:px-8 lg:pb-24 lg:pt-24">
          <DecorativeLeaf />
          <div className="grid gap-12 lg:grid-cols-[1.05fr_1fr] lg:items-center">
            <div className="relative">
              <div className="absolute -bottom-4 -right-4 hidden h-full w-full rounded-[26px] border border-[#c69f5d] lg:block" />
              <div className="overflow-hidden rounded-[22px] shadow-[0_18px_50px_rgba(44,36,23,0.12)]">
                <img
                  src="https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1400&q=80"
                  alt="Valley seating view"
                  className="h-[320px] w-full object-cover sm:h-[420px] lg:h-[460px]"
                />
              </div>
            </div>

            <div className="grid gap-8 lg:grid-cols-[1fr_250px] lg:gap-10">
              <div>
                <div className="mb-4 flex items-center gap-3 text-[12px] font-semibold uppercase tracking-[0.35em] text-[#b7904f]">
                  <span>About Us</span>
                  <span className="h-px w-6 bg-[#c6a56a]" />
                </div>
                <h2 className="font-serif text-4xl leading-tight text-[#37332d] sm:text-5xl">
                  Your Home in the Hills
                </h2>
                <p className="mt-7 max-w-[620px] text-lg leading-9 text-[#5b544a]">
                  Serene Valley Homestay is a boutique retreat surrounded by lush greenery, misty mountains and peace.
                  Thoughtfully designed for comfort and relaxation, we offer warm hospitality, modern amenities and unforgettable views.
                </p>
                <Button className="mt-8 h-14 rounded-xl bg-[#34422a] px-7 text-base font-semibold text-white hover:bg-[#2c3825]">
                  Discover Our Story
                </Button>
              </div>

              <div className="grid gap-5 border-l border-[#e2d7c7] pl-0 lg:pl-8">
                {aboutHighlights.map((item) => (
                  <div key={item} className="flex items-center gap-3 text-lg text-[#5b544a]">
                    <BadgeCheck className="h-5 w-5 text-[#c59d59]" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section id="rooms" className="mx-auto max-w-[1320px] px-4 py-6 sm:px-6 lg:px-8 lg:py-10">
          <SectionEyebrow>Featured Rooms</SectionEyebrow>
          <h2 className="text-center font-serif text-4xl text-[#3b3731] sm:text-5xl">Stay in Comfort &amp; Style</h2>
          <div className="mx-auto mt-4 h-px w-10 bg-[#d0ab69]" />

          <div className="mt-12 grid gap-8 lg:grid-cols-3">
            {roomCards.map((room, index) => (
              <Card
                key={`${room.title}-${index}`}
                className="overflow-hidden rounded-[20px] border border-[#e9dfd2] bg-white shadow-[0_12px_34px_rgba(50,41,28,0.07)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_18px_44px_rgba(50,41,28,0.12)]"
              >
                <div className="overflow-hidden">
                  <img src={room.image} alt={room.title} className="h-[270px] w-full object-cover transition duration-500 hover:scale-105" />
                </div>
                <CardContent className="p-6">
                  <h3 className="font-serif text-[34px] leading-none text-[#3a362f]">{room.title}</h3>
                  <p className="mt-4 min-h-[56px] text-base leading-7 text-[#60584e]">{room.description}</p>

                  <div className="mt-5 flex flex-wrap items-center gap-5 border-b border-[#ede6da] pb-5 text-[15px] text-[#8a7d6d]">
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-[#c39c57]" />
                      <span>2 Guests</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <BedDouble className="h-4 w-4 text-[#c39c57]" />
                      <span>King Bed</span>
                    </div>
                  </div>

                  <div className="mt-5 flex items-center justify-between gap-4">
                    <div>
                      <div className="font-serif text-[40px] leading-none text-[#3a362f]">{room.price}</div>
                      <div className="mt-1 text-base text-[#71695d]">/ night</div>
                    </div>
                    <Button className="h-12 rounded-xl bg-[#34422a] px-6 text-[15px] font-semibold text-white hover:bg-[#2d3925]">
                      View Details
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        <section id="services" className="mx-auto max-w-[1320px] px-4 py-10 sm:px-6 lg:px-8 lg:py-12">
          <SectionEyebrow>Services &amp; Amenities</SectionEyebrow>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
            {amenities.map((item) => {
              const Icon = item.icon;
              return (
                <Card
                  key={item.title}
                  className="rounded-[18px] border border-[#e8e0d6] bg-[#fbfaf7] shadow-none transition hover:-translate-y-1 hover:shadow-[0_12px_28px_rgba(40,34,24,0.08)]"
                >
                  <CardContent className="flex min-h-[190px] flex-col items-center justify-center px-5 py-8 text-center">
                    <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-[#f5efe4] text-[#c19a57]">
                      <Icon className="h-8 w-8" />
                    </div>
                    <h3 className="font-serif text-[30px] leading-none text-[#3c3832]">{item.title}</h3>
                    <p className="mt-3 text-sm leading-6 text-[#6b6459]">{item.description}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </section>

        <section id="gallery" className="mx-auto max-w-[1320px] px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
          <SectionEyebrow>Gallery</SectionEyebrow>
          <h2 className="text-center font-serif text-4xl text-[#3b3731] sm:text-5xl">A Glimpse of Serenity</h2>

          <div className="mt-10 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
            {galleryImages.map((src, index) => (
              <div key={`${src}-${index}`} className="group overflow-hidden rounded-[16px] shadow-[0_10px_24px_rgba(44,36,24,0.08)]">
                <img
                  src={src}
                  alt={`Gallery ${index + 1}`}
                  className="h-[140px] w-full object-cover transition duration-500 group-hover:scale-110 md:h-[180px]"
                />
              </div>
            ))}
          </div>

          <div className="mt-8 flex justify-center">
            <Button className="h-14 rounded-xl bg-[#34422a] px-8 text-base font-semibold text-white hover:bg-[#2d3925]">
              View Full Gallery
            </Button>
          </div>
        </section>

        <section className="mt-8 bg-[linear-gradient(90deg,#273321_0%,#314028_32%,#2c3b25_65%,#34442b_100%)] text-white">
          <div className="mx-auto grid max-w-[1440px] gap-8 px-4 py-10 sm:px-6 lg:grid-cols-[1.4fr_1fr_1fr_auto] lg:items-center lg:px-8">
            <div className="flex items-start gap-5">
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full border border-[#cfa55f]/40 bg-[#d0a75c]/10 text-[#d7af69]">
                <WalletCards className="h-7 w-7" />
              </div>
              <div>
                <h3 className="font-serif text-[42px] leading-none text-[#f5eddc]">Ready for a Serene Escape?</h3>
                <p className="mt-3 max-w-[560px] text-base leading-7 text-white/75">
                  Send us a booking request or get in touch with us for a memorable stay amidst nature.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4 border-white/10 lg:border-l lg:pl-8">
              <div className="flex h-14 w-14 items-center justify-center rounded-full border border-[#d5ad69]/40 text-[#d8b36f]">
                <Phone className="h-5 w-5" />
              </div>
              <div>
                <div className="text-sm text-white/70">Call Us</div>
                <div className="mt-1 text-xl font-semibold text-[#f7f2e9]">+91 98765 43210</div>
              </div>
            </div>

            <div className="flex items-center gap-4 border-white/10 lg:border-l lg:pl-8">
              <div className="flex h-14 w-14 items-center justify-center rounded-full border border-[#d5ad69]/40 text-[#d8b36f]">
                <Globe className="h-5 w-5" />
              </div>
              <div>
                <div className="text-sm text-white/70">WhatsApp</div>
                <div className="mt-1 text-xl font-semibold text-[#f7f2e9]">+91 98765 43210</div>
              </div>
            </div>

            <div className="flex justify-start lg:justify-end">
              <Button className="h-14 rounded-xl bg-[#d0a85c] px-8 text-base font-semibold text-[#fffdf7] hover:bg-[#c79e52]">
                Request Booking
                <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        </section>
      </main>

      <footer id="contact" className="relative overflow-hidden bg-[#191d19] text-white">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_left_bottom,rgba(208,168,92,0.12),transparent_32%),radial-gradient(circle_at_right_top,rgba(208,168,92,0.08),transparent_26%)]" />
        <div className="relative mx-auto max-w-[1440px] px-4 pb-8 pt-12 sm:px-6 lg:px-8">
          <div className="grid gap-10 lg:grid-cols-[1.2fr_1fr_1fr_1fr]">
            <div>
              <BrandMark />
              <p className="mt-6 max-w-[360px] text-[15px] leading-7 text-white/68">
                A luxury homestay nestled in the lap of nature, offering comfort, peace and unforgettable experiences.
              </p>
              <div className="mt-6 flex items-center gap-4 text-white/80">
                <a href="#" className="rounded-full border border-white/10 p-2 transition hover:border-[#d0a85c] hover:text-[#d0a85c]"><Facebook className="h-4 w-4" /></a>
                <a href="#" className="rounded-full border border-white/10 p-2 transition hover:border-[#d0a85c] hover:text-[#d0a85c]"><Instagram className="h-4 w-4" /></a>
                <a href="#" className="rounded-full border border-white/10 p-2 transition hover:border-[#d0a85c] hover:text-[#d0a85c]"><Phone className="h-4 w-4" /></a>
                <a href="#" className="rounded-full border border-white/10 p-2 transition hover:border-[#d0a85c] hover:text-[#d0a85c]"><Trees className="h-4 w-4" /></a>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-semibold uppercase tracking-[0.28em] text-[#d0a85c]">Quick Links</h3>
              <ul className="mt-6 space-y-3 text-white/75">
                {quickLinks.map((item) => (
                  <li key={item}>
                    <a href="#" className="transition hover:text-[#d8b470]">› {item}</a>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="text-sm font-semibold uppercase tracking-[0.28em] text-[#d0a85c]">Contact Info</h3>
              <div className="mt-6 space-y-4 text-white/75">
                <div className="flex items-start gap-3">
                  <Phone className="mt-1 h-4 w-4 text-[#d8b36f]" />
                  <span>+91 98765 43210</span>
                </div>
                <div className="flex items-start gap-3">
                  <Mail className="mt-1 h-4 w-4 text-[#d8b36f]" />
                  <span>info@serenevalley.com</span>
                </div>
                <div className="flex items-start gap-3">
                  <MapPin className="mt-1 h-4 w-4 text-[#d8b36f]" />
                  <span>Village Sari, P.O. Mawkhal, Ranikhet, Uttarakhand 263645</span>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-semibold uppercase tracking-[0.28em] text-[#d0a85c]">Follow Us</h3>
              <div className="mt-6 space-y-4 text-white/75">
                <a href="#" className="flex items-center gap-3 transition hover:text-[#d8b470]">
                  <Facebook className="h-4 w-4 text-[#d8b36f]" />
                  <span>Facebook</span>
                </a>
                <a href="#" className="flex items-center gap-3 transition hover:text-[#d8b470]">
                  <Instagram className="h-4 w-4 text-[#d8b36f]" />
                  <span>Instagram</span>
                </a>
                <a href="#" className="flex items-center gap-3 transition hover:text-[#d8b470]">
                  <Phone className="h-4 w-4 text-[#d8b36f]" />
                  <span>WhatsApp</span>
                </a>
              </div>
            </div>
          </div>
                <h1 className="text-3xl font-semibold">La Ki Trep Resort</h1>
      <p className="text-slate-600">Public website placeholder. Build-out comes after admin modules.</p>
      <Link className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white" href="/admin">
        Go to Admin Dashboard
      </Link>

          <div className="mt-10 flex flex-col gap-4 border-t border-white/10 pt-6 text-sm text-white/55 sm:flex-row sm:items-center sm:justify-between">
            <div>© 2025 Serene Valley Homestay. All Rights Reserved.</div>
            <div>Designed with ❤️ for travelers</div>
          </div>
        </div>
      </footer>
    </div>
  );
}

