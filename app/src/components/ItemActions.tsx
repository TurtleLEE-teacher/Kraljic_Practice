'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';

type Answer = { quadrant: string; reason: string };
const EMPTY: Answer = { quadrant: '', reason: '' };
const LS_KEY = 'kraljic_survey_v1';

const QUADRANTS = [
  {
    id: 'noncritical',
    label: '일반',
    desc: '저위험 · 저영향',
    btn:          'border-slate-300 text-slate-600 hover:bg-slate-50',
    sel:          'bg-slate-700 border-slate-700 text-white',
    badge:        'bg-slate-100 text-slate-700',
    activeBorder: 'border-slate-400',
  },
  {
    id: 'bottleneck',
    label: '병목',
    desc: '고위험 · 저영향',
    btn:          'border-red-300 text-red-600 hover:bg-red-50',
    sel:          'bg-red-600 border-red-600 text-white',
    badge:        'bg-red-100 text-red-700',
    activeBorder: 'border-red-400',
  },
  {
    id: 'leverage',
    label: '레버리지',
    desc: '저위험 · 고영향',
    btn:          'border-emerald-300 text-emerald-700 hover:bg-emerald-50',
    sel:          'bg-emerald-600 border-emerald-600 text-white',
    badge:        'bg-emerald-100 text-emerald-700',
    activeBorder: 'border-emerald-400',
  },
  {
    id: 'strategic',
    label: '전략',
    desc: '고위험 · 고영향',
    btn:          'border-violet-300 text-violet-700 hover:bg-violet-50',
    sel:          'bg-violet-600 border-violet-600 text-white',
    badge:        'bg-violet-100 text-violet-700',
    activeBorder: 'border-violet-400',
  },
] as const;

export default function ItemActions({ itemId }: { itemId: string }) {
  const [answer, setAnswer] = useState<Answer>(EMPTY);
  const [flash,  setFlash]  = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(LS_KEY);
      if (raw) {
        const all = JSON.parse(raw) as Record<string, Answer>;
        if (all[itemId]) setAnswer(all[itemId]);
      }
    } catch {}
  }, [itemId]);

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
    setTimeout(() => setFlash(false), 1500);
  };

  const setReason = (reason: string) => {
    const next = { ...answer, reason };
    setAnswer(next);
    persist(next);
  };

  const handleClear = () => {
    setAnswer(EMPTY);
    persist(EMPTY);
    setFlash(false);
  };

  const selQ = QUADRANTS.find(q => q.id === answer.quadrant);

  return (
    <div className={`bg-white rounded-xl border-2 overflow-hidden transition-colors ${
      selQ ? selQ.activeBorder : 'border-dashed border-gray-300'
    }`}>

      {/* Header */}
      <div className="px-4 py-3 bg-gray-50 border-b border-gray-100 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold text-gray-800">이 품목 분류</span>
          <span className="text-[11px] font-semibold text-amber-700 bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded">
            임시 저장
          </span>
        </div>
        <div className="flex items-center gap-2">
          {selQ && (
            <span className={`text-xs font-bold px-2 py-0.5 rounded-full flex items-center gap-1 ${selQ.badge}`}>
              {selQ.label}
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
              </svg>
            </span>
          )}
          {(answer.quadrant || answer.reason) && (
            <button
              onClick={handleClear}
              className="text-xs text-gray-400 hover:text-red-500 transition-colors cursor-pointer font-semibold"
            >
              초기화
            </button>
          )}
        </div>
      </div>

      <div className="p-4 space-y-3">

        {/* Quadrant buttons 2×2 */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
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
        <textarea
          value={answer.reason}
          onChange={e => setReason(e.target.value)}
          placeholder={`분류 근거 메모\n예) 지출비중 8.0%, 공급업체 5개(대체 Y 5개), 납기준수율 91.7%, CV 12% → 레버리지`}
          rows={3}
          className="w-full text-sm text-gray-700 border border-gray-200 rounded-xl px-3.5 py-3 resize-none focus:outline-none focus:border-blue-300 placeholder-gray-300 leading-relaxed"
        />

        {/* Status row */}
        <div className="flex items-center justify-between">
          <span className={`text-xs transition-colors ${
            flash ? 'text-emerald-600 font-semibold' : 'text-gray-400'
          }`}>
            {flash
              ? '임시 저장됨 ✓'
              : answer.quadrant
                ? `${selQ?.label}(으)로 임시 저장됨`
                : '품목군 선택 시 자동 임시 저장'}
          </span>
          <Link
            href="/survey"
            className="text-xs text-blue-500 hover:text-blue-700 font-semibold whitespace-nowrap"
          >
            최종 제출 페이지 →
          </Link>
        </div>

      </div>
    </div>
  );
}
