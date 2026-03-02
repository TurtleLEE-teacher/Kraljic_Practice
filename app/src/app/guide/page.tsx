import Link from 'next/link';
import InventoryCalculator from '@/components/InventoryCalculator';

const KPI_GUIDE = [
  {
    id: 'lead-time',
    name: '평균 납기 리드타임',
    axis: '공급위험',
    axisColor: 'red',
    source: '납기 이력 테이블',
    formula: '리드타임(일) = 실제입고일 − 발주일\n평균 = Σ 리드타임 ÷ 발주 건수',
    example: '발주일: 2024-01-05 / 입고일: 2024-01-12\n→ 리드타임 = 7일\n12건 평균 = Σ(7+8+6+…) ÷ 12',
    interpretation: '짧을수록(≤5일) 공급위험 낮음. 길수록(≥30일) 공급위험 높음.',
  },
  {
    id: 'otd',
    name: '납기준수율',
    axis: '공급위험',
    axisColor: 'red',
    source: '납기 이력 테이블',
    formula: '납기준수 여부 = 실제입고일 ≤ 납기예정일 이면 ○\n납기준수율(%) = (○ 건수 ÷ 전체 건수) × 100',
    example: '12건 중 11건 준수 → 11 ÷ 12 × 100 = 91.7%',
    interpretation: '높을수록(≥95%) 공급위험 낮음. 낮을수록(<80%) 공급위험 높음.',
  },
  {
    id: 'cv',
    name: '리드타임 변동계수(CV)',
    axis: '공급위험',
    axisColor: 'red',
    source: '납기 이력 테이블',
    formula: '표준편차(σ) = √[Σ(리드타임 - 평균)² ÷ N]\nCV(%) = σ ÷ 평균 × 100',
    example: '평균 리드타임 7일, σ = 0.9일\n→ CV = 0.9 ÷ 7 × 100 = 12.9%',
    interpretation: '낮을수록(<20%) 안정적. 높을수록(≥40%) 불확실성이 큼.',
  },
  {
    id: 'supplier-count',
    name: '등록 공급업체 수',
    axis: '공급위험',
    axisColor: 'red',
    source: '공급업체 현황 테이블',
    formula: '공급업체 현황 테이블의 행 수를 카운트',
    example: '테이블에 5개 업체 행 → 공급업체 수 = 5개',
    interpretation: '많을수록(≥5개) 공급위험 낮음. 적을수록(≤2개) 공급위험 높음.',
  },
  {
    id: 'concentration',
    name: '1위 공급업체 집중도',
    axis: '공급위험',
    axisColor: 'red',
    source: '공급업체 현황 테이블',
    formula: '집중도(%) = 최대 거래금액 업체 ÷ 전체 거래금액 합계 × 100',
    example: '5개 업체 합계 1,200,000만원 / 1위 480,000만원\n→ 집중도 = 480,000 ÷ 1,200,000 × 100 = 40%',
    interpretation: '낮을수록(<30%) 분산. 높을수록(≥70%) 특정 업체 의존도 위험.',
  },
  {
    id: 'substitutable',
    name: '대체 가능 업체 수',
    axis: '공급위험',
    axisColor: 'red',
    source: '공급업체 현황 테이블',
    formula: "대체가능여부 컬럼에서 'Y' 값인 행 수를 카운트",
    example: "5개 업체 중 3개가 'Y' → 대체 가능 업체 수 = 3개",
    interpretation: '많을수록(≥3개) 공급위험 낮음. 0~1개면 전환 어렵고 공급위험 높음.',
  },
  {
    id: 'spend',
    name: '지출 비중',
    axis: '수익영향',
    axisColor: 'emerald',
    source: '구매 지출 현황 테이블',
    formula: '지출비중(%) = 품목 구매금액 ÷ 전사 총 구매금액 × 100',
    example: '품목금액 12억원 / 전사총액 150억원\n→ 지출비중 = 12 ÷ 150 × 100 = 8.0%',
    interpretation: '낮을수록(<2%) 수익영향 낮음. 높을수록(≥10%) 수익영향 높음.',
  },
];

const CLASSIFICATION_TABLE = [
  {
    factor: '지출 비중',
    noncritical: '< 2%',
    leverage: '≥ 5%',
    bottleneck: '< 5%',
    strategic: '≥ 10%',
  },
  {
    factor: '공급업체 수',
    noncritical: '≥ 5개',
    leverage: '≥ 4개',
    bottleneck: '≤ 2개',
    strategic: '≤ 3개',
  },
  {
    factor: '1위 집중도',
    noncritical: '< 30%',
    leverage: '< 40%',
    bottleneck: '≥ 70%',
    strategic: '≥ 60%',
  },
  {
    factor: '대체 가능 업체',
    noncritical: '≥ 3개',
    leverage: '≥ 3개',
    bottleneck: '0 ~ 1개',
    strategic: '0 ~ 1개',
  },
  {
    factor: '평균 리드타임',
    noncritical: '≤ 5일',
    leverage: '≤ 15일',
    bottleneck: '≥ 30일',
    strategic: '≥ 20일',
  },
  {
    factor: '납기준수율',
    noncritical: '≥ 95%',
    leverage: '≥ 90%',
    bottleneck: '< 80%',
    strategic: '중간 / 변동 큼',
  },
  {
    factor: '리드타임 CV',
    noncritical: '< 20%',
    leverage: '< 25%',
    bottleneck: '≥ 40%',
    strategic: '≥ 30%',
  },
];

export default function GuidePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      <div className="max-w-2xl mx-auto px-4 py-8">

        {/* Back nav */}
        <div className="mb-6">
          <Link href="/" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 transition-colors">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            홈으로
          </Link>
        </div>

        {/* Header */}
        <div className="mb-8">
          <span className="inline-block text-xs font-semibold text-slate-600 bg-slate-100 px-3 py-1 rounded-full mb-3">
            KPI 산출 가이드
          </span>
          <h1 className="text-xl font-bold text-gray-900">8개 정량 인자 계산 방법</h1>
          <p className="text-sm text-gray-500 mt-2">
            각 인자의 원천 데이터, 계산 공식, 해석 기준을 확인하세요.
          </p>
        </div>

        {/* KPI Cards */}
        <div className="space-y-4 mb-8">
          {KPI_GUIDE.map((kpi) => (
            <div key={kpi.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <div className={`px-4 py-2.5 flex items-center justify-between ${
                kpi.axisColor === 'red' ? 'bg-red-50 border-b border-red-100' : 'bg-emerald-50 border-b border-emerald-100'
              }`}>
                <h3 className="text-sm font-bold text-gray-800">{kpi.name}</h3>
                <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                  kpi.axisColor === 'red' ? 'bg-red-100 text-red-700' : 'bg-emerald-100 text-emerald-700'
                }`}>
                  {kpi.axis} 축
                </span>
              </div>
              <div className="p-4 space-y-3">
                <div>
                  <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1">원천 데이터</p>
                  <p className="text-xs text-gray-600">{kpi.source}</p>
                </div>
                <div>
                  <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1">계산 공식</p>
                  <pre className="text-xs text-gray-700 bg-gray-50 rounded-lg p-3 whitespace-pre-wrap font-mono leading-relaxed">
                    {kpi.formula}
                  </pre>
                </div>
                <div>
                  <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1">예시</p>
                  <pre className="text-xs text-blue-700 bg-blue-50 rounded-lg p-3 whitespace-pre-wrap font-mono leading-relaxed">
                    {kpi.example}
                  </pre>
                </div>
                <div>
                  <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1">해석 기준</p>
                  <p className="text-xs text-gray-600 leading-relaxed">{kpi.interpretation}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Classification Table */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden mb-8">
          <div className="px-4 py-3 border-b border-gray-100 bg-gray-50">
            <h2 className="text-sm font-bold text-gray-800">품목군 분류 판단 기준표</h2>
            <p className="text-xs text-gray-500 mt-0.5">KPI 값이 아래 범위에 해당하면 해당 품목군일 가능성이 높습니다.</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="px-3 py-2.5 text-left font-semibold text-gray-500 bg-gray-50">KPI 인자</th>
                  <th className="px-3 py-2.5 text-center font-semibold text-slate-600 bg-slate-50">일반</th>
                  <th className="px-3 py-2.5 text-center font-semibold text-emerald-600 bg-emerald-50">레버리지</th>
                  <th className="px-3 py-2.5 text-center font-semibold text-red-600 bg-red-50">병목</th>
                  <th className="px-3 py-2.5 text-center font-semibold text-violet-600 bg-violet-50">전략</th>
                </tr>
              </thead>
              <tbody>
                {CLASSIFICATION_TABLE.map((row, i) => (
                  <tr key={row.factor} className={`border-b border-gray-50 ${i % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}`}>
                    <td className="px-3 py-2 font-semibold text-gray-700">{row.factor}</td>
                    <td className="px-3 py-2 text-center text-slate-600 font-mono">{row.noncritical}</td>
                    <td className="px-3 py-2 text-center text-emerald-600 font-mono">{row.leverage}</td>
                    <td className="px-3 py-2 text-center text-red-600 font-mono">{row.bottleneck}</td>
                    <td className="px-3 py-2 text-center text-violet-600 font-mono">{row.strategic}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="px-4 py-3 bg-amber-50 border-t border-amber-100">
            <p className="text-[11px] text-amber-700 leading-relaxed">
              <strong>주의:</strong> 모든 인자가 동일한 품목군을 가리키지 않을 수 있습니다.
              상충되는 신호가 있을 때는 <strong>지출비중(수익영향)</strong>과 <strong>공급업체 수/집중도(공급위험)</strong>를 가장 중요한 인자로 우선 판단하세요.
            </p>
          </div>
        </div>

        {/* Inventory Calculator */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden mb-6">
          <div className="px-4 py-3 border-b border-gray-100 bg-gray-50">
            <h2 className="text-sm font-bold text-gray-800">보조 도구 — 재고 계산기</h2>
            <p className="text-xs text-gray-500 mt-0.5">EOQ · 안전재고 · 재주문점 계산</p>
          </div>
          <div className="p-4">
            <InventoryCalculator />
          </div>
        </div>

        {/* CTA */}
        <Link
          href="/items"
          className="block w-full text-center py-3 rounded-xl bg-emerald-600 text-white text-sm font-bold hover:bg-emerald-700 transition-colors"
        >
          품목 데이터 분석 시작 →
        </Link>

      </div>
    </div>
  );
}
