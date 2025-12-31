-- Create medicines table
CREATE TABLE IF NOT EXISTS public.medicines (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    active_ingredient TEXT,
    unit TEXT,
    default_dosage TEXT,
    price NUMERIC DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create prescriptions table
CREATE TABLE IF NOT EXISTS public.prescriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code TEXT,
    resident_id TEXT REFERENCES public.residents(id) ON DELETE CASCADE,
    doctor_id TEXT, -- REFERENCES public.users(id) - users might be in auth or public schema, keep loose for now or link strictly if sure
    doctor_name TEXT,
    diagnosis TEXT,
    prescription_date DATE DEFAULT CURRENT_DATE,
    start_date DATE,
    end_date DATE,
    status TEXT DEFAULT 'Active', -- Active, Completed, Cancelled
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create prescription_items table
CREATE TABLE IF NOT EXISTS public.prescription_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    prescription_id UUID REFERENCES public.prescriptions(id) ON DELETE CASCADE,
    medicine_id UUID REFERENCES public.medicines(id) ON DELETE SET NULL,
    medicine_name TEXT NOT NULL,
    dosage TEXT,
    frequency TEXT,
    times_of_day JSONB DEFAULT '[]'::jsonb,
    quantity INTEGER,
    instructions TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.medicines ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prescriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prescription_items ENABLE ROW LEVEL SECURITY;

-- Create Policies (Allow all for authenticated users for simplicity as per current app pattern)
create policy "Enable all access for authenticated users" on public.medicines
  for all using (auth.role() = 'authenticated');

create policy "Enable all access for authenticated users" on public.prescriptions
  for all using (auth.role() = 'authenticated');

create policy "Enable all access for authenticated users" on public.prescription_items
  for all using (auth.role() = 'authenticated');

-- Grant permissions
GRANT ALL ON public.medicines TO authenticated;
GRANT ALL ON public.medicines TO service_role;

GRANT ALL ON public.prescriptions TO authenticated;
GRANT ALL ON public.prescriptions TO service_role;

GRANT ALL ON public.prescription_items TO authenticated;
GRANT ALL ON public.prescription_items TO service_role;
