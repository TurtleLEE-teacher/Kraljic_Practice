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
    color: 'red',
    strategies: [
      { id: 'bn-safety', name: '안전재고 확보', description: '공급 중단에 대비한 버퍼 재고를 확보합니다', benefit: '공급 중단 리스크 즉시 감소', risk: '재고 유지비용 증가, 자본 묶임' },
      { id: 'bn-alt-rd', name: '대체재 R&D', description: '기술적으로 대체 가능한 소재·부품을 개발합니다', benefit: '장기적 공급 독립성 확보', risk: '개발 기간 12~24개월, 성공 불확실' },
      { id: 'bn-longterm', name: '장기 공급 계약', description: '현 공급사와 2~3년 장기 계약으로 물량을 확보합니다', benefit: '공급 안정성, 가격 예측 가능', risk: '시장 변동 시 계약 유연성 저하' },
      { id: 'bn-support', name: '공급사 기술 지원', description: '공급사의 생산 능력 향상을 위한 기술·자금 지원', benefit: '공급사 역량 강화, 신뢰 구축', risk: '투자 회수 불확실, 경쟁사 혜택 가능성' },
    ],
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
    strategies: [
      { id: 'lv-bid', name: '경쟁 입찰 확대', description: '다수 공급사 대상 경쟁 입찰로 최적가를 확보합니다', benefit: '단가 인하, 시장 투명성 확보', risk: '품질 저하 우려, 기존 공급사 관계 악화' },
      { id: 'lv-volume', name: '볼륨 디스카운트', description: '구매량 집중으로 대량 할인을 협상합니다', benefit: '즉각적 원가 절감', risk: '특정 공급사 의존도 증가 가능' },
      { id: 'lv-pool', name: '공급사 풀 확대', description: '신규 공급사를 발굴하여 협상 레버리지를 강화합니다', benefit: '경쟁 심화, 협상력 강화', risk: '신규 공급사 품질 검증 비용' },
      { id: 'lv-std', name: '규격 표준화', description: '사양을 표준화하여 공급사 전환 비용을 낮춥니다', benefit: '전환 용이성, 장기 원가 구조 개선', risk: '초기 규격 변경 비용, 내부 저항' },
    ],
  },
  strategic: {
    id: 'strategic',
    nameKo: '전략',
    nameEn: 'Strategic',
    supplyRisk: 'HIGH',
    profitImpact: 'HIGH',
    coreDilemma: '파트너십 심화 vs 종속 회피',
    weights: { ce: 0.20, ss: 0.30, sv: 0.50 },
    color: 'violet',
    strategies: [
      { id: 'st-partner', name: '장기 파트너십 계약', description: '핵심 공급사와 전략적 파트너십을 체결합니다', benefit: '공급 안정성, 우선 배분권', risk: '종속도 심화, 계약 경직성' },
      { id: 'st-joint-rd', name: '공동 R&D 투자', description: '공급사와 차세대 기술·제품을 공동 개발합니다', benefit: '기술 우위 확보, 혁신 가속', risk: 'IP 분쟁 가능, 투자 회수 불확실' },
      { id: 'st-dual', name: '대체 공급원 개발', description: '보조 공급원을 육성하여 독점 리스크를 완화합니다', benefit: '리스크 분산, 협상 레버리지', risk: '양산 검증 장기간, 초기 비용 부담' },
      { id: 'st-vi', name: '수직 통합 검토', description: '핵심 부품의 내재화(자체 생산) 가능성을 검토합니다', benefit: '공급 완전 자립, 원가 구조 변경', risk: '대규모 투자, 핵심역량 분산' },
    ],
  },
  noncritical: {
    id: 'noncritical',
    nameKo: '일반',
    nameEn: 'Non-critical',
    supplyRisk: 'LOW',
    profitImpact: 'LOW',
    coreDilemma: '관리 효율화 vs 방치 위험',
    weights: { ce: 0.50, ss: 0.15, sv: 0.35 },
    color: 'slate',
    strategies: [
      { id: 'nc-auto', name: '구매 자동화 (카탈로그)', description: '온라인 카탈로그 기반 자동 발주 시스템을 구축합니다', benefit: '관리 공수 대폭 절감', risk: '가격 비교 기회 감소' },
      { id: 'nc-reduce', name: '공급사 수 축소', description: '소수 우수 공급사로 통합하여 관리 효율을 높입니다', benefit: '거래 비용 절감, 관리 단순화', risk: '공급사 몰입도 저하 시 품질 이슈' },
      { id: 'nc-pcard', name: 'P-Card 도입', description: '구매 카드로 소액 거래를 간소화합니다', benefit: '프로세스 간소화, 결제 즉시성', risk: '지출 통제 약화 가능' },
      { id: 'nc-annual', name: '연간 일괄 계약', description: '연간 단가 계약으로 반복 협상을 제거합니다', benefit: '단가 안정, 행정 비용 절감', risk: '시장가 하락 시 불리' },
    ],
  },
};
