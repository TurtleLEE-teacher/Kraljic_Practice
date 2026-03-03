import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ITEMS, ITEM_MAP } from '@/data/items';
import RawDataTable from '@/components/RawDataTable';
import ItemActions from '@/components/ItemActions';
import {
  DeliveryCalcPanel,
  SupplierCalcPanel,
  SpendCalcPanel,
} from '@/components/ItemCalcPanels';

export function generateStaticParams() {
  return ITEMS.map((item) => ({ id: item.id }));
}

interface Props {
  params: Promise<{ id: string }>;
}

/* ── date util ── */
function daysBetween(from: string, to: string) {
  return Math.round(
    (new Date(to).getTime() - new Date(from).getTime()) / 86_400_000
  );
}

export default async function ItemDetailPage({ params }: Props) {
  const { id } = await params;
  const item = ITEM_MAP[id];
  if (!item) notFound();

  /* ──────────────────────────────────
     Row data for tables
  ────────────────────────────────── */
  const deliveryRows = item.deliveries.map((d) => ({
    poNumber:    d.poNumber,
    orderDate:   d.orderDate,
    plannedDate: d.plannedDate,
    actualDate:  d.actualDate,
  }));

  const totalAmt = item.suppliers.reduce((s, x) => s + x.annualAmount, 0);
  const supplierRows = item.suppliers.map((s) => ({
    name:          s.name,
    annualAmount:  s.annualAmount.toLocaleString('ko-KR'),
    share:         ((s.annualAmount / totalAmt) * 100).toFixed(1) + '%',
    substitutable: s.substitutable,
    note:          s.note,
  }));

  const spendRows = item.spends.map((s) => ({
    year:       s.year.toString(),
    itemSpend:  s.itemSpend.toFixed(2) + '억',
    totalSpend: s.totalSpend.toFixed(0) + '억',
  }));

  /* ──────────────────────────────────
     Server-side KPI computation
  ────────────────────────────────── */

  // ── 납기 KPIs ──
  const leadTimes = item.deliveries.map((d) =>
    daysBetween(d.orderDate, d.actualDate)
  );
  const ltN      = leadTimes.length;
  const ltSum    = leadTimes.reduce((a, b) => a + b, 0);
  const avgLT    = ltSum / ltN;
  const variance = leadTimes.reduce((s, lt) => s + (lt - avgLT) ** 2, 0) / ltN;
  const sigma    = Math.sqrt(variance);
  const cv       = avgLT > 0 ? (sigma / avgLT) * 100 : 0;

  const onTimeN  = item.deliveries.filter((d) => d.actualDate <= d.plannedDate).length;
  const otd      = (onTimeN / ltN) * 100;
  const maxLT    = Math.max(...leadTimes);

  const delayAmounts = item.deliveries
    .map((d) => daysBetween(d.plannedDate, d.actualDate))
    .filter((d) => d > 0);
  const lateN        = delayAmounts.length;
  const avgDelayDays = lateN > 0
    ? delayAmounts.reduce((a, b) => a + b, 0) / lateN : 0;
  const maxDelay     = lateN > 0 ? Math.max(...delayAmounts) : 0;

  // ── 공급업체 KPIs ──
  const supCount  = item.suppliers.length;
  const maxAmt    = Math.max(...item.suppliers.map((x) => x.annualAmount));
  const topConc   = (maxAmt / totalAmt) * 100;
  const subCount  = item.suppliers.filter((x) => x.substitutable === 'Y').length;
  const subRatio  = (subCount / supCount) * 100;
  const hhi       = item.suppliers.reduce((s, x) => {
    const share = x.annualAmount / totalAmt;
    return s + share * share * 10000;
  }, 0);

  // ── 지출 KPIs ──
  const latestSpend   = item.spends[item.spends.length - 1];
  const spendRatio    = (latestSpend.itemSpend / latestSpend.totalSpend) * 100;
  const avgSpendRatio = item.spends
    .reduce((s, sp) => s + (sp.itemSpend / sp.totalSpend) * 100, 0) / item.spends.length;

  let yoyGrowth: number | null = null;
  if (item.spends.length >= 2) {
    const prev = item.spends[item.spends.length - 2];
    yoyGrowth = ((latestSpend.itemSpend - prev.itemSpend) / prev.itemSpend) * 100;
  }

  /* ──────────────────────────────────
     Navigation
  ────────────────────────────────── */
  const itemIndex = ITEMS.findIndex((i) => i.id === id);
  const prevItem  = itemIndex > 0                ? ITEMS[itemIndex - 1] : null;
  const nextItem  = itemIndex < ITEMS.length - 1 ? ITEMS[itemIndex + 1] : null;

  return (
    <div className="min-h-screen bg-slate-50">

      {/* ── Sticky header ── */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center gap-3">
          <Link href="/items" className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors">
            <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <div className="w-7 h-7 rounded-md bg-slate-800 flex items-center justify-center shrink-0">
              <span className="text-xs font-black text-white uppercase">{item.id}</span>
            </div>
            <span className="text-sm font-bold text-gray-900 whitespace-nowrap truncate">{item.label}</span>
            <span className="text-xs text-gray-400 whitespace-nowrap hidden sm:inline">{item.category}</span>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Link href="/guide" className="text-xs text-gray-500 hover:text-gray-800 font-semibold whitespace-nowrap hidden sm:inline">
              가이드
            </Link>
            <span className="text-gray-200 hidden sm:inline">|</span>
            <Link href="/survey" className="text-xs text-emerald-600 hover:text-emerald-800 font-bold whitespace-nowrap">
              제출
            </Link>
          </div>
        </div>
        <div className="max-w-5xl mx-auto px-4 pb-2 flex gap-1 overflow-x-auto">
          {ITEMS.map((it) => (
            <Link
              key={it.id}
              href={`/items/${it.id}`}
              className={`w-7 h-7 rounded-md flex items-center justify-center text-xs font-bold transition-colors shrink-0 ${
                it.id === id
                  ? 'bg-slate-800 text-white'
                  : 'bg-gray-100 text-gray-400 hover:bg-gray-200 hover:text-gray-600'
              }`}
            >
              {it.id.toUpperCase()}
            </Link>
          ))}
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-5 space-y-6">

        {/* ══ 납기 이력  |  납기 KPI ①②③ ══ */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
          <RawDataTable
            title="1. 납기 이력"
            subtitle={`${item.deliveries.length}건 발주 기록`}
            columns={[
              { key: 'poNumber',    label: '발주번호' },
              { key: 'orderDate',   label: '발주일' },
              { key: 'plannedDate', label: '납기예정일' },
              { key: 'actualDate',  label: '실제입고일' },
            ]}
            rows={deliveryRows}
            note="리드타임 = 실제입고일 − 발주일 / 납기준수 = 실제입고일 ≤ 납기예정일 / CV = σ ÷ 평균 × 100"
          />
          <DeliveryCalcPanel defaults={{
            ltSum, ltN, avgLT, sigma, cv,
            onTimeN, otd, maxLT,
            lateN, avgDelayDays, maxDelay,
          }} />
        </div>

        {/* ══ 공급업체 현황  |  공급업체 KPI ④⑤⑥ ══ */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
          <RawDataTable
            title="2. 공급업체 현황"
            subtitle={`${item.suppliers.length}개 등록업체`}
            columns={[
              { key: 'name',          label: '공급업체명' },
              { key: 'annualAmount',  label: '거래금액(만원)', align: 'right' },
              { key: 'share',         label: '비중',           align: 'right' },
              { key: 'substitutable', label: '대체',           align: 'center' },
              { key: 'note',          label: '비고' },
            ]}
            rows={supplierRows}
            note="집중도 = 최대거래업체 ÷ 전체합계 × 100 / 대체가능 = Y 행 카운트"
          />
          <SupplierCalcPanel defaults={{
            supCount, totalAmt, maxAmt, topConc,
            subCount, subRatio, hhi,
          }} />
        </div>

        {/* ══ 구매 지출 현황  |  지출 KPI ⑦ ══ */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
          <RawDataTable
            title="3. 구매 지출 현황"
            subtitle="3개 연도 기준"
            columns={[
              { key: 'year',       label: '연도',             align: 'center' },
              { key: 'itemSpend',  label: '품목 구매금액',    align: 'right' },
              { key: 'totalSpend', label: '전사 총 구매금액', align: 'right' },
            ]}
            rows={spendRows}
            note="지출비중(%) = 품목 구매금액 ÷ 전사 총 구매금액 × 100"
          />
          <SpendCalcPanel defaults={{
            itemSpend:    latestSpend.itemSpend,
            totalSpend:   latestSpend.totalSpend,
            spendRatio,
            absSpend:     latestSpend.itemSpend,
            yoyGrowth,
            avgSpendRatio,
          }} />
        </div>

        {/* ══ 이 품목 분류 ══ */}
        <ItemActions itemId={id} />

        {/* ══ Prev / Next ══ */}
        <div className="flex gap-3 pt-2">
          {prevItem ? (
            <Link
              href={`/items/${prevItem.id}`}
              className="flex-1 flex items-center gap-2 py-3 px-4 rounded-xl bg-white border border-gray-200 hover:border-blue-200 transition-colors group"
            >
              <svg className="w-4 h-4 text-gray-400 group-hover:text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              <div>
                <p className="text-xs text-gray-400">이전</p>
                <p className="text-sm font-bold text-gray-700 group-hover:text-blue-700">
                  {prevItem.id.toUpperCase()} {prevItem.label}
                </p>
              </div>
            </Link>
          ) : <div className="flex-1" />}

          {nextItem ? (
            <Link
              href={`/items/${nextItem.id}`}
              className="flex-1 flex items-center justify-end gap-2 py-3 px-4 rounded-xl bg-white border border-gray-200 hover:border-blue-200 transition-colors group"
            >
              <div className="text-right">
                <p className="text-xs text-gray-400">다음</p>
                <p className="text-sm font-bold text-gray-700 group-hover:text-blue-700">
                  {nextItem.id.toUpperCase()} {nextItem.label}
                </p>
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
