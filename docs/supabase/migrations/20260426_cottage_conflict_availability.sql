-- Keep C1-C2 archive for history but enforce active+bookable selection and FC45/C4/C5 conflict-aware availability.

create or replace function public.create_booking_request(
  p_property_slug text,
  p_cottage_slug text,
  p_full_name text,
  p_phone text,
  p_whatsapp_number text,
  p_email text,
  p_city text,
  p_state text,
  p_country text,
  p_check_in_date date,
  p_check_out_date date,
  p_adults integer,
  p_children integer,
  p_infants integer,
  p_special_requests text
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_property public.properties;
  v_cottage public.cottages;
  v_conflict_cottage_ids uuid[];
  v_guest_id uuid;
  v_booking_id uuid;
  v_total_guests integer;
  v_nights integer;
  v_weekday_nights integer := 0;
  v_weekend_nights integer := 0;
  v_base_amount numeric(10,2) := 0;
  v_child_amount numeric(10,2) := 0;
  v_total_amount numeric(10,2) := 0;
  v_date date;
  i integer;
begin
  if p_check_in_date is null or p_check_out_date is null then
    raise exception 'Check-in and check-out are required';
  end if;
  if p_check_out_date <= p_check_in_date then
    raise exception 'Check-out date must be after check-in date';
  end if;
  if p_check_in_date < current_date then
    raise exception 'Check-in date cannot be in the past';
  end if;
  if coalesce(p_adults, 0) < 1 then
    raise exception 'At least one adult is required';
  end if;

  select * into v_property from public.properties where slug = p_property_slug and is_active = true limit 1;
  if v_property.id is null then
    raise exception 'Property not found';
  end if;

  select *
  into v_cottage
  from public.cottages
  where property_id = v_property.id
    and slug = p_cottage_slug
    and status = 'active'
    and is_bookable = true
  limit 1;

  if v_cottage.id is null then
    raise exception 'Cottage not found or not bookable';
  end if;

  with selected_and_related_codes as (
    select distinct code from public.cottages c where c.id = v_cottage.id and c.status = 'active' and c.is_bookable = true
    union
    select distinct unnest(component_codes) from public.cottages c where c.id = v_cottage.id and c.status = 'active' and c.is_bookable = true
    union
    select distinct c.code
    from public.cottages c
    where c.status = 'active'
      and c.is_bookable = true
      and exists (select 1 from public.cottages selected where selected.id = v_cottage.id and selected.code = any(c.component_codes))
  )
  select array_agg(distinct c.id)
  into v_conflict_cottage_ids
  from public.cottages c
  where c.status = 'active'
    and c.is_bookable = true
    and (c.code in (select code from selected_and_related_codes)
      or exists (select 1 from unnest(c.component_codes) as component_code where component_code in (select code from selected_and_related_codes)));

  if coalesce(array_length(v_conflict_cottage_ids, 1), 0) = 0 then
    v_conflict_cottage_ids := array[v_cottage.id];
  end if;

  v_total_guests := coalesce(p_adults, 0) + coalesce(p_children, 0) + coalesce(p_infants, 0);
  if coalesce(p_adults, 0) > v_cottage.max_adults then raise exception 'Adult count exceeds cottage limit'; end if;
  if coalesce(p_children, 0) > v_cottage.max_children then raise exception 'Children count exceeds cottage limit'; end if;
  if coalesce(p_infants, 0) > v_cottage.max_infants then raise exception 'Infant count exceeds cottage limit'; end if;
  if v_total_guests > v_cottage.max_total_guests then raise exception 'Total guest count exceeds cottage limit'; end if;

  if exists (
    select 1 from public.bookings b
    where b.cottage_id = any(v_conflict_cottage_ids)
      and b.status in ('confirmed', 'advance_paid', 'checked_in')
      and b.check_in_date < p_check_out_date
      and b.check_out_date > p_check_in_date
  ) then
    raise exception 'Selected dates are unavailable for confirmed bookings';
  end if;

  if exists (
    select 1 from public.cottage_blocks cb
    where cb.cottage_id = any(v_conflict_cottage_ids)
      and cb.start_date < p_check_out_date
      and cb.end_date > p_check_in_date
  ) then
    raise exception 'Selected dates are unavailable due to maintenance block';
  end if;

  v_nights := (p_check_out_date - p_check_in_date);
  for i in 0..(v_nights - 1) loop
    v_date := p_check_in_date + i;
    if extract(dow from v_date) in (0, 6) then
      v_weekend_nights := v_weekend_nights + 1;
    else
      v_weekday_nights := v_weekday_nights + 1;
    end if;
  end loop;

  v_base_amount := (v_weekday_nights * v_cottage.weekday_price) + (v_weekend_nights * v_cottage.weekend_price);
  v_child_amount := coalesce(p_children, 0) * v_cottage.child_price * v_nights;
  v_total_amount := v_base_amount + v_child_amount;

  insert into public.booking_guests(full_name,phone,whatsapp_number,email,city,state,country)
  values (trim(p_full_name),trim(p_phone),nullif(trim(coalesce(p_whatsapp_number, '')), ''),nullif(trim(coalesce(p_email, '')), '')::citext,nullif(trim(coalesce(p_city, '')), ''),nullif(trim(coalesce(p_state, '')), ''),coalesce(nullif(trim(coalesce(p_country, '')), ''), 'India'))
  returning id into v_guest_id;

  insert into public.bookings(property_id,booking_guest_id,cottage_id,check_in_date,check_out_date,adults,children,infants,special_requests,nights,base_amount,child_amount,total_amount)
  values (v_property.id,v_guest_id,v_cottage.id,p_check_in_date,p_check_out_date,p_adults,coalesce(p_children, 0),coalesce(p_infants, 0),nullif(trim(coalesce(p_special_requests, '')), ''),v_nights,v_base_amount,v_child_amount,v_total_amount)
  returning id into v_booking_id;

  return jsonb_build_object('success', true,'booking_id', v_booking_id,'booking_code', (select booking_code from public.bookings where id = v_booking_id),'status', 'pending','nights', v_nights,'total_amount', v_total_amount,'message', 'Booking request submitted successfully');
end;
$$;

create or replace function public.get_cottage_unavailability(
  p_property_slug text,
  p_cottage_slug text
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_property_id uuid;
  v_cottage_id uuid;
  v_conflict_cottage_ids uuid[];
  v_blocked_ranges jsonb := '[]'::jsonb;
  v_unavailable_dates jsonb := '[]'::jsonb;
begin
  select id into v_property_id from public.properties where slug = p_property_slug and is_active = true limit 1;
  if v_property_id is null then raise exception 'Property not found'; end if;

  select id into v_cottage_id
  from public.cottages
  where property_id = v_property_id
    and slug = p_cottage_slug
    and status = 'active'
    and is_bookable = true
  limit 1;
  if v_cottage_id is null then raise exception 'Cottage not found'; end if;

  with selected_and_related_codes as (
    select distinct code from public.cottages c where c.id = v_cottage_id and c.status = 'active' and c.is_bookable = true
    union
    select distinct unnest(component_codes) from public.cottages c where c.id = v_cottage_id and c.status = 'active' and c.is_bookable = true
    union
    select distinct c.code
    from public.cottages c
    where c.status = 'active'
      and c.is_bookable = true
      and exists (select 1 from public.cottages selected where selected.id = v_cottage_id and selected.code = any(c.component_codes))
  )
  select array_agg(distinct c.id)
  into v_conflict_cottage_ids
  from public.cottages c
  where c.status = 'active'
    and c.is_bookable = true
    and (c.code in (select code from selected_and_related_codes)
      or exists (select 1 from unnest(c.component_codes) as component_code where component_code in (select code from selected_and_related_codes)));

  if coalesce(array_length(v_conflict_cottage_ids, 1), 0) = 0 then
    v_conflict_cottage_ids := array[v_cottage_id];
  end if;

  with blocked as (
    select b.check_in_date, b.check_out_date
    from public.bookings b
    where b.cottage_id = any(v_conflict_cottage_ids)
      and b.status in ('confirmed', 'advance_paid', 'checked_in')
      and b.check_in_date < b.check_out_date
    union all
    select cb.start_date as check_in_date, (cb.end_date + interval '1 day')::date as check_out_date
    from public.cottage_blocks cb
    where cb.cottage_id = any(v_conflict_cottage_ids)
      and cb.start_date <= cb.end_date
  )
  select coalesce(jsonb_agg(jsonb_build_object('checkInDate', check_in_date::text,'checkOutDate', check_out_date::text) order by check_in_date), '[]'::jsonb)
  into v_blocked_ranges
  from blocked;

  with blocked as (
    select b.check_in_date, b.check_out_date
    from public.bookings b
    where b.cottage_id = any(v_conflict_cottage_ids)
      and b.status in ('confirmed', 'advance_paid', 'checked_in')
      and b.check_in_date < b.check_out_date
    union all
    select cb.start_date as check_in_date, (cb.end_date + interval '1 day')::date as check_out_date
    from public.cottage_blocks cb
    where cb.cottage_id = any(v_conflict_cottage_ids)
      and cb.start_date <= cb.end_date
  ),
  nights as (
    select generate_series(check_in_date, check_out_date - interval '1 day', interval '1 day')::date as blocked_date
    from blocked
  )
  select coalesce(jsonb_agg(distinct blocked_date::text), '[]'::jsonb)
  into v_unavailable_dates
  from nights;

  return jsonb_build_object('unavailableDates', v_unavailable_dates,'blockedRanges', v_blocked_ranges);
end;
$$;
