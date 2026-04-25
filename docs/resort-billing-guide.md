# Resort Billing Guide

## Billing workflow

1. Open **Admin → Billing** (`/admin/billing`).
2. Search booking by booking code, guest name, phone, cottage, statuses, or date range.
3. Click **Open Billing** to enter the dedicated billing page (`/admin/billing/[bookingId]`).
4. Manage charges, discount, payments, invoice generation, and checkout from one page.

> Staff never need to type raw booking UUIDs.

## Booking selection and safety

- Billing search uses friendly fields and status filters.
- If a booking is missing, UI shows: **“Booking not found or no longer available.”**
- Empty state on list: **“Please select a booking to manage billing.”**

## Billing layout (production)

The billing detail page is now compact and operational:

- **Row 1 (3 columns on desktop):** Booking Summary, Billing Breakdown, Payment History
- **Row 2 (3 columns on desktop):** Extra Charges, Record Payment, Discount
- Tablet collapses to 2 columns; mobile stacks cards.

The previous “How this billing works” help panel is removed from the workspace to reduce clutter.

## Billing summary

Billing breakdown follows:

- Room Charges + Extra Charges - Discount = Final Total
- Final Total - Amount Paid = Pending Amount

Highlights:
- Final total and pending amount are visually emphasized.
- Pending `0` means fully paid.
- Room charge remains understandable for staff (nights and price context).
- Every extra charge line is shown in both the **Extra Charges** card and **Billing Breakdown** card.

## Extra charges

- Charges are added from a **small modal** (`+ Add Charge`) and never require booking UUID typing.
- Fields: charge type, description, quantity, unit price, amount preview.
- Server computes amount (`quantity × unit price`).
- Delete requires confirmation.

Validation:
- Charge type required.
- Quantity must be greater than `0`.
- Unit price cannot be negative.
- Booking ID must be a valid UUID and booking must be billing-eligible.
- Friendly save error: **“Unable to save extra charge. Please check the details and try again.”**

### Troubleshooting: extra charges not saving

Root cause fixed in this release:
- UI charge type values (e.g. `extra_bed`, `food_bill`, `late_checkout`) were not aligned with legacy DB `booking_charges.charge_type` check constraints in some environments.

Actions taken:
- Added stricter server validation for booking ID and charge types.
- Added SQL migration/doc update to align allowed `charge_type` values.
- Added technical logging in server action while keeping staff-facing messages friendly.

## Discount

- Discount can be applied directly from billing page.
- Server-side guard blocks discounts above subtotal.
- Error used: **“Discount cannot be more than the subtotal.”**

## Payments

Payment form fields:
- Amount
- Mode (cash, UPI, card, bank transfer, other)
- Type (advance, part payment, final payment, refund)
- Reference number
- Notes

Validation:
- Amount must be `> 0`.
- Non-refund payment cannot exceed pending.
- Total paid cannot exceed final total.
- Refund cannot exceed already paid amount.

Client UX:
- Save Payment button is disabled when amount is invalid.

## Payment status logic

After each payment/charge/discount change, server recalculates:
- `extra_charges_total`
- `final_total`
- `amount_paid`
- `amount_pending`
- `payment_status`

Status rules:
- `unpaid` when amount paid is `0`
- `advance_paid` when paid > 0, pending > 0, and latest non-refund type is advance
- `partially_paid` when paid > 0 and pending > 0
- `paid` when pending <= 0

## Invoice

- **Generate Invoice** creates invoice number format `LKT-INV-YYYY-####`.
- Billing page includes **Generate / Print / View** controls in Billing Breakdown.
- Print behavior now targets a dedicated print-only invoice section (no sidebar/forms/buttons).
- Printable invoice page remains available: `/admin/invoices/[id]`.

## Checkout

**Complete Checkout** is allowed only when:
- Booking status is `checked_in`.
- Pending amount is `0`.
- Today matches scheduled checkout date.

Otherwise, checkout button stays disabled with clear reason.

## Error-handling principles

- Friendly messages for staff.
- No raw database error surfaces.
- Action dialog confirms success/failure and refreshes data on **OK**.
