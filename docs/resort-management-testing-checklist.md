# Resort Management Testing Checklist

## Public flow
- [ ] Website booking form still creates booking request.
- [ ] Website request appears in admin bookings with source `website`.

## Customer flow
- [ ] Create customer with valid 10-digit phone.
- [ ] Duplicate phone shows warning/error.
- [ ] Edit customer fields and confirm persistence.

## Manual booking flow
- [ ] Create manual booking from phone source.
- [ ] Validate unavailable/blocked dates are rejected.
- [ ] Validate check-out must be after check-in.

## Billing flow
- [ ] Add advance payment and verify payment history.
- [ ] Add extra charge and verify bill totals recalculate.
- [ ] Add final payment and verify pending becomes 0.

## Check-in / Checkout flow
- [ ] Check-in from confirmed booking.
- [ ] Checkout with full payment.
- [ ] Checkout with pending dues only via explicit override.

## Invoices
- [ ] Generate invoice from booking.
- [ ] Invoice number is unique and readable.
- [ ] Invoice appears in invoices list.

## Reports
- [ ] Daily/monthly collection shows totals.
- [ ] Pending bill report lists unpaid balances.
- [ ] Booking source report shows counts and revenue.

## Availability
- [ ] Maintenance block prevents new booking on blocked days.
- [ ] Cancelled/no-show bookings do not block availability.
