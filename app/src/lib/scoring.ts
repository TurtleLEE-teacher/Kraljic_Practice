import { QUADRANT_META } from '@/data/quadrants';
import type { QuadrantId, RawScore, WeightedScore, Grade } from '@/lib/types';

/**
 * Calculate the weighted score for a single step in a given quadrant.
 *
 * Formula: ce * w_ce + ss * w_ss + sv * w_sv
 *
 * For example, in the Bottleneck quadrant (weights: CE=0.20, SS=0.50, SV=0.30),
 * a raw score of {ce:2, ss:4, sv:3} yields 2*0.20 + 4*0.50 + 3*0.30 = 3.3
 */
export function calculateWeightedScore(raw: RawScore, quadrant: QuadrantId): WeightedScore {
  const weights = QUADRANT_META[quadrant].weights;
  const weighted = raw.ce * weights.ce + raw.ss * weights.ss + raw.sv * weights.sv;
  return { raw, weighted };
}

/**
 * Sum the weighted scores for one quadrant across its 4 steps.
 *
 * Each quadrant has exactly 4 steps, so stepScores should contain 4 entries.
 * The total is the simple sum of all individual weighted values.
 */
export function calculateQuadrantTotal(stepScores: WeightedScore[]): number {
  return stepScores.reduce((sum, s) => sum + s.weighted, 0);
}

/**
 * Sum all 4 quadrant totals to produce the Layer 1 score.
 *
 * Range: approximately 16.0 (minimum) to 80.0 (maximum).
 */
export function calculateLayer1Score(quadrantTotals: Record<QuadrantId, number>): number {
  return (
    quadrantTotals.bottleneck +
    quadrantTotals.leverage +
    quadrantTotals.strategic +
    quadrantTotals.noncritical
  );
}

/**
 * Calculate the Layer 2 event score.
 *
 * In the event phase, each quadrant has one response (not 4 steps).
 * Each response is weighted using the same quadrant-specific weights.
 *
 * Range: approximately 4.0 (minimum) to 20.0 (maximum).
 */
export function calculateEventScore(
  eventScores: { quadrant: QuadrantId; raw: RawScore }[],
): number {
  return eventScores.reduce((sum, entry) => {
    const weights = QUADRANT_META[entry.quadrant].weights;
    const weighted =
      entry.raw.ce * weights.ce +
      entry.raw.ss * weights.ss +
      entry.raw.sv * weights.sv;
    return sum + weighted;
  }, 0);
}

/**
 * Calculate the final score by adding Layer 1 and Layer 2.
 *
 * Maximum possible: 80 (Layer 1) + 20 (Layer 2) = 100.
 */
export function calculateFinalScore(layer1: number, layer2: number): number {
  return layer1 + layer2;
}

/**
 * Determine the grade based on the final score.
 *
 * Thresholds:
 *   Excellent  >= 70
 *   Good       >= 55
 *   Fair       >= 40
 *   Poor       <  40
 */
export function determineGrade(finalScore: number): Grade {
  if (finalScore >= 70) return 'Excellent';
  if (finalScore >= 55) return 'Good';
  if (finalScore >= 40) return 'Fair';
  return 'Poor';
}
