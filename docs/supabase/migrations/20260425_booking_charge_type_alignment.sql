-- Align booking_charges.charge_type values with admin billing UI options.

begin;

alter table public.booking_charges
  drop constraint if exists booking_charges_charge_type_check;

alter table public.booking_charges
  add constraint booking_charges_charge_type_check
  check (
    charge_type in (
      'room',
      'extra_bed',
      'extra_person',
      'food_bill',
      'food',
      'bonfire',
      'transport',
      'laundry',
      'decoration',
      'late_checkout',
      'damage_charge',
      'damage',
      'discount_adjustment',
      'other'
    )
  );

commit;
