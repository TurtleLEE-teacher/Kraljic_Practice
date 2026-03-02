import type { ItemData } from '@/lib/types';

/**
 * 10개 품목 원천 데이터
 *
 * ▸ 모든 수치는 원시값 그대로 제공됩니다 (KPI 계산값 없음).
 * ▸ 참가자는 아래 원천 데이터로부터 직접 KPI를 산출해야 합니다.
 *
 * 산출 가이드 → /guide 참고
 */
export const ITEMS: ItemData[] = [
  // ─────────────────────────────────────────────
  // 품목 A – MLCC 커패시터  (정답: 레버리지)
  // 높은 지출비중 + 낮은 공급위험
  // ─────────────────────────────────────────────
  {
    id: 'a',
    label: '품목 A',
    category: '전자부품',
    description: '전자기기 회로 기판에 범용 사용되는 적층 세라믹 커패시터',
    deliveries: [
      { poNumber: 'PO-2024-001', orderDate: '2024-01-05', plannedDate: '2024-01-12', actualDate: '2024-01-11' },
      { poNumber: 'PO-2024-007', orderDate: '2024-01-22', plannedDate: '2024-01-29', actualDate: '2024-01-30' },
      { poNumber: 'PO-2024-015', orderDate: '2024-02-08', plannedDate: '2024-02-15', actualDate: '2024-02-14' },
      { poNumber: 'PO-2024-023', orderDate: '2024-03-01', plannedDate: '2024-03-08', actualDate: '2024-03-07' },
      { poNumber: 'PO-2024-031', orderDate: '2024-03-18', plannedDate: '2024-03-25', actualDate: '2024-03-26' },
      { poNumber: 'PO-2024-040', orderDate: '2024-04-05', plannedDate: '2024-04-12', actualDate: '2024-04-12' },
      { poNumber: 'PO-2024-051', orderDate: '2024-05-02', plannedDate: '2024-05-09', actualDate: '2024-05-08' },
      { poNumber: 'PO-2024-063', orderDate: '2024-06-10', plannedDate: '2024-06-17', actualDate: '2024-06-19' },
      { poNumber: 'PO-2024-074', orderDate: '2024-07-08', plannedDate: '2024-07-15', actualDate: '2024-07-14' },
      { poNumber: 'PO-2024-085', orderDate: '2024-08-05', plannedDate: '2024-08-12', actualDate: '2024-08-12' },
      { poNumber: 'PO-2024-096', orderDate: '2024-09-09', plannedDate: '2024-09-16', actualDate: '2024-09-15' },
      { poNumber: 'PO-2024-108', orderDate: '2024-10-07', plannedDate: '2024-10-14', actualDate: '2024-10-16' },
    ],
    suppliers: [
      { name: '삼성전기(주)', annualAmount: 480_000, substitutable: 'Y', note: '국내 1위, 글로벌 Top3' },
      { name: 'Murata Manufacturing', annualAmount: 360_000, substitutable: 'Y', note: '일본 글로벌 메이저' },
      { name: 'TDK Corporation', annualAmount: 220_000, substitutable: 'Y', note: '일본 글로벌 메이저' },
      { name: '(주)아모텍', annualAmount: 90_000, substitutable: 'Y', note: '국내 중견' },
      { name: 'Yageo Corporation', annualAmount: 50_000, substitutable: 'Y', note: '대만 메이저' },
    ],
    spends: [
      { year: 2022, itemSpend: 10.8, totalSpend: 142 },
      { year: 2023, itemSpend: 11.4, totalSpend: 148 },
      { year: 2024, itemSpend: 12.0, totalSpend: 150 },
    ],
  },

  // ─────────────────────────────────────────────
  // 품목 B – 특수 세라믹 절연체  (정답: 병목)
  // 낮은 지출비중 + 높은 공급위험(소수 공급사, 긴 리드타임)
  // ─────────────────────────────────────────────
  {
    id: 'b',
    label: '품목 B',
    category: '산업용 소재',
    description: '고온 환경 센서 모듈에 사용되는 특수 고내열 세라믹 절연체',
    deliveries: [
      { poNumber: 'PO-2024-003', orderDate: '2024-01-08', plannedDate: '2024-02-19', actualDate: '2024-03-05' },
      { poNumber: 'PO-2024-012', orderDate: '2024-02-01', plannedDate: '2024-03-13', actualDate: '2024-03-12' },
      { poNumber: 'PO-2024-021', orderDate: '2024-03-04', plannedDate: '2024-04-15', actualDate: '2024-05-02' },
      { poNumber: 'PO-2024-035', orderDate: '2024-04-09', plannedDate: '2024-05-21', actualDate: '2024-05-20' },
      { poNumber: 'PO-2024-047', orderDate: '2024-05-06', plannedDate: '2024-06-17', actualDate: '2024-07-01' },
      { poNumber: 'PO-2024-059', orderDate: '2024-06-03', plannedDate: '2024-07-15', actualDate: '2024-07-14' },
      { poNumber: 'PO-2024-068', orderDate: '2024-07-01', plannedDate: '2024-08-12', actualDate: '2024-09-04' },
      { poNumber: 'PO-2024-079', orderDate: '2024-07-29', plannedDate: '2024-09-09', actualDate: '2024-09-08' },
      { poNumber: 'PO-2024-090', orderDate: '2024-08-26', plannedDate: '2024-10-07', actualDate: '2024-10-28' },
      { poNumber: 'PO-2024-101', orderDate: '2024-09-23', plannedDate: '2024-11-04', actualDate: '2024-11-03' },
      { poNumber: 'PO-2024-112', orderDate: '2024-10-21', plannedDate: '2024-12-02', actualDate: '2024-12-20' },
      { poNumber: 'PO-2024-120', orderDate: '2024-11-11', plannedDate: '2024-12-23', actualDate: '2024-12-22' },
    ],
    suppliers: [
      { name: '(주)세라텍', annualAmount: 220_000, substitutable: 'N', note: '국내 유일 양산업체, 전용 소성로 보유' },
      { name: 'Kyocera Corporation', annualAmount: 60_000, substitutable: '△', note: '일본산, 규격 일부 불일치로 대체 시 설계 변경 필요' },
    ],
    spends: [
      { year: 2022, itemSpend: 2.2, totalSpend: 142 },
      { year: 2023, itemSpend: 2.5, totalSpend: 148 },
      { year: 2024, itemSpend: 2.8, totalSpend: 150 },
    ],
  },

  // ─────────────────────────────────────────────
  // 품목 C – 사무용 소모품  (정답: 일반)
  // 낮은 지출비중 + 낮은 공급위험
  // ─────────────────────────────────────────────
  {
    id: 'c',
    label: '품목 C',
    category: '사무용품',
    description: '복사지, 볼펜, 파일 등 일반 사무 소모품 묶음 단위 구매',
    deliveries: [
      { poNumber: 'PO-2024-004', orderDate: '2024-01-09', plannedDate: '2024-01-11', actualDate: '2024-01-10' },
      { poNumber: 'PO-2024-014', orderDate: '2024-02-05', plannedDate: '2024-02-07', actualDate: '2024-02-07' },
      { poNumber: 'PO-2024-024', orderDate: '2024-03-04', plannedDate: '2024-03-06', actualDate: '2024-03-06' },
      { poNumber: 'PO-2024-034', orderDate: '2024-04-02', plannedDate: '2024-04-04', actualDate: '2024-04-04' },
      { poNumber: 'PO-2024-044', orderDate: '2024-05-07', plannedDate: '2024-05-09', actualDate: '2024-05-08' },
      { poNumber: 'PO-2024-054', orderDate: '2024-06-03', plannedDate: '2024-06-05', actualDate: '2024-06-05' },
      { poNumber: 'PO-2024-065', orderDate: '2024-07-01', plannedDate: '2024-07-03', actualDate: '2024-07-03' },
      { poNumber: 'PO-2024-076', orderDate: '2024-08-05', plannedDate: '2024-08-07', actualDate: '2024-08-09' },
      { poNumber: 'PO-2024-087', orderDate: '2024-09-02', plannedDate: '2024-09-04', actualDate: '2024-09-04' },
      { poNumber: 'PO-2024-098', orderDate: '2024-10-07', plannedDate: '2024-10-09', actualDate: '2024-10-09' },
      { poNumber: 'PO-2024-109', orderDate: '2024-11-04', plannedDate: '2024-11-06', actualDate: '2024-11-06' },
      { poNumber: 'PO-2024-118', orderDate: '2024-12-02', plannedDate: '2024-12-04', actualDate: '2024-12-04' },
    ],
    suppliers: [
      { name: '오피스디포코리아(주)', annualAmount: 8_000, substitutable: 'Y', note: '대형 유통 채널' },
      { name: '(주)알파문구', annualAmount: 6_500, substitutable: 'Y', note: '온라인 쇼핑몰 공급' },
      { name: '교보문고 B2B', annualAmount: 5_200, substitutable: 'Y', note: '다품목 원스톱 공급' },
      { name: '(주)모닝글로리', annualAmount: 3_800, substitutable: 'Y', note: '브랜드 제품 전문' },
      { name: '이마트 비즈', annualAmount: 2_500, substitutable: 'Y', note: '근거리 긴급 조달용' },
      { name: '11번가 기업회원', annualAmount: 1_800, substitutable: 'Y', note: '이커머스 조달' },
      { name: '(주)문화사', annualAmount: 1_200, substitutable: 'Y', note: '특수 소모품 전문' },
      { name: '지마켓 비즈', annualAmount: 900, substitutable: 'Y', note: '이커머스 조달' },
      { name: '롯데마트 B2B', annualAmount: 600, substitutable: 'Y', note: '근거리 긴급 조달용' },
      { name: '코스트코 비즈니스', annualAmount: 500, substitutable: 'Y', note: '대용량 묶음 구매' },
    ],
    spends: [
      { year: 2022, itemSpend: 0.28, totalSpend: 142 },
      { year: 2023, itemSpend: 0.29, totalSpend: 148 },
      { year: 2024, itemSpend: 0.30, totalSpend: 150 },
    ],
  },

  // ─────────────────────────────────────────────
  // 품목 D – 배터리 셀  (정답: 전략)
  // 높은 지출비중 + 높은 공급위험
  // ─────────────────────────────────────────────
  {
    id: 'd',
    label: '품목 D',
    category: '2차전지',
    description: '전기차 팩 조립에 사용되는 각형 리튬이온 배터리 셀',
    deliveries: [
      { poNumber: 'PO-2024-002', orderDate: '2024-01-03', plannedDate: '2024-02-02', actualDate: '2024-02-09' },
      { poNumber: 'PO-2024-010', orderDate: '2024-02-05', plannedDate: '2024-03-06', actualDate: '2024-03-06' },
      { poNumber: 'PO-2024-019', orderDate: '2024-03-04', plannedDate: '2024-04-03', actualDate: '2024-04-18' },
      { poNumber: 'PO-2024-029', orderDate: '2024-04-02', plannedDate: '2024-05-02', actualDate: '2024-05-02' },
      { poNumber: 'PO-2024-039', orderDate: '2024-05-01', plannedDate: '2024-05-31', actualDate: '2024-06-10' },
      { poNumber: 'PO-2024-050', orderDate: '2024-06-03', plannedDate: '2024-07-03', actualDate: '2024-07-03' },
      { poNumber: 'PO-2024-061', orderDate: '2024-07-01', plannedDate: '2024-07-31', actualDate: '2024-08-14' },
      { poNumber: 'PO-2024-072', orderDate: '2024-08-01', plannedDate: '2024-08-31', actualDate: '2024-09-01' },
      { poNumber: 'PO-2024-083', orderDate: '2024-09-02', plannedDate: '2024-10-02', actualDate: '2024-10-16' },
      { poNumber: 'PO-2024-094', orderDate: '2024-10-01', plannedDate: '2024-10-31', actualDate: '2024-10-30' },
      { poNumber: 'PO-2024-105', orderDate: '2024-11-04', plannedDate: '2024-12-04', actualDate: '2024-12-04' },
      { poNumber: 'PO-2024-116', orderDate: '2024-12-02', plannedDate: '2025-01-01', actualDate: '2025-01-15' },
    ],
    suppliers: [
      { name: 'LG에너지솔루션(주)', annualAmount: 3_500_000, substitutable: '△', note: '주력 공급사, 장기 공급 계약 체결' },
      { name: 'CATL (Contemporary Amperex)', annualAmount: 1_750_000, substitutable: '△', note: '중국 1위, 물량 일부 이원화. 규격 차이로 완전 대체 불가' },
    ],
    spends: [
      { year: 2022, itemSpend: 48.0, totalSpend: 142 },
      { year: 2023, itemSpend: 50.5, totalSpend: 148 },
      { year: 2024, itemSpend: 52.5, totalSpend: 150 },
    ],
  },

  // ─────────────────────────────────────────────
  // 품목 E – 열연 철강 코일  (정답: 레버리지)
  // 높은 지출비중 + 낮은 공급위험(다수 글로벌 공급사)
  // ─────────────────────────────────────────────
  {
    id: 'e',
    label: '품목 E',
    category: '철강/금속',
    description: '차체 프레스 공정에 투입되는 열연 고강도 철강 코일 (규격: SS400)',
    deliveries: [
      { poNumber: 'PO-2024-005', orderDate: '2024-01-08', plannedDate: '2024-01-18', actualDate: '2024-01-17' },
      { poNumber: 'PO-2024-016', orderDate: '2024-02-05', plannedDate: '2024-02-15', actualDate: '2024-02-17' },
      { poNumber: 'PO-2024-026', orderDate: '2024-03-04', plannedDate: '2024-03-14', actualDate: '2024-03-14' },
      { poNumber: 'PO-2024-036', orderDate: '2024-04-01', plannedDate: '2024-04-11', actualDate: '2024-04-10' },
      { poNumber: 'PO-2024-046', orderDate: '2024-05-06', plannedDate: '2024-05-16', actualDate: '2024-05-18' },
      { poNumber: 'PO-2024-057', orderDate: '2024-06-03', plannedDate: '2024-06-13', actualDate: '2024-06-13' },
      { poNumber: 'PO-2024-067', orderDate: '2024-07-01', plannedDate: '2024-07-11', actualDate: '2024-07-11' },
      { poNumber: 'PO-2024-078', orderDate: '2024-08-05', plannedDate: '2024-08-15', actualDate: '2024-08-17' },
      { poNumber: 'PO-2024-089', orderDate: '2024-09-02', plannedDate: '2024-09-12', actualDate: '2024-09-12' },
      { poNumber: 'PO-2024-100', orderDate: '2024-10-07', plannedDate: '2024-10-17', actualDate: '2024-10-16' },
      { poNumber: 'PO-2024-111', orderDate: '2024-11-04', plannedDate: '2024-11-14', actualDate: '2024-11-16' },
      { poNumber: 'PO-2024-121', orderDate: '2024-12-02', plannedDate: '2024-12-12', actualDate: '2024-12-12' },
    ],
    suppliers: [
      { name: 'POSCO(포스코)', annualAmount: 640_000, substitutable: 'Y', note: '국내 1위, 안정적 공급' },
      { name: '현대제철(주)', annualAmount: 380_000, substitutable: 'Y', note: '국내 2위, 이원화 공급 중' },
      { name: 'Nippon Steel', annualAmount: 210_000, substitutable: 'Y', note: '일본산, 고강도 특수재 공급' },
      { name: 'ArcelorMittal Korea', annualAmount: 130_000, substitutable: 'Y', note: '글로벌 메이저 한국법인' },
      { name: '동국제강(주)', annualAmount: 80_000, substitutable: 'Y', note: '보조 공급사' },
      { name: 'SSAB Korea', annualAmount: 60_000, substitutable: 'Y', note: '스웨덴산 고강도재 전문' },
    ],
    spends: [
      { year: 2022, itemSpend: 16.5, totalSpend: 142 },
      { year: 2023, itemSpend: 17.2, totalSpend: 148 },
      { year: 2024, itemSpend: 18.0, totalSpend: 150 },
    ],
  },

  // ─────────────────────────────────────────────
  // 품목 F – 포장재(골판지 박스)  (정답: 일반)
  // 낮은 지출비중 + 낮은 공급위험
  // ─────────────────────────────────────────────
  {
    id: 'f',
    label: '품목 F',
    category: '포장재',
    description: '완제품 출하에 사용되는 규격 골판지 박스 및 완충재',
    deliveries: [
      { poNumber: 'PO-2024-006', orderDate: '2024-01-10', plannedDate: '2024-01-13', actualDate: '2024-01-13' },
      { poNumber: 'PO-2024-017', orderDate: '2024-02-07', plannedDate: '2024-02-10', actualDate: '2024-02-10' },
      { poNumber: 'PO-2024-027', orderDate: '2024-03-06', plannedDate: '2024-03-09', actualDate: '2024-03-08' },
      { poNumber: 'PO-2024-037', orderDate: '2024-04-03', plannedDate: '2024-04-06', actualDate: '2024-04-07' },
      { poNumber: 'PO-2024-048', orderDate: '2024-05-08', plannedDate: '2024-05-11', actualDate: '2024-05-11' },
      { poNumber: 'PO-2024-058', orderDate: '2024-06-05', plannedDate: '2024-06-08', actualDate: '2024-06-08' },
      { poNumber: 'PO-2024-069', orderDate: '2024-07-03', plannedDate: '2024-07-06', actualDate: '2024-07-06' },
      { poNumber: 'PO-2024-080', orderDate: '2024-08-07', plannedDate: '2024-08-10', actualDate: '2024-08-09' },
      { poNumber: 'PO-2024-091', orderDate: '2024-09-04', plannedDate: '2024-09-07', actualDate: '2024-09-07' },
      { poNumber: 'PO-2024-102', orderDate: '2024-10-09', plannedDate: '2024-10-12', actualDate: '2024-10-12' },
      { poNumber: 'PO-2024-113', orderDate: '2024-11-06', plannedDate: '2024-11-09', actualDate: '2024-11-11' },
      { poNumber: 'PO-2024-122', orderDate: '2024-12-04', plannedDate: '2024-12-07', actualDate: '2024-12-07' },
    ],
    suppliers: [
      { name: '(주)대한포장', annualAmount: 30_000, substitutable: 'Y', note: '주력 공급사' },
      { name: '고려제지(주)', annualAmount: 22_000, substitutable: 'Y', note: '대형 제지 계열 포장재' },
      { name: '신대한제지(주)', annualAmount: 18_000, substitutable: 'Y', note: '중견 업체' },
      { name: '한국팩(주)', annualAmount: 15_000, substitutable: 'Y', note: '맞춤 인쇄 포장재 특화' },
      { name: '(주)우진패키지', annualAmount: 9_500, substitutable: 'Y', note: '친환경 포장재 전문' },
      { name: '세한포장(주)', annualAmount: 6_000, substitutable: 'Y', note: '소량 긴급 조달용' },
      { name: '(주)동양포장', annualAmount: 4_200, substitutable: 'Y', note: '보조 공급사' },
      { name: '진양산업(주)', annualAmount: 2_300, substitutable: 'Y', note: '완충재 전문' },
    ],
    spends: [
      { year: 2022, itemSpend: 1.1, totalSpend: 142 },
      { year: 2023, itemSpend: 1.15, totalSpend: 148 },
      { year: 2024, itemSpend: 1.2, totalSpend: 150 },
    ],
  },

  // ─────────────────────────────────────────────
  // 품목 G – 희토류 마그넷  (정답: 병목)
  // 낮은 지출비중 + 높은 공급위험(지역 집중, 긴 리드타임)
  // ─────────────────────────────────────────────
  {
    id: 'g',
    label: '품목 G',
    category: '희소금속/자성재료',
    description: '모터 및 액추에이터에 사용되는 네오디뮴(Nd-Fe-B) 소결 마그넷',
    deliveries: [
      { poNumber: 'PO-2024-008', orderDate: '2024-01-05', plannedDate: '2024-03-05', actualDate: '2024-04-02' },
      { poNumber: 'PO-2024-018', orderDate: '2024-02-02', plannedDate: '2024-04-02', actualDate: '2024-04-01' },
      { poNumber: 'PO-2024-028', orderDate: '2024-03-04', plannedDate: '2024-05-02', actualDate: '2024-06-10' },
      { poNumber: 'PO-2024-038', orderDate: '2024-04-01', plannedDate: '2024-05-31', actualDate: '2024-05-30' },
      { poNumber: 'PO-2024-049', orderDate: '2024-05-03', plannedDate: '2024-07-01', actualDate: '2024-08-15' },
      { poNumber: 'PO-2024-060', orderDate: '2024-06-03', plannedDate: '2024-08-01', actualDate: '2024-07-31' },
      { poNumber: 'PO-2024-070', orderDate: '2024-07-02', plannedDate: '2024-08-30', actualDate: '2024-10-08' },
      { poNumber: 'PO-2024-081', orderDate: '2024-07-30', plannedDate: '2024-09-27', actualDate: '2024-09-26' },
      { poNumber: 'PO-2024-092', orderDate: '2024-08-27', plannedDate: '2024-10-25', actualDate: '2024-12-02' },
      { poNumber: 'PO-2024-103', orderDate: '2024-09-24', plannedDate: '2024-11-22', actualDate: '2024-11-21' },
      { poNumber: 'PO-2024-114', orderDate: '2024-10-22', plannedDate: '2024-12-20', actualDate: '2024-12-19' },
      { poNumber: 'PO-2024-123', orderDate: '2024-11-12', plannedDate: '2025-01-10', actualDate: '2025-01-09' },
    ],
    suppliers: [
      { name: 'Zhong Ke San Huan (中科三環)', annualAmount: 240_000, substitutable: 'N', note: '중국 1위 희토류 마그넷, 네오디뮴 원료 직접 채굴·가공' },
      { name: 'JL MAG Rare-Earth Co.', annualAmount: 60_000, substitutable: '△', note: '중국 2위. 동일 원산지 리스크 공유, 부분 규격 불일치' },
    ],
    spends: [
      { year: 2022, itemSpend: 2.8, totalSpend: 142 },
      { year: 2023, itemSpend: 2.9, totalSpend: 148 },
      { year: 2024, itemSpend: 3.0, totalSpend: 150 },
    ],
  },

  // ─────────────────────────────────────────────
  // 품목 H – MRO 윤활유  (정답: 일반)
  // 낮은 지출비중 + 낮은 공급위험
  // ─────────────────────────────────────────────
  {
    id: 'h',
    label: '품목 H',
    category: 'MRO 소모품',
    description: '생산설비 유지보수에 사용되는 산업용 윤활유 및 그리스',
    deliveries: [
      { poNumber: 'PO-2024-009', orderDate: '2024-01-10', plannedDate: '2024-01-11', actualDate: '2024-01-11' },
      { poNumber: 'PO-2024-020', orderDate: '2024-02-07', plannedDate: '2024-02-08', actualDate: '2024-02-08' },
      { poNumber: 'PO-2024-030', orderDate: '2024-03-06', plannedDate: '2024-03-07', actualDate: '2024-03-07' },
      { poNumber: 'PO-2024-041', orderDate: '2024-04-08', plannedDate: '2024-04-09', actualDate: '2024-04-10' },
      { poNumber: 'PO-2024-052', orderDate: '2024-05-09', plannedDate: '2024-05-10', actualDate: '2024-05-10' },
      { poNumber: 'PO-2024-062', orderDate: '2024-06-06', plannedDate: '2024-06-07', actualDate: '2024-06-07' },
      { poNumber: 'PO-2024-073', orderDate: '2024-07-08', plannedDate: '2024-07-09', actualDate: '2024-07-09' },
      { poNumber: 'PO-2024-084', orderDate: '2024-08-07', plannedDate: '2024-08-08', actualDate: '2024-08-08' },
      { poNumber: 'PO-2024-095', orderDate: '2024-09-05', plannedDate: '2024-09-06', actualDate: '2024-09-06' },
      { poNumber: 'PO-2024-106', orderDate: '2024-10-10', plannedDate: '2024-10-11', actualDate: '2024-10-11' },
      { poNumber: 'PO-2024-115', orderDate: '2024-11-07', plannedDate: '2024-11-08', actualDate: '2024-11-08' },
      { poNumber: 'PO-2024-124', orderDate: '2024-12-05', plannedDate: '2024-12-06', actualDate: '2024-12-06' },
    ],
    suppliers: [
      { name: '쉘코리아(유)', annualAmount: 14_000, substitutable: 'Y', note: 'Shell 글로벌 브랜드, 국내 유통 안정' },
      { name: 'GS칼텍스(주)', annualAmount: 11_000, substitutable: 'Y', note: '국내 정유사 MRO 라인' },
      { name: 'SK루브리컨츠(주)', annualAmount: 9_000, substitutable: 'Y', note: 'SK 계열 산업용 윤활유' },
      { name: '에쓰오일(주) MRO', annualAmount: 6_500, substitutable: 'Y', note: 'S-Oil 산업용 제품' },
      { name: '(주)한국루브텍', annualAmount: 4_200, substitutable: 'Y', note: '국내 중견 윤활유 전문' },
      { name: 'Castrol Korea', annualAmount: 2_800, substitutable: 'Y', note: 'BP 계열 브랜드' },
      { name: '모빌코리아(유)', annualAmount: 2_500, substitutable: 'Y', note: 'ExxonMobil 계열' },
    ],
    spends: [
      { year: 2022, itemSpend: 0.48, totalSpend: 142 },
      { year: 2023, itemSpend: 0.49, totalSpend: 148 },
      { year: 2024, itemSpend: 0.50, totalSpend: 150 },
    ],
  },

  // ─────────────────────────────────────────────
  // 품목 I – 반도체 웨이퍼  (정답: 전략)
  // 높은 지출비중 + 높은 공급위험(사실상 독점)
  // ─────────────────────────────────────────────
  {
    id: 'i',
    label: '품목 I',
    category: '반도체 소재',
    description: 'CMOS 이미지센서 제조용 12인치 실리콘 단결정 웨이퍼 (CZ법)',
    deliveries: [
      { poNumber: 'PO-2024-011', orderDate: '2024-01-02', plannedDate: '2024-04-01', actualDate: '2024-04-28' },
      { poNumber: 'PO-2024-022', orderDate: '2024-02-01', plannedDate: '2024-04-30', actualDate: '2024-04-30' },
      { poNumber: 'PO-2024-032', orderDate: '2024-03-01', plannedDate: '2024-05-29', actualDate: '2024-06-20' },
      { poNumber: 'PO-2024-042', orderDate: '2024-04-01', plannedDate: '2024-06-28', actualDate: '2024-06-28' },
      { poNumber: 'PO-2024-053', orderDate: '2024-05-02', plannedDate: '2024-07-29', actualDate: '2024-08-22' },
      { poNumber: 'PO-2024-064', orderDate: '2024-06-03', plannedDate: '2024-08-30', actualDate: '2024-08-29' },
      { poNumber: 'PO-2024-075', orderDate: '2024-07-01', plannedDate: '2024-09-27', actualDate: '2024-10-18' },
      { poNumber: 'PO-2024-086', orderDate: '2024-08-01', plannedDate: '2024-10-28', actualDate: '2024-10-28' },
      { poNumber: 'PO-2024-097', orderDate: '2024-09-02', plannedDate: '2024-11-28', actualDate: '2024-12-20' },
      { poNumber: 'PO-2024-107', orderDate: '2024-10-01', plannedDate: '2024-12-28', actualDate: '2024-12-27' },
      { poNumber: 'PO-2024-117', orderDate: '2024-11-04', plannedDate: '2025-01-31', actualDate: '2025-02-10' },
      { poNumber: 'PO-2024-125', orderDate: '2024-12-02', plannedDate: '2025-03-02', actualDate: '2025-03-01' },
    ],
    suppliers: [
      { name: 'Shin-Etsu Chemical (信越化学)', annualAmount: 2_050_000, substitutable: 'N', note: '세계 1위, 당사 전용 규격(표면 거칠기·도판트 농도) 협의 개발품. 실질 대체 불가' },
      { name: 'Siltronic AG', annualAmount: 650_000, substitutable: '△', note: '독일 메이저. 일부 규격 공급 가능하나 양산 검증에 8~12개월 필요' },
    ],
    spends: [
      { year: 2022, itemSpend: 24.5, totalSpend: 142 },
      { year: 2023, itemSpend: 26.0, totalSpend: 148 },
      { year: 2024, itemSpend: 27.0, totalSpend: 150 },
    ],
  },

  // ─────────────────────────────────────────────
  // 품목 J – ABS 수지  (정답: 레버리지)
  // 높은 지출비중 + 낮은 공급위험(다수 공급사, 상품성 원자재)
  // ─────────────────────────────────────────────
  {
    id: 'j',
    label: '품목 J',
    category: '합성수지/플라스틱',
    description: '가전 및 자동차 내장재 사출 성형에 사용되는 ABS 합성수지 펠렛',
    deliveries: [
      { poNumber: 'PO-2024-013', orderDate: '2024-01-09', plannedDate: '2024-01-16', actualDate: '2024-01-15' },
      { poNumber: 'PO-2024-025', orderDate: '2024-02-06', plannedDate: '2024-02-13', actualDate: '2024-02-14' },
      { poNumber: 'PO-2024-033', orderDate: '2024-03-05', plannedDate: '2024-03-12', actualDate: '2024-03-12' },
      { poNumber: 'PO-2024-043', orderDate: '2024-04-02', plannedDate: '2024-04-09', actualDate: '2024-04-09' },
      { poNumber: 'PO-2024-055', orderDate: '2024-05-07', plannedDate: '2024-05-14', actualDate: '2024-05-16' },
      { poNumber: 'PO-2024-066', orderDate: '2024-06-04', plannedDate: '2024-06-11', actualDate: '2024-06-11' },
      { poNumber: 'PO-2024-077', orderDate: '2024-07-02', plannedDate: '2024-07-09', actualDate: '2024-07-09' },
      { poNumber: 'PO-2024-088', orderDate: '2024-08-06', plannedDate: '2024-08-13', actualDate: '2024-08-15' },
      { poNumber: 'PO-2024-099', orderDate: '2024-09-03', plannedDate: '2024-09-10', actualDate: '2024-09-10' },
      { poNumber: 'PO-2024-110', orderDate: '2024-10-08', plannedDate: '2024-10-15', actualDate: '2024-10-15' },
      { poNumber: 'PO-2024-119', orderDate: '2024-11-05', plannedDate: '2024-11-12', actualDate: '2024-11-14' },
      { poNumber: 'PO-2024-126', orderDate: '2024-12-03', plannedDate: '2024-12-10', actualDate: '2024-12-10' },
    ],
    suppliers: [
      { name: '(주)LG화학 ABS사업부', annualAmount: 280_000, substitutable: 'Y', note: '국내 1위, 안정 공급 중' },
      { name: '금호석유화학(주)', annualAmount: 200_000, substitutable: 'Y', note: '국내 2위 ABS 생산' },
      { name: 'INEOS Styrolution Korea', annualAmount: 140_000, substitutable: 'Y', note: '글로벌 ABS 메이저 한국법인' },
      { name: 'SABIC Korea', annualAmount: 100_000, substitutable: 'Y', note: '중동계 글로벌 석화 메이저' },
      { name: '(주)삼양화학', annualAmount: 80_000, substitutable: 'Y', note: '국내 중견 합성수지 전문' },
      { name: 'Toray Plastics Korea', annualAmount: 60_000, substitutable: 'Y', note: '일본 도레이 계열' },
      { name: '화인케미칼(주)', annualAmount: 45_000, substitutable: 'Y', note: '국내 중소 업체, 소량 보완용' },
      { name: 'Chi Mei Corporation', annualAmount: 30_000, substitutable: 'Y', note: '대만 메이저, 긴급 대체 조달용' },
    ],
    spends: [
      { year: 2022, itemSpend: 9.2, totalSpend: 142 },
      { year: 2023, itemSpend: 9.6, totalSpend: 148 },
      { year: 2024, itemSpend: 9.75, totalSpend: 150 },
    ],
  },
];

export const ITEM_MAP: Record<string, ItemData> = Object.fromEntries(
  ITEMS.map((item) => [item.id, item])
);
