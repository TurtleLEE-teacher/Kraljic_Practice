import Link from 'next/link';
import { ITEMS } from '@/data/items';

export default function ItemsPage() {
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
          <span className="text-sm font-bold text-gray-900 flex-1">10개 품목 원천 데이터</span>
          <Link href="/guide" className="text-xs text-gray-500 hover:text-gray-800 font-semibold whitespace-nowrap">
            가이드
          </Link>
          <span className="text-gray-200">|</span>
          <Link href="/survey" className="text-xs text-emerald-600 hover:text-emerald-800 font-bold whitespace-nowrap">
            제출
          </Link>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-4">
        <div className="space-y-2">
          {ITEMS.map((item) => {
            const latestSpend = item.spends[item.spends.length - 1];

            return (
              <Link
                key={item.id}
                href={`/items/${item.id}`}
                className="flex items-center gap-4 px-4 py-3.5 bg-white rounded-xl border border-gray-200 hover:border-blue-300 hover:shadow-sm transition-all group"
              >
                {/* ID */}
                <div className="w-10 h-10 rounded-lg bg-slate-800 flex items-center justify-center shrink-0">
                  <span className="text-sm font-black text-white uppercase">{item.id}</span>
                </div>

                {/* Name + category */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-gray-900 whitespace-nowrap">{item.label}</p>
                  <p className="text-xs text-gray-400 whitespace-nowrap">{item.category}</p>
                </div>

                {/* Compact stats */}
                <div className="flex items-center gap-3 text-xs text-gray-500 shrink-0">
                  <span className="whitespace-nowrap">납기 {item.deliveries.length}건</span>
                  <span className="whitespace-nowrap">업체 {item.suppliers.length}개</span>
                  <span className="whitespace-nowrap font-semibold text-gray-700">{latestSpend.itemSpend}억</span>
                </div>

                {/* Arrow */}
                <svg className="w-4 h-4 text-gray-300 group-hover:text-blue-400 transition-colors shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
