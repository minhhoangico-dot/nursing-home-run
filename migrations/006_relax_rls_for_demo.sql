-- Relax RLS policies to allow anon/public access
-- Rationale: The app uses simulated role-based auth (client-side), not native Supabase Auth.
-- Therefore, all database requests come as 'anon' role.

-- 1. BLOOD SUGAR RECORDS
DROP POLICY IF EXISTS "Auth users can read blood_sugar_records" ON blood_sugar_records;
DROP POLICY IF EXISTS "Auth users can insert blood_sugar_records" ON blood_sugar_records;
DROP POLICY IF EXISTS "Auth users can update blood_sugar_records" ON blood_sugar_records;
DROP POLICY IF EXISTS "Public read blood_sugar_records" ON blood_sugar_records;
DROP POLICY IF EXISTS "Public insert blood_sugar_records" ON blood_sugar_records;
DROP POLICY IF EXISTS "Public update blood_sugar_records" ON blood_sugar_records;

CREATE POLICY "Public read blood_sugar_records" ON blood_sugar_records FOR SELECT TO public USING (true);
CREATE POLICY "Public insert blood_sugar_records" ON blood_sugar_records FOR INSERT TO public WITH CHECK (true);
CREATE POLICY "Public update blood_sugar_records" ON blood_sugar_records FOR UPDATE TO public USING (true);

-- 2. SHIFT HANDOVERS
DROP POLICY IF EXISTS "Auth users can read shift_handovers" ON shift_handovers;
DROP POLICY IF EXISTS "Auth users can insert shift_handovers" ON shift_handovers;
DROP POLICY IF EXISTS "Auth users can update shift_handovers" ON shift_handovers;

CREATE POLICY "Public read shift_handovers" ON shift_handovers FOR SELECT TO public USING (true);
CREATE POLICY "Public insert shift_handovers" ON shift_handovers FOR INSERT TO public WITH CHECK (true);
CREATE POLICY "Public update shift_handovers" ON shift_handovers FOR UPDATE TO public USING (true);

-- 3. SHIFT HANDOVER NOTES
DROP POLICY IF EXISTS "Auth users can read shift_handover_notes" ON shift_handover_notes;
DROP POLICY IF EXISTS "Auth users can insert shift_handover_notes" ON shift_handover_notes;
DROP POLICY IF EXISTS "Auth users can update shift_handover_notes" ON shift_handover_notes;

CREATE POLICY "Public read shift_handover_notes" ON shift_handover_notes FOR SELECT TO public USING (true);
CREATE POLICY "Public insert shift_handover_notes" ON shift_handover_notes FOR INSERT TO public WITH CHECK (true);
CREATE POLICY "Public update shift_handover_notes" ON shift_handover_notes FOR UPDATE TO public USING (true);

-- 4. PROCEDURE RECORDS
DROP POLICY IF EXISTS "Auth users can read procedure_records" ON procedure_records;
DROP POLICY IF EXISTS "Auth users can insert procedure_records" ON procedure_records;
DROP POLICY IF EXISTS "Auth users can update procedure_records" ON procedure_records;
DROP POLICY IF EXISTS "Auth users can delete procedure_records" ON procedure_records;

CREATE POLICY "Public read procedure_records" ON procedure_records FOR SELECT TO public USING (true);
CREATE POLICY "Public insert procedure_records" ON procedure_records FOR INSERT TO public WITH CHECK (true);
CREATE POLICY "Public update procedure_records" ON procedure_records FOR UPDATE TO public USING (true);
CREATE POLICY "Public delete procedure_records" ON procedure_records FOR DELETE TO public USING (true);

-- 5. WEIGHT RECORDS
DROP POLICY IF EXISTS "Auth users can read weight_records" ON weight_records;
DROP POLICY IF EXISTS "Auth users can insert weight_records" ON weight_records;
DROP POLICY IF EXISTS "Auth users can update weight_records" ON weight_records;

CREATE POLICY "Public read weight_records" ON weight_records FOR SELECT TO public USING (true);
CREATE POLICY "Public insert weight_records" ON weight_records FOR INSERT TO public WITH CHECK (true);
CREATE POLICY "Public update weight_records" ON weight_records FOR UPDATE TO public USING (true);
