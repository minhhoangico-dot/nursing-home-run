-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Residents Table
create table residents (
  id text primary key,
  name text not null,
  dob date,
  gender text,
  room text,
  bed text,
  floor text,
  building text,
  care_level integer,
  status text,
  admission_date date,
  guardian_name text,
  guardian_phone text,
  balance numeric default 0,
  assessments jsonb default '[]',
  prescriptions jsonb default '[]',
  medical_visits jsonb default '[]',
  special_monitoring jsonb default '[]',
  medical_history jsonb default '[]',
  allergies jsonb default '[]',
  vital_signs jsonb default '[]',
  care_logs jsonb default '[]',
  current_condition_note text,
  last_medical_update date,
  last_updated_by text,
  room_type text,
  diet_type text,
  diet_note text,
  created_at timestamptz default now()
);

-- Users Table
create table users (
  id uuid primary key default uuid_generate_v4(),
  username text unique,
  role text,
  full_name text,
  avatar_url text,
  created_at timestamptz default now()
);

-- Inventory Table
create table inventory (
  id text primary key,
  name text not null,
  category text,
  unit text,
  stock numeric default 0,
  min_stock numeric default 0,
  price numeric default 0,
  created_at timestamptz default now()
);

-- Inventory Transactions Table
create table inventory_transactions (
  id text primary key,
  item_id text references inventory(id),
  item_name text,
  type text, -- 'IMPORT' | 'EXPORT'
  quantity numeric,
  date timestamptz default now(),
  performer text,
  reason text
);

-- Purchase Requests Table
create table purchase_requests (
  id text primary key,
  item_name text,
  quantity numeric,
  requester text,
  request_date timestamptz default now(),
  status text,
  priority text,
  estimated_cost numeric,
  reason text
);

-- Financial Transactions Table
create table financial_transactions (
  id text primary key,
  date timestamptz default now(),
  resident_name text,
  description text,
  amount numeric,
  type text, -- 'INCOME' | 'EXPENSE'
  performer text,
  status text
);

-- Service Prices Table
create table service_prices (
  id text primary key,
  name text,
  price numeric,
  unit text,
  category text,
  description text
);

-- Incidents Table
create table incidents (
  id text primary key,
  date timestamptz default now(),
  resident_id text references residents(id),
  resident_name text,
  type text,
  severity text,
  description text,
  immediate_action text,
  reporter text,
  status text
);

-- Staff Schedules Table
create table staff_schedules (
    user_id text primary key,
    user_name text,
    role text,
    shifts jsonb default '[]'
);

-- Handovers Table
create table handovers (
  id text primary key,
  date date,
  shift text,
  leader text,
  total_residents integer,
  new_admissions integer,
  discharges integer,
  transfers integer,
  medical_alerts jsonb default '[]',
  equipment_issues jsonb default '[]',
  general_notes text,
  created_at timestamptz default now()
);

-- Visitors Table
create table visitors (
  id text primary key,
  visitor_name text,
  id_card text,
  phone text,
  resident_id text references residents(id),
  resident_name text,
  relationship text,
  check_in_time timestamptz,
  check_out_time timestamptz,
  status text,
  note text,
  item_brought text
);

-- Maintenance Requests Table
create table maintenance_requests (
  id text primary key,
  title text,
  description text,
  area text,
  priority text,
  status text,
  reporter text,
  assigned_to text,
  created_at timestamptz default now(),
  completed_at timestamptz,
  cost numeric
);

-- Activities Table
create table activities (
  id text primary key,
  title text,
  type text,
  date date,
  start_time text,
  end_time text,
  location text,
  host text,
  description text,
  status text
);

-- Medication Logs Table
create table medication_logs (
  id text primary key,
  resident_id text references residents(id),
  prescription_id text,
  medication_name text,
  dose text,
  time text,
  date date,
  status text,
  performer text,
  note text,
  created_at timestamptz default now()
);

-- Meal Orders Table
create table meal_orders (
  id uuid primary key default uuid_generate_v4(),
  resident_id text references residents(id),
  date date,
  meal_type text,
  diet_type text,
  note text,
  unique(resident_id, date, meal_type)
);

-- Enable RLS (Row Level Security) - defaulting to true but we'll add policies for public access for now as per plan
alter table residents enable row level security;
alter table users enable row level security;
alter table inventory enable row level security;
alter table inventory_transactions enable row level security;
alter table purchase_requests enable row level security;
alter table financial_transactions enable row level security;
alter table service_prices enable row level security;
alter table incidents enable row level security;
alter table staff_schedules enable row level security;
alter table handovers enable row level security;
alter table visitors enable row level security;
alter table maintenance_requests enable row level security;
alter table activities enable row level security;
alter table medication_logs enable row level security;
alter table meal_orders enable row level security;

-- Create policies (modify as needed for better security later)
-- For now, allow all access (since auth isn't fully set up with RLS in the app code yet?)
-- Actually, let's allow public access for simplicity in development as per implementation plan "Enable RLS policies (public read/write for demo purposes)"

create policy "Public Access Residents" on residents for all using (true) with check (true);
create policy "Public Access Users" on users for all using (true) with check (true);
create policy "Public Access Inventory" on inventory for all using (true) with check (true);
create policy "Public Access Inv Trans" on inventory_transactions for all using (true) with check (true);
create policy "Public Access Purchase" on purchase_requests for all using (true) with check (true);
create policy "Public Access Finance" on financial_transactions for all using (true) with check (true);
create policy "Public Access Prices" on service_prices for all using (true) with check (true);
create policy "Public Access Incidents" on incidents for all using (true) with check (true);
create policy "Public Access Schedules" on staff_schedules for all using (true) with check (true);
create policy "Public Access Handovers" on handovers for all using (true) with check (true);
create policy "Public Access Visitors" on visitors for all using (true) with check (true);
create policy "Public Access Maint" on maintenance_requests for all using (true) with check (true);
create policy "Public Access Activities" on activities for all using (true) with check (true);
create policy "Public Access Meds" on medication_logs for all using (true) with check (true);
create policy "Public Access Meals" on meal_orders for all using (true) with check (true);
