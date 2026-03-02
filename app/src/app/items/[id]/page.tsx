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

export default async function ItemDetailPage({ params }: Props) {
  const { id } = await params;
  const item = ITEM_MAP[id];

  if (!item) notFound();

  // Build delivery table rows
  const deliveryRows = item.deliveries.map((d) => ({
    poNumber: d.poNumber,
    orderDate: d.orderDate,
    plannedDate: d.plannedDate,
    actualDate: d.actualDate,
  }));

  // Build supplier table rows
  const totalAmount = item.suppliers.reduce((sum, s) => sum + s.annualAmount, 0);
  const supplierRows = item.suppliers.map((s) => ({
    name: s.name,
    annualAmount: s.annualAmount.toLocaleString('ko-KR'),
    share: ((s.annualAmount / totalAmount) * 100).toFixed(1) + '%',
    substitutable: s.substitutable,
    note: s.note,
  }));

  // Build spend table rows
  const spendRows = item.spends.map((s) => ({
    year: s.year.toString(),
    itemSpend: s.itemSpend.toFixed(2) + '억',
    totalSpend: s.totalSpend.toFixed(0) + '억',
  }));

  // Nearby item navigation
  const itemIndex = ITEMS.findIndex((i) => i.id === id);
  const prevItem = itemIndex > 0 ? ITEMS[itemIndex - 1] : null;
  const nextItem = itemIndex < ITEMS.length - 1 ? ITEMS[itemIndex + 1] : null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      <div className="max-w-2xl mx-auto px-4 py-8">

        {/* Back nav */}
        <div className="mb-6">
          <Link href="/items" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 transition-colors">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            품목 목록으로
          </Link>
        </div>

        {/* Header */}
        <div className="bg-white rounded-2xl border border-gray-200 p-5 mb-6">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-xl bg-slate-100 flex items-center justify-center shrink-0">
              <span className="text-xl font-black text-slate-700 uppercase">{item.id}</span>
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900">{item.label}</h1>
              <span className="inline-block text-xs font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-full mt-1">
                {item.category}
              </span>
              <p className="text-sm text-gray-500 mt-2 leading-relaxed">{item.description}</p>
            </div>
          </div>

          {/* Quick stats */}
          <div className="grid grid-cols-3 gap-3 mt-4 pt-4 border-t border-gray-100">
            <div className="text-center">
              <p className="text-xs text-gray-400">납기이력 건수</p>
              <p className="text-base font-bold text-gray-800 mt-0.5">{item.deliveries.length}건</p>
            </div>
            <div className="text-center">
              <p className="text-xs text-gray-400">등록 공급업체</p>
              <p className="text-base font-bold text-gray-800 mt-0.5">{item.suppliers.length}개</p>
            </div>
            <div className="text-center">
              <p className="text-xs text-gray-400">2024 구매금액</p>
              <p className="text-base font-bold text-gray-800 mt-0.5">
                {item.spends[item.spends.length - 1].itemSpend}억원
              </p>
            </div>
          </div>
        </div>

        {/* KPI Task Banner */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl px-4 py-3 mb-6">
          <p className="text-xs text-blue-800 font-semibold mb-1">산출해야 할 KPI 인자 (8개)</p>
          <div className="grid grid-cols-2 gap-x-4 gap-y-1">
            {[
              '① 평균 납기 리드타임',
              '② 납기준수율',
              '③ 리드타임 변동계수(CV)',
              '④ 등록 공급업체 수',
              '⑤ 1위 공급업체 집중도',
              '⑥ 대체 가능 업체 수',
              '⑦ 연간 구매금액 (지출)',
              '⑧ 지출 비중(%)',
            ].map((kpi) => (
              <p key={kpi} className="text-[11px] text-blue-700 flex items-center gap-1">
                <span className="w-1 h-1 rounded-full bg-blue-400 shrink-0" />
                {kpi}
              </p>
            ))}
          </div>
          <p className="text-[11px] text-blue-600 mt-2">
            계산 방법 →{' '}
            <Link href="/guide" className="underline font-semibold">KPI 가이드</Link>
          </p>
        </div>

        {/* Table 1: 납기 이력 */}
        <div className="mb-4">
          <RawDataTable
            title="테이블 1 — 납기 이력"
            subtitle="2024년 발주 건수: 12건 | 원천 데이터: 발주일, 납기예정일, 실제입고일"
            columns={[
              { key: 'poNumber', label: '발주번호' },
              { key: 'orderDate', label: '발주일' },
              { key: 'plannedDate', label: '납기예정일' },
              { key: 'actualDate', label: '실제입고일' },
            ]}
            rows={deliveryRows}
            note="리드타임 = 실제입고일 − 발주일 (일수 계산) / 납기준수 = 실제입고일 ≤ 납기예정일이면 ○"
          />
        </div>

        {/* Table 2: 공급업체 현황 */}
        <div className="mb-4">
          <RawDataTable
            title="테이블 2 — 공급업체 현황"
            subtitle={`2024년 기준 등록 공급업체: ${item.suppliers.length}개 | 원천 데이터: 거래금액, 대체가능 여부`}
            columns={[
              { key: 'name', label: '공급업체명' },
              { key: 'annualAmount', label: '연간거래금액(만원)', align: 'right' },
              { key: 'share', label: '비중', align: 'right' },
              { key: 'substitutable', label: '대체가능', align: 'center' },
              { key: 'note', label: '비고' },
            ]}
            rows={supplierRows}
            note="집중도(%) = 최대 거래금액 업체 ÷ 전체 합계 × 100 / 대체가능 업체 수 = 'Y' 행 카운트"
          />
        </div>

        {/* Table 3: 구매 지출 현황 */}
        <div className="mb-6">
          <RawDataTable
            title="테이블 3 — 구매 지출 현황"
            subtitle="3개 연도 기준 | 원천 데이터: 품목 구매금액, 전사 총 구매금액"
            columns={[
              { key: 'year', label: '연도', align: 'center' },
              { key: 'itemSpend', label: '품목 구매금액', align: 'right' },
              { key: 'totalSpend', label: '전사 총 구매금액', align: 'right' },
            ]}
            rows={spendRows}
            note="지출비중(%) = 품목 구매금액 ÷ 전사 총 구매금액 × 100"
          />
        </div>

        {/* My Analysis Section */}
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 mb-6">
          <h3 className="text-sm font-bold text-slate-700 mb-3">나의 분석 메모</h3>
          <div className="grid grid-cols-2 gap-2 text-xs">
            {[
              { label: '① 평균 리드타임', unit: '일' },
              { label: '② 납기준수율', unit: '%' },
              { label: '③ 리드타임 CV', unit: '%' },
              { label: '④ 공급업체 수', unit: '개' },
              { label: '⑤ 1위 집중도', unit: '%' },
              { label: '⑥ 대체가능 업체', unit: '개' },
              { label: '⑦ 구매금액(2024)', unit: '억원' },
              { label: '⑧ 지출 비중', unit: '%' },
            ].map((field) => (
              <div key={field.label} className="bg-white rounded-lg p-2 border border-slate-100">
                <p className="text-[10px] text-slate-500 mb-1">{field.label}</p>
                <div className="flex items-center gap-1">
                  <div className="flex-1 h-5 bg-slate-100 rounded border-b border-slate-300" />
                  <span className="text-[10px] text-slate-400 shrink-0">{field.unit}</span>
                </div>
              </div>
            ))}
          </div>
          <p className="text-[11px] text-slate-400 mt-3">
            ※ 화면에서 직접 작성은 안 됩니다. 종이 또는 개인 노트에 기록하세요.
          </p>
        </div>

        {/* Prev / Next navigation */}
        <div className="flex gap-3">
          {prevItem ? (
            <Link
              href={`/items/${prevItem.id}`}
              className="flex-1 flex items-center gap-2 py-3 px-4 rounded-xl bg-white border border-gray-200 hover:border-gray-300 transition-colors"
            >
              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              <div>
                <p className="text-[10px] text-gray-400">이전 품목</p>
                <p className="text-xs font-semibold text-gray-700">{prevItem.label}</p>
              </div>
            </Link>
          ) : <div className="flex-1" />}

          {nextItem ? (
            <Link
              href={`/items/${nextItem.id}`}
              className="flex-1 flex items-center justify-end gap-2 py-3 px-4 rounded-xl bg-white border border-gray-200 hover:border-gray-300 transition-colors"
            >
              <div className="text-right">
                <p className="text-[10px] text-gray-400">다음 품목</p>
                <p className="text-xs font-semibold text-gray-700">{nextItem.label}</p>
              </div>
              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          ) : <div className="flex-1" />}
        </div>

      </div>
    </div>
  );
}
