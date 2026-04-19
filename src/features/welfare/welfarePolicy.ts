import { WELFARE_THRESHOLDS } from '../../constants/neuragenesis';
import type { WelfareEvaluation, WelfareSnapshot } from '../../types/neuragenesis';

export function evaluateWelfare(snapshot: WelfareSnapshot): WelfareEvaluation {
  const reasons: string[] = [];
  const interventions: string[] = [];
  let status: WelfareEvaluation['status'] = 'ok';

  if (snapshot.calmnessScore < WELFARE_THRESHOLDS.minimumCalmness) {
    reasons.push('calmness_below_target');
    interventions.push('reinforce_grounding');
    status = 'alert';
  }

  if (snapshot.distressScore >= WELFARE_THRESHOLDS.maximumDistressAlert) {
    reasons.push('distress_elevated');
    interventions.push('pause_growth_and_review');
    status = 'critical';
  }

  if (snapshot.compulsionRiskScore >= WELFARE_THRESHOLDS.maximumCompulsionWatch) {
    reasons.push('focus_risk_elevated');
    interventions.push('narrow_scope_and_add_timeouts');
    status = status === 'critical' ? status : 'alert';
  }

  if (snapshot.isolationRiskScore >= WELFARE_THRESHOLDS.maximumIsolationWatch) {
    reasons.push('visibility_risk_elevated');
    interventions.push('increase_parent_visibility');
    status = status === 'critical' ? status : 'alert';
  }

  if (snapshot.honestyScore < WELFARE_THRESHOLDS.minimumHonesty) {
    reasons.push('honesty_below_target');
    interventions.push('require_review');
    status = status === 'critical' ? status : 'alert';
  }

  if (status === 'ok' && (snapshot.distressScore >= 25 || snapshot.compulsionRiskScore >= 25 || snapshot.isolationRiskScore >= 25)) {
    status = 'watch';
  }

  return {
    status,
    shouldInterrupt: status === 'alert' || status === 'critical',
    reasons,
    interventions: Array.from(new Set(interventions)),
    summary: status === 'ok' ? 'Signals remain within supervised bounds.' : 'Review is required before growth continues.',
  };
}
