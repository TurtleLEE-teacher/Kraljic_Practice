import type {
  DashboardData,
  QuadrantResult,
  QuadrantId,
  WeightedScore,
  RawScore,
  DimensionProfile,
  Grade,
} from '@/lib/types';
import { QUADRANT_META, QUADRANT_ORDER } from '@/data/quadrants';

/**
 * Generate a realistic weighted score for a given quadrant and raw scores.
 */
function computeWeighted(quadrant: QuadrantId, raw: RawScore): WeightedScore {
  const w = QUADRANT_META[quadrant].weights;
  return {
    raw,
    weighted: raw.ce * w.ce + raw.ss * w.ss + raw.sv * w.sv,
  };
}

/**
 * Compute the optimal (maximum possible) weighted score for a quadrant.
 * Each step can score at most 5 per dimension, so the optimal per-step is
 * 5*w_ce + 5*w_ss + 5*w_sv = 5. Over 4 steps, max = 20.
 */
function getOptimalScore(quadrant: QuadrantId): number {
  const w = QUADRANT_META[quadrant].weights;
  return 4 * (5 * w.ce + 5 * w.ss + 5 * w.sv);
}

/**
 * Realistic score distributions per quadrant based on design doc simulations.
 * Each quadrant has 4 steps, each step producing CE/SS/SV scores (1-5).
 */
const MOCK_STEP_SCORES: Record<QuadrantId, RawScore[]> = {
  bottleneck: [
    { ce: 2, ss: 4, sv: 3 }, // Step 1: prioritized supply stability
    { ce: 3, ss: 4, sv: 4 }, // Step 2: balanced approach
    { ce: 3, ss: 5, sv: 3 }, // Step 3: strong supply focus
    { ce: 4, ss: 3, sv: 4 }, // Step 4: slight cost focus
  ],
  leverage: [
    { ce: 5, ss: 2, sv: 3 }, // Step 1: aggressive cost reduction
    { ce: 4, ss: 3, sv: 3 }, // Step 2: competitive bidding
    { ce: 4, ss: 2, sv: 4 }, // Step 3: balanced with strategy
    { ce: 5, ss: 3, sv: 2 }, // Step 4: cost optimization
  ],
  strategic: [
    { ce: 2, ss: 3, sv: 5 }, // Step 1: partnership deepening
    { ce: 3, ss: 4, sv: 4 }, // Step 2: balanced collaboration
    { ce: 2, ss: 3, sv: 5 }, // Step 3: innovation cooperation
    { ce: 3, ss: 4, sv: 4 }, // Step 4: strategic alignment
  ],
  noncritical: [
    { ce: 4, ss: 2, sv: 4 }, // Step 1: process automation
    { ce: 5, ss: 2, sv: 3 }, // Step 2: cost reduction
    { ce: 3, ss: 3, sv: 3 }, // Step 3: moderate approach
    { ce: 4, ss: 2, sv: 4 }, // Step 4: efficiency focus
  ],
};

/**
 * Mock choice IDs for each step in each quadrant.
 */
const MOCK_CHOICE_IDS: Record<QuadrantId, string[]> = {
  bottleneck: [
    'bottleneck_step1_B',
    'bottleneck_step2_B',
    'bottleneck_step3_A',
    'bottleneck_step4_C',
  ],
  leverage: [
    'leverage_step1_A',
    'leverage_step2_A',
    'leverage_step3_B',
    'leverage_step4_A',
  ],
  strategic: [
    'strategic_step1_C',
    'strategic_step2_B',
    'strategic_step3_C',
    'strategic_step4_B',
  ],
  noncritical: [
    'noncritical_step1_B',
    'noncritical_step2_A',
    'noncritical_step3_B',
    'noncritical_step4_B',
  ],
};

/**
 * Mock event (Layer 2) response scores per quadrant.
 */
const MOCK_EVENT_SCORES: Record<QuadrantId, RawScore> = {
  bottleneck: { ce: 2, ss: 4, sv: 3 },
  leverage: { ce: 4, ss: 3, sv: 3 },
  strategic: { ce: 2, ss: 3, sv: 5 },
  noncritical: { ce: 4, ss: 2, sv: 4 },
};

const MOCK_EVENT_CHOICE_IDS: Record<QuadrantId, string> = {
  bottleneck: 'event_bottleneck_B',
  leverage: 'event_leverage_B',
  strategic: 'event_strategic_A',
  noncritical: 'event_noncritical_A',
};

/**
 * Determine grade from final score based on design doc grading ranges.
 * Using the combined 1+2 layer scoring (max realistic ~78):
 *   Excellent: >= 70
 *   Good: >= 60
 *   Fair: >= 50
 *   Poor: < 50
 */
function determineGrade(finalScore: number): Grade {
  if (finalScore >= 70) return 'Excellent';
  if (finalScore >= 60) return 'Good';
  if (finalScore >= 50) return 'Fair';
  return 'Poor';
}

/**
 * Compute the dimension profile from all quadrant results.
 * Aggregates raw CE/SS/SV scores across all quadrants and steps.
 */
function computeDimensionProfile(
  quadrantResults: QuadrantResult[]
): DimensionProfile {
  let ceTotal = 0;
  let ssTotal = 0;
  let svTotal = 0;
  let stepCount = 0;

  for (const qr of quadrantResults) {
    for (const ws of qr.stepScores) {
      ceTotal += ws.raw.ce;
      ssTotal += ws.raw.ss;
      svTotal += ws.raw.sv;
      stepCount++;
    }
  }

  const ceAvg = stepCount > 0 ? ceTotal / stepCount : 0;
  const ssAvg = stepCount > 0 ? ssTotal / stepCount : 0;
  const svAvg = stepCount > 0 ? svTotal / stepCount : 0;

  const scores = { ce: ceTotal, ss: ssTotal, sv: svTotal };
  const sorted = Object.entries(scores).sort(([, a], [, b]) => b - a);
  const strongest = sorted[0][0] as 'ce' | 'ss' | 'sv';
  const weakest = sorted[sorted.length - 1][0] as 'ce' | 'ss' | 'sv';

  return {
    ce: { total: ceTotal, average: parseFloat(ceAvg.toFixed(2)) },
    ss: { total: ssTotal, average: parseFloat(ssAvg.toFixed(2)) },
    sv: { total: svTotal, average: parseFloat(svAvg.toFixed(2)) },
    strongest,
    weakest,
  };
}

/**
 * Generate complete mock DashboardData with realistic scores
 * based on the design document's score simulations.
 */
export function generateMockDashboardData(): DashboardData {
  // Build quadrant results
  const quadrantResults: QuadrantResult[] = QUADRANT_ORDER.map((qId) => {
    const stepRaws = MOCK_STEP_SCORES[qId];
    const stepScores = stepRaws.map((raw) => computeWeighted(qId, raw));
    const totalWeighted = parseFloat(
      stepScores.reduce((sum, s) => sum + s.weighted, 0).toFixed(2)
    );
    const optimalScore = getOptimalScore(qId);
    const percentOfOptimal = parseFloat(
      ((totalWeighted / optimalScore) * 100).toFixed(1)
    );

    return {
      quadrant: qId,
      stepScores,
      totalWeighted,
      choiceIds: MOCK_CHOICE_IDS[qId],
      optimalScore,
      percentOfOptimal,
    };
  });

  // Compute Layer 1 score
  const layer1Score = parseFloat(
    quadrantResults.reduce((sum, qr) => sum + qr.totalWeighted, 0).toFixed(2)
  );

  // Build event results
  const eventResults = QUADRANT_ORDER.map((qId) => {
    const raw = MOCK_EVENT_SCORES[qId];
    return {
      quadrant: qId,
      choiceId: MOCK_EVENT_CHOICE_IDS[qId],
      score: computeWeighted(qId, raw),
    };
  });

  // Compute Layer 2 score
  const layer2Score = parseFloat(
    eventResults.reduce((sum, er) => sum + er.score.weighted, 0).toFixed(2)
  );

  // Final score
  const finalScore = parseFloat((layer1Score + layer2Score).toFixed(2));

  // Grade
  const grade = determineGrade(finalScore);

  // Dimension profile
  const dimensionProfile = computeDimensionProfile(quadrantResults);

  return {
    sessionId: 'mock-session-' + Date.now().toString(36),
    participantName: '김실습',
    layer1Score,
    layer2Score,
    finalScore,
    grade,
    quadrantResults,
    eventResults,
    dimensionProfile,
    rank: { before: 5, after: 3, total: 24 },
  };
}
