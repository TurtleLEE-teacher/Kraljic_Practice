'use client';

import React, { useMemo, useCallback, useState } from 'react';
import { useRouter } from 'next/navigation';
import type { QuadrantId, Grade } from '@/lib/types';
import { QUADRANT_META, QUADRANT_ORDER } from '@/data/quadrants';
import { useGameStore } from '@/store/gameStore';
import {
  getNotionConfig,
  saveNotionConfig,
  type NotionConfig,
  type SubmitStatus,
} from '@/lib/notionSubmit';

/** 100점 환산 계수 */
const SCORE_SCALE = 5;

/** 등급 판정 (100점 기준) */
function determineGrade(score100: number): Grade {
  if (score100 >= 85) return 'Excellent';
  if (score100 >= 70) return 'Good';
  if (score100 >= 55) return 'Fair';
  return 'Poor';
}

const GRADE_INFO: Record<Grade, { label: string; color: string; bg: string; desc: string }> = {
  Excellent: { label: '우수', color: '#8b5cf6', bg: '#f5f3ff', desc: '해당 사분면의 핵심 전략을 정확히 이해하고 있습니다.' },
  Good: { label: '양호', color: '#10b981', bg: '#ecfdf5', desc: '대체로 적절한 판단이나, 일부 단계에서 더 나은 선택이 가능했습니다.' },
  Fair: { label: '보통', color: '#f59e0b', bg: '#fffbeb', desc: '기본 개념은 이해하지만, 핵심 딜레마에 대한 추가 학습이 필요합니다.' },
  Poor: { label: '미흡', color: '#ef4444', bg: '#fef2f2', desc: '이 사분면의 전략 특성에 대한 복습이 필요합니다.' },
};

const DIM_LABELS: Record<string, string> = { ce: '비용효율성', ss: '공급안정성', sv: '전략적가치' };

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

  // 점수 (100점 환산)
  const rawTotal = useMemo(() => stepData.reduce((sum, s) => sum + s.scores.weighted, 0), [stepData]);
  const score100 = Math.round(rawTotal * SCORE_SCALE);
  const grade = determineGrade(score100);
  const gradeInfo = GRADE_INFO[grade];
  const meta = completedQuadrant ? QUADRANT_META[completedQuadrant] : null;

  // 차원별 합산
  const dimTotals = useMemo(() => {
    const ce = stepData.reduce((s, d) => s + d.scores.raw.ce, 0);
    const ss = stepData.reduce((s, d) => s + d.scores.raw.ss, 0);
    const sv = stepData.reduce((s, d) => s + d.scores.raw.sv, 0);
    return { ce, ss, sv };
  }, [stepData]);

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
      grade,
      rawTotal: parseFloat(rawTotal.toFixed(2)),
      dimCe: dimTotals.ce,
      dimSs: dimTotals.ss,
      dimSv: dimTotals.sv,
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
      setNotionMsg(res.ok ? '전송 완료' : `전송 실패 (${res.status})`);
    } catch {
      setNotionStatus('error');
      setNotionMsg('네트워크 오류');
    }
  }, [completedQuadrant, meta, store.sessionId, store.participantName, score100, grade, rawTotal, dimTotals, stepData]);

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
          <span className="text-sm font-semibold text-gray-700">실습 결과</span>
          <button onClick={() => router.push('/')} className="text-xs text-gray-400 hover:text-gray-600">
            홈으로
          </button>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-8 print:py-4 space-y-6">
        {/* ① 점수 요약 */}
        <section className="bg-white rounded-2xl shadow-sm p-6 text-center">
          <p className="text-sm text-gray-500 mb-1">{store.participantName} 님</p>
          <div className="flex items-center justify-center gap-2 mb-5">
            <span className="w-3 h-3 rounded-full" style={{ backgroundColor: colorHex }} />
            <h1 className="text-xl font-bold text-gray-900">
              {meta.nameKo} <span className="text-sm font-normal text-gray-400">({meta.nameEn})</span>
            </h1>
          </div>

          {/* 점수 원형 */}
          <div className="relative w-40 h-40 mx-auto mb-4">
            <svg viewBox="0 0 120 120" className="w-full h-full -rotate-90">
              <circle cx="60" cy="60" r="52" fill="none" stroke="#e5e7eb" strokeWidth="10" />
              <circle
                cx="60" cy="60" r="52" fill="none"
                stroke={gradeInfo.color} strokeWidth="10" strokeLinecap="round"
                strokeDasharray={`${2 * Math.PI * 52}`}
                strokeDashoffset={`${2 * Math.PI * 52 * (1 - score100 / 100)}`}
                style={{ transition: 'stroke-dashoffset 1s ease-out' }}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-3xl font-extrabold" style={{ color: gradeInfo.color }}>{score100}</span>
              <span className="text-xs text-gray-400">/ 100점</span>
            </div>
          </div>

          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full" style={{ backgroundColor: gradeInfo.bg }}>
            <span className="text-lg font-bold" style={{ color: gradeInfo.color }}>{gradeInfo.label}</span>
            <span className="text-xs text-gray-500">({grade})</span>
          </div>
          <p className="text-sm text-gray-600 mt-3 max-w-xs mx-auto">{gradeInfo.desc}</p>
        </section>

        {/* ② 단계별 결과 */}
        <section className="bg-white rounded-2xl shadow-sm p-6">
          <h2 className="text-base font-bold text-gray-800 mb-4">단계별 점수</h2>
          <div className="space-y-3">
            {stepData.map((sub, i) => {
              const stepScore = Math.round(sub.scores.weighted * SCORE_SCALE);
              const pct = (stepScore / 25) * 100;
              return (
                <div key={i} className="flex items-center gap-4">
                  <span className="text-xs font-bold text-gray-500 w-14 flex-shrink-0">Step {i + 1}</span>
                  <div className="flex-1">
                    <div className="w-full h-6 bg-gray-100 rounded-full overflow-hidden relative">
                      <div
                        className="h-full rounded-full transition-all duration-700"
                        style={{ width: `${Math.min(pct, 100)}%`, backgroundColor: colorHex }}
                      />
                      <span className="absolute inset-0 flex items-center justify-center text-xs font-semibold text-gray-700">
                        {stepScore}점
                      </span>
                    </div>
                  </div>
                  <div className="text-[10px] text-gray-400 w-24 text-right flex-shrink-0">
                    CE:{sub.scores.raw.ce} SS:{sub.scores.raw.ss} SV:{sub.scores.raw.sv}
                  </div>
                </div>
              );
            })}
          </div>
          <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between">
            <span className="text-sm font-semibold text-gray-700">합계</span>
            <span className="text-lg font-extrabold" style={{ color: colorHex }}>{score100}점</span>
          </div>
        </section>

        {/* ③ 차원별 분석 */}
        <section className="bg-white rounded-2xl shadow-sm p-6">
          <h2 className="text-base font-bold text-gray-800 mb-4">차원별 분석</h2>
          <div className="space-y-3">
            {(['ce', 'ss', 'sv'] as const).map((dim) => {
              const val = dimTotals[dim];
              const max = 20;
              const pct = (val / max) * 100;
              const isPrimary = primaryDim?.key === dim;
              const weight = meta.weights[dim];
              return (
                <div key={dim}>
                  <div className="flex items-center justify-between mb-1">
                    <span className={`text-sm ${isPrimary ? 'font-bold text-gray-800' : 'text-gray-600'}`}>
                      {DIM_LABELS[dim]}
                      {isPrimary && <span className="text-xs ml-1" style={{ color: colorHex }}>핵심</span>}
                    </span>
                    <span className="text-xs text-gray-400">{val}/{max} (가중치 {(weight * 100).toFixed(0)}%)</span>
                  </div>
                  <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-700"
                      style={{ width: `${pct}%`, backgroundColor: isPrimary ? colorHex : '#94a3b8' }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
          {primaryDim && (
            <div className="mt-4 p-3 rounded-lg bg-gray-50 text-sm text-gray-700">
              이 사분면의 핵심 차원은 <strong>{DIM_LABELS[primaryDim.key]}</strong> (가중치 {(primaryDim.w * 100).toFixed(0)}%)입니다.
              {dimTotals[primaryDim.key] >= 14
                ? ' 좋은 성과를 보였습니다.'
                : ' 이 차원의 점수를 높이면 총점이 크게 개선됩니다.'}
            </div>
          )}
        </section>

        {/* ④ 핵심 교훈 */}
        <section className="bg-white rounded-2xl shadow-sm p-6">
          <h2 className="text-base font-bold text-gray-800 mb-3">핵심 교훈</h2>
          <div className="p-4 rounded-lg" style={{ backgroundColor: gradeInfo.bg, borderLeft: `3px solid ${gradeInfo.color}` }}>
            <p className="text-sm text-gray-700 leading-relaxed">
              <strong>{meta.nameKo}</strong>의 핵심 딜레마는 &ldquo;{meta.coreDilemma}&rdquo;입니다.
              {grade === 'Excellent' || grade === 'Good'
                ? ' 이 딜레마를 잘 이해하고 적절한 의사결정을 내렸습니다.'
                : ' 이 딜레마에 대한 추가 학습으로 더 나은 의사결정이 가능합니다.'}
            </p>
          </div>
        </section>

        {/* ⑤ 액션 */}
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
          Kraljic Matrix 시뮬레이션 | 세션: {store.sessionId?.slice(0, 8)}
        </footer>
      </main>
    </div>
  );
}
