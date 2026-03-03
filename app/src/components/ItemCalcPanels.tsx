'use client';

import { useState, useMemo } from 'react';

/* ─── shared types ─── */
type Risk = 'low' | 'mid' | 'high';

export interface DeliveryDefaults {
  ltSum: number; ltN: number; avgLT: number;
  sigma: number; cv: number;
  onTimeN: number; otd: number;
  maxLT: number; lateN: number; avgDelayDays: number; maxDelay: number;
}
export interface SupplierDefaults {
  supCount: number; totalAmt: number; maxAmt: number; topConc: number;
  subCount: number; subRatio: number; hhi: number;
}
export interface SpendDefaults {
  itemSpend: number; totalSpend: number; spendRatio: number;
  absSpend: number; yoyGrowth: number | null; avgSpendRatio: number;
}

/* ─── helpers ─── */
function fmt(n: number, dec = 1) {
  return Number.isInteger(n) ? n.toString() : n.toFixed(dec);
}
function n2s(n: number) { return fmt(n, 2); } // for initial input state

function RiskBadge({ risk, axis }: { risk: Risk; axis: 'supply' | 'profit' }) {
  const label = {
    low:  axis === 'supply' ? '공급위험 낮음' : '수익영향 낮음',
    mid:  '중간',
    high: axis === 'supply' ? '공급위험 높음' : '수익영향 높음',
  }[risk];
  const cls = {
    low:  axis === 'supply' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600',
    mid:  'bg-amber-100 text-amber-700',
    high: axis === 'supply' ? 'bg-red-100 text-red-700'        : 'bg-emerald-100 text-emerald-700',
  }[risk];
  return <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full whitespace-nowrap ${cls}`}>{label}</span>;
}

function KpiInput({ value, onChange, width = 'w-20' }: {
  value: string; onChange: (v: string) => void; width?: string;
}) {
  return (
    <input
      type="number" value={value} min="0" step="any"
      onChange={e => onChange(e.target.value)}
      className={`${width} px-1.5 py-1 border border-blue-200 rounded-md text-xs text-center focus:outline-none focus:border-blue-500 bg-blue-50/40 font-mono`}
    />
  );
}

const Op = ({ v }: { v: string }) => (
  <span className="text-gray-400 text-xs font-medium shrink-0">{v}</span>
);

/* ─── per-KPI row ─── */
function KpiRow({
  num, name, axis, formula, result, unit, risk, extra
}: {
  num: string; name: string; axis: 'supply' | 'profit';
  formula: React.ReactNode;
  result: number | null; unit: string; risk: Risk | null;
  extra?: string;
}) {
  const numCls = axis === 'supply' ? 'bg-red-100 text-red-700' : 'bg-emerald-100 text-emerald-700';
  return (
    <div className="py-3 border-b border-gray-100 last:border-0 space-y-1.5">
      {/* header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <span className={`text-[10px] font-black w-5 h-5 flex items-center justify-center rounded-full shrink-0 ${numCls}`}>{num}</span>
          <span className="text-xs font-bold text-gray-700">{name}</span>
        </div>
        <div className="flex items-center gap-1.5">
          {result !== null && (
            <span className="text-sm font-black text-gray-900 whitespace-nowrap">
              {fmt(result, unit === '일' ? 1 : unit === '%' ? 2 : 0)}{unit}
            </span>
          )}
          {result !== null && risk && <RiskBadge risk={risk} axis={axis} />}
        </div>
      </div>
      {/* formula row */}
      <div className="flex items-center gap-1 flex-wrap pl-6">
        {formula}
      </div>
      {extra && <p className="text-[10px] text-gray-400 pl-6">{extra}</p>}
    </div>
  );
}

/* ─── ref stat (read-only) ─── */
function RefStat({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="flex items-center justify-between py-1.5 border-b border-gray-50 last:border-0">
      <span className="text-xs text-gray-500">{label}</span>
      <div className="text-right">
        <span className="text-xs font-bold text-gray-700">{value}</span>
        {sub && <span className="text-[10px] text-gray-400 ml-1">{sub}</span>}
      </div>
    </div>
  );
}

/* ════════════════════════════════════════
   DeliveryCalcPanel  ①②③
════════════════════════════════════════ */
export function DeliveryCalcPanel({ defaults: d }: { defaults: DeliveryDefaults }) {
  // ① 평균 리드타임  — inputs: Σ리드타임, N
  const [ltSum, setLtSum] = useState(fmt(d.ltSum, 0));
  const [ltN,   setLtN]   = useState(fmt(d.ltN, 0));

  // ② OTD  — inputs: 준수건수, 전체건수
  const [okN,  setOkN]  = useState(fmt(d.onTimeN, 0));
  const [totN, setTotN] = useState(fmt(d.ltN, 0));

  // ③ CV  — inputs: σ (avgLT auto-linked from ①)
  const [sigma, setSigma] = useState(n2s(d.sigma));

  const avgLT = useMemo(() => {
    const s = +ltSum, n = +ltN;
    return s > 0 && n > 0 ? s / n : null;
  }, [ltSum, ltN]);

  const otd = useMemo(() => {
    const ok = +okN, tot = +totN;
    return ok >= 0 && tot > 0 ? (ok / tot) * 100 : null;
  }, [okN, totN]);

  const cv = useMemo(() => {
    const s = +sigma;
    return s >= 0 && avgLT !== null && avgLT > 0 ? (s / avgLT) * 100 : null;
  }, [sigma, avgLT]);

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden h-fit">
      <div className="px-4 py-2.5 bg-red-50 border-b border-red-100 flex items-center justify-between">
        <span className="text-sm font-bold text-red-800">납기 KPI</span>
        <span className="text-[11px] font-semibold text-red-400 bg-red-100 px-2 py-0.5 rounded-full">① ② ③ · 공급위험</span>
      </div>

      <div className="px-4">
        {/* ① */}
        <KpiRow
          num="①" name="평균 납기 리드타임" axis="supply"
          result={avgLT} unit="일"
          risk={avgLT === null ? null : avgLT <= 5 ? 'low' : avgLT <= 15 ? 'mid' : 'high'}
          extra="납기이력 테이블 → 각 건의 리드타임(실제입고일−발주일) 합산"
          formula={<>
            <KpiInput value={ltSum} onChange={setLtSum} width="w-20" />
            <Op v="일 ÷" />
            <KpiInput value={ltN} onChange={setLtN} width="w-14" />
            <Op v="건 =" />
            {avgLT !== null
              ? <span className="text-sm font-black text-gray-800">{avgLT.toFixed(1)}일</span>
              : <span className="text-xs text-gray-300">?</span>}
          </>}
        />

        {/* ② */}
        <KpiRow
          num="②" name="납기준수율 (OTD)" axis="supply"
          result={otd} unit="%"
          risk={otd === null ? null : otd >= 95 ? 'low' : otd >= 80 ? 'mid' : 'high'}
          extra="실제입고일 ≤ 납기예정일인 건 카운트"
          formula={<>
            <KpiInput value={okN} onChange={setOkN} width="w-14" />
            <Op v="건 ÷" />
            <KpiInput value={totN} onChange={setTotN} width="w-14" />
            <Op v="건 × 100 =" />
            {otd !== null
              ? <span className="text-sm font-black text-gray-800">{otd.toFixed(1)}%</span>
              : <span className="text-xs text-gray-300">?</span>}
          </>}
        />

        {/* ③ */}
        <KpiRow
          num="③" name="리드타임 변동계수 (CV)" axis="supply"
          result={cv} unit="%"
          risk={cv === null ? null : cv < 20 ? 'low' : cv < 40 ? 'mid' : 'high'}
          extra="σ = √[Σ(리드타임−평균)² ÷ N] · 계산기나 엑셀로 산출 후 입력"
          formula={<>
            <Op v="σ =" />
            <KpiInput value={sigma} onChange={setSigma} width="w-16" />
            <Op v="일 ÷" />
            <span className="text-xs font-bold text-blue-600 whitespace-nowrap">
              {avgLT !== null ? `${avgLT.toFixed(1)}일①` : '①입력'}
            </span>
            <Op v="× 100 =" />
            {cv !== null
              ? <span className="text-sm font-black text-gray-800">{cv.toFixed(1)}%</span>
              : <span className="text-xs text-gray-300">?</span>}
          </>}
        />
      </div>

      {/* 참고 지표 */}
      <div className="mx-4 mt-1 mb-3 rounded-lg bg-gray-50 border border-gray-100 px-3 py-2">
        <p className="text-[10px] font-bold text-gray-400 mb-1.5 uppercase tracking-wider">참고 지표</p>
        <RefStat label="최대 리드타임" value={`${d.maxLT}일`} />
        <RefStat label="지연 발생 건수" value={`${d.lateN}건`} sub={`전체 ${d.ltN}건 중`} />
        <RefStat label="지연 시 평균 초과일" value={d.lateN > 0 ? `${d.avgDelayDays.toFixed(1)}일` : '—'} />
        <RefStat label="최대 지연일수" value={d.maxDelay > 0 ? `${d.maxDelay}일` : '—'} />
      </div>
    </div>
  );
}

/* ════════════════════════════════════════
   SupplierCalcPanel  ④⑤⑥
════════════════════════════════════════ */
export function SupplierCalcPanel({ defaults: d }: { defaults: SupplierDefaults }) {
  // ④ 공급업체 수
  const [cnt, setCnt] = useState(fmt(d.supCount, 0));

  // ⑤ 1위 집중도
  const [maxA,  setMaxA]  = useState(fmt(d.maxAmt, 0));
  const [totA,  setTotA]  = useState(fmt(d.totalAmt, 0));

  // ⑥ 대체 가능 업체 수
  const [sub, setSub] = useState(fmt(d.subCount, 0));

  const conc = useMemo(() => {
    const m = +maxA, t = +totA;
    return m >= 0 && t > 0 ? (m / t) * 100 : null;
  }, [maxA, totA]);

  const subRatioCalc = useMemo(() => {
    const s = +sub, c = +cnt;
    return s >= 0 && c > 0 ? (s / c) * 100 : null;
  }, [sub, cnt]);

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden h-fit">
      <div className="px-4 py-2.5 bg-red-50 border-b border-red-100 flex items-center justify-between">
        <span className="text-sm font-bold text-red-800">공급업체 KPI</span>
        <span className="text-[11px] font-semibold text-red-400 bg-red-100 px-2 py-0.5 rounded-full">④ ⑤ ⑥ · 공급위험</span>
      </div>

      <div className="px-4">
        {/* ④ */}
        <KpiRow
          num="④" name="등록 공급업체 수" axis="supply"
          result={+cnt || null} unit="개"
          risk={!cnt ? null : +cnt >= 5 ? 'low' : +cnt >= 3 ? 'mid' : 'high'}
          extra="공급업체 현황 테이블의 행 수"
          formula={<>
            <KpiInput value={cnt} onChange={setCnt} width="w-16" />
            <Op v="개" />
          </>}
        />

        {/* ⑤ */}
        <KpiRow
          num="⑤" name="1위 공급업체 집중도" axis="supply"
          result={conc} unit="%"
          risk={conc === null ? null : conc < 30 ? 'low' : conc < 70 ? 'mid' : 'high'}
          extra="비중 컬럼 최고값; 또는 최대거래금액 ÷ 전체합계 × 100"
          formula={<>
            <KpiInput value={maxA} onChange={setMaxA} width="w-24" />
            <Op v="÷" />
            <KpiInput value={totA} onChange={setTotA} width="w-24" />
            <Op v="× 100 =" />
            {conc !== null
              ? <span className="text-sm font-black text-gray-800">{conc.toFixed(1)}%</span>
              : <span className="text-xs text-gray-300">?</span>}
          </>}
        />

        {/* ⑥ */}
        <KpiRow
          num="⑥" name="대체 가능 업체 수" axis="supply"
          result={+sub >= 0 && sub !== '' ? +sub : null} unit="개"
          risk={sub === '' ? null : +sub >= 3 ? 'low' : +sub >= 1 ? 'mid' : 'high'}
          extra="대체 컬럼에서 Y인 행 카운트"
          formula={<>
            <KpiInput value={sub} onChange={setSub} width="w-16" />
            <Op v="개" />
            {subRatioCalc !== null && (
              <span className="text-[11px] text-gray-400 whitespace-nowrap">
                (전체의 {subRatioCalc.toFixed(0)}%)
              </span>
            )}
          </>}
        />
      </div>

      {/* 참고 지표 */}
      <div className="mx-4 mt-1 mb-3 rounded-lg bg-gray-50 border border-gray-100 px-3 py-2">
        <p className="text-[10px] font-bold text-gray-400 mb-1.5 uppercase tracking-wider">참고 지표</p>
        <RefStat label="대체가능 비율" value={`${d.subRatio.toFixed(1)}%`} sub={`${d.subCount}/${d.supCount}개`} />
        <RefStat label="전체 거래금액 합계" value={`${(d.totalAmt / 10000).toFixed(1)}억원`} />
        <RefStat
          label="HHI 지수"
          value={d.hhi.toFixed(0)}
          sub={d.hhi >= 2500 ? '고집중' : d.hhi >= 1500 ? '중집중' : '저집중'}
        />
      </div>
    </div>
  );
}

/* ════════════════════════════════════════
   SpendCalcPanel  ⑦
════════════════════════════════════════ */
export function SpendCalcPanel({ defaults: d }: { defaults: SpendDefaults }) {
  const [itemSpend,  setItemSpend]  = useState(n2s(d.itemSpend));
  const [totalSpend, setTotalSpend] = useState(n2s(d.totalSpend));

  const ratio = useMemo(() => {
    const i = +itemSpend, t = +totalSpend;
    return i >= 0 && t > 0 ? (i / t) * 100 : null;
  }, [itemSpend, totalSpend]);

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden h-fit">
      <div className="px-4 py-2.5 bg-emerald-50 border-b border-emerald-100 flex items-center justify-between">
        <span className="text-sm font-bold text-emerald-800">지출 KPI</span>
        <span className="text-[11px] font-semibold text-emerald-600 bg-emerald-100 px-2 py-0.5 rounded-full">⑦ · 수익영향</span>
      </div>

      <div className="px-4">
        {/* ⑦ */}
        <KpiRow
          num="⑦" name="구매 지출 비중" axis="profit"
          result={ratio} unit="%"
          risk={ratio === null ? null : ratio < 2 ? 'low' : ratio < 10 ? 'mid' : 'high'}
          extra="구매 지출 현황 테이블 → 최근 연도 기준"
          formula={<>
            <KpiInput value={itemSpend} onChange={setItemSpend} width="w-20" />
            <Op v="억 ÷" />
            <KpiInput value={totalSpend} onChange={setTotalSpend} width="w-20" />
            <Op v="억 × 100 =" />
            {ratio !== null
              ? <span className="text-sm font-black text-gray-800">{ratio.toFixed(2)}%</span>
              : <span className="text-xs text-gray-300">?</span>}
          </>}
        />
        {ratio !== null && (
          <div className="pb-3 pl-6">
            <div className="bg-gray-100 rounded-full h-1.5 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${ratio >= 10 ? 'bg-emerald-500' : ratio >= 2 ? 'bg-amber-400' : 'bg-gray-400'}`}
                style={{ width: `${Math.min(ratio * 5, 100)}%` }}
              />
            </div>
            <div className="flex justify-between text-[9px] text-gray-400 mt-0.5">
              <span>0%</span><span className="text-amber-500">2%</span><span className="text-emerald-600">10%+</span>
            </div>
          </div>
        )}
      </div>

      {/* 참고 지표 */}
      <div className="mx-4 mt-1 mb-3 rounded-lg bg-gray-50 border border-gray-100 px-3 py-2">
        <p className="text-[10px] font-bold text-gray-400 mb-1.5 uppercase tracking-wider">참고 지표</p>
        <RefStat label="최근 연도 절대 지출액" value={`${d.absSpend.toFixed(2)}억원`} />
        <RefStat
          label="전년 대비 증가율"
          value={d.yoyGrowth !== null ? `${d.yoyGrowth > 0 ? '+' : ''}${d.yoyGrowth.toFixed(1)}%` : '—'}
        />
        <RefStat label="3년 평균 지출 비중" value={`${d.avgSpendRatio.toFixed(2)}%`} />
      </div>
    </div>
  );
}
