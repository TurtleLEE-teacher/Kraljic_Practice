'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { ITEMS, ITEM_ANSWERS, ITEM_FEEDBACK } from '@/data/items';
import { QUADRANT_META } from '@/data/quadrants';
import { computeAxisScores } from '@/lib/scoring';
import type { QuadrantId } from '@/lib/types';
import KraljicMatrixChart from '@/components/KraljicMatrixChart';

const SUBMIT_KEY = 'kraljic_submitted_v1';
const STRATEGY_KEY = 'kraljic_strategies_v1';

const Q_BADGE: Record<string, { label: string; cls: string }> = {
  noncritical: { label: '일반',    cls: 'bg-slate-100 text-slate-700' },
  bottleneck:  { label: '병목',    cls: 'bg-red-100 text-red-700' },
  leverage:    { label: '레버리지', cls: 'bg-emerald-100 text-emerald-700' },
  strategic:   { label: '전략',    cls: 'bg-violet-100 text-violet-700' },
};

export default function StrategyPage() {
  const [userAnswers, setUserAnswers] = useState<Record<string, string>>({});
  const [showRef, setShowRef] = useState(false);
  const [selectedStrategies, setSelectedStrategies] = useState<Record<string, string[]>>({});
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const sub = localStorage.getItem(SUBMIT_KEY);
      if (sub) {
        const parsed = JSON.parse(sub);
        const answers: Record<string, string> = {};
        for (const [id, val] of Object.entries(parsed.answers as Record<string, { quadrant: string }>)) {
          answers[id] = val.quadrant;
        }
        setUserAnswers(answers);
      }
      const strat = localStorage.getItem(STRATEGY_KEY);
      if (strat) setSelectedStrategies(JSON.parse(strat));
    } catch {}
    setLoaded(true);
  }, []);

  // Persist strategy selections
  useEffect(() => {
    if (loaded) {
      try { localStorage.setItem(STRATEGY_KEY, JSON.stringify(selectedStrategies)); } catch {}
    }
  }, [selectedStrategies, loaded]);

  const toggleStrategy = (itemId: string, stratId: string) => {
    setSelectedStrategies(prev => {
      const current = prev[itemId] || [];
      const next = current.includes(stratId)
        ? current.filter(s => s !== stratId)
        : [...current, stratId];
      return { ...prev, [itemId]: next };
    });
  };

  // Chart data
  const chartData = useMemo(() => {
    return ITEMS.map(item => {
      const { srScore, piScore } = computeAxisScores(item);
      const userQ = userAnswers[item.id] || 'noncritical';
      return {
        id: item.id,
        label: item.label,
        x: srScore,
        y: piScore,
        quadrant: userQ,
      };
    });
  }, [userAnswers]);

  const matchCount = ITEMS.filter(i => userAnswers[i.id] === ITEM_ANSWERS[i.id]).length;

  if (!loaded) return null;

  if (Object.keys(userAnswers).length === 0) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
        <div className="text-center space-y-4">
          <p className="text-gray-500">분류 제출 후 이용할 수 있습니다.</p>
          <Link href="/survey" className="inline-block px-6 py-3 bg-emerald-600 text-white text-sm font-bold rounded-xl hover:bg-emerald-700">
            분류 제출하러 가기 →
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center gap-3">
          <Link href="/survey" className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors">
            <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <span className="text-sm font-bold text-gray-900 flex-1">전략 수립 시뮬레이션</span>
          <span className="text-xs text-violet-600 bg-violet-50 border border-violet-200 font-bold px-2.5 py-1 rounded-full">
            Step 3
          </span>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-6 space-y-8">

        {/* ═══ Section A: 정답 비교 피드백 ═══ */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base font-bold text-gray-900">A. 분류 결과 비교</h2>
            <button
              onClick={() => setShowRef(!showRef)}
              className="text-xs font-bold text-blue-600 hover:text-blue-800 cursor-pointer"
            >
              {showRef ? '참고 분류 숨기기' : '참고 분류 보기'}
            </button>
          </div>

          {showRef && (
            <div className="mb-3 bg-blue-50 border border-blue-200 rounded-xl px-4 py-3">
              <p className="text-sm font-bold text-blue-800 mb-1">
                일치: {matchCount}/10
              </p>
              <div className="h-2 bg-blue-100 rounded-full overflow-hidden">
                <div className="h-full bg-blue-500 rounded-full" style={{ width: `${(matchCount / 10) * 100}%` }} />
              </div>
            </div>
          )}

          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  <th className="px-3 py-2.5 text-left font-semibold text-gray-500">품목</th>
                  <th className="px-3 py-2.5 text-center font-semibold text-gray-500">내 분류</th>
                  {showRef && <th className="px-3 py-2.5 text-center font-semibold text-gray-500">참고 분류</th>}
                  {showRef && <th className="px-3 py-2.5 text-center font-semibold text-gray-500">일치</th>}
                </tr>
              </thead>
              <tbody>
                {ITEMS.map((item, i) => {
                  const userQ = userAnswers[item.id];
                  const refQ = ITEM_ANSWERS[item.id];
                  const match = userQ === refQ;
                  const uBadge = userQ ? Q_BADGE[userQ] : null;
                  const rBadge = Q_BADGE[refQ];

                  return (
                    <tr key={item.id} className={`border-b border-gray-50 ${i % 2 === 0 ? 'bg-white' : 'bg-gray-50/40'}`}>
                      <td className="px-3 py-2.5">
                        <span className="font-black text-gray-700">{item.id.toUpperCase()}</span>
                        <span className="ml-1.5 text-gray-400">{item.label}</span>
                      </td>
                      <td className="px-3 py-2.5 text-center">
                        {uBadge ? (
                          <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${uBadge.cls}`}>{uBadge.label}</span>
                        ) : <span className="text-gray-300">—</span>}
                      </td>
                      {showRef && (
                        <td className="px-3 py-2.5 text-center">
                          <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${rBadge.cls}`}>{rBadge.label}</span>
                        </td>
                      )}
                      {showRef && (
                        <td className="px-3 py-2.5 text-center">
                          {match ? (
                            <span className="text-emerald-600 font-bold">✓</span>
                          ) : (
                            <details className="inline-block">
                              <summary className="text-red-500 font-bold cursor-pointer">✗</summary>
                              <p className="text-[10px] text-red-600 text-left mt-1 max-w-[200px] leading-relaxed">
                                {ITEM_FEEDBACK[item.id]}
                              </p>
                            </details>
                          )}
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>

        {/* ═══ Section B: 전략 옵션 선택 ═══ */}
        <section>
          <h2 className="text-base font-bold text-gray-900 mb-1">B. 전략 옵션 선택</h2>
          <p className="text-sm text-gray-500 mb-4">
            각 품목의 분면에 맞는 전략 옵션을 2~3개 선택하세요. 기대효과와 리스크를 비교해보세요.
          </p>

          <div className="space-y-3">
            {ITEMS.map(item => {
              const qId = (userAnswers[item.id] || 'noncritical') as QuadrantId;
              const meta = QUADRANT_META[qId];
              const selected = selectedStrategies[item.id] || [];
              const badge = Q_BADGE[qId];

              return (
                <div key={item.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                  <div className="px-4 py-3 flex items-center gap-3 border-b border-gray-100">
                    <div className="w-7 h-7 rounded-md bg-slate-800 flex items-center justify-center shrink-0">
                      <span className="text-xs font-black text-white uppercase">{item.id}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="text-sm font-bold text-gray-900">{item.label}</span>
                    </div>
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${badge.cls}`}>{badge.label}</span>
                  </div>

                  {/* Core dilemma */}
                  <div className="px-4 py-2 bg-gray-50 border-b border-gray-100">
                    <p className="text-xs text-gray-500">
                      <span className="font-semibold text-gray-600">핵심 딜레마:</span> {meta.coreDilemma}
                    </p>
                  </div>

                  {/* Strategy options */}
                  <div className="px-4 py-3 space-y-2">
                    {meta.strategies.map(strat => {
                      const isSelected = selected.includes(strat.id);
                      return (
                        <button
                          key={strat.id}
                          onClick={() => toggleStrategy(item.id, strat.id)}
                          className={`w-full text-left px-3 py-2.5 rounded-lg border-2 transition-all cursor-pointer ${
                            isSelected
                              ? 'border-violet-300 bg-violet-50'
                              : 'border-gray-200 hover:border-gray-300 bg-white'
                          }`}
                        >
                          <div className="flex items-start gap-2">
                            <div className={`w-4 h-4 rounded border-2 flex items-center justify-center shrink-0 mt-0.5 ${
                              isSelected ? 'border-violet-500 bg-violet-500' : 'border-gray-300'
                            }`}>
                              {isSelected && (
                                <svg className="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                </svg>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-bold text-gray-800">{strat.name}</p>
                              <p className="text-[11px] text-gray-500 mt-0.5">{strat.description}</p>
                              {isSelected && (
                                <div className="mt-2 grid grid-cols-2 gap-2">
                                  <div className="bg-emerald-50 rounded px-2 py-1.5">
                                    <p className="text-[9px] font-bold text-emerald-600 uppercase">기대효과</p>
                                    <p className="text-[11px] text-emerald-700 mt-0.5">{strat.benefit}</p>
                                  </div>
                                  <div className="bg-red-50 rounded px-2 py-1.5">
                                    <p className="text-[9px] font-bold text-red-500 uppercase">리스크</p>
                                    <p className="text-[11px] text-red-600 mt-0.5">{strat.risk}</p>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* ═══ Section C: Kraljic 매트릭스 시각화 ═══ */}
        <section>
          <h2 className="text-base font-bold text-gray-900 mb-1">C. 포트폴리오 시각화</h2>
          <p className="text-sm text-gray-500 mb-4">
            10개 품목의 공급위험·수익영향 종합점수를 기반으로 매트릭스에 배치합니다.
          </p>
          <KraljicMatrixChart data={chartData} />
        </section>

        {/* Bottom CTA */}
        <div className="grid grid-cols-2 gap-3 pt-2 pb-8">
          <Link
            href="/survey"
            className="block text-center py-3.5 rounded-xl border border-gray-200 bg-white text-sm font-semibold text-gray-600 hover:border-blue-300 hover:text-blue-600 transition-colors"
          >
            ← 분류 결과로
          </Link>
          <Link
            href="/"
            className="block text-center py-3.5 rounded-xl bg-slate-800 text-white text-sm font-bold hover:bg-slate-700 transition-colors"
          >
            처음으로
          </Link>
        </div>
      </div>
    </div>
  );
}
