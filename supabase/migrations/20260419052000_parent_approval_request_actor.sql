alter table public.parent_approvals
  add column if not exists requested_by_user_id uuid references auth.users (id) on delete set null;

create index if not exists idx_parent_approvals_requested_by_user_id
  on public.parent_approvals (requested_by_user_id);
