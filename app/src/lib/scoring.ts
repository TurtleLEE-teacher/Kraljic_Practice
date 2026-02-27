import { QUADRANT_META } from '@/data/quadrants';
import type { QuadrantId, RawScore, WeightedScore } from '@/lib/types';

/**
 * Calculate the weighted score for a single step in a given quadrant.
 *
 * Formula: ce * w_ce + ss * w_ss + sv * w_sv
 */
export function calculateWeightedScore(raw: RawScore, quadrant: QuadrantId): WeightedScore {
  const weights = QUADRANT_META[quadrant].weights;
  const weighted = raw.ce * weights.ce + raw.ss * weights.ss + raw.sv * weights.sv;
  return { raw, weighted };
}

/**
 * Maximum achievable weighted scores per quadrant,
 * calculated from the best choice at each step.
 *
 * Bottleneck: 3.7 + 4.1 + 3.8 + 4.0 = 15.6
 * Leverage:   3.5 + 3.5 + 3.8 + 4.1 = 14.9
 * Strategic:  3.8 + 3.8 + 3.8 + 4.0 = 15.4
 * Noncritical: 3.85 + 4.35 + 4.70 + 3.35 = 16.25
 *
 * Update these if scenario choice scores change.
 */
export const QUADRANT_MAX_WEIGHTED: Record<QuadrantId, number> = {
  bottleneck: 15.6,
  leverage: 14.9,
  strategic: 15.4,
  noncritical: 16.25,
};

/** Normalize raw weighted total to 0-100 scale based on actual achievable max */
export function normalizeScore(rawWeighted: number, quadrantId: QuadrantId): number {
  const max = QUADRANT_MAX_WEIGHTED[quadrantId];
  return Math.min(100, Math.round((rawWeighted / max) * 100));
}

/** Dimension labels */
export const DIM_LABELS: Record<string, string> = {
  ce: '비용효율성',
  ss: '공급안정성',
  sv: '전략적가치',
};
