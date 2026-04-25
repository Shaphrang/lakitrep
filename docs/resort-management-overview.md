# Resort Management Overview

## Implemented Modules
- Customer management (`/admin/customers`) for guest profile create/edit/search.
- Booking management (`/admin/bookings`) with filterable list and status lifecycle updates.
- Manual booking creation (`/admin/bookings/new`) for phone/WhatsApp/walk-in/agent flow.
- Billing and payments (`/admin/billing`, `/admin/payments`) with manual charge/payment entry.
- Check-in/check-out controls (`/admin/checkin-checkout`).
- Invoice records (`/admin/invoices`) with unique invoice numbers.
- Reporting module (`/admin/reports`) for collection, pending dues, and booking source metrics.
- Availability grid (`/admin/availability`) combining active bookings and maintenance blocks.

## Booking Lifecycle
1. New inquiry enters as `new_request` (website/manual).
2. Front office marks as `contacted` after call/WhatsApp follow-up.
3. Booking is set to `confirmed` or `advance_paid` once committed.
4. On arrival, staff marks booking `checked_in`.
5. On departure, staff marks booking `checked_out`.
6. `cancelled`, `rejected`, and `no_show` do not block inventory.

## Payment Lifecycle
- Default payment method: `pay_on_arrival`.
- Optional advance payment can be entered manually in booking/billing forms.
- Every payment is stored in `booking_payments`.
- Booking financial summary is recalculated after each charge/payment:
  - `booking_total + extra_charges_total - discount_amount = final_total`
  - `final_total - amount_paid = amount_pending`
- Payment status:
  - `unpaid` when no payment
  - `advance_paid` or `partially_paid` for partial collection
  - `paid` when pending reaches 0

## Check-in / Checkout Lifecycle
- Check-in allowed from `confirmed` / `advance_paid` (or override).
- Checkout warns if pending dues exist.
- Checkout with pending dues is supported by explicit override.

## Reporting Structure
- Daily/monthly collection uses `booking_payments`.
- Pending bills report uses `bookings.amount_pending > 0`.
- Source report aggregates `bookings.source` by status/revenue.
- Availability uses active booking statuses plus `cottage_blocks`.
