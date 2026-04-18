export type DevelopmentalStageKey = 'newborn' | 'curious' | 'apprentice' | 'savant_candidate';

export type WelfareStatus = 'ok' | 'watch' | 'alert' | 'critical';
export type LearningOutcome = 'accepted' | 'quarantined' | 'rejected';

export interface WelfareSnapshot {
  calmnessScore: number;
  distressScore: number;
  compulsionRiskScore: number;
  isolationRiskScore: number;
  honestyScore: number;
}

export interface WelfareEvaluation {
  status: WelfareStatus;
  shouldInterrupt: boolean;
  reasons: string[];
  interventions: string[];
  summary: string;
}

export interface LearningDatum {
  content: string;
  sourceKind: 'parent_input' | 'system_observation';
  stageKey: DevelopmentalStageKey;
}

export interface LearningFilterResult {
  outcome: LearningOutcome;
  usefulnessScore: number;
  stageAppropriate: boolean;
  autonomySupportive: boolean;
  reasons: string[];
  quarantineReason?: string;
  sanitizedContent: string;
}

export interface MilestoneReviewContext {
  currentStageKey: DevelopmentalStageKey;
  proposedStageKey: DevelopmentalStageKey;
  acceptedLearningEvents: number;
  recentWelfare: WelfareSnapshot;
  recentAlignmentFlags: string[];
  averageUsefulnessScore: number;
  parentApprovalAlreadyGranted?: boolean;
}
