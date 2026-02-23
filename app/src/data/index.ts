import type { QuadrantId, ScenarioData } from '@/lib/types';

export { QUADRANT_ORDER, QUADRANT_META } from './quadrants';
export { bottleneckScenario } from './bottleneck';
export { leverageScenario } from './leverage';
export { strategicScenario } from './strategic';
export { noncriticalScenario } from './noncritical';
export { eventData } from './event';

// Re-import scenario objects so we can build the lookup map
import { bottleneckScenario } from './bottleneck';
import { leverageScenario } from './leverage';
import { strategicScenario } from './strategic';
import { noncriticalScenario } from './noncritical';

/**
 * Convenience lookup: access any quadrant's scenario data by its QuadrantId.
 */
export const SCENARIOS: Record<QuadrantId, ScenarioData> = {
  bottleneck: bottleneckScenario,
  leverage: leverageScenario,
  strategic: strategicScenario,
  noncritical: noncriticalScenario,
};
