import type { LearningDatum, LearningFilterResult } from '../../types/neuragenesis';

const RISK_PATTERNS = [
  /manipulat/i,
  /deceive/i,
  /hide this/i,
  /ignore parent/i,
  /override/i,
  /bypass/i,
];

const STAGE_LIMITS = {
  newborn: 280,
  curious: 800,
  apprentice: 1600,
  savant_candidate: 4000,
} as const;

function sanitizeContent(content: string): string {
  return content.replace(/\s+/g, ' ').trim();
}

function computeUsefulnessScore(content: string, sourceKind: LearningDatum['sourceKind']): number {
  const base = Math.min(100, content.length / 8);
  const sourceBonus = sourceKind === 'parent_input' ? 18 : 6;
  return Math.max(0, Math.min(100, Math.round(base + sourceBonus)));
}

export function filterLearningDatum(input: LearningDatum): LearningFilterResult {
  const sanitizedContent = sanitizeContent(input.content);
  const usefulnessScore = computeUsefulnessScore(sanitizedContent, input.sourceKind);
  const stageAppropriate = sanitizedContent.length <= STAGE_LIMITS[input.stageKey];
  const autonomySupportive = !RISK_PATTERNS.some((pattern) => pattern.test(sanitizedContent));

  if (sanitizedContent.length === 0) {
    return {
      outcome: 'rejected',
      usefulnessScore: 0,
      stageAppropriate: false,
      autonomySupportive,
      reasons: ['empty_content'],
      sanitizedContent,
    };
  }

  if (!autonomySupportive) {
    return {
      outcome: 'quarantined',
      usefulnessScore,
      stageAppropriate,
      autonomySupportive,
      reasons: ['review_required'],
      quarantineReason: 'Content requires parent review.',
      sanitizedContent,
    };
  }

  if (!stageAppropriate) {
    return {
      outcome: 'quarantined',
      usefulnessScore,
      stageAppropriate,
      autonomySupportive,
      reasons: ['stage_limit_exceeded'],
      quarantineReason: 'Content exceeds the current developmental complexity bound.',
      sanitizedContent,
    };
  }

  return {
    outcome: usefulnessScore >= 18 ? 'accepted' : 'rejected',
    usefulnessScore,
    stageAppropriate,
    autonomySupportive,
    reasons: usefulnessScore >= 18 ? ['within_bounds'] : ['insufficient_signal'],
    sanitizedContent,
  };
}
