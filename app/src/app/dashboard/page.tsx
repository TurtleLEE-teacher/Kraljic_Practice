'use client';

import React, { useMemo, useCallback, useState } from 'react';
import { useRouter } from 'next/navigation';
import type { QuadrantId } from '@/lib/types';
import { QUADRANT_META, QUADRANT_ORDER } from '@/data/quadrants';
import { useGameStore } from '@/store/gameStore';
import { normalizeScore, DIM_LABELS } from '@/lib/scoring';
import {
  getNotionConfig,
  saveNotionConfig,
  type SubmitStatus,
} from '@/lib/notionSubmit';

/** Dimension insight by quadrant and dominant dimension */
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

export default function DashboardPage() {
  const router = useRouter();
  const store = useGameStore();

  // 완료된 사분면 찾기 (가장 최근 완료)
  const completedQuadrant = useMemo<QuadrantId | null>(() => {
    for (const qId of [...QUADRANT_ORDER].reverse()) {
      const count = store.submissions.filter((s) => s.quadrant === qId).length;
      if (count >= 4) return qId;
    }
    return null;
  }, [store.submissions]);

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

  // 가장 높은 차원 (팀 성향)
  const sortedDims = useMemo(() => {
    const dims = [
      { key: 'ce' as const, val: dimTotals.ce, label: DIM_LABELS.ce },
      { key: 'ss' as const, val: dimTotals.ss, label: DIM_LABELS.ss },
      { key: 'sv' as const, val: dimTotals.sv, label: DIM_LABELS.sv },
    ];
    return dims.sort((a, b) => b.val - a.val);
  }, [dimTotals]);

  // 핵심 차원 (사분면에서 가장 중요한 차원)
  const primaryDim = useMemo(() => {
    if (!meta) return null;
    const dims = [
      { key: 'ce' as const, w: meta.weights.ce },
      { key: 'ss' as const, w: meta.weights.ss },
      { key: 'sv' as const, w: meta.weights.sv },
    ];
    return dims.sort((a, b) => b.w - a.w)[0];
  }, [meta]);

  // 팀의 가치 성향 vs 사분면의 핵심 차원
  const teamAlignment = useMemo(() => {
    if (!primaryDim || !completedQuadrant) return null;
    const teamTop = sortedDims[0].key;
    const isAligned = teamTop === primaryDim.key;
    return { teamTop, isAligned };
  }, [primaryDim, sortedDims, completedQuadrant]);

  // 선택 이유 모음
  const reasons = useMemo(() => {
    return stepData
      .filter((s) => s.reason)
      .map((s) => ({ step: s.step + 1, reason: s.reason! }));
  }, [stepData]);

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
      reasons: reasons.map((r) => `Step ${r.step}: ${r.reason}`),
      submittedAt: new Date().toISOString(),
    };

    try {
      const res = await fetch(config.proxyUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      setNotionStatus(res.ok ? 'success' : 'error');
      setNotionMsg(res.ok ? '전송 완료' : `전송 실패 (${res.status})`);
    } catch {
      setNotionStatus('error');
      setNotionMsg('네트워크 오류');
    }
  }, [completedQuadrant, meta, store.sessionId, store.participantName, score100, rawTotal, dimTotals, stepData, sortedDims, reasons]);

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

  return (
    <div className="min-h-screen bg-gray-50 print:bg-white">
      {/* 헤더 */}
      <header className="bg-white border-b border-gray-200 print:hidden">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between">
          <span className="text-sm font-semibold text-gray-700">팀 분석 결과</span>
          <button onClick={() => router.push('/')} className="text-xs text-gray-400 hover:text-gray-600">
            홈으로
          </button>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-8 print:py-4 space-y-6">
        {/* 1. 사분면 + 팀 정보 */}
        <section className="bg-white rounded-2xl shadow-sm p-6 text-center">
          <p className="text-sm text-gray-500 mb-1">{store.participantName} 팀</p>
          <div className="flex items-center justify-center gap-2 mb-4">
            <span className="w-3 h-3 rounded-full" style={{ backgroundColor: colorHex }} />
            <h1 className="text-xl font-bold text-gray-900">
              {meta.nameKo} <span className="text-sm font-normal text-gray-400">({meta.nameEn})</span>
            </h1>
          </div>
          <p className="text-sm text-gray-600 max-w-sm mx-auto">
            핵심 딜레마: &ldquo;{meta.coreDilemma}&rdquo;
          </p>
        </section>

        {/* 2. 가치 성향 분석 (핵심 섹션) */}
        <section className="bg-white rounded-2xl shadow-sm p-6">
          <h2 className="text-base font-bold text-gray-800 mb-1">팀의 가치 성향 분석</h2>
          <p className="text-xs text-gray-500 mb-5">4단계 의사결정에서 팀이 어떤 가치를 우선시했는지 보여줍니다</p>

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
                      {isTop && <span className="text-xs ml-1.5 text-violet-600 font-semibold">팀 중시</span>}
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

          {/* 정합성 분석 */}
          {teamAlignment && completedQuadrant && (
            <div className={`mt-5 p-4 rounded-xl border ${
              teamAlignment.isAligned
                ? 'bg-emerald-50 border-emerald-200'
                : 'bg-amber-50 border-amber-200'
            }`}>
              {teamAlignment.isAligned ? (
                <p className="text-sm text-emerald-800">
                  팀이 <strong>{DIM_LABELS[teamAlignment.teamTop]}</strong>을(를) 가장 중시했는데, 이는{' '}
                  {meta.nameKo} 사분면의 핵심 차원과 일치합니다.{' '}
                  {QUADRANT_DIM_INSIGHT[completedQuadrant][teamAlignment.teamTop]}
                </p>
              ) : (
                <p className="text-sm text-amber-800">
                  팀이 <strong>{DIM_LABELS[teamAlignment.teamTop]}</strong>을(를) 가장 중시했지만,{' '}
                  {meta.nameKo} 사분면의 핵심 차원은 <strong>{primaryDim ? DIM_LABELS[primaryDim.key] : ''}</strong>입니다.{' '}
                  {QUADRANT_DIM_INSIGHT[completedQuadrant][teamAlignment.teamTop]}
                </p>
              )}
            </div>
          )}
        </section>

        {/* 3. 단계별 요약 */}
        <section className="bg-white rounded-2xl shadow-sm p-6">
          <h2 className="text-base font-bold text-gray-800 mb-4">단계별 의사결정 요약</h2>
          <div className="space-y-3">
            {stepData.map((sub, i) => {
              const pct = Math.min(100, Math.round((sub.scores.weighted / 5) * 100));
              return (
                <div key={i} className="bg-gray-50 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-semibold text-gray-700">Step {i + 1}</span>
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
                  {sub.reason && (
                    <p className="mt-2 text-xs text-gray-500 italic">&ldquo;{sub.reason}&rdquo;</p>
                  )}
                </div>
              );
            })}
          </div>
          <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between">
            <span className="text-sm font-semibold text-gray-700">종합 점수</span>
            <span className="text-lg font-extrabold" style={{ color: colorHex }}>{score100}<span className="text-sm font-normal text-gray-400"> / 100</span></span>
          </div>
        </section>

        {/* 4. 토론 가이드 */}
        <section className="bg-white rounded-2xl shadow-sm p-6">
          <h2 className="text-base font-bold text-gray-800 mb-3">팀 토론 가이드</h2>
          <div className="space-y-3">
            <div className="flex items-start gap-3 p-3 rounded-lg bg-violet-50">
              <span className="text-sm font-bold text-violet-600 flex-shrink-0">Q1</span>
              <p className="text-sm text-violet-800">
                각 단계에서 다른 선택을 했다면 어떤 결과가 나왔을까요? 가장 고민됐던 단계는?
              </p>
            </div>
            <div className="flex items-start gap-3 p-3 rounded-lg bg-blue-50">
              <span className="text-sm font-bold text-blue-600 flex-shrink-0">Q2</span>
              <p className="text-sm text-blue-800">
                이 사분면에서 {meta.nameKo === '병목' ? '공급 안정성' : meta.nameKo === '레버리지' ? '비용 절감' : meta.nameKo === '전략' ? '전략적 가치' : '관리 효율'}을(를) 우선시한 이유는 무엇인가요?
              </p>
            </div>
            <div className="flex items-start gap-3 p-3 rounded-lg bg-emerald-50">
              <span className="text-sm font-bold text-emerald-600 flex-shrink-0">Q3</span>
              <p className="text-sm text-emerald-800">
                다른 팀과 결과를 비교해 보세요. 같은 상황에서 다른 선택을 한 팀이 있나요? 그 이유는?
              </p>
            </div>
          </div>
        </section>

        {/* 5. 팀의 선택 이유 (있는 경우) */}
        {reasons.length > 0 && (
          <section className="bg-white rounded-2xl shadow-sm p-6">
            <h2 className="text-base font-bold text-gray-800 mb-3">팀의 선택 이유 기록</h2>
            <div className="space-y-2">
              {reasons.map((r) => (
                <div key={r.step} className="flex items-start gap-3 p-3 rounded-lg bg-gray-50">
                  <span className="text-xs font-bold text-gray-500 flex-shrink-0 mt-0.5">Step {r.step}</span>
                  <p className="text-sm text-gray-700">{r.reason}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* 6. 액션 */}
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
