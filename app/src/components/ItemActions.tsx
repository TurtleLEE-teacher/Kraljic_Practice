'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import KpiCalculator from './KpiCalculator';

/* ─── types ─── */
type Answer = { quadrant: string; reason: string };
const EMPTY: Answer = { quadrant: '', reason: '' };
const LS_KEY = 'kraljic_survey_v1';

const QUADRANTS = [
  {
    id: 'noncritical',
    label: '일반',
    desc: '저위험 · 저영향',
    btn:   'border-slate-300 text-slate-600 hover:bg-slate-50',
    sel:   'bg-slate-700 border-slate-700 text-white',
    badge: 'bg-slate-100 text-slate-700',
  },
  {
    id: 'bottleneck',
    label: '병목',
    desc: '고위험 · 저영향',
    btn:   'border-red-300 text-red-600 hover:bg-red-50',
    sel:   'bg-red-600 border-red-600 text-white',
    badge: 'bg-red-100 text-red-700',
  },
  {
    id: 'leverage',
    label: '레버리지',
    desc: '저위험 · 고영향',
    btn:   'border-emerald-300 text-emerald-700 hover:bg-emerald-50',
    sel:   'bg-emerald-600 border-emerald-600 text-white',
    badge: 'bg-emerald-100 text-emerald-700',
  },
  {
    id: 'strategic',
    label: '전략',
    desc: '고위험 · 고영향',
    btn:   'border-violet-300 text-violet-700 hover:bg-violet-50',
    sel:   'bg-violet-600 border-violet-600 text-white',
    badge: 'bg-violet-100 text-violet-700',
  },
] as const;

interface Props {
  itemId: string;
}

export default function ItemActions({ itemId }: Props) {
  const [tab, setTab]         = useState<'classify' | 'calc'>('calc');
  const [answer, setAnswer]   = useState<Answer>(EMPTY);
  const [flash, setFlash]     = useState(false);

  /* Load from localStorage */
  useEffect(() => {
    try {
      const raw = localStorage.getItem(LS_KEY);
      if (raw) {
        const all = JSON.parse(raw) as Record<string, Answer>;
        if (all[itemId]) setAnswer(all[itemId]);
      }
    } catch {}
  }, [itemId]);

  /* Persist to localStorage */
  const persist = useCallback((next: Answer) => {
    try {
      const raw = localStorage.getItem(LS_KEY);
      const all = raw ? (JSON.parse(raw) as Record<string, Answer>) : {};
      localStorage.setItem(LS_KEY, JSON.stringify({ ...all, [itemId]: next }));
    } catch {}
  }, [itemId]);

  const setQuadrant = (id: string) => {
    const next = { ...answer, quadrant: answer.quadrant === id ? '' : id };
    setAnswer(next);
    persist(next);
    setFlash(true);
    setTimeout(() => setFlash(false), 1200);
  };

  const setReason = (reason: string) => {
    const next = { ...answer, reason };
    setAnswer(next);
    persist(next);
  };

  const selQ = QUADRANTS.find(q => q.id === answer.quadrant);

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">

      {/* Section label + tab toggle */}
      <div className="flex items-center border-b border-gray-100">
        <div className="flex gap-0 flex-1">
          <button
            onClick={() => setTab('calc')}
            className={`flex-1 py-3 text-sm font-semibold transition-colors cursor-pointer border-b-2 ${
              tab === 'calc'
                ? 'text-blue-700 border-blue-500 bg-blue-50/60'
                : 'text-gray-400 border-transparent hover:text-gray-600 hover:bg-gray-50'
            }`}
          >
            KPI 계산기
          </button>
          <button
            onClick={() => setTab('classify')}
            className={`flex-1 py-3 text-sm font-semibold transition-colors cursor-pointer border-b-2 relative ${
              tab === 'classify'
                ? 'text-emerald-700 border-emerald-500 bg-emerald-50/60'
                : 'text-gray-400 border-transparent hover:text-gray-600 hover:bg-gray-50'
            }`}
          >
            분류 기록
            {answer.quadrant && selQ && (
              <span className={`absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-bold px-1.5 py-0.5 rounded-full ${selQ.badge}`}>
                {selQ.label}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Tab: KPI 계산기 */}
      {tab === 'calc' && (
        <div className="p-0">
          <KpiCalculator />
        </div>
      )}

      {/* Tab: 분류 기록 */}
      {tab === 'classify' && (
        <div className="p-4 space-y-4">

          {/* Quadrant grid */}
          <div className="grid grid-cols-2 gap-2">
            {QUADRANTS.map(q => {
              const active = answer.quadrant === q.id;
              return (
                <button
                  key={q.id}
                  onClick={() => setQuadrant(q.id)}
                  className={`py-3 px-4 rounded-xl border-2 text-left transition-all cursor-pointer ${
                    active ? q.sel : `bg-white ${q.btn}`
                  }`}
                >
                  <p className={`text-sm font-bold ${active ? 'text-white' : ''}`}>{q.label}</p>
                  <p className={`text-xs mt-0.5 ${active ? 'text-white/70' : 'text-gray-400'}`}>{q.desc}</p>
                </button>
              );
            })}
          </div>

          {/* Reason textarea */}
          <div>
            <textarea
              value={answer.reason}
              onChange={e => setReason(e.target.value)}
              placeholder={`분류 근거를 입력하세요&#10;예) 지출비중 8%, 공급업체 5개, 납기준수율 91.7%, CV 12% → 레버리지`}
              rows={4}
              className="w-full text-sm text-gray-700 border border-gray-200 rounded-xl px-3.5 py-3 resize-none focus:outline-none focus:border-blue-300 placeholder-gray-300 leading-relaxed"
            />
          </div>

          {/* Status bar */}
          <div className="flex items-center justify-between">
            <span className={`text-xs transition-all ${flash ? 'text-emerald-600 font-semibold' : 'text-gray-400'}`}>
              {flash ? '저장됨' : answer.quadrant ? `${selQ?.label} 선택됨` : '품목군을 선택하세요'}
            </span>
            <Link
              href="/survey"
              className="text-xs text-blue-500 hover:text-blue-700 font-semibold whitespace-nowrap"
            >
              전체 제출 보기 →
            </Link>
          </div>

        </div>
      )}

    </div>
  );
}
