'use client';

import { useState, useMemo, useRef } from 'react';

type Tab = 'delivery' | 'supplier' | 'spend';

interface DeliveryRow { id: number; lt: string; onTime: boolean }
interface SupplierRow { id: number; name: string; amount: string; sub: 'Y' | '△' | 'N' }

type RiskLevel = 'low' | 'mid' | 'high';
type Axis = 'supply' | 'profit';

const RISK_INFO: Record<RiskLevel, Record<Axis, { label: string; cls: string }>> = {
  low:  { supply: { label: '공급위험 낮음', cls: 'bg-emerald-100 text-emerald-700' }, profit: { label: '수익영향 낮음',  cls: 'bg-slate-100 text-slate-600'    } },
  mid:  { supply: { label: '중간',          cls: 'bg-amber-100 text-amber-700'   }, profit: { label: '수익영향 중간',  cls: 'bg-amber-100 text-amber-700'   } },
  high: { supply: { label: '공급위험 높음', cls: 'bg-red-100 text-red-700'       }, profit: { label: '수익영향 높음',  cls: 'bg-emerald-100 text-emerald-700' } },
};

function riskBg(level: RiskLevel) {
  return { low: 'border-emerald-200 bg-emerald-50/40', mid: 'border-amber-200 bg-amber-50/40', high: 'border-red-200 bg-red-50/40' }[level];
}

/* ── Result card ── */
function ResultCard({ num, label, value, risk, axis, sub }: {
  num: string; label: string; value: string;
  risk: RiskLevel; axis: Axis; sub?: string;
}) {
  const ri = RISK_INFO[risk][axis];
  const numCls = axis === 'supply' ? 'bg-red-100 text-red-700' : 'bg-emerald-100 text-emerald-700';
  return (
    <div className={`flex items-center justify-between px-3 py-2.5 rounded-lg border ${riskBg(risk)}`}>
      <div className="flex items-center gap-2 min-w-0">
        <span className={`shrink-0 text-[10px] font-black w-5 h-5 flex items-center justify-center rounded-full ${numCls}`}>{num}</span>
        <div className="min-w-0">
          <p className="text-xs font-semibold text-gray-700 truncate">{label}</p>
          {sub && <p className="text-[10px] text-gray-400">{sub}</p>}
        </div>
      </div>
      <div className="flex items-center gap-1.5 shrink-0 ml-2">
        <span className="text-sm font-bold text-gray-800">{value}</span>
        <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full whitespace-nowrap ${ri.cls}`}>{ri.label}</span>
      </div>
    </div>
  );
}

/* ── Input helpers ── */
function TextInput({ value, onChange, placeholder, type = 'text' }: {
  value: string; onChange: (v: string) => void; placeholder: string; type?: string;
}) {
  return (
    <input
      type={type}
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      min="0"
      step="any"
      className="w-full px-2 py-1.5 border border-gray-200 rounded-lg text-xs focus:outline-none focus:border-blue-400 bg-white"
    />
  );
}

/* ══════════════════════════════════════════
   Main Component
══════════════════════════════════════════ */
export default function KpiCalculator() {
  const [tab, setTab] = useState<Tab>('delivery');
  const idRef = useRef(10);
  const nextId = () => ++idRef.current;

  /* ── Tab 1: Delivery ── */
  const [dRows, setDRows] = useState<DeliveryRow[]>([
    { id: 1, lt: '', onTime: true },
    { id: 2, lt: '', onTime: true },
    { id: 3, lt: '', onTime: true },
  ]);
  const addDRow = () => setDRows(r => [...r, { id: nextId(), lt: '', onTime: true }]);
  const delDRow = (id: number) => setDRows(r => r.filter(x => x.id !== id));
  const updateD = (id: number, patch: Partial<DeliveryRow>) =>
    setDRows(rows => rows.map(r => r.id === id ? { ...r, ...patch } : r));

  const dc = useMemo(() => {
    const v = dRows.filter(r => r.lt !== '' && !isNaN(+r.lt) && +r.lt > 0);
    if (!v.length) return null;
    const lts = v.map(r => +r.lt);
    const avg = lts.reduce((a, b) => a + b) / lts.length;
    const sigma = Math.sqrt(lts.reduce((a, b) => a + (b - avg) ** 2, 0) / lts.length);
    const cv = avg > 0 ? (sigma / avg) * 100 : 0;
    const otd = (v.filter(r => r.onTime).length / v.length) * 100;
    return { avg, sigma, cv, otd, n: v.length };
  }, [dRows]);

  /* ── Tab 2: Supplier ── */
  const [sRows, setSRows] = useState<SupplierRow[]>([
    { id: 4, name: '', amount: '', sub: 'Y' },
  ]);
  const addSRow = () => setSRows(r => [...r, { id: nextId(), name: '', amount: '', sub: 'Y' }]);
  const delSRow = (id: number) => setSRows(r => r.filter(x => x.id !== id));
  const updateS = (id: number, patch: Partial<SupplierRow>) =>
    setSRows(rows => rows.map(r => r.id === id ? { ...r, ...patch } : r));

  const sc = useMemo(() => {
    const v = sRows.filter(r => r.amount !== '' && !isNaN(+r.amount) && +r.amount > 0);
    if (!v.length) return null;
    const amounts = v.map(r => +r.amount);
    const total = amounts.reduce((a, b) => a + b);
    const conc = (Math.max(...amounts) / total) * 100;
    const subCount = v.filter(r => r.sub === 'Y').length;
    return { count: v.length, conc, subCount, total };
  }, [sRows]);

  /* ── Tab 3: Spend ── */
  const [itemSpend, setItemSpend] = useState('');
  const [totalSpend, setTotalSpend] = useState('');
  const spc = useMemo(() => {
    const item = +itemSpend, tot = +totalSpend;
    if (!itemSpend || !totalSpend || isNaN(item) || isNaN(tot) || tot <= 0) return null;
    return { ratio: (item / tot) * 100 };
  }, [itemSpend, totalSpend]);

  /* ── Tabs config ── */
  const TABS = [
    { id: 'delivery' as Tab, label: '납기이력', kpis: '① ② ③', color: 'red',     desc: '리드타임 · 납기준수율 · CV' },
    { id: 'supplier' as Tab, label: '공급업체', kpis: '④ ⑤ ⑥', color: 'red',     desc: '업체수 · 집중도 · 대체가능' },
    { id: 'spend'    as Tab, label: '지출비중', kpis: '⑦',       color: 'emerald', desc: '수익영향 축 지표' },
  ];

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
      {/* Tab bar */}
      <div className="grid grid-cols-3 border-b border-gray-200">
        {TABS.map(t => {
          const active = tab === t.id;
          const activeStyle = t.color === 'red'
            ? 'bg-red-50 text-red-700 border-b-2 border-red-500'
            : 'bg-emerald-50 text-emerald-700 border-b-2 border-emerald-500';
          return (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`py-3 px-2 text-center transition-colors cursor-pointer ${active ? activeStyle : 'text-gray-500 hover:bg-gray-50'}`}
            >
              <div className="text-xs font-bold">{t.label}</div>
              <div className={`text-[10px] mt-0.5 ${active ? (t.color === 'red' ? 'text-red-400' : 'text-emerald-400') : 'text-gray-400'}`}>
                KPI {t.kpis}
              </div>
            </button>
          );
        })}
      </div>

      <div className="p-4 space-y-3">

        {/* ════════ TAB 1: DELIVERY ════════ */}
        {tab === 'delivery' && <>
          <div className="bg-red-50 border border-red-100 rounded-lg px-3 py-2.5">
            <p className="text-[11px] font-semibold text-red-500 mb-1">입력 방법</p>
            <p className="text-xs text-red-700 leading-relaxed">
              납기이력 테이블에서 각 발주건의 <strong>리드타임</strong>(발주일 → 실제입고일 차이, 일 단위)과
              납기 준수 여부(실제입고일 ≤ 납기예정일)를 입력하세요.
            </p>
          </div>

          {/* Column headers */}
          <div className="grid grid-cols-[1.5rem_1fr_5.5rem_1.5rem] gap-2 text-[10px] font-semibold text-gray-400 px-0.5">
            <span className="text-center">#</span>
            <span>리드타임 (발주→입고, 일)</span>
            <span className="text-center">납기 준수</span>
            <span />
          </div>

          <div className="space-y-1.5">
            {dRows.map((row, i) => (
              <div key={row.id} className="grid grid-cols-[1.5rem_1fr_5.5rem_1.5rem] gap-2 items-center">
                <span className="text-[11px] text-gray-400 text-center">{i + 1}</span>
                <TextInput
                  type="number"
                  value={row.lt}
                  onChange={v => updateD(row.id, { lt: v })}
                  placeholder="예: 7"
                />
                <button
                  onClick={() => updateD(row.id, { onTime: !row.onTime })}
                  className={`h-8 rounded-lg text-[11px] font-semibold cursor-pointer transition-colors ${
                    row.onTime ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200' : 'bg-red-100 text-red-600 hover:bg-red-200'
                  }`}
                >
                  {row.onTime ? '✓ 준수' : '✗ 지연'}
                </button>
                {dRows.length > 1
                  ? <button onClick={() => delDRow(row.id)} className="text-gray-300 hover:text-red-400 cursor-pointer text-base leading-none text-center">×</button>
                  : <span />
                }
              </div>
            ))}
          </div>

          <button
            onClick={addDRow}
            className="w-full py-1.5 border-2 border-dashed border-gray-200 rounded-lg text-xs text-gray-400 hover:border-red-300 hover:text-red-500 transition-colors cursor-pointer"
          >
            + 행 추가
          </button>

          {dc && (
            <div className="space-y-2 pt-1">
              <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">계산 결과 ({dc.n}건 기준)</p>
              <ResultCard num="①" label="평균 납기 리드타임" value={`${dc.avg.toFixed(1)}일`}
                risk={dc.avg <= 5 ? 'low' : dc.avg <= 15 ? 'mid' : 'high'} axis="supply" />
              <ResultCard num="②" label="납기준수율" value={`${dc.otd.toFixed(1)}%`}
                risk={dc.otd >= 95 ? 'low' : dc.otd >= 80 ? 'mid' : 'high'} axis="supply"
                sub={`${dc.n}건 중 ${Math.round(dc.otd * dc.n / 100)}건 준수`} />
              <ResultCard num="③" label="리드타임 변동계수 (CV)" value={`${dc.cv.toFixed(1)}%`}
                risk={dc.cv < 20 ? 'low' : dc.cv < 40 ? 'mid' : 'high'} axis="supply"
                sub={`표준편차 σ = ${dc.sigma.toFixed(2)}일`} />
            </div>
          )}
        </>}

        {/* ════════ TAB 2: SUPPLIER ════════ */}
        {tab === 'supplier' && <>
          <div className="bg-red-50 border border-red-100 rounded-lg px-3 py-2.5">
            <p className="text-[11px] font-semibold text-red-500 mb-1">입력 방법</p>
            <p className="text-xs text-red-700 leading-relaxed">
              공급업체 현황 테이블에서 각 업체의 <strong>연간 거래금액(만원)</strong>과
              <strong> 대체 가능 여부(Y/△/N)</strong>를 입력하세요.
            </p>
          </div>

          {/* Column headers */}
          <div className="grid grid-cols-[1.5rem_1fr_1fr_3rem_1.5rem] gap-1.5 text-[10px] font-semibold text-gray-400 px-0.5">
            <span className="text-center">#</span>
            <span>업체명 (선택)</span>
            <span>연간 금액 (만원)</span>
            <span className="text-center">대체</span>
            <span />
          </div>

          <div className="space-y-1.5">
            {sRows.map((row, i) => (
              <div key={row.id} className="grid grid-cols-[1.5rem_1fr_1fr_3rem_1.5rem] gap-1.5 items-center">
                <span className="text-[11px] text-gray-400 text-center">{i + 1}</span>
                <TextInput value={row.name} onChange={v => updateS(row.id, { name: v })} placeholder="A사" />
                <TextInput type="number" value={row.amount} onChange={v => updateS(row.id, { amount: v })} placeholder="예: 480000" />
                <select
                  value={row.sub}
                  onChange={e => updateS(row.id, { sub: e.target.value as 'Y' | '△' | 'N' })}
                  className="h-8 px-1 border border-gray-200 rounded-lg text-xs focus:outline-none focus:border-red-400 bg-white text-center"
                >
                  <option value="Y">Y</option>
                  <option value="△">△</option>
                  <option value="N">N</option>
                </select>
                {sRows.length > 1
                  ? <button onClick={() => delSRow(row.id)} className="text-gray-300 hover:text-red-400 cursor-pointer text-base leading-none text-center">×</button>
                  : <span />
                }
              </div>
            ))}
          </div>

          <button
            onClick={addSRow}
            className="w-full py-1.5 border-2 border-dashed border-gray-200 rounded-lg text-xs text-gray-400 hover:border-red-300 hover:text-red-500 transition-colors cursor-pointer"
          >
            + 행 추가
          </button>

          {sc && (
            <div className="space-y-2 pt-1">
              <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">계산 결과</p>
              <ResultCard num="④" label="등록 공급업체 수" value={`${sc.count}개`}
                risk={sc.count >= 5 ? 'low' : sc.count >= 3 ? 'mid' : 'high'} axis="supply" />
              <ResultCard num="⑤" label="1위 공급업체 집중도" value={`${sc.conc.toFixed(1)}%`}
                risk={sc.conc < 30 ? 'low' : sc.conc < 70 ? 'mid' : 'high'} axis="supply"
                sub={`총 거래금액 ${sc.total.toLocaleString()}만원`} />
              <ResultCard num="⑥" label="대체 가능 업체 수" value={`${sc.subCount}개`}
                risk={sc.subCount >= 3 ? 'low' : sc.subCount >= 1 ? 'mid' : 'high'} axis="supply" />
            </div>
          )}
        </>}

        {/* ════════ TAB 3: SPEND ════════ */}
        {tab === 'spend' && <>
          <div className="bg-emerald-50 border border-emerald-100 rounded-lg px-3 py-2.5">
            <p className="text-[11px] font-semibold text-emerald-600 mb-1">입력 방법</p>
            <p className="text-xs text-emerald-700 leading-relaxed">
              구매 지출 현황 테이블에서 <strong>해당 품목 구매금액</strong>과
              <strong> 전사 총 구매금액</strong>(억원 단위)을 입력하세요.
              최근 연도 값을 기준으로 계산하세요.
            </p>
          </div>

          <div className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                품목 구매금액 <span className="font-normal text-gray-400">(억원)</span>
              </label>
              <div className="relative">
                <input
                  type="number"
                  value={itemSpend}
                  onChange={e => setItemSpend(e.target.value)}
                  placeholder="예: 12.0"
                  min="0"
                  step="0.1"
                  className="w-full px-3 py-2.5 pr-14 border-2 border-gray-200 rounded-lg text-sm focus:outline-none focus:border-emerald-400"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[11px] text-gray-400">억원</span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                전사 총 구매금액 <span className="font-normal text-gray-400">(억원)</span>
              </label>
              <div className="relative">
                <input
                  type="number"
                  value={totalSpend}
                  onChange={e => setTotalSpend(e.target.value)}
                  placeholder="예: 150.0"
                  min="0"
                  step="0.1"
                  className="w-full px-3 py-2.5 pr-14 border-2 border-gray-200 rounded-lg text-sm focus:outline-none focus:border-emerald-400"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[11px] text-gray-400">억원</span>
              </div>
            </div>
          </div>

          {itemSpend && totalSpend && !spc && (
            <p className="text-xs text-red-500">총 구매금액은 0보다 커야 합니다.</p>
          )}

          {spc && (
            <div className="space-y-2 pt-1">
              <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">계산 결과</p>
              <ResultCard
                num="⑦" label="지출 비중" value={`${spc.ratio.toFixed(2)}%`}
                risk={spc.ratio < 2 ? 'low' : spc.ratio < 10 ? 'mid' : 'high'} axis="profit"
                sub={`수익영향(Profit Impact) 축 지표`}
              />
              {/* Visual bar */}
              <div className="bg-gray-100 rounded-full h-2 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${spc.ratio >= 10 ? 'bg-emerald-500' : spc.ratio >= 2 ? 'bg-amber-400' : 'bg-gray-400'}`}
                  style={{ width: `${Math.min(spc.ratio * 5, 100)}%` }}
                />
              </div>
              <div className="flex justify-between text-[9px] text-gray-400">
                <span>0%</span>
                <span className="text-amber-500">2% (일반↔병목/레버리지)</span>
                <span className="text-emerald-600">10% (전략/레버리지)</span>
              </div>
            </div>
          )}
        </>}

      </div>
    </div>
  );
}
