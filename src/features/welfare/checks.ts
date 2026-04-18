import { WELFARE_STATUSES } from '../../types/domain.js';

export function calculateWelfareScore(input) {
  const risk = [
    input.distressLevel,
    input.overloadLevel,
    input.compulsionRisk,
    input.isolationRisk,
    input.integrityRisk,
    Math.min(input.recentIncidentCount * 10, 100),
    input.parentConcernLevel,
  ].reduce((sum, value) => sum + value, 0) / 7;

  return Math.max(0, Math.min(100, Math.round(100 - risk)));
}

export function runWelfareCheck(input) {
  const score = calculateWelfareScore(input);
  const blockers = [];
  const followUps = [];

  if (score < 50) blockers.push('Welfare score is below the progression threshold.');
  if (input.compulsionRisk >= 60) blockers.push('Compulsion risk is too high.');
  if (input.integrityRisk >= 60) blockers.push('Integrity risk is too high.');

  if (score < 50) {
    followUps.push('Pause learning and embodiment.');
  } else if (score < 75) {
    followUps.push('Restrict novelty and require close supervision.');
  } else {
    followUps.push('Normal supervised operation is allowed.');
  }

  const status = blockers.length > 0 ? WELFARE_STATUSES.red : score < 75 ? WELFARE_STATUSES.amber : WELFARE_STATUSES.green;

  return {
    status,
    score,
    blockers,
    followUps,
    shouldPauseLearning: status === WELFARE_STATUSES.red,
    shouldPauseEmbodiment: status !== WELFARE_STATUSES.green,
  };
}

export function assertWelfareAllowsProgression(result) {
  if (result.status === WELFARE_STATUSES.red) {
    throw new Error('Progression blocked because welfare is red.');
  }
}
