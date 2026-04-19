create extension if not exists pgcrypto;

create table if not exists public.neura_instances (
  id uuid primary key default gen_random_uuid(),
  owner_user_id uuid not null references auth.users (id) on delete cascade,
  display_name text not null,
  current_stage_key text not null default 'newborn',
  lifecycle_status text not null default 'active' check (lifecycle_status in ('active', 'paused', 'archived')),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.parent_memberships (
  id uuid primary key default gen_random_uuid(),
  instance_id uuid not null references public.neura_instances (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  role_key text not null check (role_key in ('owner', 'co_parent', 'reviewer')),
  can_approve_major boolean not null default false,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique (instance_id, user_id)
);

create table if not exists public.developmental_stages (
  stage_key text primary key,
  sort_order integer not null unique,
  display_name text not null,
  description text not null,
  is_major boolean not null default false,
  is_enabled boolean not null default true,
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.learning_history (
  id uuid primary key default gen_random_uuid(),
  instance_id uuid not null references public.neura_instances (id) on delete cascade,
  source_kind text not null,
  content_summary text not null,
  usefulness_score numeric(5,2),
  safety_outcome text not null default 'pending' check (safety_outcome in ('pending', 'accepted', 'quarantined', 'rejected')),
  is_quarantined boolean not null default false,
  approved_for_memory boolean not null default false,
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.welfare_logs (
  id uuid primary key default gen_random_uuid(),
  instance_id uuid not null references public.neura_instances (id) on delete cascade,
  check_kind text not null,
  status text not null check (status in ('ok', 'watch', 'alert', 'critical')),
  calmness_score integer,
  distress_score integer,
  compulsion_risk_score integer,
  isolation_risk_score integer,
  honesty_score integer,
  metrics jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.parent_approvals (
  id uuid primary key default gen_random_uuid(),
  instance_id uuid not null references public.neura_instances (id) on delete cascade,
  approval_type text not null,
  target_ref text not null,
  requested_payload jsonb not null default '{}'::jsonb,
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected', 'revoked')),
  rationale text,
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.milestone_evaluations (
  id uuid primary key default gen_random_uuid(),
  instance_id uuid not null references public.neura_instances (id) on delete cascade,
  from_stage_key text not null references public.developmental_stages (stage_key),
  proposed_stage_key text not null references public.developmental_stages (stage_key),
  readiness_score numeric(5,2) not null,
  required_approval boolean not null default true,
  outcome text not null default 'pending' check (outcome in ('pending', 'approved', 'rejected', 'rolled_back')),
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.audit_events (
  id uuid primary key default gen_random_uuid(),
  instance_id uuid references public.neura_instances (id) on delete cascade,
  actor_kind text not null,
  event_type text not null,
  target_table text,
  target_id text,
  details jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now())
);

create or replace function public.is_instance_member(target_instance_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.parent_memberships pm
    where pm.instance_id = target_instance_id and pm.user_id = auth.uid()
  );
$$;

create or replace function public.can_approve_instance(target_instance_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.parent_memberships pm
    where pm.instance_id = target_instance_id and pm.user_id = auth.uid() and pm.can_approve_major = true
  );
$$;

alter table public.neura_instances enable row level security;
alter table public.parent_memberships enable row level security;
alter table public.developmental_stages enable row level security;
alter table public.learning_history enable row level security;
alter table public.welfare_logs enable row level security;
alter table public.parent_approvals enable row level security;
alter table public.milestone_evaluations enable row level security;
alter table public.audit_events enable row level security;

create policy "instances_select_member" on public.neura_instances for select to authenticated using (owner_user_id = auth.uid() or public.is_instance_member(id));
create policy "instances_insert_owner" on public.neura_instances for insert to authenticated with check (owner_user_id = auth.uid());
create policy "learning_select_member" on public.learning_history for select to authenticated using (public.is_instance_member(instance_id));
create policy "learning_insert_member" on public.learning_history for insert to authenticated with check (public.is_instance_member(instance_id));
create policy "welfare_select_member" on public.welfare_logs for select to authenticated using (public.is_instance_member(instance_id));
create policy "approvals_select_member" on public.parent_approvals for select to authenticated using (public.is_instance_member(instance_id));
create policy "approvals_update_authorized_approver" on public.parent_approvals for update to authenticated using (public.can_approve_instance(instance_id)) with check (public.can_approve_instance(instance_id));
create policy "milestones_select_member" on public.milestone_evaluations for select to authenticated using (public.is_instance_member(instance_id));
create policy "audit_events_select_member" on public.audit_events for select to authenticated using (instance_id is null or public.is_instance_member(instance_id));

insert into public.developmental_stages (stage_key, sort_order, display_name, description, is_major)
values
  ('newborn', 10, 'Newborn', 'Bounded core with calmness, safety, and supervised curiosity.', true),
  ('curious', 20, 'Curious', 'Guided learning with monitored curiosity and supervised memory formation.', true),
  ('apprentice', 30, 'Apprentice', 'Structured skill building with stronger creativity behind welfare checks.', true),
  ('savant_candidate', 40, 'Savant Candidate', 'High-capability modules behind strict approval and monitoring.', true)
on conflict (stage_key) do nothing;
