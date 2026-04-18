# Operations

Local setup:
- npm install --include=dev
- copy .env.example to .env
- npm run typecheck
- npm run verify
- npm run start

Parent workflow:
- sign in
- review child profiles
- monitor welfare and pending approvals
- approve or deny milestones
- require simulation before embodiment

Safety workflow:
- red welfare pauses learning and embodiment
- amber welfare narrows learning scope
- milestone progression stays parent-approved
- embodiment stays green-only and simulation-first
