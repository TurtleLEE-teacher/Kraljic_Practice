'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ITEMS } from '@/data/items';

const LS_KEY = 'kraljic_survey_v1';
const SUBMIT_KEY = 'kraljic_submitted_v1';

const Q_STYLE: Record<string, { label: string; badge: string; border: string }> = {
  noncritical: { label: '일반',    badge: 'bg-slate-100 text-slate-700',    border: 'border-slate-300' },
  bottleneck:  { label: '병목',    badge: 'bg-red-100 text-red-700',        border: 'border-red-300'   },
  leverage:    { label: '레버리지', badge: 'bg-emerald-100 text-emerald-700', border: 'border-emerald-300' },
  strategic:   { label: '전략',    badge: 'bg-violet-100 text-violet-700',  border: 'border-violet-300' },
};

export default function ItemsPage() {
  const [answers, setAnswers] = useState<Record<string, { quadrant: string }>>({});
  const [submitted, setSubmitted] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(LS_KEY);
      if (raw) setAnswers(JSON.parse(raw));
      setSubmitted(!!localStorage.getItem(SUBMIT_KEY));
    } catch {}
    setLoaded(true);
  }, []);

  const completedCount = loaded ? ITEMS.filter(i => answers[i.id]?.quadrant).length : 0;
  const allDone = completedCount === ITEMS.length;

  return (
    <div className="min-h-screen bg-slate-50">

      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center gap-3">
          <Link href="/" className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors">
            <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <span className="text-sm font-bold text-gray-900 flex-1">10개 품목 원천 데이터</span>
          {loaded && (
            <span className={`text-xs font-semibold px-2.5 py-1 rounded-full whitespace-nowrap ${
              submitted ? 'bg-emerald-100 text-emerald-700' :
              allDone   ? 'bg-blue-100 text-blue-700' :
                          'bg-gray-100 text-gray-500'
            }`}>
              {submitted ? '최종 제출 완료' : `${completedCount}/10 임시저장`}
            </span>
          )}
          <Link href="/guide" className="text-xs text-gray-500 hover:text-gray-800 font-semibold whitespace-nowrap">
            가이드
          </Link>
          <span className="text-gray-200">|</span>
          <Link href="/survey" className="text-xs text-emerald-600 hover:text-emerald-800 font-bold whitespace-nowrap">
            제출
          </Link>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-4">
        <div className="space-y-2">
          {ITEMS.map((item) => {
            const latestSpend = item.spends[item.spends.length - 1];
            const qid = loaded ? answers[item.id]?.quadrant : undefined;
            const qs = qid ? Q_STYLE[qid] : null;

            return (
              <Link
                key={item.id}
                href={`/items/${item.id}`}
                className={`flex items-center gap-3 px-4 py-3.5 bg-white rounded-xl border-2 hover:shadow-sm transition-all group ${
                  qs ? qs.border : 'border-gray-200 hover:border-blue-300'
                }`}
              >
                {/* ID */}
                <div className="w-9 h-9 rounded-lg bg-slate-800 flex items-center justify-center shrink-0">
                  <span className="text-sm font-black text-white uppercase">{item.id}</span>
                </div>

                {/* Name + category + difficulty */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <p className="text-sm font-bold text-gray-900 whitespace-nowrap">{item.label}</p>
                    <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full whitespace-nowrap ${
                      item.difficulty === 'easy' ? 'bg-emerald-100 text-emerald-700' :
                      item.difficulty === 'normal' ? 'bg-blue-100 text-blue-700' :
                      item.difficulty === 'hard' ? 'bg-orange-100 text-orange-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                      {item.difficulty === 'easy' ? '쉬움' : item.difficulty === 'normal' ? '보통' : item.difficulty === 'hard' ? '어려움' : '심화'}
                    </span>
                  </div>
                  <p className="text-xs text-gray-400 whitespace-nowrap">{item.category}</p>
                </div>

                {/* Classification badge OR raw stats */}
                {qs ? (
                  <span className={`text-xs font-bold px-2.5 py-1 rounded-full whitespace-nowrap shrink-0 ${qs.badge}`}>
                    {qs.label}
                  </span>
                ) : (
                  <div className="flex items-center gap-2 text-xs text-gray-400 shrink-0">
                    <span className="whitespace-nowrap">{item.deliveries.length}건</span>
                    <span className="text-gray-200">·</span>
                    <span className="whitespace-nowrap">{item.suppliers.length}개 업체</span>
                    <span className="text-gray-200">·</span>
                    <span className="whitespace-nowrap font-semibold text-gray-600">{latestSpend.itemSpend}억</span>
                  </div>
                )}

                {/* Status icon */}
                {qs ? (
                  <div className="w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center shrink-0">
                    <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                ) : (
                  <svg className="w-4 h-4 text-gray-300 group-hover:text-blue-400 transition-colors shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                )}
              </Link>
            );
          })}
        </div>

        {/* Final submit CTA */}
        {loaded && (
          <div className="mt-4">
            {submitted ? (
              <Link
                href="/survey"
                className="flex items-center justify-center gap-2 py-4 rounded-xl bg-emerald-50 border-2 border-emerald-300 text-emerald-700 text-sm font-bold"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                최종 제출 완료 — 결과 확인하기
              </Link>
            ) : allDone ? (
              <Link
                href="/survey"
                className="block text-center py-4 rounded-xl bg-emerald-600 text-white text-sm font-bold hover:bg-emerald-700 transition-colors shadow-lg"
              >
                10개 모두 임시저장됨 — 최종 제출하기 →
              </Link>
            ) : (
              <Link
                href="/survey"
                className="block text-center py-3 rounded-xl border border-gray-200 bg-white text-gray-500 text-sm hover:border-blue-300 hover:text-blue-600 transition-colors"
              >
                전체 현황 보기 ({completedCount}/10 임시저장)
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
