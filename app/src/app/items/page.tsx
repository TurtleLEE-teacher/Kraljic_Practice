import Link from 'next/link';
import { ITEMS } from '@/data/items';

const CATEGORY_CONFIG: Record<string, { color: string; icon: string }> = {
  '전자부품':        { color: 'bg-blue-100 text-blue-700 border-blue-200',    icon: '⚡' },
  '산업용 소재':     { color: 'bg-orange-100 text-orange-700 border-orange-200', icon: '🔩' },
  '사무용품':        { color: 'bg-slate-100 text-slate-600 border-slate-200',   icon: '📋' },
  '2차전지':         { color: 'bg-violet-100 text-violet-700 border-violet-200', icon: '🔋' },
  '철강/금속':       { color: 'bg-gray-100 text-gray-600 border-gray-200',     icon: '⚙️' },
  '포장재':          { color: 'bg-yellow-100 text-yellow-700 border-yellow-200', icon: '📦' },
  '희소금속/자성재료': { color: 'bg-red-100 text-red-700 border-red-200',       icon: '🧲' },
  'MRO 소모품':      { color: 'bg-teal-100 text-teal-700 border-teal-200',     icon: '🔧' },
  '반도체 소재':     { color: 'bg-indigo-100 text-indigo-700 border-indigo-200', icon: '💡' },
  '합성수지/플라스틱': { color: 'bg-lime-100 text-lime-700 border-lime-200',    icon: '🧪' },
};

// Max spend for visual bar scaling (item d: 52.5억)
const MAX_SPEND = 52.5;

function SpendBar({ spend }: { spend: number }) {
  const pct = Math.min((spend / MAX_SPEND) * 100, 100);
  const color = spend >= 10 ? 'bg-emerald-500' : spend >= 3 ? 'bg-blue-400' : 'bg-gray-300';
  return (
    <div className="mt-2">
      <div className="flex items-center justify-between mb-1">
        <span className="text-[10px] text-gray-400">구매금액 (2024)</span>
        <span className="text-[10px] font-bold text-gray-600">{spend}억원</span>
      </div>
      <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all ${color}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

function SupplierDots({ count }: { count: number }) {
  const MAX = 10;
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: Math.min(count, MAX) }).map((_, i) => (
        <span
          key={i}
          className="w-2 h-2 rounded-full bg-slate-400 inline-block"
          style={{ opacity: 0.4 + (i / MAX) * 0.6 }}
        />
      ))}
      {count > MAX && <span className="text-[10px] text-gray-400 ml-1">+{count - MAX}</span>}
    </div>
  );
}

export default function ItemsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      {/* Page header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center gap-3">
          <Link href="/" className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors">
            <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <div className="flex items-center gap-2 flex-1">
            <span className="text-sm font-bold text-gray-900">10개 품목 원천 데이터</span>
            <span className="text-[10px] bg-emerald-100 text-emerald-700 font-semibold px-2 py-0.5 rounded-full">품목 A ~ J</span>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Link href="/guide" className="text-xs text-slate-600 hover:text-slate-900 font-semibold whitespace-nowrap">
              가이드
            </Link>
            <span className="text-gray-200">|</span>
            <Link href="/survey" className="text-xs text-emerald-600 hover:text-emerald-800 font-bold whitespace-nowrap">
              📝 제출
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6">

        {/* Item Grid */}
        <div className="grid grid-cols-1 gap-3">
          {ITEMS.map((item) => {
            const config = CATEGORY_CONFIG[item.category] ?? { color: 'bg-gray-100 text-gray-600 border-gray-200', icon: '📌' };
            const latestSpend = item.spends[item.spends.length - 1];

            return (
              <Link
                key={item.id}
                href={`/items/${item.id}`}
                className="bg-white rounded-xl border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all duration-150 p-4 group"
              >
                <div className="flex items-start gap-3">
                  {/* Item ID badge with category icon */}
                  <div className="relative shrink-0">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center">
                      <span className="text-base font-black text-slate-700 uppercase">{item.id}</span>
                    </div>
                    <div className="absolute -bottom-1 -right-1 text-base leading-none">
                      {config.icon}
                    </div>
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-sm font-bold text-gray-900">{item.label}</span>
                          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${config.color}`}>
                            {item.category}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">{item.description}</p>
                      </div>
                      <svg className="w-4 h-4 text-gray-300 group-hover:text-blue-400 transition-colors shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>

                    {/* Data stats row */}
                    <div className="mt-2 flex items-center gap-3 flex-wrap">
                      <div className="flex items-center gap-1.5">
                        <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <span className="text-[11px] text-gray-500">납기이력 <span className="font-bold text-gray-700">{item.deliveries.length}건</span></span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                        <SupplierDots count={item.suppliers.length} />
                        <span className="text-[11px] text-gray-500"><span className="font-bold text-gray-700">{item.suppliers.length}</span>개</span>
                      </div>
                    </div>

                    {/* Spend bar */}
                    <SpendBar spend={latestSpend.itemSpend} />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

      </div>
    </div>
  );
}
