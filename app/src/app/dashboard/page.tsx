'use client';

import React, { useMemo, useCallback, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import type { QuadrantId, ScenarioData } from '@/lib/types';
import { QUADRANT_META, QUADRANT_ORDER } from '@/data/quadrants';
import { useGameStore } from '@/store/gameStore';
import { normalizeScore, DIM_LABELS } from '@/lib/scoring';
import {
  getNotionConfig,
  saveNotionConfig,
  type SubmitStatus,
} from '@/lib/notionSubmit';

/** Load scenario data dynamically */
async function loadScenarioData(quadrantId: QuadrantId): Promise<ScenarioData | null> {
  try {
    switch (quadrantId) {
      case 'bottleneck': {
        const { bottleneckScenario } = await import('@/data/bottleneck');
        return bottleneckScenario;
      }
      case 'leverage': {
        const { leverageScenario } = await import('@/data/leverage');
        return leverageScenario;
      }
      case 'strategic': {
        const { strategicScenario } = await import('@/data/strategic');
        return strategicScenario;
      }
      case 'noncritical': {
        const { noncriticalScenario } = await import('@/data/noncritical');
        return noncriticalScenario;
      }
      default:
        return null;
    }
  } catch {
    return null;
  }
}

/** Redact quadrant names from text */
function redactText(text: string): string {
  return text
    .replace(/병목/g, '●●')
    .replace(/레버리지/g, '●●●●')
    .replace(/전략/g, '●●')
    .replace(/일반/g, '●●')
    .replace(/Bottleneck/gi, '●●●●')
    .replace(/Leverage/gi, '●●●●')
    .replace(/Strategic/gi, '●●●●')
    .replace(/Non-?critical/gi, '●●●●');
}

/** Dimension insight by quadrant */
const QUADRANT_DIM_INSIGHT: Record<QuadrantId, Record<string, string>> = {
  bottleneck: {
    ce: '비용 절약을 중시했지만, 병목 품목에서는 공급 안정성이 더 중요합니다.',
    ss: '공급 안정성을 우선시한 판단은 병목 품목의 핵심 원칙에 부합합니다.',
    sv: '장기 전략적 가치를 추구했습니다. 병목 품목에서는 실질적인 공급 확보가 먼저입니다.',
  },
  leverage: {
    ce: '비용 효율성 극대화는 레버리지 품목의 핵심 전략입니다.',
    ss: '공급 안정성을 중시했지만, 레버리지 품목은 경쟁을 통한 비용 절감이 우선입니다.',
    sv: '전략적 가치를 고려한 소싱은 레버리지에서 전략으로의 진화 가능성을 보여줍니다.',
  },
  strategic: {
    ce: '비용 절감에 집중했지만, 전략 품목은 장기 가치 창출이 핵심입니다.',
    ss: '공급 안정성 확보는 중요하지만, 전략 품목에서는 혁신 파트너십이 더 큰 가치를 만듭니다.',
    sv: '전략적 가치 극대화는 전략 품목 관리의 핵심에 정확히 부합합니다.',
  },
  noncritical: {
    ce: '비용 효율화는 일상 품목 관리의 기본 원칙입니다.',
    ss: '공급 안정성을 중시했지만, 일상 품목은 관리 효율화가 더 중요합니다.',
    sv: '프로세스 혁신을 추구했습니다. 일상 품목에서도 시스템 개선은 큰 가치를 만듭니다.',
  },
};

/** Quadrant brief explanation for presentation */
const QUADRANT_EXPLAIN: Record<QuadrantId, { risk: string; impact: string; strategy: string }> = {
  bottleneck: {
    risk: '공급 위험 높음',
    impact: '수익 영향 낮음',
    strategy: '금액은 작지만 대체 불가한 품목. 공급 안정성 확보가 최우선.',
  },
  leverage: {
    risk: '공급 위험 낮음',
    impact: '수익 영향 높음',
    strategy: '대체 공급사가 많고 금액이 큰 품목. 경쟁을 활용한 비용 절감이 핵심.',
  },
  strategic: {
    risk: '공급 위험 높음',
    impact: '수익 영향 높음',
    strategy: '핵심 부품으로 공급사와 전략적 파트너십이 필수. 종속 vs 협력의 균형이 핵심.',
  },
  noncritical: {
    risk: '공급 위험 낮음',
    impact: '수익 영향 낮음',
    strategy: '소액 다품종 품목. 관리 비용을 줄이는 효율화가 핵심.',
  },
};

export default function DashboardPage() {
  const router = useRouter();
  const store = useGameStore();

  // 발표 모드 상태
  const [isRevealed, setIsRevealed] = useState(false);
  const [revealAnimation, setRevealAnimation] = useState(false);
  const [scenarioData, setScenarioData] = useState<ScenarioData | null>(null);

  // 완료된 사분면 찾기 (가장 최근 완료)
  const completedQuadrant = useMemo<QuadrantId | null>(() => {
    for (const qId of [...QUADRANT_ORDER].reverse()) {
      const count = store.submissions.filter((s) => s.quadrant === qId).length;
      if (count >= 4) return qId;
    }
    return null;
  }, [store.submissions]);

  // 시나리오 데이터 로드
  useEffect(() => {
    if (!completedQuadrant) return;
    loadScenarioData(completedQuadrant).then(setScenarioData);
  }, [completedQuadrant]);

  // 해당 사분면 스텝별 데이터
  const stepData = useMemo(() => {
    if (!completedQuadrant) return [];
    return store.submissions
      .filter((s) => s.quadrant === completedQuadrant)
      .sort((a, b) => a.step - b.step);
  }, [store.submissions, completedQuadrant]);

  // 점수 (정규화된 100점 기준)
  const rawTotal = useMemo(() => stepData.reduce((sum, s) => sum + s.scores.weighted, 0), [stepData]);
  const score100 = completedQuadrant ? normalizeScore(rawTotal, completedQuadrant) : 0;
  const meta = completedQuadrant ? QUADRANT_META[completedQuadrant] : null;

  // 차원별 합산
  const dimTotals = useMemo(() => {
    const ce = stepData.reduce((s, d) => s + d.scores.raw.ce, 0);
    const ss = stepData.reduce((s, d) => s + d.scores.raw.ss, 0);
    const sv = stepData.reduce((s, d) => s + d.scores.raw.sv, 0);
    return { ce, ss, sv };
  }, [stepData]);

  // 가장 높은 차원
  const sortedDims = useMemo(() => {
    const dims = [
      { key: 'ce' as const, val: dimTotals.ce, label: DIM_LABELS.ce },
      { key: 'ss' as const, val: dimTotals.ss, label: DIM_LABELS.ss },
      { key: 'sv' as const, val: dimTotals.sv, label: DIM_LABELS.sv },
    ];
    return dims.sort((a, b) => b.val - a.val);
  }, [dimTotals]);

  // 핵심 차원
  const primaryDim = useMemo(() => {
    if (!meta) return null;
    const dims = [
      { key: 'ce' as const, w: meta.weights.ce },
      { key: 'ss' as const, w: meta.weights.ss },
      { key: 'sv' as const, w: meta.weights.sv },
    ];
    return dims.sort((a, b) => b.w - a.w)[0];
  }, [meta]);

  const teamAlignment = useMemo(() => {
    if (!primaryDim || !completedQuadrant) return null;
    const teamTop = sortedDims[0].key;
    const isAligned = teamTop === primaryDim.key;
    return { teamTop, isAligned };
  }, [primaryDim, sortedDims, completedQuadrant]);

  // 선택된 옵션 제목 가져오기
  const choiceTitles = useMemo(() => {
    if (!scenarioData) return [];
    return stepData.map((sub) => {
      const step = scenarioData.steps[sub.step];
      if (!step) return '\u2014';
      const choice = step.choices.find((c) => c.id === sub.choiceId);
      return choice ? choice.title : '\u2014';
    });
  }, [scenarioData, stepData]);

  // 정답 공개 핸들러
  const handleReveal = useCallback(() => {
    setRevealAnimation(true);
    setTimeout(() => setIsRevealed(true), 600);
  }, []);

  // Notion submit
  const [notionStatus, setNotionStatus] = useState<SubmitStatus>('idle');
  const [notionMsg, setNotionMsg] = useState('');
  const [showNotionConfig, setShowNotionConfig] = useState(false);
  const [notionUrl, setNotionUrl] = useState(() => getNotionConfig()?.proxyUrl ?? '');

  const handleNotionSubmit = useCallback(async () => {
    const config = getNotionConfig();
    if (!config?.proxyUrl) {
      setShowNotionConfig(true);
      return;
    }
    if (!completedQuadrant || !meta) return;
    setNotionStatus('sending');
    setNotionMsg('');

    const payload = {
      sessionId: store.sessionId,
      participantName: store.participantName,
      quadrant: completedQuadrant,
      quadrantNameKo: meta.nameKo,
      score100,
      rawTotal: parseFloat(rawTotal.toFixed(2)),
      dimCe: dimTotals.ce,
      dimSs: dimTotals.ss,
      dimSv: dimTotals.sv,
      teamTopValue: sortedDims[0].label,
      choices: stepData.map((s) => s.choiceId),
      submittedAt: new Date().toISOString(),
    };

    try {
      const res = await fetch(config.proxyUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      setNotionStatus(res.ok ? 'success' : 'error');
      setNotionMsg(res.ok ? '\uc804\uc1a1 \uc644\ub8cc' : `\uc804\uc1a1 \uc2e4\ud328 (${res.status})`);
    } catch {
      setNotionStatus('error');
      setNotionMsg('\ub124\ud2b8\uc6cc\ud06c \uc624\ub958');
    }
  }, [completedQuadrant, meta, store.sessionId, store.participantName, score100, rawTotal, dimTotals, stepData, sortedDims]);

  const handleSaveNotionConfig = useCallback(() => {
    if (!notionUrl.trim()) return;
    saveNotionConfig({ proxyUrl: notionUrl.trim() });
    setShowNotionConfig(false);
    handleNotionSubmit();
  }, [notionUrl, handleNotionSubmit]);

  const handleRestart = useCallback(() => {
    store.reset();
    router.push('/');
  }, [store, router]);

  // 데이터 없을 때
  if (!completedQuadrant || !meta) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-sm text-center">
          <h2 className="text-lg font-bold text-gray-800 mb-2">완료한 사분면이 없습니다</h2>
          <p className="text-sm text-gray-600 mb-4">사분면을 선택하고 4단계를 완료해 주세요.</p>
          <button onClick={() => router.push('/')} className="px-6 py-2.5 bg-slate-800 text-white rounded-lg text-sm font-medium">
            시작하기
          </button>
        </div>
      </div>
    );
  }

  const colorHex = meta.color === 'red' ? '#ef4444' : meta.color === 'emerald' ? '#10b981' : meta.color === 'violet' ? '#8b5cf6' : '#64748b';
  const explain = QUADRANT_EXPLAIN[completedQuadrant];

  // ==========================================
  // 발표 모드 (정답 가려진 상태)
  // ==========================================
  if (!isRevealed) {
    return (
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white border-b border-gray-200">
          <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between">
            <span className="text-sm font-semibold text-gray-700">품목군 맞추기</span>
            <button onClick={() => router.push('/')} className="text-xs text-gray-400 hover:text-gray-600">
              홈으로
            </button>
          </div>
        </header>

        <main className="max-w-3xl mx-auto px-4 py-8 space-y-6">
          {/* 발표자 + 미스터리 */}
          <section className="bg-white rounded-2xl shadow-sm p-6 text-center">
            <p className="text-sm text-gray-500 mb-3">{store.participantName} 님의 품목군</p>
            <div className={`inline-flex items-center justify-center w-20 h-20 rounded-full bg-gray-100 mb-4 ${revealAnimation ? 'animate-pulse' : ''}`}>
              <span className="text-3xl font-black text-gray-400">?</span>
            </div>
            <h1 className="text-xl font-bold text-gray-900">어떤 품목군일까요?</h1>
            <p className="text-sm text-gray-500 mt-2">아래 힌트를 보고 4가지 사분면 중 하나를 맞춰보세요!</p>
            <div className="flex justify-center gap-2 mt-3">
              {['병목', '레버리지', '전략', '일반'].map((name) => (
                <span key={name} className="px-3 py-1 bg-gray-100 text-gray-600 text-xs font-medium rounded-full">
                  {name}
                </span>
              ))}
            </div>
          </section>

          {/* 힌트 1: 기업·품목 정보 */}
          {scenarioData && (
            <section className="bg-white rounded-2xl shadow-sm p-6">
              <div className="flex items-center gap-2 mb-3">
                <span className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center text-xs font-bold text-blue-600">1</span>
                <h2 className="text-base font-bold text-gray-800">기업 및 품목 정보</h2>
              </div>
              <div className="space-y-2 text-sm text-gray-700">
                <p><strong>기업:</strong> {scenarioData.background.companyName} ({scenarioData.background.industry})</p>
                <p><strong>품목:</strong> {scenarioData.background.itemName}</p>
                <p><strong>연간 구매액:</strong> {scenarioData.background.annualSpend}</p>
                <p className="text-gray-600 text-xs mt-2">{redactText(scenarioData.background.itemDescription)}</p>
              </div>
              <div className="mt-3 space-y-1">
                {scenarioData.background.keyMetrics.map((m, i) => (
                  <p key={i} className="text-xs text-gray-500 pl-3 border-l-2 border-gray-200">{redactText(m)}</p>
                ))}
              </div>
            </section>
          )}

          {/* 힌트 2: 의사결정 요약 */}
          {scenarioData && (
            <section className="bg-white rounded-2xl shadow-sm p-6">
              <div className="flex items-center gap-2 mb-3">
                <span className="w-6 h-6 rounded-full bg-violet-100 flex items-center justify-center text-xs font-bold text-violet-600">2</span>
                <h2 className="text-base font-bold text-gray-800">4단계 의사결정 요약</h2>
              </div>
              <div className="space-y-3">
                {scenarioData.steps.map((step, i) => (
                  <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-gray-50">
                    <span className="text-xs font-bold text-gray-400 flex-shrink-0 mt-1">Step {i + 1}</span>
                    <div>
                      <p className="text-sm font-medium text-gray-800">{redactText(step.title)}</p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        선택: <span className="font-medium text-gray-700">{redactText(choiceTitles[i] || '\u2014')}</span>
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* 힌트 3: 가치 차원 분석 */}
          <section className="bg-white rounded-2xl shadow-sm p-6">
            <div className="flex items-center gap-2 mb-3">
              <span className="w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center text-xs font-bold text-emerald-600">3</span>
              <h2 className="text-base font-bold text-gray-800">가치 차원 분석</h2>
            </div>
            <p className="text-xs text-gray-500 mb-4">이 참가자가 4단계에서 어떤 가치를 중시했는지 보여줍니다</p>
            <div className="space-y-3">
              {sortedDims.map((dim, i) => {
                const max = 20;
                const pct = (dim.val / max) * 100;
                const isTop = i === 0;
                return (
                  <div key={dim.key}>
                    <div className="flex items-center justify-between mb-1">
                      <span className={`text-sm ${isTop ? 'font-bold text-gray-900' : 'text-gray-600'}`}>
                        {dim.label}
                        {isTop && <span className="text-xs ml-1.5 text-violet-600 font-semibold">가장 중시</span>}
                      </span>
                      <span className="text-xs text-gray-400">{dim.val}/{max}</span>
                    </div>
                    <div className="w-full h-3.5 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-700"
                        style={{ width: `${pct}%`, backgroundColor: isTop ? '#6b7280' : '#d1d5db' }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* 정답 공개 버튼 */}
          <section className="text-center space-y-3">
            <p className="text-sm text-gray-500">다른 참가자들이 답을 정했으면 공개하세요!</p>
            <button
              onClick={handleReveal}
              className={`px-8 py-4 bg-gradient-to-r from-violet-600 to-blue-600 text-white text-lg font-bold rounded-2xl shadow-lg
                         hover:from-violet-700 hover:to-blue-700 active:scale-95 transition-all duration-200 cursor-pointer
                         ${revealAnimation ? 'animate-bounce' : ''}`}
            >
              정답 공개
            </button>
          </section>

          <footer className="text-center text-xs text-gray-400 py-4 border-t border-gray-100">
            Kraljic Matrix 워크샵
          </footer>
        </main>
      </div>
    );
  }

  // ==========================================
  // 정답 공개 후 (전체 결과 + 발표 가이드)
  // ==========================================
  return (
    <div className="min-h-screen bg-gray-50 print:bg-white">
      <header className="bg-white border-b border-gray-200 print:hidden">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between">
          <span className="text-sm font-semibold text-gray-700">정답 공개!</span>
          <button onClick={() => router.push('/')} className="text-xs text-gray-400 hover:text-gray-600">
            홈으로
          </button>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-8 print:py-4 space-y-6">
        {/* 정답 공개 */}
        <section className="bg-white rounded-2xl shadow-lg p-8 text-center border-2" style={{ borderColor: colorHex }}>
          <p className="text-sm text-gray-500 mb-2">{store.participantName} 님의 품목군은</p>
          <div className="flex items-center justify-center gap-3 mb-3">
            <span className="w-5 h-5 rounded-full" style={{ backgroundColor: colorHex }} />
            <h1 className="text-3xl font-black" style={{ color: colorHex }}>
              {meta.nameKo}
            </h1>
            <span className="text-base font-normal text-gray-400">({meta.nameEn})</span>
          </div>
          <div className="inline-flex items-center gap-4 text-sm text-gray-600 mt-2">
            <span>공급 위험: <strong>{explain.risk}</strong></span>
            <span className="text-gray-300">|</span>
            <span>수익 영향: <strong>{explain.impact}</strong></span>
          </div>
          <p className="text-sm text-gray-700 mt-3 max-w-md mx-auto">{explain.strategy}</p>
          <div className="mt-4 text-3xl font-extrabold" style={{ color: colorHex }}>
            {score100}<span className="text-sm font-normal text-gray-400"> / 100점</span>
          </div>
        </section>

        {/* 발표 가이드 */}
        <section className="bg-white rounded-2xl shadow-sm p-6" style={{ borderLeft: `4px solid ${colorHex}` }}>
          <h2 className="text-base font-bold text-gray-800 mb-3">발표 가이드</h2>
          <p className="text-xs text-gray-500 mb-3">아래 내용을 참고하여 30초~1분 간단히 발표해 주세요.</p>
          <div className="space-y-2">
            <div className="flex items-start gap-2 p-2.5 rounded-lg bg-gray-50">
              <span className="text-xs font-bold text-gray-400 flex-shrink-0">1.</span>
              <p className="text-sm text-gray-700">
                <strong>{meta.nameKo}</strong> 사분면이란? &mdash; {explain.strategy}
              </p>
            </div>
            <div className="flex items-start gap-2 p-2.5 rounded-lg bg-gray-50">
              <span className="text-xs font-bold text-gray-400 flex-shrink-0">2.</span>
              <p className="text-sm text-gray-700">
                핵심 딜레마: &ldquo;{meta.coreDilemma}&rdquo;
              </p>
            </div>
            <div className="flex items-start gap-2 p-2.5 rounded-lg bg-gray-50">
              <span className="text-xs font-bold text-gray-400 flex-shrink-0">3.</span>
              <p className="text-sm text-gray-700">
                4단계 중 가장 어려웠던 의사결정과 그 이유
              </p>
            </div>
            <div className="flex items-start gap-2 p-2.5 rounded-lg bg-gray-50">
              <span className="text-xs font-bold text-gray-400 flex-shrink-0">4.</span>
              <p className="text-sm text-gray-700">
                가치 차원 분석: {sortedDims[0].label}을(를) 가장 중시한 이유
              </p>
            </div>
          </div>
        </section>

        {/* 가치 성향 분석 (공개 후 색상 포함) */}
        <section className="bg-white rounded-2xl shadow-sm p-6">
          <h2 className="text-base font-bold text-gray-800 mb-1">가치 성향 분석</h2>
          <p className="text-xs text-gray-500 mb-5">4단계 의사결정에서 어떤 가치를 우선시했는지 보여줍니다</p>
          <div className="space-y-4">
            {sortedDims.map((dim, i) => {
              const max = 20;
              const pct = (dim.val / max) * 100;
              const isPrimary = primaryDim?.key === dim.key;
              const isTop = i === 0;
              const weight = meta.weights[dim.key];
              return (
                <div key={dim.key}>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className={`text-sm ${isTop ? 'font-bold text-gray-900' : 'text-gray-600'}`}>
                      {dim.label}
                      {isTop && <span className="text-xs ml-1.5 text-violet-600 font-semibold">가장 중시</span>}
                      {isPrimary && <span className="text-xs ml-1.5 font-medium" style={{ color: colorHex }}>사분면 핵심</span>}
                    </span>
                    <span className="text-xs text-gray-400">{dim.val}/{max} (가중치 {(weight * 100).toFixed(0)}%)</span>
                  </div>
                  <div className="w-full h-4 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-700"
                      style={{
                        width: `${pct}%`,
                        backgroundColor: isTop ? colorHex : isPrimary ? colorHex + '80' : '#94a3b8',
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          {teamAlignment && completedQuadrant && (
            <div className={`mt-5 p-4 rounded-xl border ${
              teamAlignment.isAligned
                ? 'bg-emerald-50 border-emerald-200'
                : 'bg-amber-50 border-amber-200'
            }`}>
              {teamAlignment.isAligned ? (
                <p className="text-sm text-emerald-800">
                  <strong>{DIM_LABELS[teamAlignment.teamTop]}</strong>을(를) 가장 중시했는데, 이는{' '}
                  {meta.nameKo} 사분면의 핵심 차원과 일치합니다.{' '}
                  {QUADRANT_DIM_INSIGHT[completedQuadrant][teamAlignment.teamTop]}
                </p>
              ) : (
                <p className="text-sm text-amber-800">
                  <strong>{DIM_LABELS[teamAlignment.teamTop]}</strong>을(를) 가장 중시했지만,{' '}
                  {meta.nameKo} 사분면의 핵심 차원은 <strong>{primaryDim ? DIM_LABELS[primaryDim.key] : ''}</strong>입니다.{' '}
                  {QUADRANT_DIM_INSIGHT[completedQuadrant][teamAlignment.teamTop]}
                </p>
              )}
            </div>
          )}
        </section>

        {/* 단계별 요약 */}
        <section className="bg-white rounded-2xl shadow-sm p-6">
          <h2 className="text-base font-bold text-gray-800 mb-4">단계별 의사결정</h2>
          <div className="space-y-3">
            {stepData.map((sub, i) => {
              const pct = Math.min(100, Math.round((sub.scores.weighted / 5) * 100));
              return (
                <div key={i} className="bg-gray-50 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <span className="text-sm font-semibold text-gray-700">Step {i + 1}</span>
                      {scenarioData && (
                        <span className="text-xs text-gray-400 ml-2">{scenarioData.steps[i]?.title}</span>
                      )}
                    </div>
                    <div className="text-[10px] text-gray-400 flex items-center gap-2">
                      <span>CE:{sub.scores.raw.ce}</span>
                      <span>SS:{sub.scores.raw.ss}</span>
                      <span>SV:{sub.scores.raw.sv}</span>
                    </div>
                  </div>
                  <div className="w-full h-2.5 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-700"
                      style={{ width: `${pct}%`, backgroundColor: colorHex }}
                    />
                  </div>
                  <p className="mt-1.5 text-xs text-gray-600">
                    선택: {choiceTitles[i] || '\u2014'}
                  </p>
                </div>
              );
            })}
          </div>
        </section>

        {/* 액션 */}
        <section className="print:hidden space-y-4">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={handleNotionSubmit}
              disabled={notionStatus === 'sending'}
              className={`inline-flex items-center gap-2 px-6 py-3 font-semibold rounded-xl shadow-sm transition-colors cursor-pointer text-sm ${
                notionStatus === 'success'
                  ? 'bg-green-600 text-white'
                  : notionStatus === 'error'
                    ? 'bg-red-600 text-white hover:bg-red-700'
                    : 'bg-violet-600 text-white hover:bg-violet-700'
              }`}
            >
              {notionStatus === 'sending' ? '전송 중...' : notionStatus === 'success' ? '전송 완료!' : '결과 전송'}
            </button>
            <button
              onClick={() => router.push('/')}
              className="inline-flex items-center gap-2 px-6 py-3 bg-slate-700 text-white font-semibold rounded-xl shadow-sm hover:bg-slate-800 transition-colors cursor-pointer text-sm"
            >
              다른 사분면 도전
            </button>
            <button
              onClick={handleRestart}
              className="inline-flex items-center gap-2 px-6 py-3 bg-white text-gray-600 font-semibold rounded-xl shadow-sm border border-gray-200 hover:bg-gray-50 transition-colors cursor-pointer text-sm"
            >
              처음부터 다시
            </button>
          </div>

          {notionMsg && (
            <p className={`text-center text-sm ${notionStatus === 'success' ? 'text-green-600' : 'text-red-500'}`}>{notionMsg}</p>
          )}

          {showNotionConfig && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
              <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-md mx-4">
                <h3 className="text-base font-bold text-gray-900 mb-2">결과 전송 설정</h3>
                <p className="text-xs text-gray-500 mb-4">웹훅 URL을 입력하세요.</p>
                <input
                  type="url"
                  value={notionUrl}
                  onChange={(e) => setNotionUrl(e.target.value)}
                  placeholder="https://..."
                  className="w-full px-3 py-2.5 border-2 border-gray-200 rounded-lg text-sm focus:outline-none focus:border-violet-500 transition-colors mb-4"
                />
                <div className="flex gap-3">
                  <button onClick={() => setShowNotionConfig(false)} className="flex-1 py-2.5 text-sm font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200">
                    취소
                  </button>
                  <button
                    onClick={handleSaveNotionConfig}
                    disabled={!notionUrl.trim()}
                    className="flex-1 py-2.5 text-sm font-medium text-white bg-violet-600 rounded-lg hover:bg-violet-700 disabled:opacity-50"
                  >
                    저장 후 전송
                  </button>
                </div>
              </div>
            </div>
          )}
        </section>

        <footer className="text-center text-xs text-gray-400 py-4 border-t border-gray-100">
          Kraljic Matrix 워크샵 | 세션: {store.sessionId?.slice(0, 8)}
        </footer>
      </main>
    </div>
  );
}
