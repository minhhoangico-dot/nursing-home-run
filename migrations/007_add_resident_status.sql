ALTER TABLE residents
ADD COLUMN IF NOT EXISTS location_status TEXT DEFAULT 'Present', -- 'Present', 'Home', 'Hospital'
ADD COLUMN IF NOT EXISTS absent_start_date TIMESTAMP WITH TIME ZONE;
