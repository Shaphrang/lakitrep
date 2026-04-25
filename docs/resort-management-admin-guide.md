# Resort Management Admin Guide

## 1) Add customer
- Open **Admin → Customers**.
- Fill `full name` and `phone` (10 digits required).
- Add optional WhatsApp/email/address/type/source.
- Save. Duplicate phone numbers are blocked.

## 2) Create manual booking
- Open **Admin → Add Manual Booking**.
- Select an existing customer and cottage.
- Enter check-in/check-out, guest counts, source, and notes.
- Optional: discount + advance amount + payment mode.
- Submit to create booking.

## 3) Confirm booking
- Open booking details.
- Change status to `confirmed` / `advance_paid`.
- Save.

## 4) Record advance/final payment
- From booking detail or billing page, use **Record payment**.
- Choose mode (`cash`, `upi`, `card`, `bank_transfer`, `other`).
- Choose payment type (`advance`, `part_payment`, `final_payment`, `refund`).

## 5) Check-in
- Open **Check-in / Checkout**.
- Click **Check-in** for arrival booking.
- System stores actual check-in timestamp.

## 6) Add charges
- Open booking detail or billing page.
- Add charge type, quantity, and unit price.
- Booking bill summary is recalculated automatically.

## 7) Checkout
- Ensure final payment is recorded or use pending override policy.
- Click **Checkout**.
- System stores actual checkout timestamp.

## 8) Generate invoice
- On booking detail/billing page click **Generate Invoice**.
- Invoice appears under **Admin → Invoices**.

## 9) View reports
- Open **Admin → Reports** for:
  - Total collection
  - Pending bills
  - Booking source performance
  - Customer summary
