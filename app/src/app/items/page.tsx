import Link from 'next/link';
import { ITEMS } from '@/data/items';

const CATEGORY_COLORS: Record<string, string> = {
  '전자부품': 'bg-blue-100 text-blue-700',
  '산업용 소재': 'bg-orange-100 text-orange-700',
  '사무용품': 'bg-slate-100 text-slate-600',
  '2차전지': 'bg-violet-100 text-violet-700',
  '철강/금속': 'bg-gray-100 text-gray-600',
  '포장재': 'bg-yellow-100 text-yellow-700',
  '희소금속/자성재료': 'bg-red-100 text-red-700',
  'MRO 소모품': 'bg-teal-100 text-teal-700',
  '반도체 소재': 'bg-indigo-100 text-indigo-700',
  '합성수지/플라스틱': 'bg-lime-100 text-lime-700',
};

export default function ItemsPage() {
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
        <div className="mb-6">
          <span className="inline-block text-xs font-semibold text-emerald-600 bg-emerald-100 px-3 py-1 rounded-full mb-3">
            품목 데이터
          </span>
          <h1 className="text-xl font-bold text-gray-900">10개 품목 원천 데이터</h1>
          <p className="text-sm text-gray-500 mt-2">
            품목을 선택하여 납기이력·공급업체·지출 데이터를 확인하고 KPI를 산출하세요.
          </p>
        </div>

        {/* Info banner */}
        <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 mb-6">
          <p className="text-xs text-amber-800 leading-relaxed">
            <strong>실습 안내:</strong> 각 품목의 원천 데이터로부터 8개 KPI 인자를 직접 계산하여
            어느 품목군(일반·레버리지·병목·전략)에 속하는지 판단하세요.
            계산 방법은 <Link href="/guide" className="underline font-semibold">KPI 가이드</Link>를 참고하세요.
          </p>
        </div>

        {/* Item Grid */}
        <div className="grid grid-cols-1 gap-3">
          {ITEMS.map((item) => {
            const colorClass = CATEGORY_COLORS[item.category] ?? 'bg-gray-100 text-gray-600';
            const deliveryCount = item.deliveries.length;
            const supplierCount = item.suppliers.length;
            const latestSpend = item.spends[item.spends.length - 1];

            return (
              <Link
                key={item.id}
                href={`/items/${item.id}`}
                className="bg-white rounded-xl border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all duration-150 p-4 group"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    {/* Item badge */}
                    <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center shrink-0">
                      <span className="text-sm font-black text-slate-700 uppercase">{item.id}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-bold text-gray-900">{item.label}</span>
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${colorClass}`}>
                          {item.category}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">{item.description}</p>
                      {/* Mini stats */}
                      <div className="flex gap-3 mt-2">
                        <span className="text-[11px] text-gray-400">
                          <span className="font-semibold text-gray-600">{deliveryCount}</span>건 납기이력
                        </span>
                        <span className="text-[11px] text-gray-400">
                          <span className="font-semibold text-gray-600">{supplierCount}</span>개 공급업체
                        </span>
                        <span className="text-[11px] text-gray-400">
                          <span className="font-semibold text-gray-600">{latestSpend.itemSpend}억</span> (2024)
                        </span>
                      </div>
                    </div>
                  </div>
                  <svg className="w-4 h-4 text-gray-300 group-hover:text-blue-400 transition-colors shrink-0 mt-0.5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </Link>
            );
          })}
        </div>

        {/* Guide link */}
        <div className="mt-6 text-center">
          <Link
            href="/guide"
            className="inline-flex items-center gap-1.5 text-sm text-slate-600 hover:text-slate-900 font-semibold transition-colors"
          >
            📐 KPI 계산 방법을 모르겠다면 가이드 보기
          </Link>
        </div>

      </div>
    </div>
  );
}
