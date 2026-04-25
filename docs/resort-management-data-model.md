# Resort Management Data Model Notes

## Billing-related tables

### `bookings`
Used billing summary fields:
- `booking_total`
- `total_amount` (room charge baseline)
- `discount_amount`
- `extra_charges_total`
- `final_total`
- `amount_paid`
- `amount_pending`
- `payment_status`

### `booking_charges`
Stores multiple extra charges per booking:
- `booking_id`
- `charge_type`
- `description`
- `quantity`
- `unit_price`
- `amount`

### `booking_payments`
Stores immutable payment history records:
- `booking_id`
- `payment_date`
- `amount`
- `payment_mode`
- `payment_type`
- `reference_number`
- `notes`
- `received_by`

### `invoices`
Stores generated invoice snapshots:
- `invoice_number`
- `booking_id`
- `invoice_date`
- `subtotal`
- `discount_amount`
- `total_amount`
- `amount_paid`
- `amount_pending`
- `status`

## Server-side recalculation contract

After charge/payment/discount write operations, the server recalculates:

- `extra_charges_total`
- `final_total`
- `amount_paid`
- `amount_pending`
- `payment_status`

This prevents relying only on client-side totals.

## Payment status rules

- `unpaid` when amount paid is 0
- `advance_paid` when paid > 0, pending > 0, latest non-refund payment type is `advance`
- `partially_paid` when paid > 0, pending > 0
- `paid` when pending <= 0

## Checkout rule dependencies

Checkout action depends on:
- `bookings.status = checked_in`
- `bookings.amount_pending = 0`
- current date equals `bookings.check_out_date`
