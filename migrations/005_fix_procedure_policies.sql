-- Fix RLS policies for procedure_records
-- Error: "new row violates row-level security policy for table 'procedure_records'"

ALTER TABLE procedure_records ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Auth users can read procedure_records" ON procedure_records;
DROP POLICY IF EXISTS "Auth users can insert procedure_records" ON procedure_records;
DROP POLICY IF EXISTS "Auth users can update procedure_records" ON procedure_records;
DROP POLICY IF EXISTS "Auth users can delete procedure_records" ON procedure_records;

CREATE POLICY "Auth users can read procedure_records" ON procedure_records FOR SELECT TO authenticated USING (true);
CREATE POLICY "Auth users can insert procedure_records" ON procedure_records FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Auth users can update procedure_records" ON procedure_records FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Auth users can delete procedure_records" ON procedure_records FOR DELETE TO authenticated USING (true);
