# Resort Management Admin Guide

## What changed (April 25, 2026)

This update introduces a dedicated billing workflow designed for front-desk staff.

## Billing redesign

### New flow

- `/admin/billing` is now a **booking search/select screen**.
- `/admin/billing/[bookingId]` is the **dedicated billing workspace**.
- Staff choose bookings using friendly fields; no manual UUID typing.

### Billing workspace sections

- Booking Summary
- Billing Breakdown
- Extra Charges
- Record Payment
- Payment History
- Invoice / Checkout Actions
- Help panel

### Key validations

- Charge quantity > 0 and price >= 0.
- Discount cannot exceed subtotal.
- Payment amount must be > 0.
- Payment cannot exceed current pending amount.
- Total paid cannot exceed final total.
- Refund cannot exceed amount paid so far.

### Checkout guardrails

Checkout button is disabled unless:
- Booking is `checked_in`
- Pending amount is `0`
- Today is checkout date

### Invoice workflow

- Invoice generation remains one-click from billing.
- Latest invoice can be opened in printable view.
- Printable route: `/admin/invoices/[id]`.

## Customer management

- Phone and WhatsApp validated to 10 digits.
- Duplicate phone numbers blocked with friendly message.

## Manual booking workflow

Manual booking keeps shared availability-safe behavior:
- Cottage/date availability validated server-side.
- Overlaps blocked.
- Guest count capped by cottage capacity.

## Success and error behavior

Admin actions redirect with controlled `success`/`error` messages.
`ActionDialog` displays clear result text and refreshes state on **OK**.
