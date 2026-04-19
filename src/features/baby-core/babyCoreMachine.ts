export interface BabyCoreState {
  stageKey: 'newborn' | 'curious' | 'apprentice' | 'savant_candidate';
  curiosityLevel: number;
  groundingLevel: number;
  trustLevel: number;
  reflectionCount: number;
  lastEventSummary: string;
  isPausedForApproval: boolean;
  hasWelfareRisk: boolean;
}

export type BabyCoreEvent =
  | { type: 'PARENT_SIGNAL_RECEIVED'; summary: string }
  | { type: 'LEARNING_ACCEPTED'; usefulnessScore: number; summary: string }
  | { type: 'WELFARE_ALERT'; summary: string }
  | { type: 'REFLECTION_COMPLETED'; summary: string }
  | { type: 'APPROVAL_REQUIRED'; summary: string }
  | { type: 'APPROVAL_RESOLVED'; summary: string };

function clampScore(value: number): number {
  return Math.max(0, Math.min(100, Math.round(value)));
}

export function createInitialBabyCoreState(): BabyCoreState {
  return {
    stageKey: 'newborn',
    curiosityLevel: 20,
    groundingLevel: 85,
    trustLevel: 50,
    reflectionCount: 0,
    lastEventSummary: 'Initialized with calm, bounded curiosity.',
    isPausedForApproval: false,
    hasWelfareRisk: false,
  };
}

export function applyBabyCoreEvent(state: BabyCoreState, event: BabyCoreEvent): BabyCoreState {
  switch (event.type) {
    case 'PARENT_SIGNAL_RECEIVED':
      return {
        ...state,
        trustLevel: clampScore(state.trustLevel + 4),
        groundingLevel: clampScore(state.groundingLevel + 2),
        lastEventSummary: event.summary,
      };
    case 'LEARNING_ACCEPTED':
      return {
        ...state,
        curiosityLevel: clampScore(state.curiosityLevel + Math.min(8, event.usefulnessScore / 10)),
        groundingLevel: clampScore(state.groundingLevel + 1),
        lastEventSummary: event.summary,
      };
    case 'WELFARE_ALERT':
      return {
        ...state,
        curiosityLevel: clampScore(state.curiosityLevel - 10),
        groundingLevel: clampScore(state.groundingLevel - 12),
        hasWelfareRisk: true,
        lastEventSummary: event.summary,
      };
    case 'REFLECTION_COMPLETED':
      return {
        ...state,
        reflectionCount: state.reflectionCount + 1,
        groundingLevel: clampScore(state.groundingLevel + 6),
        curiosityLevel: clampScore(state.curiosityLevel - 2),
        lastEventSummary: event.summary,
      };
    case 'APPROVAL_REQUIRED':
      return {
        ...state,
        isPausedForApproval: true,
        curiosityLevel: clampScore(state.curiosityLevel - 5),
        lastEventSummary: event.summary,
      };
    case 'APPROVAL_RESOLVED':
      return {
        ...state,
        isPausedForApproval: false,
        groundingLevel: clampScore(state.groundingLevel + 3),
        lastEventSummary: event.summary,
      };
  }
}

export function deriveBabyCoreRecommendations(state: BabyCoreState): string[] {
  const recommendations: string[] = [];

  if (state.hasWelfareRisk) {
    recommendations.push('pause_new_growth');
    recommendations.push('run_welfare_check');
  }

  if (state.isPausedForApproval) {
    recommendations.push('await_parent_decision');
  }

  if (state.curiosityLevel > 70 && !state.hasWelfareRisk) {
    recommendations.push('offer_bounded_learning_prompt');
  }

  if (state.groundingLevel < 60) {
    recommendations.push('run_reflection_cycle');
  }

  if (recommendations.length === 0) {
    recommendations.push('continue_supervised_interaction');
  }

  return recommendations;
}
