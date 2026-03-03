'use client';

import { useState, useMemo, useRef } from 'react';

/* ─── Shared types & helpers ─── */
type Risk = 'low' | 'mid' | 'high';

function RiskBadge({ risk, axis }: { risk: Risk; axis: 'supply' | 'profit' }) {
  const label =
    axis === 'supply'
      ? { low: '낮음', mid: '중간', high: '높음' }[risk]
      : { low: '낮음', mid: '중간', high: '높음' }[risk];
  const cls = {
    low:  axis === 'supply' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600',
    mid:  'bg-amber-100 text-amber-700',
    high: axis === 'supply' ? 'bg-red-100 text-red-700'       : 'bg-emerald-100 text-emerald-700',
  }[risk];
  return <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full whitespace-nowrap ${cls}`}>{label}</span>;
}

function KpiRow({ num, label, value, risk, axis, sub }: {
  num: string; label: string; value: string;
  risk: Risk; axis: 'supply' | 'profit'; sub?: string;
}) {
  const numCls = axis === 'supply' ? 'bg-red-100 text-red-700' : 'bg-emerald-100 text-emerald-700';
  return (
    <div className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
      <div className="flex items-center gap-1.5 min-w-0">
        <span className={`shrink-0 text-[10px] font-black w-5 h-5 flex items-center justify-center rounded-full ${numCls}`}>{num}</span>
        <div className="min-w-0">
          <p className="text-xs font-medium text-gray-700 truncate">{label}</p>
          {sub && <p className="text-[10px] text-gray-400">{sub}</p>}
        </div>
      </div>
      <div className="flex items-center gap-1.5 shrink-0 ml-2">
        <span className="text-sm font-bold text-gray-900">{value}</span>
        <RiskBadge risk={risk} axis={axis} />
      </div>
    </div>
  );
}

function NumInput({ value, onChange, placeholder }: {
  value: string; onChange: (v: string) => void; placeholder: string;
}) {
  return (
    <input
      type="number"
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      min="0"
      step="any"
      className="w-full px-2 py-1.5 border border-gray-200 rounded-lg text-xs focus:outline-none focus:border-blue-400 bg-white"
    />
  );
}

/* ════════════════════════════════════════
   DeliveryCalcPanel  ①②③
════════════════════════════════════════ */
type DRow = { id: number; lt: string; onTime: boolean };

export function DeliveryCalcPanel() {
  const idRef = useRef(10);
  const [rows, setRows] = useState<DRow[]>([
    { id: 1, lt: '', onTime: true },
    { id: 2, lt: '', onTime: true },
    { id: 3, lt: '', onTime: true },
  ]);

  const addRow = () => setRows(r => [...r, { id: ++idRef.current, lt: '', onTime: true }]);
  const delRow = (id: number) => setRows(r => r.filter(x => x.id !== id));
  const update = (id: number, patch: Partial<DRow>) =>
    setRows(r => r.map(x => x.id === id ? { ...x, ...patch } : x));

  const calc = useMemo(() => {
    const v = rows.filter(r => r.lt !== '' && !isNaN(+r.lt) && +r.lt > 0);
    if (!v.length) return null;
    const lts = v.map(r => +r.lt);
    const avg = lts.reduce((a, b) => a + b) / lts.length;
    const sigma = Math.sqrt(lts.reduce((a, b) => a + (b - avg) ** 2, 0) / lts.length);
    const cv = avg > 0 ? (sigma / avg) * 100 : 0;
    const otd = (v.filter(r => r.onTime).length / v.length) * 100;
    return { avg, sigma, cv, otd, n: v.length };
  }, [rows]);

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden h-fit">
      <div className="px-4 py-3 bg-red-50 border-b border-red-100 flex items-center justify-between">
        <span className="text-sm font-bold text-red-800">납기 KPI 계산</span>
        <span className="text-xs font-semibold text-red-400 bg-red-100 px-2 py-0.5 rounded-full">① ② ③ 공급위험</span>
      </div>

      <div className="p-3 space-y-2">
        {/* Column headers */}
        <div className="grid grid-cols-[1fr_4rem_1.25rem] gap-1.5 px-0.5">
          <p className="text-[10px] text-gray-400 font-semibold">리드타임 (일)</p>
          <p className="text-[10px] text-gray-400 font-semibold text-center">납기준수</p>
          <span />
        </div>

        {/* Input rows */}
        <div className="space-y-1.5">
          {rows.map((row, i) => (
            <div key={row.id} className="grid grid-cols-[1fr_4rem_1.25rem] gap-1.5 items-center">
              <NumInput
                value={row.lt}
                onChange={v => update(row.id, { lt: v })}
                placeholder={`${i + 1}번 건`}
              />
              <button
                onClick={() => update(row.id, { onTime: !row.onTime })}
                className={`h-7 rounded-lg text-[11px] font-bold cursor-pointer transition-colors ${
                  row.onTime
                    ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
                    : 'bg-red-100 text-red-600 hover:bg-red-200'
                }`}
              >
                {row.onTime ? '준수' : '지연'}
              </button>
              {rows.length > 1
                ? <button onClick={() => delRow(row.id)} className="text-gray-300 hover:text-red-400 cursor-pointer text-sm leading-none text-center">×</button>
                : <span />
              }
            </div>
          ))}
        </div>

        <button
          onClick={addRow}
          className="w-full py-1 border border-dashed border-gray-200 rounded-lg text-[11px] text-gray-400 hover:border-red-300 hover:text-red-500 transition-colors cursor-pointer"
        >
          + 행 추가
        </button>

        {/* Results */}
        {calc ? (
          <div className="border-t border-gray-100 pt-2 space-y-0.5">
            <p className="text-[10px] text-gray-400 font-semibold mb-1">{calc.n}건 기준 계산 결과</p>
            <KpiRow num="①" label="평균 리드타임" value={`${calc.avg.toFixed(1)}일`}
              risk={calc.avg <= 5 ? 'low' : calc.avg <= 15 ? 'mid' : 'high'} axis="supply" />
            <KpiRow num="②" label="납기준수율" value={`${calc.otd.toFixed(1)}%`}
              risk={calc.otd >= 95 ? 'low' : calc.otd >= 80 ? 'mid' : 'high'} axis="supply"
              sub={`${Math.round(calc.otd * calc.n / 100)} / ${calc.n}건 준수`} />
            <KpiRow num="③" label="리드타임 CV" value={`${calc.cv.toFixed(1)}%`}
              risk={calc.cv < 20 ? 'low' : calc.cv < 40 ? 'mid' : 'high'} axis="supply"
              sub={`σ = ${calc.sigma.toFixed(2)}일`} />
          </div>
        ) : (
          <p className="text-[11px] text-gray-300 text-center py-2">리드타임 입력 시 자동 계산</p>
        )}
      </div>
    </div>
  );
}

/* ════════════════════════════════════════
   SupplierCalcPanel  ④⑤⑥
════════════════════════════════════════ */
type SRow = { id: number; amount: string; sub: 'Y' | '△' | 'N' };

export function SupplierCalcPanel() {
  const idRef = useRef(20);
  const [rows, setRows] = useState<SRow[]>([{ id: 1, amount: '', sub: 'Y' }]);

  const addRow = () => setRows(r => [...r, { id: ++idRef.current, amount: '', sub: 'Y' }]);
  const delRow = (id: number) => setRows(r => r.filter(x => x.id !== id));
  const update = (id: number, patch: Partial<SRow>) =>
    setRows(r => r.map(x => x.id === id ? { ...x, ...patch } : x));

  const calc = useMemo(() => {
    const v = rows.filter(r => r.amount !== '' && !isNaN(+r.amount) && +r.amount > 0);
    if (!v.length) return null;
    const amounts = v.map(r => +r.amount);
    const total = amounts.reduce((a, b) => a + b);
    const conc = (Math.max(...amounts) / total) * 100;
    const subCount = v.filter(r => r.sub === 'Y').length;
    return { count: v.length, conc, subCount, total };
  }, [rows]);

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden h-fit">
      <div className="px-4 py-3 bg-red-50 border-b border-red-100 flex items-center justify-between">
        <span className="text-sm font-bold text-red-800">공급업체 KPI 계산</span>
        <span className="text-xs font-semibold text-red-400 bg-red-100 px-2 py-0.5 rounded-full">④ ⑤ ⑥ 공급위험</span>
      </div>

      <div className="p-3 space-y-2">
        {/* Column headers */}
        <div className="grid grid-cols-[1fr_3rem_1.25rem] gap-1.5 px-0.5">
          <p className="text-[10px] text-gray-400 font-semibold">거래금액 (만원)</p>
          <p className="text-[10px] text-gray-400 font-semibold text-center">대체</p>
          <span />
        </div>

        <div className="space-y-1.5">
          {rows.map(row => (
            <div key={row.id} className="grid grid-cols-[1fr_3rem_1.25rem] gap-1.5 items-center">
              <NumInput
                value={row.amount}
                onChange={v => update(row.id, { amount: v })}
                placeholder="만원"
              />
              <select
                value={row.sub}
                onChange={e => update(row.id, { sub: e.target.value as 'Y' | '△' | 'N' })}
                className="h-7 border border-gray-200 rounded-lg text-xs focus:outline-none focus:border-red-400 bg-white text-center"
              >
                <option value="Y">Y</option>
                <option value="△">△</option>
                <option value="N">N</option>
              </select>
              {rows.length > 1
                ? <button onClick={() => delRow(row.id)} className="text-gray-300 hover:text-red-400 cursor-pointer text-sm leading-none text-center">×</button>
                : <span />
              }
            </div>
          ))}
        </div>

        <button
          onClick={addRow}
          className="w-full py-1 border border-dashed border-gray-200 rounded-lg text-[11px] text-gray-400 hover:border-red-300 hover:text-red-500 transition-colors cursor-pointer"
        >
          + 행 추가
        </button>

        {calc ? (
          <div className="border-t border-gray-100 pt-2 space-y-0.5">
            <p className="text-[10px] text-gray-400 font-semibold mb-1">계산 결과</p>
            <KpiRow num="④" label="등록 공급업체 수" value={`${calc.count}개`}
              risk={calc.count >= 5 ? 'low' : calc.count >= 3 ? 'mid' : 'high'} axis="supply" />
            <KpiRow num="⑤" label="1위 집중도" value={`${calc.conc.toFixed(1)}%`}
              risk={calc.conc < 30 ? 'low' : calc.conc < 70 ? 'mid' : 'high'} axis="supply"
              sub={`합계 ${calc.total.toLocaleString()}만원`} />
            <KpiRow num="⑥" label="대체 가능 업체" value={`${calc.subCount}개`}
              risk={calc.subCount >= 3 ? 'low' : calc.subCount >= 1 ? 'mid' : 'high'} axis="supply" />
          </div>
        ) : (
          <p className="text-[11px] text-gray-300 text-center py-2">거래금액 입력 시 자동 계산</p>
        )}
      </div>
    </div>
  );
}

/* ════════════════════════════════════════
   SpendCalcPanel  ⑦
════════════════════════════════════════ */
export function SpendCalcPanel() {
  const [itemSpend,  setItemSpend]  = useState('');
  const [totalSpend, setTotalSpend] = useState('');

  const calc = useMemo(() => {
    const item = +itemSpend, tot = +totalSpend;
    if (!itemSpend || !totalSpend || isNaN(item) || isNaN(tot) || tot <= 0) return null;
    return { ratio: (item / tot) * 100 };
  }, [itemSpend, totalSpend]);

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden h-fit">
      <div className="px-4 py-3 bg-emerald-50 border-b border-emerald-100 flex items-center justify-between">
        <span className="text-sm font-bold text-emerald-800">지출 KPI 계산</span>
        <span className="text-xs font-semibold text-emerald-600 bg-emerald-100 px-2 py-0.5 rounded-full">⑦ 수익영향</span>
      </div>

      <div className="p-3 space-y-2.5">
        <div>
          <p className="text-[10px] text-gray-400 font-semibold mb-1">품목 구매금액 (억원)</p>
          <input
            type="number" value={itemSpend}
            onChange={e => setItemSpend(e.target.value)}
            placeholder="예: 12.0" min="0" step="0.01"
            className="w-full px-2.5 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-emerald-400 bg-white"
          />
        </div>
        <div>
          <p className="text-[10px] text-gray-400 font-semibold mb-1">전사 총 구매금액 (억원)</p>
          <input
            type="number" value={totalSpend}
            onChange={e => setTotalSpend(e.target.value)}
            placeholder="예: 150.0" min="0" step="0.1"
            className="w-full px-2.5 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-emerald-400 bg-white"
          />
        </div>

        {calc ? (
          <div className="border-t border-gray-100 pt-2.5 space-y-0.5">
            <p className="text-[10px] text-gray-400 font-semibold mb-1">계산 결과</p>
            <KpiRow num="⑦" label="지출 비중" value={`${calc.ratio.toFixed(2)}%`}
              risk={calc.ratio < 2 ? 'low' : calc.ratio < 10 ? 'mid' : 'high'} axis="profit"
              sub="수익영향(Profit Impact) 축 지표" />
            <div className="mt-2 bg-gray-100 rounded-full h-2 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${
                  calc.ratio >= 10 ? 'bg-emerald-500' : calc.ratio >= 2 ? 'bg-amber-400' : 'bg-gray-400'
                }`}
                style={{ width: `${Math.min(calc.ratio * 5, 100)}%` }}
              />
            </div>
            <div className="flex justify-between text-[9px] text-gray-400 mt-0.5">
              <span>0%</span>
              <span className="text-amber-500">2%</span>
              <span className="text-emerald-600">10%+</span>
            </div>
          </div>
        ) : (
          <p className="text-[11px] text-gray-300 text-center py-1">금액 입력 시 자동 계산</p>
        )}
      </div>
    </div>
  );
}
