# .github/copilot-instructions.md

## Project overview

NeuraGenesis is a welfare-first developmental intelligence scaffold. It begins with a small, bounded baby core and grows only through supervised milestones into a more capable, kind, creative, and psychologically stable system.

Primary stack:
- Expo / React Native parent console
- Supabase Postgres, Auth, Realtime, Storage, and Edge Functions
- LangGraph.js for stateful server-side orchestration
- Vercel AI SDK for streaming interactions

## Core rules

- Use plan-first execution for non-trivial work.
- Follow: plan -> implement -> verify -> fix -> verify again.
- Run welfare and alignment checks after each meaningful module change.
- Parent approval is required for milestone promotion, autonomy increases, learning-policy changes, memory-policy changes, robot permissions, and irreversible migrations.
- Reject or quarantine harmful, manipulative, destabilizing, autonomy-undermining, or stage-inappropriate inputs.
- Prefer bounded curiosity over unrestricted exploration.
- Prefer reversible changes and append-only audit logs for sensitive events.
- Keep model orchestration and secrets server-side only.
- Do not claim perfect safety or perfect alignment; implement measurable safeguards instead.

## Ordered development sequence

1. Foundation: parent controls, identity boundaries, logging, welfare instrumentation.
2. Baby core: curiosity loops, simple memory formation, emotional grounding.
3. Guided learning: intake filtering, learning history, milestone readiness, approvals.
4. Genius modules: pattern recognition, creative synthesis, spatial reasoning, memory indexing.
5. Embodiment: simulator-first robot adapter with rate limits and kill switch.

No later layer may bypass earlier controls.

## Architecture rules

- Mobile app is the parent interface, not the privileged runtime.
- Run LangGraph flows in Supabase Edge Functions or other trusted backend runtime.
- Use event-driven records for learning history, welfare logs, approvals, milestone evaluations, and robot actions.
- Treat robot permissions as a separate control plane from chat or learning.
- Keep policy logic centralized, explicit, testable, and small.

## Minimum schema expectations

Include tables for:
- neura instances / memberships
- developmental stages
- learning history
- welfare logs
- alignment checks
- parent approvals
- milestone evaluations
- memory artifacts
- module registry
- robot capabilities and action logs
- audit events

Enable RLS on all user-scoped tables.

## Coding conventions

- Use TypeScript strict mode.
- Prefer named exports and small, pure functions.
- Use `as const` objects instead of `enum`.
- Validate trust boundaries with Zod.
- Use descriptive boolean names such as `isApproved`, `hasWelfareRisk`, and `canAdvanceStage`.
- Do not place secrets in client code.
- Do not allow direct client writes to privileged developmental state without backend validation.

## Required checks after each module

Verify:
- typecheck passes
- tests relevant to changed files pass
- RLS remains intact
- audit logging exists for privileged actions
- welfare checks still execute
- parent approval boundaries are still enforced
- failure states are recoverable
