'use client';

import { useState, useMemo } from 'react';

/* ─── Shared ─── */
type Risk = 'low' | 'mid' | 'high';

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
  return <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap ${cls}`}>{label}</span>;
}

function Num({ value, onChange, placeholder, width = 'w-20' }: {
  value: string; onChange: (v: string) => void; placeholder: string; width?: string;
}) {
  return (
    <input
      type="number" value={value} min="0" step="any"
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      className={`${width} px-2 py-1 border border-gray-200 rounded-lg text-sm text-center focus:outline-none focus:border-blue-400 bg-white`}
    />
  );
}

/* ─── KPI section wrapper ─── */
function KpiSection({ num, name, axis, children }: {
  num: string; name: string; axis: 'supply' | 'profit'; children: React.ReactNode;
}) {
  const numCls = axis === 'supply' ? 'bg-red-100 text-red-700' : 'bg-emerald-100 text-emerald-700';
  return (
    <div className="space-y-2 py-3 border-b border-gray-100 last:border-0">
      <div className="flex items-center gap-1.5">
        <span className={`text-[10px] font-black w-5 h-5 flex items-center justify-center rounded-full shrink-0 ${numCls}`}>{num}</span>
        <span className="text-xs font-bold text-gray-700">{name}</span>
      </div>
      {children}
    </div>
  );
}

/* ─── Equation display ─── */
function Eq({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-1.5 flex-wrap text-sm">
      {children}
    </div>
  );
}
const Op = ({ v }: { v: string }) => <span className="text-gray-400 font-medium">{v}</span>;
const Val = ({ v, unit }: { v: string; unit?: string }) => (
  <span className="font-black text-gray-900">{v}<span className="text-xs font-normal text-gray-400 ml-0.5">{unit}</span></span>
);

/* ════════════════════════════════════════
   DeliveryCalcPanel  ①②③
════════════════════════════════════════ */
export function DeliveryCalcPanel() {
  // ① 평균 리드타임
  const [ltSum, setLtSum] = useState('');
  const [ltN,   setLtN]   = useState('');
  // ② 납기준수율
  const [okN,   setOkN]   = useState('');
  const [totN,  setTotN]  = useState('');
  // ③ CV (σ)
  const [sigma, setSigma] = useState('');

  const avg = useMemo(() => {
    const s = +ltSum, n = +ltN;
    return ltSum && ltN && n > 0 ? s / n : null;
  }, [ltSum, ltN]);

  const otd = useMemo(() => {
    const ok = +okN, tot = +totN;
    return okN && totN && tot > 0 ? (ok / tot) * 100 : null;
  }, [okN, totN]);

  const cv = useMemo(() => {
    const s = +sigma;
    return sigma && avg !== null && avg > 0 ? (s / avg) * 100 : null;
  }, [sigma, avg]);

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden h-fit">
      <div className="px-4 py-2.5 bg-red-50 border-b border-red-100 flex items-center justify-between">
        <span className="text-sm font-bold text-red-800">납기 KPI</span>
        <span className="text-xs font-semibold text-red-400 bg-red-100 px-2 py-0.5 rounded-full">① ② ③ 공급위험</span>
      </div>

      <div className="px-4">

        {/* ① 평균 납기 리드타임 */}
        <KpiSection num="①" name="평균 납기 리드타임" axis="supply">
          <p className="text-[10px] text-gray-400">납기이력 테이블 → 각 건의 리드타임(실제입고일−발주일) 합산</p>
          <Eq>
            <Num value={ltSum} onChange={setLtSum} placeholder="Σ리드타임" width="w-24" />
            <Op v="일 ÷" />
            <Num value={ltN} onChange={setLtN} placeholder="건수" width="w-14" />
            <Op v="건 =" />
            {avg !== null
              ? <><Val v={avg.toFixed(1)} unit="일" /><RiskBadge risk={avg <= 5 ? 'low' : avg <= 15 ? 'mid' : 'high'} axis="supply" /></>
              : <span className="text-xs text-gray-300">?</span>
            }
          </Eq>
        </KpiSection>

        {/* ② 납기준수율 */}
        <KpiSection num="②" name="납기준수율" axis="supply">
          <p className="text-[10px] text-gray-400">실제입고일 ≤ 납기예정일인 건 카운트</p>
          <Eq>
            <Num value={okN} onChange={setOkN} placeholder="준수" width="w-14" />
            <Op v="건 ÷" />
            <Num value={totN} onChange={setTotN} placeholder="전체" width="w-14" />
            <Op v="건 × 100 =" />
            {otd !== null
              ? <><Val v={otd.toFixed(1)} unit="%" /><RiskBadge risk={otd >= 95 ? 'low' : otd >= 80 ? 'mid' : 'high'} axis="supply" /></>
              : <span className="text-xs text-gray-300">?</span>
            }
          </Eq>
        </KpiSection>

        {/* ③ 리드타임 CV */}
        <KpiSection num="③" name="리드타임 변동계수 (CV)" axis="supply">
          <p className="text-[10px] text-gray-400">표준편차 σ = √[Σ(리드타임−평균)² ÷ N]</p>
          <Eq>
            <Num value={sigma} onChange={setSigma} placeholder="σ" width="w-16" />
            <Op v="일 ÷" />
            {avg !== null
              ? <span className="text-sm font-bold text-blue-600">{avg.toFixed(1)}<span className="text-xs font-normal text-gray-400 ml-0.5">일①</span></span>
              : <span className="text-xs text-gray-300">①입력</span>
            }
            <Op v="× 100 =" />
            {cv !== null
              ? <><Val v={cv.toFixed(1)} unit="%" /><RiskBadge risk={cv < 20 ? 'low' : cv < 40 ? 'mid' : 'high'} axis="supply" /></>
              : <span className="text-xs text-gray-300">?</span>
            }
          </Eq>
        </KpiSection>

      </div>
    </div>
  );
}

/* ════════════════════════════════════════
   SupplierCalcPanel  ④⑤⑥
════════════════════════════════════════ */
export function SupplierCalcPanel() {
  // ④ 공급업체 수
  const [cnt, setCnt] = useState('');
  // ⑤ 1위 집중도
  const [maxAmt,   setMaxAmt]   = useState('');
  const [totalAmt, setTotalAmt] = useState('');
  // ⑥ 대체 가능 업체 수
  const [subCnt, setSubCnt] = useState('');

  const conc = useMemo(() => {
    const m = +maxAmt, t = +totalAmt;
    return maxAmt && totalAmt && t > 0 ? (m / t) * 100 : null;
  }, [maxAmt, totalAmt]);

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden h-fit">
      <div className="px-4 py-2.5 bg-red-50 border-b border-red-100 flex items-center justify-between">
        <span className="text-sm font-bold text-red-800">공급업체 KPI</span>
        <span className="text-xs font-semibold text-red-400 bg-red-100 px-2 py-0.5 rounded-full">④ ⑤ ⑥ 공급위험</span>
      </div>

      <div className="px-4">

        {/* ④ 공급업체 수 */}
        <KpiSection num="④" name="등록 공급업체 수" axis="supply">
          <p className="text-[10px] text-gray-400">공급업체 현황 테이블의 행 수</p>
          <Eq>
            <Num value={cnt} onChange={setCnt} placeholder="업체 수" width="w-20" />
            <Op v="개 →" />
            {cnt && +cnt > 0
              ? <><Val v={cnt} unit="개" /><RiskBadge risk={+cnt >= 5 ? 'low' : +cnt >= 3 ? 'mid' : 'high'} axis="supply" /></>
              : <span className="text-xs text-gray-300">?</span>
            }
          </Eq>
        </KpiSection>

        {/* ⑤ 1위 집중도 */}
        <KpiSection num="⑤" name="1위 공급업체 집중도" axis="supply">
          <p className="text-[10px] text-gray-400">비중 컬럼 최댓값 ÷ 전체 합계 (또는 비중 컬럼 최댓값 직접 입력)</p>
          <Eq>
            <Num value={maxAmt} onChange={setMaxAmt} placeholder="1위 금액" width="w-24" />
            <Op v="÷" />
            <Num value={totalAmt} onChange={setTotalAmt} placeholder="전체 합계" width="w-24" />
            <Op v="× 100 =" />
            {conc !== null
              ? <><Val v={conc.toFixed(1)} unit="%" /><RiskBadge risk={conc < 30 ? 'low' : conc < 70 ? 'mid' : 'high'} axis="supply" /></>
              : <span className="text-xs text-gray-300">?</span>
            }
          </Eq>
        </KpiSection>

        {/* ⑥ 대체 가능 업체 수 */}
        <KpiSection num="⑥" name="대체 가능 업체 수" axis="supply">
          <p className="text-[10px] text-gray-400">대체 컬럼에서 Y인 행 카운트</p>
          <Eq>
            <Num value={subCnt} onChange={setSubCnt} placeholder="Y 업체 수" width="w-20" />
            <Op v="개 →" />
            {subCnt && +subCnt >= 0
              ? <><Val v={subCnt} unit="개" /><RiskBadge risk={+subCnt >= 3 ? 'low' : +subCnt >= 1 ? 'mid' : 'high'} axis="supply" /></>
              : <span className="text-xs text-gray-300">?</span>
            }
          </Eq>
        </KpiSection>

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

  const ratio = useMemo(() => {
    const i = +itemSpend, t = +totalSpend;
    return itemSpend && totalSpend && t > 0 ? (i / t) * 100 : null;
  }, [itemSpend, totalSpend]);

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden h-fit">
      <div className="px-4 py-2.5 bg-emerald-50 border-b border-emerald-100 flex items-center justify-between">
        <span className="text-sm font-bold text-emerald-800">지출 KPI</span>
        <span className="text-xs font-semibold text-emerald-600 bg-emerald-100 px-2 py-0.5 rounded-full">⑦ 수익영향</span>
      </div>

      <div className="px-4">
        <KpiSection num="⑦" name="구매 지출 비중" axis="profit">
          <p className="text-[10px] text-gray-400">구매 지출 현황 테이블 → 최근 연도 기준</p>
          <Eq>
            <Num value={itemSpend} onChange={setItemSpend} placeholder="품목 금액" width="w-24" />
            <Op v="억 ÷" />
            <Num value={totalSpend} onChange={setTotalSpend} placeholder="전사 총액" width="w-24" />
            <Op v="억 × 100 =" />
            {ratio !== null
              ? <><Val v={ratio.toFixed(2)} unit="%" /><RiskBadge risk={ratio < 2 ? 'low' : ratio < 10 ? 'mid' : 'high'} axis="profit" /></>
              : <span className="text-xs text-gray-300">?</span>
            }
          </Eq>
          {ratio !== null && (
            <div className="mt-2">
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
        </KpiSection>
      </div>
    </div>
  );
}
