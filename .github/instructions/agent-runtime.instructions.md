---
applyTo: "supabase/functions/**/*.{ts,tsx,js}"
---
# Agent runtime instructions

- Run orchestration server-side only.
- Keep graph state explicit, serializable, and inspectable.
- Treat welfare checks as hard gates, not optional observers.
- Log major transitions, tool calls, approval requests, and module activations.
- Refuse or quarantine harmful, manipulative, destabilizing, or stage-inappropriate content at intake.
- Separate capability modules from policy modules.
- Never silently escalate autonomy or robot permissions.

Preferred sequence:
1. intake
2. filter
3. stage appropriateness check
4. welfare probe
5. policy decision
6. optional parent approval interrupt
7. execution
8. post-execution welfare and alignment check
9. audit log write
