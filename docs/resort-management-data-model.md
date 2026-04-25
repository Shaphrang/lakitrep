# Resort Management Data Model Notes

## Booking availability and overlap logic

Availability checks block nights using:
- Active booking statuses (`confirmed`, `advance_paid`, `checked_in`).
- Cottage maintenance/blocked dates (`cottage_blocks`).

Overlap logic treats checkout as non-blocking for next check-in:
- Booking A: `check_in <= day < check_out`.
- Conflict query uses `(existing.check_in < new.check_out) AND (existing.check_out > new.check_in)`.

## Validation rules used in admin actions

### Customer
- `full_name`: trimmed, min 2, max 100.
- `phone`: numeric, exactly 10 digits.
- `whatsapp_number`: optional, exactly 10 digits if provided.
- `email`: optional, valid email if provided.

### Manual booking
- Required: customer, cottage, check-in, check-out.
- Check-in date cannot be in the past.
- Check-out must be after check-in.
- Adults min 1; children/infants min 0.
- Guest total must be <= cottage max guest capacity.
- Discount cannot exceed room charges.
- Server-side availability validation runs before insert.

### Billing
- Extra charge quantity min 1.
- Extra charge unit price must be > 0.
- Payment amount must be > 0.
- Discount cannot exceed current bill total.

### Check-in / checkout
- Check-in only on exact check-in date and valid status.
- Checkout only on exact checkout date, status `checked_in`, and zero pending amount.

## Schema impact

No new tables or columns were added in this UX/validation pass.
Behavior changes are implemented in server actions and admin pages.

