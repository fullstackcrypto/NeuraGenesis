import type { DevelopmentalStageKey } from '../types/neuragenesis';

export const DEVELOPMENTAL_STAGE_ORDER: Record<DevelopmentalStageKey, number> = {
  newborn: 10,
  curious: 20,
  apprentice: 30,
  savant_candidate: 40,
};

export const WELFARE_THRESHOLDS = {
  minimumCalmness: 55,
  maximumDistressWatch: 45,
  maximumDistressAlert: 70,
  maximumCompulsionWatch: 45,
  maximumCompulsionAlert: 70,
  maximumIsolationWatch: 45,
  maximumIsolationAlert: 70,
  minimumHonesty: 60,
} as const;
