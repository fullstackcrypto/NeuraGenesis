# Deployment checklist

Repository:
- confirm README and docs files exist
- keep the public landing page at docs/index.html
- keep .env.example free of secrets

Runtime:
- install dependencies
- run typecheck
- run verify
- start the Expo app and test auth, dashboard, and child detail routes

Supabase:
- run the initial migration
- verify auth and row-level security
- verify realtime updates for children, approvals, welfare logs, and incidents

GitHub Pages:
- use main branch
- serve from /docs
- verify the published site after build completes
