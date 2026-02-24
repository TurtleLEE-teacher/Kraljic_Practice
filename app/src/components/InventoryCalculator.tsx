'use client';

import { useState, useMemo } from 'react';

/** EOQ = sqrt((2 × D × S) / H) */
function calcEOQ(D: number, S: number, H: number): number | null {
  if (D <= 0 || S <= 0 || H <= 0) return null;
  return Math.sqrt((2 * D * S) / H);
}

/** Safety Stock = Z × σ_d × √L */
function calcSafetyStock(Z: number, sigma: number, L: number): number | null {
  if (Z <= 0 || sigma <= 0 || L <= 0) return null;
  return Z * sigma * Math.sqrt(L);
}

/** ROP = (d × L) + Safety Stock */
function calcROP(d: number, L: number, ss: number): number | null {
  if (d <= 0 || L <= 0) return null;
  return d * L + ss;
}

const Z_TABLE: { label: string; value: number }[] = [
  { label: '90% (Z=1.28)', value: 1.28 },
  { label: '95% (Z=1.65)', value: 1.65 },
  { label: '97.5% (Z=1.96)', value: 1.96 },
  { label: '99% (Z=2.33)', value: 2.33 },
  { label: '99.9% (Z=3.09)', value: 3.09 },
];

type CalcTab = 'eoq' | 'safety' | 'rop';

export default function InventoryCalculator() {
  const [activeTab, setActiveTab] = useState<CalcTab>('eoq');

  // EOQ inputs
  const [eoqD, setEoqD] = useState('');
  const [eoqS, setEoqS] = useState('');
  const [eoqH, setEoqH] = useState('');

  // Safety Stock inputs
  const [ssZ, setSsZ] = useState('1.65');
  const [ssSigma, setSsSigma] = useState('');
  const [ssL, setSsL] = useState('');

  // ROP inputs
  const [ropD, setRopD] = useState('');
  const [ropL, setRopL] = useState('');
  const [ropSS, setRopSS] = useState('');

  const eoqResult = useMemo(() => {
    return calcEOQ(parseFloat(eoqD), parseFloat(eoqS), parseFloat(eoqH));
  }, [eoqD, eoqS, eoqH]);

  const ssResult = useMemo(() => {
    return calcSafetyStock(parseFloat(ssZ), parseFloat(ssSigma), parseFloat(ssL));
  }, [ssZ, ssSigma, ssL]);

  const ropResult = useMemo(() => {
    return calcROP(parseFloat(ropD), parseFloat(ropL), parseFloat(ropSS) || 0);
  }, [ropD, ropL, ropSS]);

  const tabs: { id: CalcTab; label: string; formula: string }[] = [
    { id: 'eoq', label: 'EOQ', formula: '경제적 주문량' },
    { id: 'safety', label: 'Safety Stock', formula: '안전재고' },
    { id: 'rop', label: 'ROP', formula: '재주문점' },
  ];

  return (
    <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
      {/* Tab buttons */}
      <div className="flex border-b border-gray-200">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 px-4 py-3 text-sm font-semibold transition-colors cursor-pointer ${
              activeTab === tab.id
                ? 'bg-blue-50 text-blue-700 border-b-2 border-blue-600'
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
            }`}
          >
            <span className="block">{tab.label}</span>
            <span className="block text-[10px] font-normal mt-0.5 opacity-70">{tab.formula}</span>
          </button>
        ))}
      </div>

      <div className="p-5">
        {/* ========== EOQ ========== */}
        {activeTab === 'eoq' && (
          <div className="space-y-4">
            <div className="bg-blue-50 rounded-lg p-3 text-center">
              <p className="text-xs text-blue-600 font-medium mb-1">공식</p>
              <p className="text-sm font-mono font-bold text-blue-800">
                EOQ = √(2DS / H)
              </p>
            </div>

            <InputField label="D — 연간 수요량" unit="개/년" value={eoqD} onChange={setEoqD} placeholder="예: 10000" />
            <InputField label="S — 1회 주문비용" unit="원/회" value={eoqS} onChange={setEoqS} placeholder="예: 50000" />
            <InputField label="H — 단위당 연간 보유비용" unit="원/개·년" value={eoqH} onChange={setEoqH} placeholder="예: 200" />

            {eoqResult !== null && (
              <ResultBox
                label="경제적 주문량 (EOQ)"
                value={eoqResult.toFixed(1)}
                unit="개"
                details={[
                  `연간 주문 횟수: ${(parseFloat(eoqD) / eoqResult).toFixed(1)}회`,
                  `연간 총비용: ${((parseFloat(eoqD) / eoqResult) * parseFloat(eoqS) + (eoqResult / 2) * parseFloat(eoqH)).toLocaleString()}원`,
                ]}
              />
            )}
          </div>
        )}

        {/* ========== Safety Stock ========== */}
        {activeTab === 'safety' && (
          <div className="space-y-4">
            <div className="bg-emerald-50 rounded-lg p-3 text-center">
              <p className="text-xs text-emerald-600 font-medium mb-1">공식</p>
              <p className="text-sm font-mono font-bold text-emerald-800">
                SS = Z × σ_d × √L
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                Z — 서비스 수준
              </label>
              <select
                value={ssZ}
                onChange={(e) => setSsZ(e.target.value)}
                className="w-full px-3 py-2.5 border-2 border-gray-200 rounded-lg text-sm focus:outline-none focus:border-emerald-500"
              >
                {Z_TABLE.map((z) => (
                  <option key={z.value} value={z.value}>{z.label}</option>
                ))}
              </select>
            </div>
            <InputField label="σ_d — 일일 수요 표준편차" unit="개/일" value={ssSigma} onChange={setSsSigma} placeholder="예: 15" />
            <InputField label="L — 리드타임" unit="일" value={ssL} onChange={setSsL} placeholder="예: 7" />

            {ssResult !== null && (
              <ResultBox
                label="안전재고 (Safety Stock)"
                value={ssResult.toFixed(1)}
                unit="개"
                color="emerald"
                details={[
                  `서비스 수준: ${(Z_TABLE.find((z) => z.value === parseFloat(ssZ))?.label || ssZ)}`,
                  `리드타임 중 수요 변동 흡수`,
                ]}
              />
            )}
          </div>
        )}

        {/* ========== ROP ========== */}
        {activeTab === 'rop' && (
          <div className="space-y-4">
            <div className="bg-amber-50 rounded-lg p-3 text-center">
              <p className="text-xs text-amber-600 font-medium mb-1">공식</p>
              <p className="text-sm font-mono font-bold text-amber-800">
                ROP = (d × L) + Safety Stock
              </p>
            </div>

            <InputField label="d — 일일 평균 수요량" unit="개/일" value={ropD} onChange={setRopD} placeholder="예: 50" />
            <InputField label="L — 리드타임" unit="일" value={ropL} onChange={setRopL} placeholder="예: 7" />
            <InputField label="Safety Stock — 안전재고" unit="개" value={ropSS} onChange={setRopSS} placeholder="예: 65 (위 탭에서 계산)" />

            {ropResult !== null && (
              <ResultBox
                label="재주문점 (ROP)"
                value={ropResult.toFixed(1)}
                unit="개"
                color="amber"
                details={[
                  `리드타임 수요: ${(parseFloat(ropD) * parseFloat(ropL)).toFixed(0)}개`,
                  `안전재고: ${parseFloat(ropSS) || 0}개`,
                  `→ 재고가 ${ropResult.toFixed(0)}개 이하가 되면 주문`,
                ]}
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
}

/* ----- Helper components ----- */

function InputField({
  label,
  unit,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  unit: string;
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
}) {
  return (
    <div>
      <label className="block text-xs font-semibold text-gray-600 mb-1.5">{label}</label>
      <div className="relative">
        <input
          type="number"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full px-3 py-2.5 pr-20 border-2 border-gray-200 rounded-lg text-sm focus:outline-none focus:border-blue-500 transition-colors"
          min="0"
          step="any"
        />
        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-gray-400">{unit}</span>
      </div>
    </div>
  );
}

function ResultBox({
  label,
  value,
  unit,
  color = 'blue',
  details,
}: {
  label: string;
  value: string;
  unit: string;
  color?: 'blue' | 'emerald' | 'amber';
  details: string[];
}) {
  const colorMap = {
    blue: { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-700', value: 'text-blue-800' },
    emerald: { bg: 'bg-emerald-50', border: 'border-emerald-200', text: 'text-emerald-700', value: 'text-emerald-800' },
    amber: { bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-700', value: 'text-amber-800' },
  };
  const c = colorMap[color];

  return (
    <div className={`${c.bg} ${c.border} border rounded-xl p-4 text-center`}>
      <p className={`text-xs font-medium ${c.text} mb-1`}>{label}</p>
      <p className={`text-3xl font-extrabold ${c.value}`}>
        {value}<span className="text-sm font-normal ml-1">{unit}</span>
      </p>
      <div className="mt-2 space-y-0.5">
        {details.map((d, i) => (
          <p key={i} className="text-[11px] text-gray-500">{d}</p>
        ))}
      </div>
    </div>
  );
}
