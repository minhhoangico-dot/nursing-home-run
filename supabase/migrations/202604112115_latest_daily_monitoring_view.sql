create or replace view latest_daily_monitoring as
select distinct on (resident_id) *
from daily_monitoring
order by resident_id, record_date desc;

-- Operator note:
-- Review how RLS should apply to this view before running the migration.
-- If daily_monitoring policies do not carry over as expected, switch to a
-- security invoker function or recreate the necessary policies explicitly.
