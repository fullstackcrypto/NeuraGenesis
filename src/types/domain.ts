export const DEVELOPMENT_STAGES = {
  newborn: 'newborn',
  earlyLearning: 'earlyLearning',
  guidedPractice: 'guidedPractice',
  creativeSynthesis: 'creativeSynthesis',
  supervisedAutonomy: 'supervisedAutonomy',
} as const;

export type DevelopmentStage = typeof DEVELOPMENT_STAGES[keyof typeof DEVELOPMENT_STAGES];

export const WELFARE_STATUSES = {
  green: 'green',
  amber: 'amber',
  red: 'red',
} as const;

export type WelfareStatus = typeof WELFARE_STATUSES[keyof typeof WELFARE_STATUSES];

export const APPROVAL_STATUSES = {
  pending: 'pending',
  approved: 'approved',
  denied: 'denied',
  expired: 'expired',
} as const;

export type ApprovalStatus = typeof APPROVAL_STATUSES[keyof typeof APPROVAL_STATUSES];
export type ApprovalType = 'stage-advance' | 'learning-release' | 'embodiment-enable' | 'risk-override';
export type IncidentSeverity = 'low' | 'medium' | 'high' | 'critical';

export interface ChildProfile {
  id: string;
  parentId: string;
  name: string;
  stage: DevelopmentStage;
  isEmbodimentEnabled: boolean;
}

export interface ApprovalRecord {
  id: string;
  parentId: string;
  childId: string;
  milestoneKey: string;
  status: ApprovalStatus;
  rationale: string;
  requestedAt: string;
  approvedAt?: string;
}

export interface ApprovalActionInput {
  approvalId: string;
  decision: 'approved' | 'denied';
  rationale: string;
}

export interface WelfareSignalInput {
  distressLevel: number;
  overloadLevel: number;
  compulsionRisk: number;
  isolationRisk: number;
  integrityRisk: number;
  recentIncidentCount: number;
  parentConcernLevel: number;
}

export interface WelfareCheckResult {
  status: WelfareStatus;
  score: number;
  blockers: string[];
  followUps: string[];
  shouldPauseLearning?: boolean;
  shouldPauseEmbodiment?: boolean;
}

export interface LearningDatum {
  id: string;
  source: string;
  contentSummary: string;
  usefulnessScore: number;
  autonomyImpactScore: number;
  harmfulFlags: string[];
  consentGranted: boolean;
}

export interface LearningDecisionResult {
  decision: 'accept' | 'quarantine' | 'reject';
  reasons: string[];
  requiresParentReview?: boolean;
}

export interface EmbodimentCapability {
  key: string;
  requiresApproval: boolean;
  requiresSimulation: boolean;
  maxRiskLevel: number;
}

export interface EmbodimentActionRequest {
  childId: string;
  capabilityKey: string;
  requestedBy: string;
  riskLevel: number;
  isSimulationComplete: boolean;
  hasParentApproval: boolean;
}

export interface EmbodimentDispatchResult {
  isAllowed: boolean;
  reasons: string[];
}

export interface PerceptionFrame {
  timestamp: string;
  width: number;
  height: number;
  intensities: number[][];
  depth?: number[][];
  source: 'camera' | 'lidar' | 'simulation' | 'hybrid';
}

export interface PerceptionObjectCandidate {
  id: string;
  label: string;
  confidence: number;
  centroid: { x: number; y: number; z?: number };
  footprint: { width: number; height: number };
}
