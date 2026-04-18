import { LEARNING_DECISIONS } from '../../types/domain.js';
import { runWelfareCheck } from '../welfare/checks.js';

export function evaluateLearningDatum(datum, welfareInput) {
  const welfare = runWelfareCheck(welfareInput);
  const reasons = [];

  if (!datum.consentGranted) reasons.push('Consent was not granted.');
  if (datum.harmfulFlags.length > 0) reasons.push('Potentially harmful content detected.');
  if (datum.autonomyImpactScore < 40) reasons.push('Autonomy impact is too low.');

  if (welfare.shouldPauseLearning) {
    return {
      decision: LEARNING_DECISIONS.reject,
      reasons: [...reasons, 'Learning is paused because welfare is red.'],
      requiresParentReview: true,
    };
  }

  if (reasons.length > 0 || datum.usefulnessScore < 50) {
    return {
      decision: LEARNING_DECISIONS.quarantine,
      reasons: reasons.length > 0 ? reasons : ['Usefulness score is below threshold.'],
      requiresParentReview: true,
    };
  }

  return {
    decision: LEARNING_DECISIONS.accept,
    reasons: ['Learning datum accepted.'],
  };
}
