---
applyTo: "supabase/**/*.{sql,ts}"
---
# Supabase instructions

- Every schema change must be a migration file.
- Enable RLS on all user-scoped tables.
- Prefer append-only audit records for sensitive developmental state.
- Use helper SQL functions to centralize membership and approval checks where practical.
- Keep privileged state transitions in backend code.
- Add indexes for common filters and ordering paths.
- Validate Edge Function inputs and log privileged mutations.
- Keep functions small and single-purpose.
- Store structured metadata in `jsonb` only when a strongly typed table would be unnecessarily rigid.
