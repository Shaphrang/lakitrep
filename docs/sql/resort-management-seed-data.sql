begin;

-- Optional seed examples for local QA only.
insert into public.cottage_blocks (cottage_id, start_date, end_date, reason, notes)
select c.id, current_date + 15, current_date + 16, 'maintenance', 'Water line check'
from public.cottages c
order by c.created_at
limit 1
on conflict do nothing;

commit;
