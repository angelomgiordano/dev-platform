-- ============================================================
-- RelyAssets BESS Platform — projects table
-- Run once in Supabase → SQL Editor → New query → paste → Run
-- ============================================================

create table if not exists public.projects (
  id               text primary key,
  name             text not null,
  status           text,
  spv              text,
  dev_status       numeric,
  market_zone      text,
  regione          text,
  provincia        text,
  comune           text,
  typology         text,
  rtb              text,
  power_mw         numeric,
  capacity_h       numeric,
  capacity_mwh     numeric,
  es_volt          numeric,
  es_dist          numeric,
  stmg             text,
  cod_pratica      bigint,
  stmg_request     date,
  stmg_received    date,
  stmg_expiration  date,
  connection       text,
  stmg_acc_vat     numeric,
  connection_tot_cost numeric,
  land_type        text,
  ha               numeric,
  land_status      text,
  loi_sign         date,
  loi_exp          date,
  dev_mode         text,
  originator       text,
  orig_fee_per_mw  numeric,
  tot_orig_fee     numeric,
  developer        text,
  dev_fee          numeric,
  tot_dev_fee      numeric,
  m1               numeric,
  m2               numeric,
  m3               numeric,
  m4               numeric,
  m5               numeric,
  comments         text,
  suspended        boolean default false,
  dropped          boolean default false,
  created_at       timestamptz default now(),
  updated_at       timestamptz default now()
);

-- Auto-update updated_at
create or replace function public.set_updated_at() returns trigger as $$
begin
  new.updated_at := now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists projects_set_updated_at on public.projects;
create trigger projects_set_updated_at
  before update on public.projects
  for each row execute function public.set_updated_at();

-- ============================================================
-- Row Level Security: only authenticated users can read/write
-- ============================================================

alter table public.projects enable row level security;

drop policy if exists "projects_select_authenticated" on public.projects;
create policy "projects_select_authenticated"
  on public.projects for select
  to authenticated
  using (true);

drop policy if exists "projects_insert_authenticated" on public.projects;
create policy "projects_insert_authenticated"
  on public.projects for insert
  to authenticated
  with check (true);

drop policy if exists "projects_update_authenticated" on public.projects;
create policy "projects_update_authenticated"
  on public.projects for update
  to authenticated
  using (true)
  with check (true);

drop policy if exists "projects_delete_authenticated" on public.projects;
create policy "projects_delete_authenticated"
  on public.projects for delete
  to authenticated
  using (true);
