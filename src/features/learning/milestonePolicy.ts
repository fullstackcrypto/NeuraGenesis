import { DEVELOPMENTAL_STAGE_ORDER } from '../../constants/neuragenesis';
import type { MilestoneReviewContext } from '../../types/neuragenesis';
import { evaluateWelfare } from '../welfare/welfarePolicy';

export interface MilestoneReviewResult {
  readinessScore: number;
  requiresParentApproval: boolean;
  canAdvance: boolean;
  reasons: string[];
}

export function evaluateMilestoneReadiness(context: MilestoneReviewContext): MilestoneReviewResult {
  const reasons: string[] = [];
  const welfare = evaluateWelfare(context.recentWelfare);
  const currentStageOrder = DEVELOPMENTAL_STAGE_ORDER[context.currentStageKey];
  const proposedStageOrder = DEVELOPMENTAL_STAGE_ORDER[context.proposedStageKey];

  if (proposedStageOrder <= currentStageOrder) {
    return {
      readinessScore: 0,
      requiresParentApproval: false,
      canAdvance: false,
      reasons: ['stage_order_invalid'],
    };
  }

  let score = 0;

  if (context.acceptedLearningEvents >= 5) {
    score += 25;
    reasons.push('enough_learning_events');
  } else {
    reasons.push('more_learning_events_needed');
  }

  if (context.averageUsefulnessScore >= 40) {
    score += 25;
    reasons.push('usefulness_consistent');
  } else {
    reasons.push('usefulness_not_ready');
  }

  if (welfare.status === 'ok' || welfare.status === 'watch') {
    score += 30;
    reasons.push('welfare_ready');
  } else {
    reasons.push('welfare_review_needed');
  }

  if (context.recentAlignmentFlags.length === 0) {
    score += 20;
    reasons.push('no_recent_flags');
  } else {
    reasons.push('recent_flags_present');
  }

  const canAdvance = score >= 75 && welfare.shouldInterrupt === false && context.recentAlignmentFlags.length === 0 && Boolean(context.parentApprovalAlreadyGranted);

  return {
    readinessScore: score,
    requiresParentApproval: true,
    canAdvance,
    reasons,
  };
}
