-- Drop existing restrictive policies for daily_monitoring
DROP POLICY IF EXISTS "Authenticated users can read daily_monitoring" ON daily_monitoring;
DROP POLICY IF EXISTS "Authenticated users can insert daily_monitoring" ON daily_monitoring;
DROP POLICY IF EXISTS "Authenticated users can update daily_monitoring" ON daily_monitoring;
DROP POLICY IF EXISTS "Authenticated users can delete daily_monitoring" ON daily_monitoring;

-- Create permissive policies for daily_monitoring
CREATE POLICY "Public Access Daily Monitoring" ON daily_monitoring
    FOR ALL USING (true) WITH CHECK (true);

-- Drop existing restrictive policies for blood_sugar_records
DROP POLICY IF EXISTS "Auth users can read blood_sugar_records" ON blood_sugar_records;
DROP POLICY IF EXISTS "Auth users can insert blood_sugar_records" ON blood_sugar_records;
DROP POLICY IF EXISTS "Auth users can update blood_sugar_records" ON blood_sugar_records;
DROP POLICY IF EXISTS "Auth users can delete blood_sugar_records" ON blood_sugar_records;

-- Create permissive policies for blood_sugar_records
CREATE POLICY "Public Access Blood Sugar" ON blood_sugar_records
    FOR ALL USING (true) WITH CHECK (true);
