import Link from 'next/link';
import KpiCalculator from '@/components/KpiCalculator';

/* ─────────────────────────────────────────
   데이터 정의
───────────────────────────────────────── */

const KPI_GUIDE = [
  {
    id: 'lead-time', num: '①', axis: '공급위험', axisColor: 'red',
    name: '평균 납기 리드타임',
    source: '납기 이력 테이블',
    formula: '리드타임(일) = 실제입고일 − 발주일\n평균 = Σ 리드타임 ÷ 발주 건수',
    example: '발주일: 2024-01-05 / 입고일: 2024-01-12\n→ 리드타임 = 7일\n12건 평균 = Σ(7+8+6+…) ÷ 12',
    interpretation: '짧을수록(≤5일) 공급위험 낮음. 길수록(≥30일) 공급위험 높음.',
  },
  {
    id: 'otd', num: '②', axis: '공급위험', axisColor: 'red',
    name: '납기준수율',
    source: '납기 이력 테이블',
    formula: '납기준수 여부 = 실제입고일 ≤ 납기예정일 이면 ○\n납기준수율(%) = (○ 건수 ÷ 전체 건수) × 100',
    example: '12건 중 11건 준수 → 11 ÷ 12 × 100 = 91.7%',
    interpretation: '높을수록(≥95%) 공급위험 낮음. 낮을수록(<80%) 공급위험 높음.',
  },
  {
    id: 'cv', num: '③', axis: '공급위험', axisColor: 'red',
    name: '리드타임 변동계수(CV)',
    source: '납기 이력 테이블',
    formula: '표준편차(σ) = √[Σ(리드타임 - 평균)² ÷ N]\nCV(%) = σ ÷ 평균 × 100',
    example: '평균 리드타임 7일, σ = 0.9일\n→ CV = 0.9 ÷ 7 × 100 = 12.9%',
    interpretation: '낮을수록(<20%) 안정적. 높을수록(≥40%) 불확실성이 큼.',
  },
  {
    id: 'supplier-count', num: '④', axis: '공급위험', axisColor: 'red',
    name: '등록 공급업체 수',
    source: '공급업체 현황 테이블',
    formula: '공급업체 현황 테이블의 행 수를 카운트',
    example: '테이블에 5개 업체 행 → 공급업체 수 = 5개',
    interpretation: '많을수록(≥5개) 공급위험 낮음. 적을수록(≤2개) 공급위험 높음.',
  },
  {
    id: 'concentration', num: '⑤', axis: '공급위험', axisColor: 'red',
    name: '1위 공급업체 집중도',
    source: '공급업체 현황 테이블',
    formula: '집중도(%) = 최대 거래금액 업체 ÷ 전체 거래금액 합계 × 100',
    example: '5개 업체 합계 1,200,000만원 / 1위 480,000만원\n→ 집중도 = 480,000 ÷ 1,200,000 × 100 = 40%',
    interpretation: '낮을수록(<30%) 분산. 높을수록(≥70%) 특정 업체 의존도 위험.',
  },
  {
    id: 'substitutable', num: '⑥', axis: '공급위험', axisColor: 'red',
    name: '대체 가능 업체 수',
    source: '공급업체 현황 테이블',
    formula: "대체가능여부 컬럼에서 'Y' 값인 행 수를 카운트",
    example: "5개 업체 중 3개가 'Y' → 대체 가능 업체 수 = 3개",
    interpretation: '많을수록(≥3개) 공급위험 낮음. 0~1개면 전환 어렵고 공급위험 높음.',
  },
  {
    id: 'spend', num: '⑦', axis: '수익영향', axisColor: 'emerald',
    name: '지출 비중',
    source: '구매 지출 현황 테이블',
    formula: '지출비중(%) = 품목 구매금액 ÷ 전사 총 구매금액 × 100',
    example: '품목금액 12억원 / 전사총액 150억원\n→ 지출비중 = 12 ÷ 150 × 100 = 8.0%',
    interpretation: '낮을수록(<2%) 수익영향 낮음. 높을수록(≥10%) 수익영향 높음.',
  },
  {
    id: 'yoy', num: '⑧', axis: '수익영향', axisColor: 'emerald',
    name: '연간 지출 증가율 (YoY)',
    source: '구매 지출 현황 테이블 (최근 2개년)',
    formula: '증가율(%) = (금년 지출 − 전년 지출) ÷ 전년 지출 × 100',
    example: '2023년 11.4억 → 2024년 12.0억\n→ (12.0−11.4) ÷ 11.4 × 100 = 5.3%',
    interpretation: '낮을수록(<3%) 안정적. 높을수록(≥10%) 전략적 중요도 증가 가능.',
  },
  {
    id: 'volatility', num: '⑨', axis: '수익영향', axisColor: 'emerald',
    name: '가격 변동성',
    source: '구매 지출 현황 테이블 (3개년 지출비중)',
    formula: '3개년 지출비중의 CV(%) = σ(지출비중) ÷ 평균(지출비중) × 100',
    example: '3개년 지출비중: 7.6%, 7.7%, 8.0%\nσ = 0.17, 평균 = 7.77\n→ CV = 0.17 ÷ 7.77 × 100 = 2.2%',
    interpretation: '낮을수록(<10%) 가격 안정. 높을수록(≥25%) 가격 리스크가 수익에 큰 영향.',
  },
  {
    id: 'opimpact', num: '⑩', axis: '수익영향', axisColor: 'emerald',
    name: '운영 영향도',
    source: '품목 상세 페이지 (정성 평가)',
    formula: '1~5 점수 (1=영향 미미, 5=생산라인 전면 정지)',
    example: '배터리 셀: 공급 중단 시 전체 조립라인 정지 → 5점\n사무용품: 업무 불편 수준 → 1점',
    interpretation: '≤2점 = 수익영향 낮음. 3점 = 중간. ≥4점 = 수익영향 높음.',
  },
];

const CLASSIFICATION_TABLE = [
  { factor: '지출 비중',      noncritical: '< 2%',         leverage: '≥ 5%',    bottleneck: '< 5%',   strategic: '≥ 10%'       },
  { factor: '공급업체 수',    noncritical: '≥ 5개',        leverage: '≥ 4개',   bottleneck: '≤ 2개',  strategic: '≤ 3개'       },
  { factor: '1위 집중도',     noncritical: '< 30%',        leverage: '< 40%',   bottleneck: '≥ 70%',  strategic: '≥ 60%'       },
  { factor: '대체 가능 업체', noncritical: '≥ 3개',        leverage: '≥ 3개',   bottleneck: '0 ~ 1개', strategic: '0 ~ 1개'    },
  { factor: '평균 리드타임',  noncritical: '≤ 5일',        leverage: '≤ 15일',  bottleneck: '≥ 30일', strategic: '≥ 20일'      },
  { factor: '납기준수율',     noncritical: '≥ 95%',        leverage: '≥ 90%',   bottleneck: '< 80%',  strategic: '중간/변동 큼' },
  { factor: '리드타임 CV',    noncritical: '< 20%',        leverage: '< 25%',   bottleneck: '≥ 40%',  strategic: '≥ 30%'       },
  { factor: '지출 증가율(YoY)', noncritical: '< 3%',       leverage: '≥ 5%',    bottleneck: '< 5%',  strategic: '≥ 10%'       },
  { factor: '가격 변동성',   noncritical: '< 10%',        leverage: '< 15%',   bottleneck: '변동 큼', strategic: '≥ 25%'       },
  { factor: '운영 영향도',   noncritical: '≤ 2점',        leverage: '3 ~ 4점', bottleneck: '3 ~ 4점', strategic: '≥ 4점'      },
];

/* ─────────────────────────────────────────
   Page Component
───────────────────────────────────────── */
export default function GuidePage() {
  return (
    <div className="min-h-screen bg-slate-50">

      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center gap-3">
          <Link href="/" className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors">
            <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <span className="text-sm font-bold text-gray-900 flex-1">KPI 가이드 & 계산기</span>
          <Link href="/items" className="text-xs text-gray-500 hover:text-gray-800 font-semibold whitespace-nowrap">
            품목 데이터
          </Link>
          <span className="text-gray-200">|</span>
          <Link href="/survey" className="text-xs text-emerald-600 hover:text-emerald-800 font-bold whitespace-nowrap">
            제출
          </Link>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-8">

        {/* ═══ SECTION 1: 분류 판단 기준표 (가장 중요 → 최상단) ═══ */}
        <section>
          <h2 className="text-base font-bold text-gray-900 mb-1">분류 판단 기준표</h2>
          <p className="text-sm text-gray-500 mb-4">
            KPI 값이 아래 범위에 해당하면 해당 품목군 가능성이 높습니다.
          </p>

          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="px-3 py-2.5 text-left font-semibold text-gray-500 bg-gray-50 whitespace-nowrap">KPI 인자</th>
                    <th className="px-3 py-2.5 text-center font-semibold text-slate-600 bg-slate-50 whitespace-nowrap">일반</th>
                    <th className="px-3 py-2.5 text-center font-semibold text-emerald-600 bg-emerald-50 whitespace-nowrap">레버리지</th>
                    <th className="px-3 py-2.5 text-center font-semibold text-red-600 bg-red-50 whitespace-nowrap">병목</th>
                    <th className="px-3 py-2.5 text-center font-semibold text-violet-600 bg-violet-50 whitespace-nowrap">전략</th>
                  </tr>
                </thead>
                <tbody>
                  {CLASSIFICATION_TABLE.map((row, i) => (
                    <tr key={row.factor} className={`border-b border-gray-50 ${i % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}`}>
                      <td className="px-3 py-2 font-semibold text-gray-700 whitespace-nowrap">{row.factor}</td>
                      <td className="px-3 py-2 text-center text-slate-600 font-mono whitespace-nowrap">{row.noncritical}</td>
                      <td className="px-3 py-2 text-center text-emerald-600 font-mono whitespace-nowrap">{row.leverage}</td>
                      <td className="px-3 py-2 text-center text-red-600 font-mono whitespace-nowrap">{row.bottleneck}</td>
                      <td className="px-3 py-2 text-center text-violet-600 font-mono whitespace-nowrap">{row.strategic}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="px-4 py-3 bg-amber-50 border-t border-amber-100">
              <p className="text-xs text-amber-700 leading-relaxed">
                <strong>판단 팁:</strong> 상충 신호가 있을 때는 <strong>지출비중</strong>(수익영향)과
                <strong> 공급업체 수</strong>(공급위험)을 우선 판단하세요.
              </p>
            </div>
          </div>
        </section>

        {/* ═══ SECTION 2: KPI 계산 보조도구 ═══ */}
        <section>
          <h2 className="text-base font-bold text-gray-900 mb-1">KPI 계산 보조도구</h2>
          <p className="text-sm text-gray-500 mb-4">
            원천 데이터 값을 입력하면 KPI를 자동 계산합니다.
          </p>
          <KpiCalculator />
        </section>

        {/* ═══ SECTION 3: KPI 공식 참고 (접힘) ═══ */}
        <section>
          <h2 className="text-base font-bold text-gray-900 mb-4">KPI 공식 참고</h2>

          <div className="space-y-2">
            {KPI_GUIDE.map(kpi => {
              const isRed = kpi.axisColor === 'red';
              return (
                <details key={kpi.id} className="group bg-white rounded-xl border border-gray-200 overflow-hidden">
                  <summary className="flex items-center justify-between px-4 py-3 cursor-pointer list-none hover:bg-gray-50 transition-colors">
                    <div className="flex items-center gap-2">
                      <span className={`text-xs font-black w-5 h-5 flex items-center justify-center rounded-full ${
                        isRed ? 'bg-red-100 text-red-700' : 'bg-emerald-100 text-emerald-700'
                      }`}>{kpi.num}</span>
                      <span className="text-sm font-semibold text-gray-800">{kpi.name}</span>
                      <span className={`text-xs ${isRed ? 'text-red-400' : 'text-emerald-400'}`}>{kpi.axis}</span>
                    </div>
                    <span className="text-gray-300 group-open:rotate-90 transition-transform">›</span>
                  </summary>
                  <div className="px-4 pb-4 space-y-3 border-t border-gray-100">
                    <div className="pt-3">
                      <p className="text-xs font-semibold text-gray-400 mb-1">원천 데이터</p>
                      <p className="text-sm text-gray-600">{kpi.source}</p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-gray-400 mb-1">계산 공식</p>
                      <pre className="text-sm text-gray-700 bg-gray-50 rounded-lg p-3 whitespace-pre-wrap font-mono leading-relaxed">{kpi.formula}</pre>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-gray-400 mb-1">예시</p>
                      <pre className="text-sm text-blue-700 bg-blue-50 rounded-lg p-3 whitespace-pre-wrap font-mono leading-relaxed">{kpi.example}</pre>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-gray-400 mb-1">해석</p>
                      <p className="text-sm text-gray-600 leading-relaxed">{kpi.interpretation}</p>
                    </div>
                  </div>
                </details>
              );
            })}
          </div>
        </section>

        {/* CTA */}
        <div className="grid grid-cols-2 gap-3 pt-2">
          <Link
            href="/items"
            className="block text-center py-3.5 rounded-xl bg-slate-800 text-white text-sm font-bold hover:bg-slate-700 transition-colors"
          >
            품목 데이터 →
          </Link>
          <Link
            href="/survey"
            className="block text-center py-3.5 rounded-xl bg-emerald-600 text-white text-sm font-bold hover:bg-emerald-700 transition-colors"
          >
            분류 제출 →
          </Link>
        </div>

      </div>
    </div>
  );
}
