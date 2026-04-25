# Resort Management Testing Checklist

## Billing selection page (`/admin/billing`)
- [ ] Search by booking code.
- [ ] Search by guest name.
- [ ] Search by phone number.
- [ ] Filter by booking status.
- [ ] Filter by payment status.
- [ ] Filter by date range.
- [ ] Open billing from **Open Billing** action.
- [ ] No raw booking UUID is shown in staff-facing controls.

## Dedicated billing page (`/admin/billing/[bookingId]`)
- [ ] Booking summary shows guest, phone, cottage, stay, statuses, and source.
- [ ] Room charge, extra charges, discount, final total, paid, pending are correct.
- [ ] Pending `0` displays fully paid state.
- [ ] Missing booking shows friendly not-found message.

## Extra charges
- [ ] Add Extra Bed charge.
- [ ] Add Bonfire charge.
- [ ] Add Food charge.
- [ ] Delete one charge with confirmation.
- [ ] Totals update after add/delete.
- [ ] Invalid quantity is blocked.
- [ ] Negative unit price is blocked.

## Discount
- [ ] Apply valid discount.
- [ ] Block discount greater than subtotal.
- [ ] Block negative discount.

## Payments
- [ ] Record advance payment.
- [ ] Record part payment.
- [ ] Record final payment.
- [ ] Block payment greater than pending amount.
- [ ] Block overpayment above final total.
- [ ] Refund cannot exceed paid amount.
- [ ] Save button disabled for invalid amount.
- [ ] Payment history appends new rows (no overwrite).
- [ ] Payment status updates correctly.

## Invoice
- [ ] Generate invoice from billing page.
- [ ] Open latest invoice.
- [ ] Print using browser print.
- [ ] Invoice values match billing summary.

## Checkout
- [ ] Checkout disabled when pending > 0.
- [ ] Checkout disabled when status is not checked-in.
- [ ] Checkout disabled when date is not scheduled checkout date.
- [ ] Checkout succeeds when all rules are satisfied.

## Error-safety
- [ ] Empty charges does not crash.
- [ ] Empty payment history does not crash.
- [ ] Missing booking does not crash page.
- [ ] Failed actions show friendly errors.
