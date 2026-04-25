# Resort Management Testing Checklist

## Customer
- [ ] Add valid customer (name + 10 digit phone).
- [ ] Reject invalid phone input.
- [ ] Reject invalid email format.
- [ ] Duplicate phone shows friendly warning.

## Manual booking
- [ ] Cottage must be selected before date selection.
- [ ] Date picker loads cottage availability.
- [ ] Unavailable dates are disabled.
- [ ] Overlapping dates cannot be submitted.
- [ ] Guest count cannot exceed cottage capacity.
- [ ] Manual booking creation shows success dialog.

## Booking lifecycle
- [ ] Status update works with success message.
- [ ] Cancel/no-show flow does not crash detail page.
- [ ] Booking delete returns friendly success/error state.

## Check-in
- [ ] Check-in disabled before check-in date.
- [ ] Check-in enabled only on check-in date.
- [ ] Non-eligible status keeps check-in disabled.
- [ ] Success and error messages are staff friendly.

## Checkout
- [ ] Checkout disabled before checkout date.
- [ ] Checkout disabled when date has passed.
- [ ] Pending balance prevents checkout.
- [ ] Final payment enables checkout.
- [ ] Checkout success message appears.

## Billing
- [ ] Booking can be selected without UUID entry.
- [ ] Billing header shows guest + booking + cottage context.
- [ ] Add multiple extra charges.
- [ ] Delete charge recalculates totals.
- [ ] Apply discount validates upper limit.
- [ ] Record payment updates paid/pending.
- [ ] Generate invoice without manual booking ID typing.

## Reports
- [ ] From date cannot exceed To date.
- [ ] Filtered report shows expected rows.
- [ ] Empty states show “No records found for the selected filters.”

