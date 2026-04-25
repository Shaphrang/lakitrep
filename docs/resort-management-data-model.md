# Resort Management Data Model

## Tables

### `booking_guests` (customer registry)
- Existing table reused for customers.
- Added fields: `address`, `customer_type`, `source`.

### `bookings`
- Core reservation table.
- Added fields:
  - `customer_id`
  - `booking_total`, `discount_amount`, `extra_charges_total`
  - `final_total`, `amount_paid`, `amount_pending`
  - `internal_notes`, `created_by`
  - `actual_check_in_at`, `actual_check_out_at`

### `booking_payments`
- Multiple payments per booking.
- Tracks date, mode, type, amount, reference, receiver.

### `booking_charges`
- Extra billable items (food/transport/laundry/etc.).

### `invoices`
- Invoice snapshots generated from booking billing summary.

### `cottage_blocks`
- Maintenance/private blocks for inventory control.

## Status Values

### Booking statuses
- `new_request`, `contacted`, `confirmed`, `advance_paid`, `checked_in`, `checked_out`, `cancelled`, `no_show`, `rejected`
- Legacy statuses still supported: `pending`, `completed`

### Payment statuses
- `unpaid`, `advance_paid`, `partially_paid`, `paid`, `pending`, `refunded`
- Legacy statuses still supported: `paid_on_arrival`, `waived`

## Relationships
- `bookings.booking_guest_id` and `bookings.customer_id` → `booking_guests.id`
- `bookings.cottage_id` → `cottages.id`
- `booking_payments.booking_id` → `bookings.id`
- `booking_charges.booking_id` → `bookings.id`
- `invoices.booking_id` → `bookings.id`
- `cottage_blocks.cottage_id` → `cottages.id`
