'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { ITEMS } from '@/data/items';

/* ─── types ─── */
type Answer    = { quadrant: string; reason: string };
type Answers   = Record<string, Answer>;
type Submitted = { timestamp: string; answers: Answers };

const EMPTY: Answer = { quadrant: '', reason: '' };
const LS_KEY     = 'kraljic_survey_v1';
const SUBMIT_KEY = 'kraljic_submitted_v1';

const QUADRANTS = [
  { id: 'noncritical', label: '일반',    btn: 'border-slate-300 text-slate-600 hover:bg-slate-50', sel: 'bg-slate-700 border-slate-700 text-white', badge: 'bg-slate-100 text-slate-700' },
  { id: 'bottleneck',  label: '병목',    btn: 'border-red-300 text-red-600 hover:bg-red-50',       sel: 'bg-red-600 border-red-600 text-white',     badge: 'bg-red-100 text-red-700'     },
  { id: 'leverage',    label: '레버리지', btn: 'border-emerald-300 text-emerald-700 hover:bg-emerald-50', sel: 'bg-emerald-600 border-emerald-600 text-white', badge: 'bg-emerald-100 text-emerald-700' },
  { id: 'strategic',   label: '전략',    btn: 'border-violet-300 text-violet-700 hover:bg-violet-50',   sel: 'bg-violet-600 border-violet-600 text-white',   badge: 'bg-violet-100 text-violet-700'   },
] as const;

/* ═══════════════════════════════════════
   Main Page
═══════════════════════════════════════ */
export default function SurveyPage() {
  const [answers,   setAnswers]   = useState<Answers>({});
  const [submitted, setSubmitted] = useState<Submitted | null>(null);
  const [view,      setView]      = useState<'form' | 'review'>('form');

  /* Load state */
  useEffect(() => {
    try {
      const raw = localStorage.getItem(LS_KEY);
      if (raw) setAnswers(JSON.parse(raw));
      const sub = localStorage.getItem(SUBMIT_KEY);
      if (sub) setSubmitted(JSON.parse(sub));
    } catch {}
  }, []);

  /* Persist draft */
  useEffect(() => {
    try { localStorage.setItem(LS_KEY, JSON.stringify(answers)); } catch {}
  }, [answers]);

  const setField = useCallback((id: string, field: keyof Answer, val: string) => {
    setAnswers(prev => ({ ...prev, [id]: { ...(prev[id] ?? EMPTY), [field]: val } }));
  }, []);

  const completedCount = ITEMS.filter(i => answers[i.id]?.quadrant).length;
  const allDone = completedCount === ITEMS.length;

  /* Final submit */
  const handleFinalSubmit = () => {
    const record: Submitted = { timestamp: new Date().toISOString(), answers };
    localStorage.setItem(SUBMIT_KEY, JSON.stringify(record));
    setSubmitted(record);
  };

  /* Reset to draft editing */
  const handleReset = () => {
    localStorage.removeItem(SUBMIT_KEY);
    setSubmitted(null);
    setView('form');
  };

  /* Copy to clipboard */
  const [copied, setCopied] = useState(false);
  const copyText = async () => {
    const data = submitted?.answers ?? answers;
    const text = [
      '크랄직 매트릭스 품목군 분류 결과',
      submitted
        ? `최종 제출: ${new Date(submitted.timestamp).toLocaleString('ko-KR')}`
        : `임시 저장: ${new Date().toLocaleString('ko-KR')}`,
      '',
      ...ITEMS.map(item => {
        const a = data[item.id];
        const q = QUADRANTS.find(q => q.id === a?.quadrant);
        return `[${item.id.toUpperCase()}] ${item.label}\n  품목군: ${q?.label ?? '미분류'}\n  근거:   ${a?.reason?.trim() || '(없음)'}`;
      }),
    ].join('\n');
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {}
  };

  /* ══════════════════════════
     VIEW: Submitted (done)
  ══════════════════════════ */
  if (submitted) {
    return (
      <div className="min-h-screen bg-slate-50">
        <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
          <div className="max-w-2xl mx-auto px-4 py-3 flex items-center gap-3">
            <Link href="/items" className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors">
              <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </Link>
            <span className="text-sm font-bold text-gray-900 flex-1">최종 제출 완료</span>
            <span className="text-xs text-emerald-600 bg-emerald-50 border border-emerald-200 font-bold px-2.5 py-1 rounded-full">
              제출됨
            </span>
          </div>
        </div>

        <div className="max-w-2xl mx-auto px-4 py-6 space-y-5">

          {/* Completion banner */}
          <div className="bg-emerald-50 border border-emerald-200 rounded-2xl px-5 py-5 text-center">
            <div className="w-14 h-14 bg-emerald-500 rounded-full flex items-center justify-center mx-auto mb-3">
              <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="text-lg font-black text-emerald-800 mb-1">제출 완료</h2>
            <p className="text-sm text-emerald-600">
              {new Date(submitted.timestamp).toLocaleString('ko-KR', {
                year: 'numeric', month: 'long', day: 'numeric',
                hour: '2-digit', minute: '2-digit',
              })}
            </p>
          </div>

          {/* Results summary table */}
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-100">
              <p className="text-sm font-bold text-gray-700">분류 결과</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50">
                    <th className="px-3 py-2.5 text-left font-semibold text-gray-500 whitespace-nowrap">품목</th>
                    <th className="px-3 py-2.5 text-center font-semibold text-gray-500 whitespace-nowrap">품목군</th>
                    <th className="px-3 py-2.5 text-left font-semibold text-gray-500">분류 근거</th>
                  </tr>
                </thead>
                <tbody>
                  {ITEMS.map((item, i) => {
                    const a = submitted.answers[item.id];
                    const q = QUADRANTS.find(q => q.id === a?.quadrant);
                    return (
                      <tr key={item.id} className={`border-b border-gray-50 ${i % 2 === 0 ? 'bg-white' : 'bg-gray-50/40'}`}>
                        <td className="px-3 py-2.5 whitespace-nowrap">
                          <span className="font-black text-gray-700">{item.id.toUpperCase()}</span>
                          <span className="ml-1.5 text-gray-400">{item.label}</span>
                        </td>
                        <td className="px-3 py-2.5 text-center">
                          {q ? (
                            <span className={`text-xs font-bold px-2 py-0.5 rounded-full whitespace-nowrap ${q.badge}`}>
                              {q.label}
                            </span>
                          ) : (
                            <span className="text-gray-300">—</span>
                          )}
                        </td>
                        <td className="px-3 py-2.5 text-gray-500 max-w-[220px]">
                          <p className="line-clamp-2 leading-relaxed">{a?.reason?.trim() || '—'}</p>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Actions */}
          <div className="space-y-2">

            {/* Notion — placeholder */}
            <button
              disabled
              className="w-full flex items-center justify-center gap-2 py-4 rounded-xl bg-gray-100 text-gray-400 text-sm font-bold cursor-not-allowed"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M4.459 4.208c.746.606 1.026.56 2.428.466l13.215-.793c.28 0 .047-.28-.046-.326L17.86 1.968c-.42-.326-.981-.7-2.055-.607L3.01 2.295c-.466.046-.56.28-.374.466zm.793 3.08v13.904c0 .747.373 1.027 1.214.98l14.523-.84c.841-.046.935-.56.935-1.167V6.354c0-.606-.233-.933-.748-.887l-15.177.887c-.56.047-.747.327-.747.933zm14.337.745c.093.42 0 .84-.42.888l-.7.14v10.264c-.608.327-1.168.514-1.635.514-.748 0-.935-.234-1.495-.933l-4.577-7.186v6.952L12.21 19s0 .84-1.168.84l-3.222.186c-.093-.186 0-.653.327-.746l.84-.233V9.854L7.822 9.76c-.094-.42.14-1.026.793-1.073l3.456-.233 4.764 7.279v-6.44l-1.215-.139c-.093-.514.28-.887.747-.933zM1.936 1.035l13.31-.98c1.634-.14 2.055-.047 3.082.7l4.249 2.986c.7.513.934.653.934 1.213v16.378c0 1.026-.373 1.634-1.68 1.726l-15.458.934c-.98.047-1.448-.093-1.962-.747l-3.129-4.06c-.56-.747-.793-1.306-.793-1.96V2.667c0-.839.374-1.54 1.447-1.632z"/>
              </svg>
              노션 DB로 보내기 (연동 준비 중)
            </button>

            {/* Copy */}
            <button
              onClick={copyText}
              className="w-full py-3.5 rounded-xl bg-slate-800 text-white text-sm font-bold hover:bg-slate-700 transition-colors cursor-pointer"
            >
              {copied ? '복사됨!' : '결과 텍스트 복사'}
            </button>

            {/* Reset */}
            <button
              onClick={handleReset}
              className="w-full py-3 rounded-xl border border-gray-200 text-sm text-gray-500 font-semibold hover:border-red-200 hover:text-red-500 transition-colors cursor-pointer"
            >
              임시저장으로 돌아가서 수정하기
            </button>

          </div>
        </div>
      </div>
    );
  }

  /* ══════════════════════════
     VIEW: Review (before submit)
  ══════════════════════════ */
  if (view === 'review') {
    return (
      <div className="min-h-screen bg-slate-50">
        <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
          <div className="max-w-2xl mx-auto px-4 py-3 flex items-center gap-3">
            <button
              onClick={() => setView('form')}
              className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
            >
              <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <span className="text-sm font-bold text-gray-900 flex-1">분류 결과 검토</span>
            <span className={`text-xs font-semibold px-2.5 py-1 rounded-full whitespace-nowrap ${
              allDone ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
            }`}>
              {completedCount}/10
            </span>
          </div>
        </div>

        <div className="max-w-2xl mx-auto px-4 py-5 space-y-4">

          {/* Results table */}
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50">
                    <th className="px-3 py-2.5 text-left font-semibold text-gray-500 whitespace-nowrap">품목</th>
                    <th className="px-3 py-2.5 text-center font-semibold text-gray-500 whitespace-nowrap">품목군</th>
                    <th className="px-3 py-2.5 text-left font-semibold text-gray-500">분류 근거</th>
                  </tr>
                </thead>
                <tbody>
                  {ITEMS.map((item, i) => {
                    const a = answers[item.id];
                    const q = QUADRANTS.find(q => q.id === a?.quadrant);
                    return (
                      <tr key={item.id} className={`border-b border-gray-50 ${i % 2 === 0 ? 'bg-white' : 'bg-gray-50/40'}`}>
                        <td className="px-3 py-2.5 whitespace-nowrap">
                          <span className="font-black text-gray-700">{item.id.toUpperCase()}</span>
                          <span className="ml-1.5 text-gray-400">{item.label}</span>
                        </td>
                        <td className="px-3 py-2.5 text-center">
                          {q ? (
                            <span className={`text-xs font-bold px-2 py-0.5 rounded-full whitespace-nowrap ${q.badge}`}>
                              {q.label}
                            </span>
                          ) : (
                            <span className="text-red-300 font-semibold">미분류</span>
                          )}
                        </td>
                        <td className="px-3 py-2.5 text-gray-500 max-w-[220px]">
                          <p className="line-clamp-2 leading-relaxed">{a?.reason?.trim() || '—'}</p>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Not done warning */}
          {!allDone && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
              <p className="text-sm text-amber-700 font-semibold mb-1">미분류 품목이 있습니다</p>
              <p className="text-xs text-amber-600">
                {ITEMS.filter(i => !answers[i.id]?.quadrant).map(i => i.id.toUpperCase()).join(', ')}
              </p>
            </div>
          )}

          {/* CTAs */}
          <div className="space-y-2">
            {allDone ? (
              <button
                onClick={handleFinalSubmit}
                className="w-full py-4 rounded-xl bg-emerald-600 text-white text-sm font-bold hover:bg-emerald-700 transition-colors shadow-lg cursor-pointer"
              >
                최종 제출하기 →
              </button>
            ) : (
              <button
                disabled
                className="w-full py-4 rounded-xl bg-gray-200 text-gray-400 text-sm font-bold cursor-not-allowed"
              >
                최종 제출 ({completedCount}/10 완료 시 활성화)
              </button>
            )}

            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setView('form')}
                className="py-3 rounded-xl border border-gray-200 text-sm text-gray-600 font-semibold hover:border-blue-300 hover:text-blue-600 transition-colors cursor-pointer"
              >
                ← 수정하기
              </button>
              <button
                onClick={copyText}
                className="py-3 rounded-xl border border-gray-200 text-sm text-gray-600 font-semibold hover:border-gray-400 transition-colors cursor-pointer"
              >
                {copied ? '복사됨!' : '텍스트 복사'}
              </button>
            </div>
          </div>

        </div>
      </div>
    );
  }

  /* ══════════════════════════
     VIEW: Form (draft input)
  ══════════════════════════ */
  return (
    <div className="min-h-screen bg-slate-50">

      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-2.5">
          <div className="flex items-center gap-3 mb-2">
            <Link href="/" className="p-1 rounded-lg hover:bg-gray-100 transition-colors">
              <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </Link>
            <span className="text-sm font-bold text-gray-900 flex-1">품목군 분류 임시저장</span>
            <span className="text-xs text-gray-400 shrink-0">{completedCount}/10</span>
            <button
              onClick={() => setView('review')}
              className={`text-xs font-bold cursor-pointer whitespace-nowrap px-2.5 py-1 rounded-lg transition-colors ${
                allDone
                  ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                  : 'text-blue-600 hover:text-blue-800'
              }`}
            >
              {allDone ? '최종 제출 →' : '결과 검토 →'}
            </button>
          </div>
          {/* Progress bar */}
          <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-300 ${
                allDone ? 'bg-emerald-500' : 'bg-blue-400'
              }`}
              style={{ width: `${(completedCount / ITEMS.length) * 100}%` }}
            />
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-4 space-y-3">

        {ITEMS.map(item => {
          const answer = answers[item.id] ?? EMPTY;
          const selQ   = QUADRANTS.find(q => q.id === answer.quadrant);

          return (
            <div
              key={item.id}
              className={`bg-white rounded-xl border-2 overflow-hidden transition-colors ${
                selQ
                  ? selQ.id === 'noncritical' ? 'border-slate-300'
                  : selQ.id === 'bottleneck'  ? 'border-red-300'
                  : selQ.id === 'leverage'    ? 'border-emerald-300'
                  : 'border-violet-300'
                  : 'border-gray-200'
              }`}
            >
              <div className="px-4 py-3">

                {/* Item header */}
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-8 h-8 rounded-md bg-slate-800 flex items-center justify-center shrink-0">
                    <span className="text-sm font-black text-white">{item.id.toUpperCase()}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="text-sm font-bold text-gray-900">{item.label}</span>
                    <span className="text-xs text-gray-400 ml-2 whitespace-nowrap">{item.category}</span>
                  </div>
                  {selQ ? (
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full whitespace-nowrap shrink-0 flex items-center gap-1 ${selQ.badge}`}>
                      {selQ.label}
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                      </svg>
                    </span>
                  ) : (
                    <Link
                      href={`/items/${item.id}`}
                      target="_blank"
                      className="text-xs text-blue-500 hover:text-blue-700 whitespace-nowrap shrink-0"
                    >
                      데이터 →
                    </Link>
                  )}
                </div>

                {/* Quadrant buttons */}
                <div className="grid grid-cols-4 gap-1.5 mb-3">
                  {QUADRANTS.map(q => {
                    const active = answer.quadrant === q.id;
                    return (
                      <button
                        key={q.id}
                        onClick={() => setField(item.id, 'quadrant', active ? '' : q.id)}
                        className={`py-2 rounded-lg border-2 text-xs font-bold transition-all cursor-pointer ${
                          active ? q.sel : `bg-white ${q.btn}`
                        }`}
                      >
                        {q.label}
                      </button>
                    );
                  })}
                </div>

                {/* Reason */}
                <textarea
                  value={answer.reason}
                  onChange={e => setField(item.id, 'reason', e.target.value)}
                  placeholder="분류 근거 (예: 지출비중 35%, 공급업체 2개 → 전략)"
                  rows={2}
                  className="w-full text-sm text-gray-700 border border-gray-200 rounded-lg px-3 py-2 resize-none focus:outline-none focus:border-blue-300 placeholder-gray-300 leading-relaxed"
                />
              </div>
            </div>
          );
        })}

        {/* Bottom CTA */}
        <div className="pt-2 pb-10">
          <button
            onClick={() => setView('review')}
            className={`w-full py-4 rounded-xl text-sm font-bold transition-all cursor-pointer ${
              allDone
                ? 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-lg'
                : 'bg-white border-2 border-dashed border-gray-300 text-gray-500 hover:border-blue-300 hover:text-blue-600'
            }`}
          >
            {allDone
              ? '모두 임시저장됨 — 검토 후 최종 제출하기 →'
              : `분류 결과 검토 (${completedCount}/${ITEMS.length} 임시저장)`
            }
          </button>

          {!allDone && (
            <p className="text-xs text-gray-400 text-center mt-2">
              미분류: {ITEMS.filter(i => !answers[i.id]?.quadrant).map(i => i.id.toUpperCase()).join(' · ')}
            </p>
          )}
        </div>

      </div>
    </div>
  );
}
