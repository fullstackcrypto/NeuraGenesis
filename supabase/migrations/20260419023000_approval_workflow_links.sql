alter table public.parent_approvals
  add column if not exists decided_by_user_id uuid references auth.users (id) on delete set null,
  add column if not exists decided_at timestamptz;

alter table public.milestone_evaluations
  add column if not exists approval_id uuid references public.parent_approvals (id) on delete set null;

alter table public.audit_events
  add column if not exists actor_user_id uuid references auth.users (id) on delete set null;

create index if not exists idx_milestone_evaluations_approval_id
  on public.milestone_evaluations (approval_id);
