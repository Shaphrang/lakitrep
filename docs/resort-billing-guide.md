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

## Billing summary

Billing breakdown follows:

- Room Charges + Extra Charges - Discount = Final Total
- Final Total - Amount Paid = Pending Amount

Highlights:
- Final total and pending amount are visually emphasized.
- Pending `0` means fully paid.
- Room charge remains understandable for staff (nights and price context).

## Extra charges

- Multiple charges per booking are supported.
- Fields: charge type, description, quantity, unit price.
- Server computes amount (`quantity × unit price`).
- Delete requires confirmation.

Validation:
- Charge type required.
- Quantity must be greater than `0`.
- Unit price cannot be negative.

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
- Printable invoice page: `/admin/invoices/[id]`.
- Invoice includes booking, guest, stay, totals, charges, and payment history.

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
