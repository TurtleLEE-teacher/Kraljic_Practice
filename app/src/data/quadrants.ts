import type { QuadrantMeta, QuadrantId } from '@/lib/types';

export const QUADRANT_ORDER: QuadrantId[] = [
  'bottleneck',
  'leverage',
  'strategic',
  'noncritical',
];

export const QUADRANT_META: Record<QuadrantId, QuadrantMeta> = {
  bottleneck: {
    id: 'bottleneck',
    nameKo: '병목',
    nameEn: 'Bottleneck',
    supplyRisk: 'HIGH',
    profitImpact: 'LOW',
    coreDilemma: '저비용 품목에 얼마나 투자할 것인가',
    weights: { ce: 0.20, ss: 0.50, sv: 0.30 },
    color: 'amber',
  },
  leverage: {
    id: 'leverage',
    nameKo: '레버리지',
    nameEn: 'Leverage',
    supplyRisk: 'LOW',
    profitImpact: 'HIGH',
    coreDilemma: '공격적 원가 절감 vs 공급사 관계',
    weights: { ce: 0.50, ss: 0.20, sv: 0.30 },
    color: 'emerald',
  },
  strategic: {
    id: 'strategic',
    nameKo: '전략',
    nameEn: 'Strategic',
    supplyRisk: 'HIGH',
    profitImpact: 'HIGH',
    coreDilemma: '파트너십 심화 vs 종속 회피',
    weights: { ce: 0.20, ss: 0.30, sv: 0.50 },
    color: 'blue',
  },
  noncritical: {
    id: 'noncritical',
    nameKo: '일상(비핵심)',
    nameEn: 'Non-critical',
    supplyRisk: 'LOW',
    profitImpact: 'LOW',
    coreDilemma: '관리 효율화 vs 방치 위험',
    weights: { ce: 0.50, ss: 0.15, sv: 0.35 },
    color: 'slate',
  },
};
