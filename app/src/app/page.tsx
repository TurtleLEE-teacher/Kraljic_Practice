import Link from 'next/link';
import KraljicMatrixDiagram from '@/components/KraljicMatrixDiagram';

const KPI_FACTORS = [
  {
    axis: '수익영향',
    color: 'emerald',
    factors: [
      { name: '연간 구매금액', source: '지출 데이터', calc: '직접 읽기' },
      { name: '지출 비중(%)', source: '지출 데이터', calc: '품목금액 ÷ 전사총액 × 100' },
    ],
  },
  {
    axis: '공급위험',
    color: 'red',
    factors: [
      { name: '등록 공급업체 수', source: '공급업체 데이터', calc: '업체 행 수 카운트' },
      { name: '1위 공급업체 집중도(%)', source: '공급업체 데이터', calc: '최대 거래업체 ÷ 합계 × 100' },
      { name: '대체 가능 업체 수', source: '공급업체 데이터', calc: "'Y' 행 카운트" },
      { name: '평균 납기 리드타임(일)', source: '납기 데이터', calc: 'Σ(입고일-발주일) ÷ 건수' },
      { name: '납기준수율(%)', source: '납기 데이터', calc: '(입고일≤납기예정일 건수) ÷ 전체 × 100' },
      { name: '리드타임 변동계수(CV%)', source: '납기 데이터', calc: '표준편차 ÷ 평균 × 100' },
    ],
  },
];

const STEPS = [
  { step: '01', title: '원천 데이터 확인', desc: '품목별 납기이력·공급업체·지출 데이터 3종 테이블을 검토합니다.' },
  { step: '02', title: 'KPI 직접 산출', desc: '8개 정량 인자를 수식에 따라 계산합니다. 계산기나 엑셀을 활용하세요.' },
  { step: '03', title: '품목군 분류 판단', desc: '가이드 기준표를 참고하여 각 품목이 4개 사분면 중 어디에 속하는지 결정합니다.' },
  { step: '04', title: 'Tally 폼 제출', desc: '품목 A~J의 분류 결과와 판단 근거를 팀별로 제출합니다.' },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      <div className="max-w-2xl mx-auto px-4 py-8">

        {/* Header */}
        <div className="text-center mb-8">
          <span className="inline-block text-xs font-semibold text-blue-600 bg-blue-100 px-3 py-1 rounded-full mb-3 tracking-wider uppercase">
            Kraljic Matrix Practice
          </span>
          <h1 className="text-2xl font-bold text-gray-900 leading-tight">
            크랄직 매트릭스<br />
            <span className="text-slate-600">품목군 분류 실습</span>
          </h1>
          <p className="text-sm text-gray-500 mt-3 leading-relaxed">
            원천 데이터에서 KPI를 직접 산출하고<br />
            10개 품목의 크랄직 품목군을 분류하는 실습입니다.
          </p>
        </div>

        {/* Kraljic Matrix Diagram */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 mb-6">
          <h2 className="text-sm font-bold text-gray-700 mb-4">크랄직 매트릭스 (Kraljic, 1983)</h2>
          <KraljicMatrixDiagram />
        </div>

        {/* MECE KPI Factors */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 mb-6">
          <h2 className="text-sm font-bold text-gray-700 mb-1">분류 기준 — 8개 정량 인자 (MECE)</h2>
          <p className="text-xs text-gray-400 mb-4">원천 데이터로부터 아래 인자를 산출하여 품목군을 결정합니다.</p>
          <div className="space-y-4">
            {KPI_FACTORS.map((group) => (
              <div key={group.axis}>
                <div className={`inline-block text-xs font-bold px-2 py-0.5 rounded mb-2 ${
                  group.color === 'emerald' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
                }`}>
                  {group.axis} 축
                </div>
                <div className="space-y-1.5">
                  {group.factors.map((f) => (
                    <div key={f.name} className="flex items-start gap-2 pl-1">
                      <span className={`w-1.5 h-1.5 rounded-full mt-1.5 shrink-0 ${
                        group.color === 'emerald' ? 'bg-emerald-400' : 'bg-red-400'
                      }`} />
                      <div>
                        <span className="text-xs font-semibold text-gray-700">{f.name}</span>
                        <span className="text-[11px] text-gray-400 ml-1.5">← {f.source}</span>
                        <p className="text-[11px] text-gray-500 font-mono">{f.calc}</p>
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
          <h2 className="text-sm font-bold text-gray-700 mb-4">실습 진행 순서</h2>
          <div className="space-y-3">
            {STEPS.map((s, i) => (
              <div key={s.step} className="flex gap-3 items-start">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                  i < 3 ? 'bg-slate-800 text-white' : 'bg-gray-100 text-gray-400'
                }`}>
                  {s.step}
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-800">{s.title}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
          <p className="text-[11px] text-gray-400 mt-3 pl-10">※ 4번(Tally 제출)은 진행자가 별도 안내합니다.</p>
        </div>

        {/* Nav buttons */}
        <div className="grid grid-cols-2 gap-3">
          <Link
            href="/guide"
            className="flex flex-col items-center py-4 px-3 rounded-xl bg-slate-800 text-white hover:bg-slate-700 transition-colors"
          >
            <span className="text-lg mb-1">📐</span>
            <span className="text-sm font-bold">KPI 가이드</span>
            <span className="text-[11px] text-slate-400 mt-0.5">계산 방법 + 기준표</span>
          </Link>
          <Link
            href="/items"
            className="flex flex-col items-center py-4 px-3 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 transition-colors"
          >
            <span className="text-lg mb-1">📊</span>
            <span className="text-sm font-bold">품목 데이터</span>
            <span className="text-[11px] text-emerald-200 mt-0.5">10개 품목 원천 데이터</span>
          </Link>
        </div>

      </div>
    </div>
  );
}
