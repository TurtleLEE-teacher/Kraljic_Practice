import Link from 'next/link';
import KraljicMatrixDiagram from '@/components/KraljicMatrixDiagram';

const KPI_FACTORS = [
  {
    axis: '수익영향 (Profit Impact)',
    axisColor: 'emerald',
    icon: (
      <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    factors: [
      { name: '연간 구매금액', source: '지출 데이터', calc: '직접 읽기' },
      { name: '지출 비중(%)', source: '지출 데이터', calc: '품목금액 ÷ 전사총액 × 100' },
    ],
  },
  {
    axis: '공급위험 (Supply Risk)',
    axisColor: 'red',
    icon: (
      <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
      </svg>
    ),
    factors: [
      { name: '등록 공급업체 수', source: '공급업체 데이터', calc: '업체 행 수 카운트' },
      { name: '1위 공급업체 집중도(%)', source: '공급업체 데이터', calc: '최대 거래업체 ÷ 합계 × 100' },
      { name: '대체 가능 업체 수', source: '공급업체 데이터', calc: "'Y' 행 카운트" },
      { name: '평균 납기 리드타임(일)', source: '납기 데이터', calc: 'Σ(입고일 − 발주일) ÷ 건수' },
      { name: '납기준수율(%)', source: '납기 데이터', calc: '(입고일 ≤ 납기예정일 건수) ÷ 전체 × 100' },
      { name: '리드타임 변동계수(CV%)', source: '납기 데이터', calc: '표준편차 ÷ 평균 × 100' },
    ],
  },
];

const STEPS = [
  {
    step: 1, title: '원천 데이터 확인',
    desc: '품목별 납기이력·공급업체·지출 3종 테이블을 검토',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
    color: 'bg-blue-600',
    active: true,
  },
  {
    step: 2, title: 'KPI 직접 산출',
    desc: '8개 정량 인자를 수식에 따라 계산 (계산기·엑셀 활용)',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 11h.01M12 11h.01M15 11h.01M4 19h16a2 2 0 002-2V7a2 2 0 00-2-2H4a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
    ),
    color: 'bg-indigo-600',
    active: true,
  },
  {
    step: 3, title: '품목군 분류 판단',
    desc: '가이드 기준표로 4개 사분면 중 해당 품목군 결정',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
      </svg>
    ),
    color: 'bg-violet-600',
    active: true,
  },
  {
    step: 4, title: 'Tally 폼 제출',
    desc: '품목 A~J 결과와 판단 근거를 팀별로 제출',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    color: 'bg-gray-300',
    active: false,
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      {/* Hero Banner */}
      <div className="relative bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 overflow-hidden">
        {/* Decorative SVG pattern */}
        <svg
          className="absolute inset-0 w-full h-full opacity-10"
          viewBox="0 0 500 200"
          preserveAspectRatio="xMidYMid slice"
        >
          <line x1="0" y1="100" x2="500" y2="100" stroke="white" strokeWidth="1" />
          <line x1="250" y1="0" x2="250" y2="200" stroke="white" strokeWidth="1" />
          {/* Quadrant dots */}
          <circle cx="125" cy="50" r="30" fill="#ef4444" opacity="0.4" />
          <circle cx="375" cy="50" r="30" fill="#7c3aed" opacity="0.4" />
          <circle cx="125" cy="150" r="30" fill="#94a3b8" opacity="0.3" />
          <circle cx="375" cy="150" r="30" fill="#059669" opacity="0.4" />
          {/* Grid marks */}
          {[50,100,150,200,250,300,350,400,450].map(x => (
            <line key={x} x1={x} y1="95" x2={x} y2="105" stroke="white" strokeWidth="0.8" />
          ))}
          {[25,50,75,125,150,175].map(y => (
            <line key={y} x1="245" y1={y} x2="255" y2={y} stroke="white" strokeWidth="0.8" />
          ))}
        </svg>
        <div className="relative px-4 py-10 text-center max-w-2xl mx-auto">
          <span className="inline-block text-[11px] font-semibold tracking-widest text-blue-300 bg-blue-900/50 border border-blue-700/50 px-3 py-1 rounded-full mb-4 uppercase">
            Kraljic Matrix Practice
          </span>
          <h1 className="text-2xl font-black text-white leading-tight mb-2">
            크랄직 매트릭스
            <br />
            <span className="text-slate-400 font-semibold text-xl">품목군 분류 실습</span>
          </h1>
          <p className="text-sm text-slate-400 leading-relaxed">
            원천 데이터 → KPI 산출 → 10개 품목 분류
          </p>
          {/* Quick badge row */}
          <div className="flex justify-center gap-2 mt-5 flex-wrap">
            {[
              { label: '납기 이력', color: 'bg-blue-800 text-blue-200', icon: '📅' },
              { label: '공급업체 현황', color: 'bg-slate-700 text-slate-200', icon: '🏭' },
              { label: '구매 지출', color: 'bg-emerald-900 text-emerald-200', icon: '💰' },
              { label: '→ 8개 KPI 산출', color: 'bg-violet-900 text-violet-200', icon: '📐' },
            ].map(b => (
              <span key={b.label} className={`text-[11px] font-semibold px-3 py-1 rounded-full ${b.color}`}>
                {b.icon} {b.label}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-8">

        {/* Kraljic Matrix Diagram */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center">
              <svg className="w-4 h-4 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
            </div>
            <div>
              <h2 className="text-sm font-bold text-gray-800">크랄직 매트릭스</h2>
              <p className="text-[11px] text-gray-400">Kraljic (1983) — Harvard Business Review</p>
            </div>
          </div>
          <KraljicMatrixDiagram />
        </div>

        {/* MECE KPI Factors */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-lg bg-indigo-100 flex items-center justify-center">
              <svg className="w-4 h-4 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <div>
              <h2 className="text-sm font-bold text-gray-800">8개 정량 인자 (MECE)</h2>
              <p className="text-[11px] text-gray-400">원천 데이터 → 직접 계산 → 품목군 결정</p>
            </div>
          </div>

          <div className="space-y-4">
            {KPI_FACTORS.map((group) => (
              <div
                key={group.axis}
                className={`rounded-xl border p-4 ${
                  group.axisColor === 'emerald'
                    ? 'bg-emerald-50 border-emerald-200'
                    : 'bg-red-50 border-red-200'
                }`}
              >
                <div className="flex items-center gap-2 mb-3">
                  {group.icon}
                  <span className={`text-xs font-bold ${
                    group.axisColor === 'emerald' ? 'text-emerald-800' : 'text-red-800'
                  }`}>
                    {group.axis}
                  </span>
                </div>
                <div className="space-y-2">
                  {group.factors.map((f, fi) => (
                    <div key={f.name} className="flex items-start gap-3 bg-white/60 rounded-lg px-3 py-2">
                      <span className={`text-[10px] font-black w-4 shrink-0 mt-0.5 ${
                        group.axisColor === 'emerald' ? 'text-emerald-500' : 'text-red-400'
                      }`}>
                        {group.axisColor === 'emerald' ? fi + 1 : fi + 3}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-gray-800">{f.name}</p>
                        <p className="text-[10px] text-gray-400 mt-0.5">
                          <span className={`font-semibold ${
                            group.axisColor === 'emerald' ? 'text-emerald-600' : 'text-red-500'
                          }`}>
                            데이터:
                          </span>
                          {' '}{f.source} — {f.calc}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Steps */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-lg bg-violet-100 flex items-center justify-center">
              <svg className="w-4 h-4 text-violet-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
              </svg>
            </div>
            <h2 className="text-sm font-bold text-gray-800">실습 진행 순서</h2>
          </div>

          <div className="relative">
            {/* Vertical connector line */}
            <div className="absolute left-5 top-5 bottom-5 w-0.5 bg-gray-100" />
            <div className="space-y-3">
              {STEPS.map((s) => (
                <div key={s.step} className="flex gap-4 items-start relative">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white shrink-0 z-10 ${s.color}`}>
                    {s.icon}
                  </div>
                  <div className={`flex-1 py-2 ${!s.active ? 'opacity-50' : ''}`}>
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-bold text-gray-800">{s.title}</p>
                      {!s.active && (
                        <span className="text-[10px] text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">진행자 안내</span>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 mt-0.5">{s.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Nav buttons */}
        <div className="grid grid-cols-2 gap-3">
          <Link
            href="/guide"
            className="flex flex-col items-center gap-2 py-5 px-3 rounded-2xl bg-slate-800 text-white hover:bg-slate-700 transition-all hover:scale-[1.02] shadow-md"
          >
            <svg className="w-7 h-7 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <span className="text-sm font-bold">KPI 가이드</span>
            <span className="text-[11px] text-slate-400">계산 방법 + 분류 기준표</span>
          </Link>
          <Link
            href="/items"
            className="flex flex-col items-center gap-2 py-5 px-3 rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-700 text-white hover:from-emerald-400 hover:to-emerald-600 transition-all hover:scale-[1.02] shadow-md"
          >
            <svg className="w-7 h-7 text-emerald-100" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
            <span className="text-sm font-bold">품목 데이터</span>
            <span className="text-[11px] text-emerald-200">10개 품목 원천 데이터</span>
          </Link>
        </div>

      </div>
    </div>
  );
}
