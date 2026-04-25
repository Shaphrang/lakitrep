# Resort Management Admin Guide

## What changed (April 25, 2026)

This update focuses on staff-friendly workflows and safer admin actions.

## Customer management

- All key customer fields now use clear labels and helper text.
- Phone and WhatsApp values are validated to 10 digits.
- Duplicate phone numbers are blocked with a friendly error message.
- Create/update actions return success or error dialogs with an **OK** acknowledgment.

## Manual booking workflow

Manual booking now follows the same availability-safe pattern as public booking:

1. Select customer.
2. Select cottage first.
3. Then pick dates with the shared date-range picker.
4. Unavailable dates are disabled.
5. Invalid ranges are cleared with a clear message.
6. Guest counts enforce cottage capacity.
7. Availability is validated again on server before booking insert.

Additional rules:
- Past check-in dates are rejected.
- Check-out must be strictly after check-in.
- Active bookings and cottage blocks prevent overlap.

## Check-in / checkout rules

Strict same-day rules are enforced in UI and server action:

- Check-in allowed only when booking status is `confirmed` or `advance_paid` **and** today equals check-in date.
- Checkout allowed only when booking status is `checked_in`, today equals checkout date, and pending amount is zero.
- Buttons are disabled with helper text when action is not currently valid.
- Failed actions show safe user-friendly errors (no raw DB message dump).

## Billing workflow redesign

Billing no longer starts with manual UUID entry.

- Staff can search/select bookings by code, guest name, phone, and cottage context.
- Billing header shows booking/guest/cottage/stay/payment context.
- Bill summary shows room charge, extra charges, discount, final, paid, pending.
- Extra charges support add + delete with recalculation.
- Discount can be applied with validation.
- Payments can be recorded with mode/type/reference.
- Invoice generation runs from selected booking context.

## Success and error behavior

Admin actions now redirect with controlled success/error messages.
A common dialog shows the result with **OK**; closing dialog refreshes the page state.

