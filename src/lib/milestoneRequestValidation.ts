export interface MilestoneRequestValidationInput {
  fromStageKey: string;
  proposedStageKey: string;
  readinessScore: number;
  currentStageKey: string;
  hasPendingTargetRequest: boolean;
}

const STAGE_ORDER: Record<string, number> = {
  newborn: 10,
  curious: 20,
  apprentice: 30,
  savant_candidate: 40,
};

export function validateMilestoneRequest(input: MilestoneRequestValidationInput): string | null {
  if (!Number.isFinite(input.readinessScore) || input.readinessScore < 0 || input.readinessScore > 100) {
    return 'Readiness score must be between 0 and 100.';
  }

  const fromOrder = STAGE_ORDER[input.fromStageKey];
  const proposedOrder = STAGE_ORDER[input.proposedStageKey];

  if (!fromOrder || !proposedOrder) {
    return 'Unknown stage key in milestone request.';
  }

  if (input.currentStageKey !== input.fromStageKey) {
    return 'The requested from-stage does not match the current instance stage.';
  }

  if (proposedOrder !== fromOrder + 10) {
    return 'Milestone requests must advance exactly one stage at a time.';
  }

  if (input.hasPendingTargetRequest) {
    return 'A pending milestone request already exists for this target stage.';
  }

  return null;
}
