import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ITEMS, ITEM_MAP } from '@/data/items';
import RawDataTable from '@/components/RawDataTable';

export function generateStaticParams() {
  return ITEMS.map((item) => ({ id: item.id }));
}

interface Props {
  params: Promise<{ id: string }>;
}

const CATEGORY_ICONS: Record<string, string> = {
  '전자부품': '⚡',
  '산업용 소재': '🔩',
  '사무용품': '📋',
  '2차전지': '🔋',
  '철강/금속': '⚙️',
  '포장재': '📦',
  '희소금속/자성재료': '🧲',
  'MRO 소모품': '🔧',
  '반도체 소재': '💡',
  '합성수지/플라스틱': '🧪',
};

const TABLE_META = [
  {
    num: 1,
    title: '납기 이력',
    desc: '발주일 → 납기예정일 → 실제입고일',
    icon: (
      <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    ),
    kpis: ['①평균 리드타임', '②납기준수율', '③리드타임 CV'],
    kpiColor: 'text-blue-700 bg-blue-50',
  },
  {
    num: 2,
    title: '공급업체 현황',
    desc: '업체명 · 거래금액 · 대체가능 여부',
    icon: (
      <svg className="w-4 h-4 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
      </svg>
    ),
    kpis: ['④공급업체 수', '⑤1위 집중도', '⑥대체 가능 업체'],
    kpiColor: 'text-orange-700 bg-orange-50',
  },
  {
    num: 3,
    title: '구매 지출 현황',
    desc: '연도별 품목금액 · 전사총구매액',
    icon: (
      <svg className="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    kpis: ['⑦연간 구매금액', '⑧지출 비중(%)'],
    kpiColor: 'text-emerald-700 bg-emerald-50',
  },
];

export default async function ItemDetailPage({ params }: Props) {
  const { id } = await params;
  const item = ITEM_MAP[id];

  if (!item) notFound();

  const deliveryRows = item.deliveries.map((d) => ({
    poNumber: d.poNumber,
    orderDate: d.orderDate,
    plannedDate: d.plannedDate,
    actualDate: d.actualDate,
  }));

  const totalAmount = item.suppliers.reduce((sum, s) => sum + s.annualAmount, 0);
  const supplierRows = item.suppliers.map((s) => ({
    name: s.name,
    annualAmount: s.annualAmount.toLocaleString('ko-KR'),
    share: ((s.annualAmount / totalAmount) * 100).toFixed(1) + '%',
    substitutable: s.substitutable,
    note: s.note,
  }));

  const spendRows = item.spends.map((s) => ({
    year: s.year.toString(),
    itemSpend: s.itemSpend.toFixed(2) + '억',
    totalSpend: s.totalSpend.toFixed(0) + '억',
  }));

  const itemIndex = ITEMS.findIndex((i) => i.id === id);
  const prevItem = itemIndex > 0 ? ITEMS[itemIndex - 1] : null;
  const nextItem = itemIndex < ITEMS.length - 1 ? ITEMS[itemIndex + 1] : null;
  const catIcon = CATEGORY_ICONS[item.category] ?? '📌';

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">

      {/* Sticky header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center gap-3">
          <Link href="/items" className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors">
            <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <div className="flex items-center gap-2">
            <span className="text-base">{catIcon}</span>
            <span className="text-sm font-bold text-gray-900">{item.label}</span>
            <span className="text-xs text-gray-400">— {item.category}</span>
          </div>
          {/* Item navigation dots */}
          <div className="ml-auto flex gap-1">
            {ITEMS.map((it) => (
              <Link
                key={it.id}
                href={`/items/${it.id}`}
                className={`w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-black transition-colors ${
                  it.id === id
                    ? 'bg-slate-800 text-white'
                    : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                }`}
              >
                {it.id.toUpperCase()}
              </Link>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6">

        {/* Item hero card */}
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden mb-5">
          {/* Colored top stripe */}
          <div className="h-1.5 bg-gradient-to-r from-slate-700 via-blue-600 to-indigo-600" />
          <div className="p-5">
            <div className="flex items-start gap-4">
              <div className="relative shrink-0">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-slate-800 to-slate-600 flex items-center justify-center shadow-md">
                  <span className="text-2xl font-black text-white uppercase">{item.id}</span>
                </div>
                <div className="absolute -bottom-1 -right-1 text-xl leading-none">{catIcon}</div>
              </div>
              <div className="flex-1">
                <h1 className="text-lg font-bold text-gray-900">{item.label}</h1>
                <span className="inline-block text-xs font-semibold text-slate-600 bg-slate-100 px-2.5 py-0.5 rounded-full mt-1">
                  {item.category}
                </span>
                <p className="text-sm text-gray-500 mt-2 leading-relaxed">{item.description}</p>
              </div>
            </div>

            {/* Quick stats */}
            <div className="grid grid-cols-3 gap-3 mt-5 pt-4 border-t border-gray-100">
              <div className="text-center bg-blue-50 rounded-xl py-3">
                <p className="text-[10px] text-blue-400 font-semibold uppercase tracking-wider">납기이력</p>
                <p className="text-xl font-black text-blue-700 mt-1">{item.deliveries.length}</p>
                <p className="text-[10px] text-blue-400">건</p>
              </div>
              <div className="text-center bg-orange-50 rounded-xl py-3">
                <p className="text-[10px] text-orange-400 font-semibold uppercase tracking-wider">공급업체</p>
                <p className="text-xl font-black text-orange-700 mt-1">{item.suppliers.length}</p>
                <p className="text-[10px] text-orange-400">개</p>
              </div>
              <div className="text-center bg-emerald-50 rounded-xl py-3">
                <p className="text-[10px] text-emerald-400 font-semibold uppercase tracking-wider">구매금액(24)</p>
                <p className="text-xl font-black text-emerald-700 mt-1">{item.spends[item.spends.length - 1].itemSpend}</p>
                <p className="text-[10px] text-emerald-400">억원</p>
              </div>
            </div>
          </div>
        </div>

        {/* KPI 계산 안내 */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl px-4 py-3 mb-5 flex items-center justify-between gap-3">
          <p className="text-xs text-blue-800">
            아래 3개 테이블에서 <strong>7개 KPI 인자</strong>를 직접 계산하세요
          </p>
          <Link
            href="/guide"
            className="shrink-0 text-[11px] font-bold text-white bg-blue-600 hover:bg-blue-700 px-3 py-1.5 rounded-lg transition-colors"
          >
            🧮 계산기 →
          </Link>
        </div>

        {/* Table 1: 납기 이력 */}
        <div className="mb-4">
          <div className="flex items-center gap-2 mb-2 px-1">
            <div className="w-7 h-7 rounded-lg bg-blue-100 flex items-center justify-center">
              {TABLE_META[0].icon}
            </div>
            <span className="text-sm font-bold text-gray-700">테이블 1 — 납기 이력</span>
            <span className="text-[11px] text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full ml-auto">
              ① ② ③ 산출
            </span>
          </div>
          <RawDataTable
            title=""
            subtitle="2024년 발주건 12건 | 원천 데이터: 발주일 · 납기예정일 · 실제입고일 (계산값 없음)"
            columns={[
              { key: 'poNumber', label: '발주번호' },
              { key: 'orderDate', label: '발주일' },
              { key: 'plannedDate', label: '납기예정일' },
              { key: 'actualDate', label: '실제입고일' },
            ]}
            rows={deliveryRows}
            note="리드타임 = 실제입고일 − 발주일 / 납기준수 = 실제입고일 ≤ 납기예정일 이면 ○ / CV = σ ÷ 평균 × 100"
          />
        </div>

        {/* Table 2: 공급업체 현황 */}
        <div className="mb-4">
          <div className="flex items-center gap-2 mb-2 px-1">
            <div className="w-7 h-7 rounded-lg bg-orange-100 flex items-center justify-center">
              {TABLE_META[1].icon}
            </div>
            <span className="text-sm font-bold text-gray-700">테이블 2 — 공급업체 현황</span>
            <span className="text-[11px] text-orange-600 bg-orange-50 px-2 py-0.5 rounded-full ml-auto">
              ④ ⑤ ⑥ 산출
            </span>
          </div>
          <RawDataTable
            title=""
            subtitle={`${item.suppliers.length}개 등록업체 | 원천 데이터: 거래금액 · 대체가능 여부 (계산값 없음)`}
            columns={[
              { key: 'name', label: '공급업체명' },
              { key: 'annualAmount', label: '거래금액(만원)', align: 'right' },
              { key: 'share', label: '비중', align: 'right' },
              { key: 'substitutable', label: '대체', align: 'center' },
              { key: 'note', label: '비고' },
            ]}
            rows={supplierRows}
            note="집중도(%) = 최대거래업체 ÷ 전체합계 × 100 / 대체가능 업체 수 = 'Y' 행 카운트"
          />
        </div>

        {/* Table 3: 구매 지출 현황 */}
        <div className="mb-5">
          <div className="flex items-center gap-2 mb-2 px-1">
            <div className="w-7 h-7 rounded-lg bg-emerald-100 flex items-center justify-center">
              {TABLE_META[2].icon}
            </div>
            <span className="text-sm font-bold text-gray-700">테이블 3 — 구매 지출 현황</span>
            <span className="text-[11px] text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full ml-auto">
              ⑦ ⑧ 산출
            </span>
          </div>
          <RawDataTable
            title=""
            subtitle="3개 연도 기준 | 원천 데이터: 품목 구매금액 · 전사 총 구매금액 (계산값 없음)"
            columns={[
              { key: 'year', label: '연도', align: 'center' },
              { key: 'itemSpend', label: '품목 구매금액', align: 'right' },
              { key: 'totalSpend', label: '전사 총 구매금액', align: 'right' },
            ]}
            rows={spendRows}
            note="지출비중(%) = 품목 구매금액 ÷ 전사 총 구매금액 × 100"
          />
        </div>

        {/* Prev / Next navigation */}
        <div className="flex gap-3">
          {prevItem ? (
            <Link
              href={`/items/${prevItem.id}`}
              className="flex-1 flex items-center gap-2 py-3 px-4 rounded-xl bg-white border border-gray-200 hover:border-blue-200 hover:bg-blue-50 transition-colors group"
            >
              <svg className="w-4 h-4 text-gray-400 group-hover:text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              <div>
                <p className="text-[10px] text-gray-400">이전 품목</p>
                <p className="text-xs font-bold text-gray-700 group-hover:text-blue-700">{prevItem.label}</p>
              </div>
            </Link>
          ) : <div className="flex-1" />}

          {nextItem ? (
            <Link
              href={`/items/${nextItem.id}`}
              className="flex-1 flex items-center justify-end gap-2 py-3 px-4 rounded-xl bg-white border border-gray-200 hover:border-blue-200 hover:bg-blue-50 transition-colors group"
            >
              <div className="text-right">
                <p className="text-[10px] text-gray-400">다음 품목</p>
                <p className="text-xs font-bold text-gray-700 group-hover:text-blue-700">{nextItem.label}</p>
              </div>
              <svg className="w-4 h-4 text-gray-400 group-hover:text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          ) : <div className="flex-1" />}
        </div>

      </div>
    </div>
  );
}
