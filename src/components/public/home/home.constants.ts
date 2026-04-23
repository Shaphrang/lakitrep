import type { FallbackExperience, FaqItem, QuickHighlight } from "./home.types";

export const QUICK_HIGHLIGHTS: QuickHighlight[] = [
  {
    title: "Boutique Stay",
    note: "Five private cottages for quiet and restful stays.",
    icon: "stay",
  },
  {
    title: "Swimming Pool",
    note: "Relax and unwind with refreshing pool access.",
    icon: "pool",
  },
  {
    title: "In-house Dining",
    note: "Warm meals and pre-planned reservations.",
    icon: "dining",
  },
  {
    title: "4-Acre Setting",
    note: "Open greens and slow mornings in nature.",
    icon: "nature",
  },
  {
    title: "Near Umiam",
    note: "Easy access to scenic drives and day plans.",
    icon: "scenic",
  },
];

export const FALLBACK_EXPERIENCES: FallbackExperience[] = [
  {
    name: "Umiam Lake / Barapani",
    note: "Lakeside sunsets and scenic pauses—pair this with your stay for an easy half-day outing.",
  },
  {
    name: "Umiam Boating Point / Water Sports Complex",
    note: "Light adventure and calm water sessions—ideal after a relaxed breakfast at the resort.",
  },
  {
    name: "Lum Nehru Park",
    note: "Green walking trails and breezy viewpoints—great for a slow afternoon plan.",
  },
  {
    name: "Lum Sohpetbneng",
    note: "A cultural hilltop experience with panoramic landscapes—pair this with your stay for sunrise.",
  },
  {
    name: "Umden-Diwon Eri Silk Village",
    note: "Rural craftsmanship and Ri Bhoi countryside life—perfect for a meaningful local detour.",
  },
  {
    name: "Tea Garden & Mini Golf Course, Umran",
    note: "Leisure and open-air greens close to the property—easy to combine with check-in day.",
  },
];

export const FAQ_ITEMS: FaqItem[] = [
  {
    title: "Check-in & check-out",
    points: ["Check-in: 2:00 PM", "Check-out: 11:00 AM", "Early check-in is subject to availability"],
  },
  {
    title: "Late check-out",
    points: ["₹1,000 until 12 PM", "₹2,000 until 1 PM", "Full night rate applies after 2 PM"],
  },
  {
    title: "Children & extra bedding",
    points: [
      "Children 2–12 years: ₹500 per child",
      "Infants below 2 years: no charge",
      "Children 15+ are treated as adults",
      "Extra bed on request for Cottage 4 and Family Cottage",
    ],
  },
  {
    title: "Food, beverages & dining rules",
    points: [
      "Outside food/catering and outside alcohol are not permitted",
      "Corkage charge ₹500 per room if found",
      "No room service; meals are served in the dining area",
      "Cooking on property is not allowed",
    ],
  },
  {
    title: "Property conduct & access",
    points: [
      "Valid government photo ID required for all adult guests",
      "Non-guest access, walk-in visitors, and property tours are not permitted",
      "Management can ask disruptive guests to vacate without refund",
      "No-show advance payment is non-refundable; rescheduling where possible",
    ],
  },
  {
    title: "Pool, pets & smoking",
    points: [
      "Appropriate swimwear required; shower before entering pool",
      "Children must be supervised in pool areas",
      "Pets are not permitted",
      "Smoking only in designated areas; ₹500 cleaning fee if smoking inside room",
    ],
  },
];
