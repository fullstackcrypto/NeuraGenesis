---
applyTo: "src/**/*.{ts,tsx}"
---
# React Native and Expo instructions

- Use Expo Router route conventions.
- Keep screens thin and move policy logic into feature modules or hooks.
- Use TypeScript strict mode and explicit return types on exported functions.
- Prefer functional components and named exports.
- Use TanStack Query for server state and Zustand only for local ephemeral state.
- Validate parent-entered data with Zod before mutation calls.
- Keep privileged orchestration on the backend.
- Approval-gated actions must be visible in the UI with rationale and review state.
- Avoid direct client writes to privileged developmental or robot-permission records.
- Prefer readable loading, error, empty, and risk states in dashboards.
