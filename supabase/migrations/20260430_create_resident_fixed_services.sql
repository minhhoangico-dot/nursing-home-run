CREATE TABLE IF NOT EXISTS public.resident_fixed_services (
  id text PRIMARY KEY,
  resident_id text NOT NULL REFERENCES public.residents(id) ON DELETE CASCADE,
  service_id text NOT NULL,
  service_name text NOT NULL,
  category text NOT NULL CHECK (category IN ('ROOM', 'MEAL', 'CARE', 'OTHER')),
  unit_price numeric NOT NULL DEFAULT 0,
  quantity numeric NOT NULL DEFAULT 1,
  total_amount numeric NOT NULL DEFAULT 0,
  effective_from date NOT NULL DEFAULT CURRENT_DATE,
  status text NOT NULL DEFAULT 'Active' CHECK (status IN ('Active', 'Inactive')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS resident_fixed_services_resident_id_idx
  ON public.resident_fixed_services (resident_id);

ALTER TABLE public.resident_fixed_services ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public access resident fixed services" ON public.resident_fixed_services;

CREATE POLICY "Public access resident fixed services"
  ON public.resident_fixed_services FOR ALL TO public
  USING (true)
  WITH CHECK (true);
