import Link from 'next/link';
import KpiCalculator from '@/components/KpiCalculator';
import InventoryCalculator from '@/components/InventoryCalculator';

/* ─────────────────────────────────────────
   데이터 정의
───────────────────────────────────────── */

const KPI_GUIDE = [
  {
    id: 'lead-time', icon: '⏱️', num: '①', axis: '공급위험', axisColor: 'red',
    name: '평균 납기 리드타임',
    source: '납기 이력 테이블',
    formula: '리드타임(일) = 실제입고일 − 발주일\n평균 = Σ 리드타임 ÷ 발주 건수',
    example: '발주일: 2024-01-05 / 입고일: 2024-01-12\n→ 리드타임 = 7일\n12건 평균 = Σ(7+8+6+…) ÷ 12',
    interpretation: '짧을수록(≤5일) 공급위험 낮음. 길수록(≥30일) 공급위험 높음.',
  },
  {
    id: 'otd', icon: '✅', num: '②', axis: '공급위험', axisColor: 'red',
    name: '납기준수율',
    source: '납기 이력 테이블',
    formula: '납기준수 여부 = 실제입고일 ≤ 납기예정일 이면 ○\n납기준수율(%) = (○ 건수 ÷ 전체 건수) × 100',
    example: '12건 중 11건 준수 → 11 ÷ 12 × 100 = 91.7%',
    interpretation: '높을수록(≥95%) 공급위험 낮음. 낮을수록(<80%) 공급위험 높음.',
  },
  {
    id: 'cv', icon: '📊', num: '③', axis: '공급위험', axisColor: 'red',
    name: '리드타임 변동계수(CV)',
    source: '납기 이력 테이블',
    formula: '표준편차(σ) = √[Σ(리드타임 - 평균)² ÷ N]\nCV(%) = σ ÷ 평균 × 100',
    example: '평균 리드타임 7일, σ = 0.9일\n→ CV = 0.9 ÷ 7 × 100 = 12.9%',
    interpretation: '낮을수록(<20%) 안정적. 높을수록(≥40%) 불확실성이 큼.',
  },
  {
    id: 'supplier-count', icon: '🏭', num: '④', axis: '공급위험', axisColor: 'red',
    name: '등록 공급업체 수',
    source: '공급업체 현황 테이블',
    formula: '공급업체 현황 테이블의 행 수를 카운트',
    example: '테이블에 5개 업체 행 → 공급업체 수 = 5개',
    interpretation: '많을수록(≥5개) 공급위험 낮음. 적을수록(≤2개) 공급위험 높음.',
  },
  {
    id: 'concentration', icon: '📍', num: '⑤', axis: '공급위험', axisColor: 'red',
    name: '1위 공급업체 집중도',
    source: '공급업체 현황 테이블',
    formula: '집중도(%) = 최대 거래금액 업체 ÷ 전체 거래금액 합계 × 100',
    example: '5개 업체 합계 1,200,000만원 / 1위 480,000만원\n→ 집중도 = 480,000 ÷ 1,200,000 × 100 = 40%',
    interpretation: '낮을수록(<30%) 분산. 높을수록(≥70%) 특정 업체 의존도 위험.',
  },
  {
    id: 'substitutable', icon: '🔄', num: '⑥', axis: '공급위험', axisColor: 'red',
    name: '대체 가능 업체 수',
    source: '공급업체 현황 테이블',
    formula: "대체가능여부 컬럼에서 'Y' 값인 행 수를 카운트",
    example: "5개 업체 중 3개가 'Y' → 대체 가능 업체 수 = 3개",
    interpretation: '많을수록(≥3개) 공급위험 낮음. 0~1개면 전환 어렵고 공급위험 높음.',
  },
  {
    id: 'spend', icon: '💰', num: '⑦', axis: '수익영향', axisColor: 'emerald',
    name: '지출 비중',
    source: '구매 지출 현황 테이블',
    formula: '지출비중(%) = 품목 구매금액 ÷ 전사 총 구매금액 × 100',
    example: '품목금액 12억원 / 전사총액 150억원\n→ 지출비중 = 12 ÷ 150 × 100 = 8.0%',
    interpretation: '낮을수록(<2%) 수익영향 낮음. 높을수록(≥10%) 수익영향 높음.',
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
];

/* 품목군별 핵심 KPI 신호 */
const QUADRANT_KPI_MAP = [
  {
    id: 'bottleneck',
    name: '병목', nameEn: 'Bottleneck', icon: '⚠️',
    supplyDir: '↑ 높음', profitDir: '↓ 낮음',
    bg: 'bg-red-50', border: 'border-red-200', titleColor: 'text-red-700',
    numCls: 'bg-red-100 text-red-700',
    signals: [
      { num: '④', label: '공급업체 수 적음' },
      { num: '⑥', label: '대체 불가' },
      { num: '⑤', label: '집중도 높음' },
      { num: '①', label: '리드타임 긺' },
    ],
  },
  {
    id: 'strategic',
    name: '전략', nameEn: 'Strategic', icon: '✦',
    supplyDir: '↑ 높음', profitDir: '↑ 높음',
    bg: 'bg-violet-50', border: 'border-violet-200', titleColor: 'text-violet-700',
    numCls: 'bg-violet-100 text-violet-700',
    signals: [
      { num: '⑦', label: '지출비중 높음' },
      { num: '④', label: '공급업체 수 적음' },
      { num: '⑥', label: '대체 불가' },
      { num: '⑤', label: '집중도 높음' },
    ],
  },
  {
    id: 'noncritical',
    name: '일반', nameEn: 'Non-critical', icon: '✓',
    supplyDir: '↓ 낮음', profitDir: '↓ 낮음',
    bg: 'bg-slate-50', border: 'border-slate-200', titleColor: 'text-slate-600',
    numCls: 'bg-slate-200 text-slate-600',
    signals: [
      { num: '⑦', label: '지출비중 낮음' },
      { num: '④', label: '공급업체 많음' },
      { num: '①', label: '리드타임 짧음' },
      { num: '②', label: '납기준수율 높음' },
    ],
  },
  {
    id: 'leverage',
    name: '레버리지', nameEn: 'Leverage', icon: '▲',
    supplyDir: '↓ 낮음', profitDir: '↑ 높음',
    bg: 'bg-emerald-50', border: 'border-emerald-200', titleColor: 'text-emerald-700',
    numCls: 'bg-emerald-100 text-emerald-700',
    signals: [
      { num: '⑦', label: '지출비중 높음' },
      { num: '④', label: '공급업체 많음' },
      { num: '②', label: '납기준수율 높음' },
      { num: '③', label: 'CV 안정적' },
    ],
  },
];

/* ─────────────────────────────────────────
   Page Component
───────────────────────────────────────── */
export default function GuidePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      <div className="max-w-2xl mx-auto px-4 py-8">

        {/* ── Back nav ── */}
        <div className="mb-6">
          <Link href="/" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 transition-colors">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            홈으로
          </Link>
        </div>

        {/* ── Header ── */}
        <div className="mb-8">
          <span className="inline-block text-xs font-semibold text-slate-600 bg-slate-100 px-3 py-1 rounded-full mb-3">
            KPI 산출 가이드
          </span>
          <h1 className="text-xl font-bold text-gray-900">KPI 계산 · 분류 완전 가이드</h1>
          <p className="text-sm text-gray-500 mt-2">
            품목군별 핵심 신호 확인 → 보조 계산기로 KPI 산출 → 공식 참고 → 분류 기준 적용
          </p>
          {/* Progress steps */}
          <div className="flex items-center gap-1.5 mt-4 flex-wrap">
            {['① 핵심 신호 파악', '② KPI 계산기', '③ 공식 가이드', '④ 분류 기준표'].map((s, i) => (
              <span key={i} className="flex items-center gap-1.5">
                <span className="text-xs bg-blue-100 text-blue-700 font-semibold px-2.5 py-1 rounded-full">{s}</span>
                {i < 3 && <span className="text-gray-300 text-xs">→</span>}
              </span>
            ))}
          </div>
        </div>

        {/* ════════════════════════════════════
            SECTION 1 : 품목군별 핵심 KPI 시각화
        ════════════════════════════════════ */}
        <section className="mb-8">
          <div className="flex items-center gap-2 mb-1">
            <span className="w-6 h-6 rounded-full bg-blue-600 text-white text-xs font-bold flex items-center justify-center shrink-0">1</span>
            <h2 className="text-base font-bold text-gray-900">품목군별 핵심 KPI 신호</h2>
          </div>
          <p className="text-xs text-gray-500 ml-8 mb-4">
            각 품목군의 핵심 KPI 신호를 먼저 파악하세요.
          </p>

          {/* Axis hint row */}
          <div className="flex justify-between text-[10px] text-gray-400 px-1 mb-1.5">
            <span>← 수익영향 낮음 · · · 수익영향 높음 →</span>
          </div>

          {/* 2x2 Grid */}
          <div className="grid grid-cols-2 gap-2">
            {QUADRANT_KPI_MAP.map(q => (
              <div key={q.id} className={`${q.bg} ${q.border} border rounded-xl p-3`}>
                {/* Header */}
                <div className="flex items-center gap-1.5 mb-2.5">
                  <span>{q.icon}</span>
                  <div>
                    <p className={`text-xs font-bold leading-none ${q.titleColor}`}>{q.name}</p>
                    <p className="text-[9px] text-gray-400 mt-0.5">
                      공급 {q.supplyDir} / 수익 {q.profitDir}
                    </p>
                  </div>
                </div>
                {/* KPI badges */}
                <div className="flex flex-wrap gap-1">
                  {q.signals.map(sig => (
                    <span
                      key={sig.num}
                      className={`inline-flex items-center gap-1 text-[10px] font-semibold px-1.5 py-0.5 rounded-full border ${q.border} ${q.bg}`}
                    >
                      <span className={`text-[9px] font-black w-3.5 h-3.5 flex items-center justify-center rounded-full ${q.numCls}`}>{sig.num}</span>
                      {sig.label}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <p className="text-[10px] text-gray-400 text-center mt-2">↑ 공급위험 높음 (위 행) / ↓ 공급위험 낮음 (아래 행)</p>
        </section>

        {/* ════════════════════════════════════
            SECTION 2 : KPI 계산 보조도구
        ════════════════════════════════════ */}
        <section className="mb-8">
          <div className="flex items-center gap-2 mb-1">
            <span className="w-6 h-6 rounded-full bg-blue-600 text-white text-xs font-bold flex items-center justify-center shrink-0">2</span>
            <h2 className="text-base font-bold text-gray-900">KPI 계산 보조도구</h2>
          </div>
          <p className="text-xs text-gray-500 ml-8 mb-4">
            원천 데이터 값을 입력하면 KPI를 자동 계산합니다.
            <strong className="text-gray-700"> 납기이력 → 공급업체 → 지출비중</strong> 순서로 계산하세요.
          </p>

          {/* Data source guide */}
          <div className="grid grid-cols-3 gap-2 mb-4">
            {[
              { table: '납기 이력', icon: '📅', kpis: '①②③', color: 'bg-blue-50 border-blue-200 text-blue-700' },
              { table: '공급업체 현황', icon: '🏭', kpis: '④⑤⑥', color: 'bg-orange-50 border-orange-200 text-orange-700' },
              { table: '구매 지출', icon: '💰', kpis: '⑦', color: 'bg-emerald-50 border-emerald-200 text-emerald-700' },
            ].map(src => (
              <div key={src.table} className={`border rounded-lg p-2.5 text-center ${src.color}`}>
                <div className="text-xl mb-1">{src.icon}</div>
                <p className="text-[10px] font-bold leading-tight">{src.table}</p>
                <p className="text-[10px] mt-1 opacity-75">KPI {src.kpis}</p>
              </div>
            ))}
          </div>

          <KpiCalculator />
        </section>

        {/* ════════════════════════════════════
            SECTION 3 : KPI 공식 가이드 (accordion)
        ════════════════════════════════════ */}
        <section className="mb-8">
          <div className="flex items-center gap-2 mb-1">
            <span className="w-6 h-6 rounded-full bg-blue-600 text-white text-xs font-bold flex items-center justify-center shrink-0">3</span>
            <h2 className="text-base font-bold text-gray-900">KPI 공식 상세 가이드</h2>
          </div>
          <p className="text-xs text-gray-500 ml-8 mb-4">각 항목을 클릭하면 공식과 예시를 확인할 수 있습니다.</p>

          {/* Supply Risk KPIs */}
          <div className="mb-3">
            <div className="flex items-center gap-2 mb-2">
              <span className="w-2 h-2 rounded-full bg-red-400" />
              <span className="text-xs font-bold text-red-600">공급위험(Supply Risk) 축 — KPI ①~⑥</span>
            </div>
            <div className="space-y-1.5">
              {KPI_GUIDE.filter(k => k.axisColor === 'red').map(kpi => (
                <details key={kpi.id} className="group bg-white rounded-xl border border-gray-200 overflow-hidden">
                  <summary className="flex items-center justify-between px-4 py-3 cursor-pointer list-none hover:bg-red-50/50 transition-colors">
                    <div className="flex items-center gap-2">
                      <span className="text-base leading-none">{kpi.icon}</span>
                      <span className="text-[10px] font-black w-5 h-5 flex items-center justify-center rounded-full bg-red-100 text-red-700">{kpi.num}</span>
                      <span className="text-sm font-bold text-gray-800">{kpi.name}</span>
                    </div>
                    <span className="text-gray-300 group-open:rotate-90 transition-transform text-base">›</span>
                  </summary>
                  <div className="px-4 pb-4 space-y-3 border-t border-red-100">
                    <div className="pt-3">
                      <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1">원천 데이터</p>
                      <p className="text-xs text-gray-600">{kpi.source}</p>
                    </div>
                    <div>
                      <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1">계산 공식</p>
                      <pre className="text-xs text-gray-700 bg-gray-50 rounded-lg p-3 whitespace-pre-wrap font-mono leading-relaxed">{kpi.formula}</pre>
                    </div>
                    <div>
                      <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1">예시</p>
                      <pre className="text-xs text-blue-700 bg-blue-50 rounded-lg p-3 whitespace-pre-wrap font-mono leading-relaxed">{kpi.example}</pre>
                    </div>
                    <div>
                      <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1">해석 기준</p>
                      <p className="text-xs text-gray-600 leading-relaxed">{kpi.interpretation}</p>
                    </div>
                  </div>
                </details>
              ))}
            </div>
          </div>

          {/* Profit Impact KPIs */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <span className="text-xs font-bold text-emerald-600">수익영향(Profit Impact) 축 — KPI ⑦</span>
            </div>
            <div className="space-y-1.5">
              {KPI_GUIDE.filter(k => k.axisColor === 'emerald').map(kpi => (
                <details key={kpi.id} className="group bg-white rounded-xl border border-gray-200 overflow-hidden">
                  <summary className="flex items-center justify-between px-4 py-3 cursor-pointer list-none hover:bg-emerald-50/50 transition-colors">
                    <div className="flex items-center gap-2">
                      <span className="text-base leading-none">{kpi.icon}</span>
                      <span className="text-[10px] font-black w-5 h-5 flex items-center justify-center rounded-full bg-emerald-100 text-emerald-700">{kpi.num}</span>
                      <span className="text-sm font-bold text-gray-800">{kpi.name}</span>
                    </div>
                    <span className="text-gray-300 group-open:rotate-90 transition-transform text-base">›</span>
                  </summary>
                  <div className="px-4 pb-4 space-y-3 border-t border-emerald-100">
                    <div className="pt-3">
                      <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1">원천 데이터</p>
                      <p className="text-xs text-gray-600">{kpi.source}</p>
                    </div>
                    <div>
                      <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1">계산 공식</p>
                      <pre className="text-xs text-gray-700 bg-gray-50 rounded-lg p-3 whitespace-pre-wrap font-mono leading-relaxed">{kpi.formula}</pre>
                    </div>
                    <div>
                      <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1">예시</p>
                      <pre className="text-xs text-blue-700 bg-blue-50 rounded-lg p-3 whitespace-pre-wrap font-mono leading-relaxed">{kpi.example}</pre>
                    </div>
                    <div>
                      <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1">해석 기준</p>
                      <p className="text-xs text-gray-600 leading-relaxed">{kpi.interpretation}</p>
                    </div>
                  </div>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* ════════════════════════════════════
            SECTION 4 : 분류 판단 기준표
        ════════════════════════════════════ */}
        <section className="mb-8">
          <div className="flex items-center gap-2 mb-1">
            <span className="w-6 h-6 rounded-full bg-blue-600 text-white text-xs font-bold flex items-center justify-center shrink-0">4</span>
            <h2 className="text-base font-bold text-gray-900">품목군 분류 판단 기준표</h2>
          </div>
          <p className="text-xs text-gray-500 ml-8 mb-4">
            계산한 KPI 값이 아래 범위에 해당하면 해당 품목군 가능성이 높습니다.
          </p>

          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="px-3 py-2.5 text-left font-semibold text-gray-500 bg-gray-50 min-w-[90px]">KPI 인자</th>
                    <th className="px-3 py-2.5 text-center font-semibold text-slate-600 bg-slate-50">일반<br/><span className="font-normal text-[10px]">Non-critical</span></th>
                    <th className="px-3 py-2.5 text-center font-semibold text-emerald-600 bg-emerald-50">레버리지<br/><span className="font-normal text-[10px]">Leverage</span></th>
                    <th className="px-3 py-2.5 text-center font-semibold text-red-600 bg-red-50">병목<br/><span className="font-normal text-[10px]">Bottleneck</span></th>
                    <th className="px-3 py-2.5 text-center font-semibold text-violet-600 bg-violet-50">전략<br/><span className="font-normal text-[10px]">Strategic</span></th>
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
                <strong>판단 우선순위:</strong> 모든 인자가 동일한 품목군을 가리키지 않을 수 있습니다.
                상충 신호가 있을 때는 <strong>⑦ 지출비중(수익영향)</strong>과
                <strong> ④ 공급업체 수(공급위험)</strong>을 가장 중요한 인자로 우선 판단하세요.
              </p>
            </div>
          </div>
        </section>

        {/* ════════════════════════════════════
            SECTION 5 : 심화 도구 — 재고 계산기
        ════════════════════════════════════ */}
        <section className="mb-8">
          <div className="flex items-center gap-2 mb-1">
            <span className="w-6 h-6 rounded-full bg-gray-400 text-white text-xs font-bold flex items-center justify-center shrink-0">+</span>
            <h2 className="text-base font-bold text-gray-900">심화 보조도구 — 재고 계산기</h2>
          </div>
          <p className="text-xs text-gray-500 ml-8 mb-4">
            품목군 분류 후 재고 전략 수립 시 활용. EOQ · 안전재고 · 재주문점 계산기입니다.
          </p>
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-100 bg-gray-50 flex items-center gap-2">
              <span className="text-base">📦</span>
              <div>
                <p className="text-sm font-bold text-gray-800">재고 계산기</p>
                <p className="text-xs text-gray-500">EOQ · 안전재고 · 재주문점</p>
              </div>
            </div>
            <div className="p-4">
              <InventoryCalculator />
            </div>
          </div>
        </section>

        {/* ── CTA ── */}
        <div className="grid grid-cols-2 gap-3">
          <Link
            href="/items"
            className="block text-center py-3.5 rounded-xl bg-emerald-600 text-white text-sm font-bold hover:bg-emerald-700 transition-colors shadow-sm"
          >
            📊 품목 데이터 →
          </Link>
          <Link
            href="/survey"
            className="block text-center py-3.5 rounded-xl bg-slate-800 text-white text-sm font-bold hover:bg-slate-700 transition-colors shadow-sm"
          >
            📝 분류 제출 →
          </Link>
        </div>

      </div>
    </div>
  );
}
