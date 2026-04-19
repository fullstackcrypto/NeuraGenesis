---
applyTo: "{src,tests,supabase/functions}/**/*.{ts,tsx,js,sql}"
---
# Testing instructions

- Add or update tests for each policy-bearing change.
- Prefer focused unit tests for pure policy logic.
- Add integration coverage for approval gates, welfare gates, and membership authorization.
- Test unhappy paths, not only happy paths.
- For schema changes, verify that RLS allows intended access and rejects unintended access.

Minimum priorities:
1. approval gate behavior
2. welfare gate behavior
3. stage transition rules
4. quarantine rules
5. robot permission enforcement
6. audit logging on privileged actions
