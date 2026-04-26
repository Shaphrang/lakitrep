# Public Homepage Sections

The public homepage (`src/app/(public)/page.tsx`) is composed from reusable sections in `src/components/public/home/sections/`.

## Current section order

1. Hero
2. Quick highlights
3. Story
4. Cottages
5. **Location & How to Reach**
6. Gallery preview
7. Attractions
8. Events & groups
9. Policies + FAQ
10. Final CTA

## Location & How to Reach section

- Component: `src/components/public/home/sections/LocationReachSection.tsx`
- Purpose: Shares approximate travel distances/times from Shillong, Guwahati, and nearby airports without exposing the exact map pin publicly.
- Privacy note: Explicitly states that the exact map pin is shared only after booking confirmation.
- CTA behavior:
  - Uses WhatsApp link (from property WhatsApp/phone data) when available.
  - Falls back to the existing `BookNowButton` CTA when WhatsApp/phone is unavailable.
