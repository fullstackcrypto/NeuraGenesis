export interface RobotActionRequest {
  actionName: string;
  permissionScope: string;
  hasLiveOperator: boolean;
  approvedByParent: boolean;
  isEmergencyStopRequested?: boolean;
}

export interface RobotActionDecision {
  allowed: boolean;
  reasons: string[];
  executionStatus: 'requested' | 'denied' | 'approved';
}

export function evaluateRobotActionRequest(request: RobotActionRequest): RobotActionDecision {
  const reasons: string[] = [];

  if (request.isEmergencyStopRequested) {
    return {
      allowed: false,
      reasons: ['emergency_stop_requested'],
      executionStatus: 'denied',
    };
  }

  if (!request.approvedByParent) {
    reasons.push('parent_approval_missing');
  }

  if (!request.hasLiveOperator) {
    reasons.push('live_operator_required');
  }

  if (request.permissionScope.trim().length === 0) {
    reasons.push('permission_scope_missing');
  }

  if (reasons.length > 0) {
    return {
      allowed: false,
      reasons,
      executionStatus: 'denied',
    };
  }

  return {
    allowed: true,
    reasons: ['within_permission_scope'],
    executionStatus: 'approved',
  };
}
