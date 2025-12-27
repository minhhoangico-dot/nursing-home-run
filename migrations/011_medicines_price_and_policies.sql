-- Migration: Add price to medicines and enhance policies
-- Date: 2025-12-26

-- 1. Add price column to medicines
ALTER TABLE medicines ADD COLUMN IF NOT EXISTS price NUMERIC DEFAULT 0;

-- 2. Enhance policies for Medicine Management by Staff
-- (Ensure these policies allow insert/update/delete for authenticated staff)

-- Drop existing overlapping policies if any to avoid confusion (optional, but safer to just add if missing)
-- For this migration, we'll ensure the policies are permissive for authenticated users as per requirement "manage directly"

-- Enable RLS just in case
ALTER TABLE medicines ENABLE ROW LEVEL SECURITY;

-- Re-apply or ensure policies exist (using DO block or separate statements)
-- We'll just define them. If they exist with same name, it might error, so we'll drop first if we can, or just use new names. 
-- Best practice in this env: Drop simply to be sure.

DROP POLICY IF EXISTS "Enable read access for all authenticated users" ON medicines;
DROP POLICY IF EXISTS "Enable CRUD for staff" ON medicines;
DROP POLICY IF EXISTS "Enable all access for authenticated" ON medicines;

-- Create comprehensive policy
CREATE POLICY "Enable all access for authenticated" ON medicines
    FOR ALL
    USING (auth.role() = 'authenticated')
    WITH CHECK (auth.role() = 'authenticated');
