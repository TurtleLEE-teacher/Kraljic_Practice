// ============================================================
// Kraljic Matrix KPI Classification Practice — Type Definitions
// ============================================================

// --- Quadrant ---

export type QuadrantId = 'bottleneck' | 'leverage' | 'strategic' | 'noncritical';

export interface QuadrantWeights {
  ce: number;
  ss: number;
  sv: number;
}

export interface QuadrantMeta {
  id: QuadrantId;
  nameKo: string;
  nameEn: string;
  supplyRisk: 'HIGH' | 'LOW';
  profitImpact: 'HIGH' | 'LOW';
  coreDilemma: string;
  weights: QuadrantWeights;
  color: string;
}

// --- Raw Data Types ---

/** 납기 이력 한 건 */
export interface DeliveryRecord {
  poNumber: string;     // 발주번호 e.g. "PO-2024-001"
  orderDate: string;    // 발주일 "YYYY-MM-DD"
  plannedDate: string;  // 납기예정일 "YYYY-MM-DD"
  actualDate: string;   // 실제입고일 "YYYY-MM-DD"
}

/** 공급업체 한 건 */
export interface SupplierRecord {
  name: string;                       // 공급업체명
  annualAmount: number;               // 연간 거래금액 (만원)
  substitutable: 'Y' | '△' | 'N';    // 대체 가능 여부
  note: string;                       // 비고
}

/** 연간 구매 지출 한 건 */
export interface SpendRecord {
  year: number;       // 연도
  itemSpend: number;  // 품목 구매금액 (억원)
  totalSpend: number; // 전사 총 구매금액 (억원)
}

/** 품목 전체 데이터 */
export interface ItemData {
  id: string;          // "a" ~ "j"
  label: string;       // 표시 레이블 "품목 A" ~ "품목 J"
  category: string;    // 품목 유형 (예: "전자부품", "원자재")
  description: string; // 품목 간단 설명
  deliveries: DeliveryRecord[];
  suppliers: SupplierRecord[];
  spends: SpendRecord[];
}
