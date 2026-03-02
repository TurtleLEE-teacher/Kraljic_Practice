import Link from 'next/link';

const QUADRANTS = [
  {
    id: 'bottleneck',
    nameKo: '병목',
    nameEn: 'Bottleneck',
    position: 'top-left',
    bg: 'bg-red-50',
    border: 'border-red-200',
    badge: 'bg-red-100 text-red-700',
    text: 'text-red-900',
    supplyRisk: '높음',
    profitImpact: '낮음',
    strategy: '안전재고 확보, 대체 공급선 개발',
    items: ['적은 공급업체', '긴 리드타임', '낮은 지출비중'],
  },
  {
    id: 'strategic',
    nameKo: '전략',
    nameEn: 'Strategic',
    position: 'top-right',
    bg: 'bg-violet-50',
    border: 'border-violet-200',
    badge: 'bg-violet-100 text-violet-700',
    text: 'text-violet-900',
    supplyRisk: '높음',
    profitImpact: '높음',
    strategy: '파트너십 심화, 공동 개발',
    items: ['적은 공급업체', '긴 리드타임', '높은 지출비중'],
  },
  {
    id: 'noncritical',
    nameKo: '일반',
    nameEn: 'Non-critical',
    position: 'bottom-left',
    bg: 'bg-slate-50',
    border: 'border-slate-200',
    badge: 'bg-slate-100 text-slate-600',
    text: 'text-slate-800',
    supplyRisk: '낮음',
    profitImpact: '낮음',
    strategy: '표준화·자동발주, 거래비용 절감',
    items: ['많은 공급업체', '짧은 리드타임', '낮은 지출비중'],
  },
  {
    id: 'leverage',
    nameKo: '레버리지',
    nameEn: 'Leverage',
    position: 'bottom-right',
    bg: 'bg-emerald-50',
    border: 'border-emerald-200',
    badge: 'bg-emerald-100 text-emerald-700',
    text: 'text-emerald-900',
    supplyRisk: '낮음',
    profitImpact: '높음',
    strategy: '경쟁 입찰, 공격적 원가 절감',
    items: ['많은 공급업체', '보통 리드타임', '높은 지출비중'],
  },
];

export default function KraljicMatrixDiagram() {
  return (
    <div className="w-full">
      {/* Axis labels */}
      <div className="flex items-center justify-center mb-2">
        <span className="text-xs font-semibold text-gray-500 tracking-wider uppercase">
          수익 영향 (Profit Impact) →
        </span>
      </div>

      <div className="flex gap-2 items-stretch">
        {/* Y-axis label */}
        <div className="flex items-center justify-center w-6 shrink-0">
          <span
            className="text-xs font-semibold text-gray-500 tracking-wider uppercase whitespace-nowrap"
            style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}
          >
            공급 위험 (Supply Risk) →
          </span>
        </div>

        {/* 2×2 Grid */}
        <div className="flex-1 grid grid-cols-2 gap-2">
          {/* Row 1: 높은 공급위험 (병목 | 전략) */}
          {['bottleneck', 'strategic'].map((id) => {
            const q = QUADRANTS.find((x) => x.id === id)!;
            return (
              <div
                key={q.id}
                className={`rounded-xl border-2 p-4 ${q.bg} ${q.border}`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <span className={`inline-block text-xs font-bold px-2 py-0.5 rounded-full mb-1 ${q.badge}`}>
                      {q.nameKo}
                    </span>
                    <p className="text-[10px] text-gray-400">{q.nameEn}</p>
                  </div>
                  <div className="text-right text-[10px] text-gray-400 leading-tight">
                    <div>공급위험 <span className="font-bold text-gray-600">{q.supplyRisk}</span></div>
                    <div>수익영향 <span className="font-bold text-gray-600">{q.profitImpact}</span></div>
                  </div>
                </div>
                <p className={`text-xs font-medium ${q.text} mb-2`}>{q.strategy}</p>
                <ul className="space-y-0.5">
                  {q.items.map((item) => (
                    <li key={item} className="text-[10px] text-gray-500 flex items-center gap-1">
                      <span className="w-1 h-1 rounded-full bg-gray-400 shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}

          {/* Row 2: 낮은 공급위험 (일반 | 레버리지) */}
          {['noncritical', 'leverage'].map((id) => {
            const q = QUADRANTS.find((x) => x.id === id)!;
            return (
              <div
                key={q.id}
                className={`rounded-xl border-2 p-4 ${q.bg} ${q.border}`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <span className={`inline-block text-xs font-bold px-2 py-0.5 rounded-full mb-1 ${q.badge}`}>
                      {q.nameKo}
                    </span>
                    <p className="text-[10px] text-gray-400">{q.nameEn}</p>
                  </div>
                  <div className="text-right text-[10px] text-gray-400 leading-tight">
                    <div>공급위험 <span className="font-bold text-gray-600">{q.supplyRisk}</span></div>
                    <div>수익영향 <span className="font-bold text-gray-600">{q.profitImpact}</span></div>
                  </div>
                </div>
                <p className={`text-xs font-medium ${q.text} mb-2`}>{q.strategy}</p>
                <ul className="space-y-0.5">
                  {q.items.map((item) => (
                    <li key={item} className="text-[10px] text-gray-500 flex items-center gap-1">
                      <span className="w-1 h-1 rounded-full bg-gray-400 shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      </div>

      {/* Bottom axis label */}
      <div className="flex mt-2 ml-8">
        <div className="flex-1 grid grid-cols-2 gap-2 text-center">
          <span className="text-[10px] text-gray-400">← 낮음</span>
          <span className="text-[10px] text-gray-400">높음 →</span>
        </div>
      </div>

      {/* CTA */}
      <div className="mt-5 flex gap-3">
        <Link
          href="/guide"
          className="flex-1 text-center py-2.5 rounded-xl bg-slate-800 text-white text-sm font-semibold hover:bg-slate-700 transition-colors"
        >
          KPI 산출 가이드 보기
        </Link>
        <Link
          href="/items"
          className="flex-1 text-center py-2.5 rounded-xl bg-emerald-600 text-white text-sm font-semibold hover:bg-emerald-700 transition-colors"
        >
          품목 데이터 분석 시작
        </Link>
      </div>
    </div>
  );
}
