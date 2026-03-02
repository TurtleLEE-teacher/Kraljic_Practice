'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { ITEMS } from '@/data/items';

/* ─── types ─── */
type Answer = { quadrant: string; reason: string };
type Answers = Record<string, Answer>;

/* ─── constants ─── */
const EMPTY: Answer = { quadrant: '', reason: '' };
const LS_KEY = 'kraljic_survey_v1';

const QUADRANTS = [
  {
    id: 'noncritical',
    label: '일반',
    en: 'Non-critical',
    btn:  'border-slate-300 text-slate-600 hover:bg-slate-50',
    sel:  'bg-slate-700 border-slate-700 text-white',
    card: 'border-slate-400',
    badge:'bg-slate-100 text-slate-700',
  },
  {
    id: 'bottleneck',
    label: '병목',
    en: 'Bottleneck',
    btn:  'border-red-300 text-red-600 hover:bg-red-50',
    sel:  'bg-red-600 border-red-600 text-white',
    card: 'border-red-400',
    badge:'bg-red-100 text-red-700',
  },
  {
    id: 'leverage',
    label: '레버리지',
    en: 'Leverage',
    btn:  'border-emerald-300 text-emerald-700 hover:bg-emerald-50',
    sel:  'bg-emerald-600 border-emerald-600 text-white',
    card: 'border-emerald-400',
    badge:'bg-emerald-100 text-emerald-700',
  },
  {
    id: 'strategic',
    label: '전략',
    en: 'Strategic',
    btn:  'border-violet-300 text-violet-700 hover:bg-violet-50',
    sel:  'bg-violet-600 border-violet-600 text-white',
    card: 'border-violet-400',
    badge:'bg-violet-100 text-violet-700',
  },
] as const;

const CATEGORY_ICONS: Record<string, string> = {
  '전자부품':          '⚡',
  '산업용 소재':       '🔩',
  '사무용품':          '📋',
  '2차전지':           '🔋',
  '철강/금속':         '⚙️',
  '포장재':            '📦',
  '희소금속/자성재료': '🧲',
  'MRO 소모품':        '🔧',
  '반도체 소재':       '💡',
  '합성수지/플라스틱': '🧪',
};

/* ═══════════════════════════════════════
   Main Page
═══════════════════════════════════════ */
export default function SurveyPage() {
  const [answers, setAnswers] = useState<Answers>({});
  const [view, setView]       = useState<'form' | 'summary'>('form');
  const [copied, setCopied]   = useState(false);

  /* localStorage persistence */
  useEffect(() => {
    try {
      const s = localStorage.getItem(LS_KEY);
      if (s) setAnswers(JSON.parse(s));
    } catch {}
  }, []);

  useEffect(() => {
    try { localStorage.setItem(LS_KEY, JSON.stringify(answers)); } catch {}
  }, [answers]);

  const setField = useCallback((id: string, field: keyof Answer, val: string) => {
    setAnswers(prev => ({
      ...prev,
      [id]: { ...(prev[id] ?? EMPTY), [field]: val },
    }));
  }, []);

  const completedCount = ITEMS.filter(i => answers[i.id]?.quadrant).length;

  const copyText = async () => {
    const text = [
      '크랄직 매트릭스 품목군 분류 결과',
      `제출: ${new Date().toLocaleString('ko-KR')}`,
      '',
      ...ITEMS.map(item => {
        const a = answers[item.id];
        const q = QUADRANTS.find(q => q.id === a?.quadrant);
        return [
          `[${item.id.toUpperCase()}] ${item.label}`,
          `  품목군: ${q?.label ?? '미분류'} (${q?.en ?? '-'})`,
          `  근거:   ${a?.reason?.trim() || '(없음)'}`,
        ].join('\n');
      }),
    ].join('\n');
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {}
  };

  /* ─── Summary View ─── */
  if (view === 'summary') {
    return (
      <div className="min-h-screen bg-slate-50">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
          <div className="max-w-2xl mx-auto px-4 py-3 flex items-center gap-3">
            <button
              onClick={() => setView('form')}
              className="text-sm text-gray-500 hover:text-gray-800 cursor-pointer flex items-center gap-1"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              수정
            </button>
            <span className="flex-1 text-sm font-bold text-gray-900">분류 결과 요약</span>
            <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
              completedCount === 10 ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
            }`}>
              {completedCount} / 10 완료
            </span>
          </div>
        </div>

        <div className="max-w-2xl mx-auto px-4 py-5 space-y-4">

          {/* Result table */}
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="px-4 py-3 bg-gray-50 border-b border-gray-100">
              <p className="text-sm font-bold text-gray-800">품목별 분류 결과</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="px-3 py-2.5 text-left font-semibold text-gray-500 whitespace-nowrap">품목</th>
                    <th className="px-3 py-2.5 text-left font-semibold text-gray-500 whitespace-nowrap">품목명</th>
                    <th className="px-3 py-2.5 text-center font-semibold text-gray-500 whitespace-nowrap">품목군</th>
                    <th className="px-3 py-2.5 text-left font-semibold text-gray-500">분류 근거</th>
                  </tr>
                </thead>
                <tbody>
                  {ITEMS.map((item, i) => {
                    const a = answers[item.id];
                    const q = QUADRANTS.find(q => q.id === a?.quadrant);
                    const icon = CATEGORY_ICONS[item.category] ?? '📌';
                    return (
                      <tr key={item.id} className={`border-b border-gray-50 ${i % 2 === 0 ? 'bg-white' : 'bg-gray-50/40'}`}>
                        <td className="px-3 py-2.5">
                          <span className="font-black text-gray-700 text-sm">{item.id.toUpperCase()}</span>
                          <span className="ml-1 text-xs">{icon}</span>
                        </td>
                        <td className="px-3 py-2.5 font-medium text-gray-700 whitespace-nowrap">{item.label}</td>
                        <td className="px-3 py-2.5 text-center">
                          {q ? (
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap ${q.badge}`}>
                              {q.label}
                            </span>
                          ) : (
                            <span className="text-[10px] text-gray-300">미분류</span>
                          )}
                        </td>
                        <td className="px-3 py-2.5 text-gray-500 max-w-[200px]">
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
          <button
            onClick={copyText}
            className="w-full py-3.5 rounded-xl bg-slate-800 text-white text-sm font-bold hover:bg-slate-700 transition-colors cursor-pointer"
          >
            {copied ? '✓ 클립보드에 복사됨!' : '📋 결과 텍스트 복사'}
          </button>

          {/* Notion 연동 안내 */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
            <p className="text-xs font-bold text-blue-800 mb-1.5">🔗 Notion DB 연동 — 개발 예정</p>
            <p className="text-[11px] text-blue-600 leading-relaxed">
              Notion API 키 설정 후 위 결과를 데이터베이스에 자동 전송할 수 있습니다.
              현재는 <strong>텍스트 복사</strong> 후 Notion에 직접 붙여넣으세요.
            </p>
          </div>

          <button
            onClick={() => setView('form')}
            className="w-full py-3 rounded-xl border-2 border-gray-200 text-sm text-gray-600 font-semibold hover:border-blue-300 hover:text-blue-600 transition-colors cursor-pointer"
          >
            ← 돌아가서 수정
          </button>

        </div>
      </div>
    );
  }

  /* ─── Form View ─── */
  return (
    <div className="min-h-screen bg-slate-50">

      {/* Sticky header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-2.5">
          <div className="flex items-center gap-3 mb-2">
            <Link href="/" className="p-1 rounded-lg hover:bg-gray-100 transition-colors">
              <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </Link>
            <span className="text-sm font-bold text-gray-900 flex-1">품목군 분류 제출</span>
            <span className="text-xs text-gray-400 shrink-0">{completedCount} / 10</span>
            <button
              onClick={() => setView('summary')}
              className="text-xs font-semibold text-blue-600 hover:text-blue-800 cursor-pointer whitespace-nowrap"
            >
              결과 보기 →
            </button>
          </div>
          {/* Progress bar */}
          <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-emerald-500 rounded-full transition-all duration-300"
              style={{ width: `${(completedCount / ITEMS.length) * 100}%` }}
            />
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-4 space-y-3">

        {ITEMS.map(item => {
          const answer = answers[item.id] ?? EMPTY;
          const selQ   = QUADRANTS.find(q => q.id === answer.quadrant);
          const icon   = CATEGORY_ICONS[item.category] ?? '📌';

          return (
            <div
              key={item.id}
              className={`bg-white rounded-xl border-2 overflow-hidden transition-colors duration-200 ${
                selQ ? selQ.card : 'border-gray-200'
              }`}
            >
              {/* Item header row */}
              <div className="px-4 py-2.5 border-b border-gray-100 flex items-center gap-3">
                {/* ID badge */}
                <div className="relative shrink-0">
                  <div className="w-9 h-9 rounded-xl bg-slate-800 flex items-center justify-center">
                    <span className="text-base font-black text-white">{item.id.toUpperCase()}</span>
                  </div>
                  <span className="absolute -bottom-0.5 -right-0.5 text-sm leading-none">{icon}</span>
                </div>

                {/* Name + category — NO wrap */}
                <div className="flex-1 min-w-0 overflow-hidden">
                  <p className="text-sm font-bold text-gray-900 whitespace-nowrap truncate">{item.label}</p>
                  <p className="text-[11px] text-gray-400 whitespace-nowrap">{item.category}</p>
                </div>

                {/* Right: done badge + data link */}
                <div className="flex items-center gap-2 shrink-0">
                  {selQ && (
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap ${selQ.badge}`}>
                      {selQ.label}
                    </span>
                  )}
                  <Link
                    href={`/items/${item.id}`}
                    target="_blank"
                    className="text-[11px] text-blue-500 hover:text-blue-700 whitespace-nowrap"
                  >
                    데이터 →
                  </Link>
                </div>
              </div>

              <div className="px-4 py-3 space-y-2.5">

                {/* Quadrant buttons */}
                <div>
                  <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
                    품목군 선택
                  </p>
                  <div className="grid grid-cols-4 gap-1.5">
                    {QUADRANTS.map(q => {
                      const active = answer.quadrant === q.id;
                      return (
                        <button
                          key={q.id}
                          onClick={() => setField(item.id, 'quadrant', active ? '' : q.id)}
                          className={`py-2.5 rounded-lg text-center border-2 transition-all cursor-pointer ${
                            active ? q.sel : `${q.btn} bg-white`
                          }`}
                        >
                          <div className="text-[11px] font-bold whitespace-nowrap leading-none">{q.label}</div>
                          <div className={`text-[9px] mt-0.5 whitespace-nowrap ${active ? 'opacity-75' : 'opacity-40'}`}>
                            {q.en}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Reason textarea */}
                <div>
                  <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
                    분류 근거 <span className="font-normal normal-case">(핵심 KPI 수치 기반)</span>
                  </p>
                  <textarea
                    value={answer.reason}
                    onChange={e => setField(item.id, 'reason', e.target.value)}
                    placeholder={`예) 지출비중 35%, 공급업체 2개, 대체불가 → 전략`}
                    rows={2}
                    className="w-full text-xs text-gray-700 border border-gray-200 rounded-lg px-3 py-2 resize-none focus:outline-none focus:border-blue-300 placeholder-gray-300 leading-relaxed"
                  />
                </div>

              </div>
            </div>
          );
        })}

        {/* Bottom CTA */}
        <div className="pt-2 pb-10">
          <button
            onClick={() => setView('summary')}
            className={`w-full py-4 rounded-xl text-sm font-bold transition-all cursor-pointer ${
              completedCount === ITEMS.length
                ? 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-md'
                : 'bg-white border-2 border-dashed border-gray-300 text-gray-500 hover:border-blue-300 hover:text-blue-600'
            }`}
          >
            {completedCount === ITEMS.length
              ? '✅ 분류 결과 확인 & 제출 →'
              : `결과 미리보기 (${completedCount} / ${ITEMS.length} 완료)`
            }
          </button>

          {completedCount < ITEMS.length && (
            <p className="text-[11px] text-gray-400 text-center mt-2">
              미분류:{' '}
              {ITEMS.filter(i => !answers[i.id]?.quadrant)
                .map(i => i.id.toUpperCase())
                .join(' · ')}
            </p>
          )}
        </div>

      </div>
    </div>
  );
}
