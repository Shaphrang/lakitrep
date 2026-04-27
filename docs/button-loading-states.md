# Button Loading States

## Why loading states were added

Action buttons now show explicit pending UI to prevent duplicate submissions/clicks, improve action feedback, and preserve production-grade UX/accessibility across admin and public flows.

## Components created

- `src/components/admin/shared/LoadingSpinner.tsx`
- `src/components/admin/shared/SubmitButton.tsx`

## Patterns used

### Server action forms

- Replaced direct submit buttons with `SubmitButton` (uses `useFormStatus`) in form children.
- Pending UX includes spinner + loading text + `disabled`, `aria-busy`, and `aria-disabled`.
- Existing validation disable logic remains and is merged with pending state.

### Client async actions

- Existing async handlers retain business logic.
- Added/expanded loading booleans, disabled states, and loading labels in:
  - booking request submit
  - admin gallery metadata save/delete/upload
  - report CSV export
  - media upload controls
  - booking inline status update feedback

## Files updated

Primary updates include admin auth, bookings, billing, customers, reports, content management forms, media upload, and public booking form:

- Admin auth/layout: login + logout
- Booking: filter, manual booking create, booking status inline update
- Billing: selection filters + workspace actions (invoice, checkout, charge, delete charge, payment, discount)
- Customers: filter, create, update
- Content/admin forms: cottages, attractions, properties, policies, SEO
- Reports: filter apply and CSV export button
- Public booking request submit
- Gallery/media upload and metadata actions

## Important flows covered

- Admin login/logout
- Booking search/filter + manual booking submit
- Booking status update row action
- Billing: add/delete charge, record payment, apply discount, generate invoice, complete checkout
- Customers filter/add/edit
- Cottages/attractions/properties/policies/SEO create/update/delete submit buttons
- Reports filter + CSV export
- Public booking request submit
- Gallery upload/save/delete actions

## How to add loading state for future buttons

1. **Server action form**: use `SubmitButton` inside the form and set contextual `pendingText`.
2. **Client async handler**: guard duplicate action with `if (loading) return`, set loading in `try/finally`.
3. Add visible loading text and spinner.
4. Add `disabled`, `aria-busy`, and `aria-disabled` where appropriate.
5. Keep pre-existing validation/confirmation logic intact.

## Testing performed

- `npm run lint` (passes with existing warnings unrelated to this change)
- `npx tsc --noEmit` (passes)
