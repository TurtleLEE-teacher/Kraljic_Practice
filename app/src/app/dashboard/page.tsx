'use client';

import React, { useMemo, useCallback, useState } from 'react';
import { useRouter } from 'next/navigation';
import type { DashboardData, QuadrantId, QuadrantResult, DimensionProfile, WeightedScore, Grade } from '@/lib/types';
import { QUADRANT_META, QUADRANT_ORDER } from '@/data/quadrants';
import { useGameStore } from '@/store/gameStore';
import { generateMockDashboardData } from '@/lib/mockDashboardData';

import ScoreGauge from '@/components/ScoreGauge';
import QuadrantSummaryCard from '@/components/QuadrantSummaryCard';
import RadarChartComponent from '@/components/RadarChart';
import DimensionProfileChart from '@/components/DimensionProfileChart';
import RankTracker from '@/components/RankTracker';
import LearningFeedback from '@/components/LearningFeedback';
import {
  getNotionConfig,
  saveNotionConfig,
  submitToNotion,
  type NotionConfig,
  type SubmitStatus,
} from '@/lib/notionSubmit';

/** Dimension labels in Korean */
const DIMENSION_LABELS: Record<string, string> = {
  ce: '비용효율성(CE)',
  ss: '공급안정성(SS)',
  sv: '전략적가치(SV)',
};

/** Dimension profile type labels */
function getProfileTypeLabel(strongest: string): string {
  switch (strongest) {
    case 'ce':
      return '비용 중시형';
    case 'ss':
      return '안정 중시형';
    case 'sv':
      return '전략 중시형';
    default:
      return '균형형';
  }
}

/** Determine grade from final score */
function determineGrade(finalScore: number): Grade {
  if (finalScore >= 70) return 'Excellent';
  if (finalScore >= 60) return 'Good';
  if (finalScore >= 50) return 'Fair';
  return 'Poor';
}

/** Compute optimal score for a quadrant (4 steps * max per step) */
function getOptimalScore(quadrant: QuadrantId): number {
  const w = QUADRANT_META[quadrant].weights;
  return 4 * (5 * w.ce + 5 * w.ss + 5 * w.sv);
}

/**
 * Build DashboardData from the game store state.
 * Returns null if there's no real session data, signaling we should use mock data.
 */
function buildDashboardFromStore(store: ReturnType<typeof useGameStore.getState>): DashboardData | null {
  if (!store.sessionId || store.submissions.length === 0) {
    return null;
  }

  // Build per-quadrant results
  const quadrantResults: QuadrantResult[] = QUADRANT_ORDER.map((qId) => {
    const subs = store.submissions.filter((s) => s.quadrant === qId);
    const stepScores: WeightedScore[] = subs.map((s) => s.scores);
    const totalWeighted = parseFloat(
      stepScores.reduce((sum, s) => sum + s.weighted, 0).toFixed(2)
    );
    const optimalScore = getOptimalScore(qId);
    const percentOfOptimal = parseFloat(
      ((totalWeighted / optimalScore) * 100).toFixed(1)
    );

    return {
      quadrant: qId,
      stepScores,
      totalWeighted,
      choiceIds: subs.map((s) => s.choiceId),
      optimalScore,
      percentOfOptimal,
    };
  });

  const layer1Score = parseFloat(
    quadrantResults.reduce((sum, qr) => sum + qr.totalWeighted, 0).toFixed(2)
  );

  // Build event results
  const eventResults = QUADRANT_ORDER.map((qId) => {
    const sub = store.eventSubmissions.find((s) => s.quadrant === qId);
    return {
      quadrant: qId,
      choiceId: sub?.choiceId || '',
      score: sub?.scores || { raw: { ce: 0, ss: 0, sv: 0 }, weighted: 0 },
    };
  });

  const layer2Score = parseFloat(
    eventResults.reduce((sum, er) => sum + er.score.weighted, 0).toFixed(2)
  );

  const finalScore = parseFloat((layer1Score + layer2Score).toFixed(2));
  const grade = determineGrade(finalScore);

  // Dimension profile
  const profile = computeDimensionProfile(quadrantResults);

  return {
    sessionId: store.sessionId,
    participantName: store.participantName,
    layer1Score,
    layer2Score,
    finalScore,
    grade,
    quadrantResults,
    eventResults,
    dimensionProfile: profile,
    // Rank data would come from backend; not available in client-only mode
  };
}

/** Compute dimension profile from quadrant results */
function computeDimensionProfile(quadrantResults: QuadrantResult[]): DimensionProfile {
  let ceTotal = 0;
  let ssTotal = 0;
  let svTotal = 0;
  let stepCount = 0;

  for (const qr of quadrantResults) {
    for (const ws of qr.stepScores) {
      ceTotal += ws.raw.ce;
      ssTotal += ws.raw.ss;
      svTotal += ws.raw.sv;
      stepCount++;
    }
  }

  const ceAvg = stepCount > 0 ? ceTotal / stepCount : 0;
  const ssAvg = stepCount > 0 ? ssTotal / stepCount : 0;
  const svAvg = stepCount > 0 ? svTotal / stepCount : 0;

  const scores = { ce: ceTotal, ss: ssTotal, sv: svTotal };
  const sorted = Object.entries(scores).sort(([, a], [, b]) => b - a);
  const strongest = sorted[0][0] as 'ce' | 'ss' | 'sv';
  const weakest = sorted[sorted.length - 1][0] as 'ce' | 'ss' | 'sv';

  return {
    ce: { total: ceTotal, average: parseFloat(ceAvg.toFixed(2)) },
    ss: { total: ssTotal, average: parseFloat(ssAvg.toFixed(2)) },
    sv: { total: svTotal, average: parseFloat(svAvg.toFixed(2)) },
    strongest,
    weakest,
  };
}

export default function DashboardPage() {
  const router = useRouter();
  const store = useGameStore();

  // Try to build from real store data, fall back to mock
  const data: DashboardData = useMemo(() => {
    const realData = buildDashboardFromStore(store);
    if (realData) return realData;
    return generateMockDashboardData();
  }, [store]);

  // Build event results lookup
  const eventResultMap = useMemo(() => {
    const map: Partial<Record<QuadrantId, (typeof data.eventResults)[0]>> = {};
    for (const er of data.eventResults) {
      map[er.quadrant] = er;
    }
    return map;
  }, [data.eventResults]);

  // Total event score
  const totalEventScore = useMemo(
    () =>
      data.eventResults
        .reduce((sum, er) => sum + er.score.weighted, 0)
        .toFixed(1),
    [data.eventResults]
  );

  // Strongest / weakest quadrant
  const quadrantAnalysis = useMemo(() => {
    const sorted = [...data.quadrantResults].sort(
      (a, b) => b.percentOfOptimal - a.percentOfOptimal
    );
    return {
      strongest: sorted[0],
      weakest: sorted[sorted.length - 1],
    };
  }, [data.quadrantResults]);

  // Reset and restart
  const handleRestart = useCallback(() => {
    store.reset();
    router.push('/');
  }, [store, router]);

  // Print
  const handlePrint = useCallback(() => {
    window.print();
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
    setNotionStatus('sending');
    setNotionMsg('');
    const result = await submitToNotion(data, config);
    setNotionStatus(result.ok ? 'success' : 'error');
    setNotionMsg(result.message);
  }, [data]);

  const handleSaveNotionConfig = useCallback(() => {
    if (!notionUrl.trim()) return;
    const config: NotionConfig = { proxyUrl: notionUrl.trim() };
    saveNotionConfig(config);
    setShowNotionConfig(false);
    handleNotionSubmit();
  }, [notionUrl, handleNotionSubmit]);

  return (
    <div className="min-h-screen bg-gray-50 print:bg-white">
      {/* Top header bar - hidden in print */}
      <header className="bg-white border-b border-gray-200 print:hidden">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
              <span className="text-white text-sm font-bold">K</span>
            </div>
            <span className="text-sm font-semibold text-gray-700">
              Kraljic Matrix 실습 시뮬레이션
            </span>
          </div>
          <span className="text-xs text-gray-400">결과 대시보드</span>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 print:py-4 print:px-2">
        {/* ======================================================= */}
        {/* SECTION 1: Summary Header */}
        {/* ======================================================= */}
        <section className="mb-10 print:mb-6">
          {/* Print-only title */}
          <div className="hidden print:block text-center mb-4">
            <h1 className="text-xl font-bold text-gray-900">
              Kraljic Matrix 실습 시뮬레이션 결과
            </h1>
          </div>

          <div className="bg-white rounded-2xl shadow-sm p-6 sm:p-8 print:shadow-none print:p-4 print:border print:border-gray-200">
            <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
              {/* Left: participant info + gauge */}
              <div className="flex flex-col items-center flex-shrink-0">
                <div className="mb-4 text-center">
                  <h1 className="text-2xl font-extrabold text-gray-900 print:text-xl">
                    실습 결과
                  </h1>
                  <p className="text-lg text-gray-600 mt-1">
                    <span className="font-semibold text-gray-800">
                      {data.participantName}
                    </span>{' '}
                    님
                  </p>
                </div>
                <ScoreGauge
                  score={data.finalScore}
                  maxScore={100}
                  grade={data.grade}
                  layer1Score={data.layer1Score}
                  layer2Score={data.layer2Score}
                />
              </div>

              {/* Right: quick stats */}
              <div className="flex-1 w-full">
                <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">
                  성과 요약
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <QuickStat
                    label="Layer 1 점수"
                    value={data.layer1Score.toFixed(1)}
                    sub="/ 80점"
                    color="#6366f1"
                  />
                  <QuickStat
                    label="Layer 2 점수"
                    value={data.layer2Score.toFixed(1)}
                    sub="/ 20점"
                    color="#8b5cf6"
                  />
                  <QuickStat
                    label="완료 사분면"
                    value={`${data.quadrantResults.length}`}
                    sub="/ 4개"
                    color="#06b6d4"
                  />
                  <QuickStat
                    label="최종 등급"
                    value={
                      data.grade === 'Excellent'
                        ? '우수'
                        : data.grade === 'Good'
                          ? '양호'
                          : data.grade === 'Fair'
                            ? '보통'
                            : '미흡'
                    }
                    sub={data.grade}
                    color={
                      data.grade === 'Excellent'
                        ? '#3b82f6'
                        : data.grade === 'Good'
                          ? '#10b981'
                          : data.grade === 'Fair'
                            ? '#f59e0b'
                            : '#ef4444'
                    }
                  />
                </div>

                {/* Strongest / weakest quadrant summary */}
                <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="flex items-center gap-3 px-4 py-3 bg-green-50 rounded-xl">
                    <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                      <span className="text-green-600 text-lg">&#9650;</span>
                    </div>
                    <div>
                      <p className="text-xs text-green-600 font-medium">
                        최강 사분면
                      </p>
                      <p className="text-sm font-bold text-gray-800">
                        {QUADRANT_META[quadrantAnalysis.strongest.quadrant].nameKo}
                        <span className="text-xs font-normal text-gray-500 ml-1">
                          ({quadrantAnalysis.strongest.percentOfOptimal.toFixed(1)}%)
                        </span>
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 px-4 py-3 bg-red-50 rounded-xl">
                    <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                      <span className="text-red-500 text-lg">&#9660;</span>
                    </div>
                    <div>
                      <p className="text-xs text-red-500 font-medium">
                        최약 사분면
                      </p>
                      <p className="text-sm font-bold text-gray-800">
                        {QUADRANT_META[quadrantAnalysis.weakest.quadrant].nameKo}
                        <span className="text-xs font-normal text-gray-500 ml-1">
                          ({quadrantAnalysis.weakest.percentOfOptimal.toFixed(1)}%)
                        </span>
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ======================================================= */}
        {/* SECTION 2: Quadrant Performance (4 cards) */}
        {/* ======================================================= */}
        <section className="mb-10 print:mb-6">
          <SectionHeader
            title="사분면별 성과"
            subtitle="각 사분면에서의 의사결정 성과를 분석합니다"
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 print:gap-3">
            {QUADRANT_ORDER.map((qId) => {
              const result = data.quadrantResults.find(
                (qr) => qr.quadrant === qId
              );
              if (!result) return null;
              return (
                <QuadrantSummaryCard
                  key={qId}
                  result={result}
                  meta={QUADRANT_META[qId]}
                  eventResult={eventResultMap[qId]}
                />
              );
            })}
          </div>
        </section>

        {/* ======================================================= */}
        {/* SECTION 3: Dimension Analysis */}
        {/* ======================================================= */}
        <section className="mb-10 print:mb-6 print:break-before-page">
          <SectionHeader
            title="차원별 분석"
            subtitle="비용효율성, 공급안정성, 전략적가치의 역량 프로필"
          />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Radar Chart */}
            <div className="bg-white rounded-2xl shadow-sm p-5 print:shadow-none print:border print:border-gray-200">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">
                사분면별 차원 레이더
              </h3>
              <RadarChartComponent
                quadrantResults={data.quadrantResults}
                quadrantMeta={QUADRANT_META}
              />
            </div>

            {/* Dimension Profile Chart */}
            <div className="bg-white rounded-2xl shadow-sm p-5 print:shadow-none print:border print:border-gray-200">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">
                종합 역량 프로필
              </h3>
              <DimensionProfileChart profile={data.dimensionProfile} />

              {/* Profile type badge */}
              <div className="mt-4 text-center">
                <span className="inline-block px-4 py-2 bg-indigo-50 rounded-full">
                  <span className="text-sm font-bold text-indigo-700">
                    {getProfileTypeLabel(data.dimensionProfile.strongest)}
                  </span>
                </span>
              </div>
            </div>
          </div>

          {/* Text analysis */}
          <div className="mt-4 bg-white rounded-2xl shadow-sm p-5 print:shadow-none print:border print:border-gray-200">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                <svg
                  className="w-4 h-4 text-indigo-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <div>
                <p className="text-sm text-gray-700 leading-relaxed">
                  당신의 가장 강한 역량은{' '}
                  <strong className="text-green-600">
                    {DIMENSION_LABELS[data.dimensionProfile.strongest]}
                  </strong>
                  이며,{' '}
                  <strong className="text-red-500">
                    {DIMENSION_LABELS[data.dimensionProfile.weakest]}
                  </strong>{' '}
                  영역에 더 주의가 필요합니다.
                </p>
                <p className="text-xs text-gray-500 mt-2">
                  전체 16개 의사결정(4사분면 x 4단계)에서 수집된 원점수를
                  기반으로 분석한 결과입니다.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ======================================================= */}
        {/* SECTION 4: Event Impact */}
        {/* ======================================================= */}
        <section className="mb-10 print:mb-6">
          <SectionHeader
            title="이벤트(Layer 2) 영향"
            subtitle="돌발 이벤트 대응 결과와 순위 변동"
          />

          <div className="space-y-4">
            {/* Rank Tracker */}
            {data.rank && (
              <RankTracker
                before={data.rank.before}
                after={data.rank.after}
                total={data.rank.total}
              />
            )}

            {/* Event score summary */}
            <div className="bg-white rounded-2xl shadow-sm p-5 print:shadow-none print:border print:border-gray-200">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
                <div>
                  <h3 className="text-sm font-semibold text-gray-700">
                    이벤트 대응 점수
                  </h3>
                  <p className="text-xs text-gray-500 mt-0.5">
                    돌발 이벤트에 대한 사분면별 대응 결과
                  </p>
                </div>
                <div className="px-4 py-2 bg-purple-50 rounded-xl text-center">
                  <span className="text-xs text-purple-600">총 이벤트 점수</span>
                  <p className="text-xl font-extrabold text-purple-700">
                    +{totalEventScore}점
                  </p>
                </div>
              </div>

              {/* Event per-quadrant breakdown */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {data.eventResults.map((er) => {
                  const meta = QUADRANT_META[er.quadrant];
                  const colorHex =
                    meta.color === 'red'
                      ? '#ef4444'
                      : meta.color === 'emerald'
                        ? '#10b981'
                        : meta.color === 'violet'
                          ? '#8b5cf6'
                          : '#64748b';
                  return (
                    <div
                      key={er.quadrant}
                      className="p-3 rounded-xl bg-gray-50 text-center"
                    >
                      <div
                        className="text-xs font-medium mb-1"
                        style={{ color: colorHex }}
                      >
                        {meta.nameKo}
                      </div>
                      <div className="text-lg font-bold text-gray-800">
                        +{er.score.weighted.toFixed(1)}
                      </div>
                      <div className="text-[10px] text-gray-400 mt-0.5">
                        CE:{er.score.raw.ce} SS:{er.score.raw.ss} SV:
                        {er.score.raw.sv}
                      </div>
                    </div>
                  );
                })}
              </div>

              <p className="text-sm text-gray-600 mt-4 text-center">
                이벤트 대응으로{' '}
                <strong className="text-purple-700">
                  +{totalEventScore}점
                </strong>{' '}
                획득
              </p>
            </div>
          </div>
        </section>

        {/* ======================================================= */}
        {/* SECTION 5: Learning Insights */}
        {/* ======================================================= */}
        <section className="mb-10 print:mb-6 print:break-before-page">
          <SectionHeader
            title="학습 피드백"
            subtitle="사분면별 핵심 교훈과 개선 포인트"
          />

          <div className="space-y-3">
            {QUADRANT_ORDER.map((qId) => {
              const result = data.quadrantResults.find(
                (qr) => qr.quadrant === qId
              );
              if (!result) return null;
              return (
                <LearningFeedback
                  key={qId}
                  quadrant={qId}
                  result={result}
                  meta={QUADRANT_META[qId]}
                />
              );
            })}
          </div>

          {/* Overall recommendation */}
          <div className="mt-5 bg-gradient-to-r from-indigo-50 to-blue-50 rounded-2xl p-5 print:border print:border-blue-200">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center flex-shrink-0">
                <svg
                  className="w-5 h-5 text-indigo-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                  />
                </svg>
              </div>
              <div>
                <h3 className="text-sm font-bold text-gray-800 mb-2">
                  종합 학습 권장사항
                </h3>
                <p className="text-sm text-gray-700 leading-relaxed">
                  {data.grade === 'Excellent' || data.grade === 'Good' ? (
                    <>
                      전반적으로 Kraljic 매트릭스의 사분면별 전략 차별화를 잘
                      이해하고 있습니다.{' '}
                      <strong>
                        {QUADRANT_META[quadrantAnalysis.weakest.quadrant].nameKo}
                      </strong>{' '}
                      사분면에서의 성과를 더 높이기 위해, 해당 사분면의 핵심
                      딜레마인 &ldquo;
                      {QUADRANT_META[quadrantAnalysis.weakest.quadrant].coreDilemma}
                      &rdquo;에 대한 추가 학습을 권장합니다.
                    </>
                  ) : (
                    <>
                      사분면별 전략 차별화에 대한 추가 학습이 필요합니다.
                      특히{' '}
                      <strong>
                        {QUADRANT_META[quadrantAnalysis.weakest.quadrant].nameKo}
                      </strong>{' '}
                      사분면의 핵심 딜레마인 &ldquo;
                      {QUADRANT_META[quadrantAnalysis.weakest.quadrant].coreDilemma}
                      &rdquo;를 중점적으로 복습하시기 바랍니다. 각 사분면에서
                      가장 중요한 차원(가중치가 높은 차원)을 우선 고려하는
                      연습이 도움이 됩니다.
                    </>
                  )}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ======================================================= */}
        {/* SECTION 6: Actions */}
        {/* ======================================================= */}
        <section className="mb-10 print:hidden">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={handleNotionSubmit}
              disabled={notionStatus === 'sending'}
              className={`inline-flex items-center gap-2 px-6 py-3 font-semibold rounded-xl shadow-sm transition-colors cursor-pointer ${
                notionStatus === 'success'
                  ? 'bg-green-600 text-white'
                  : notionStatus === 'error'
                    ? 'bg-red-600 text-white hover:bg-red-700'
                    : 'bg-violet-600 text-white hover:bg-violet-700'
              }`}
            >
              <svg
                className="w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                />
              </svg>
              {notionStatus === 'sending'
                ? '전송 중...'
                : notionStatus === 'success'
                  ? '전송 완료!'
                  : '결과 전송'}
            </button>
            <button
              onClick={handleRestart}
              className="inline-flex items-center gap-2 px-6 py-3 bg-slate-700 text-white font-semibold rounded-xl shadow-sm hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
              다시 시작
            </button>
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-2 px-6 py-3 bg-white text-gray-700 font-semibold rounded-xl shadow-sm border border-gray-200 hover:bg-gray-50 transition-colors cursor-pointer"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"
                />
              </svg>
              결과 인쇄
            </button>
          </div>

          {/* Notion status message */}
          {notionMsg && (
            <p className={`text-center text-sm mt-3 ${notionStatus === 'success' ? 'text-green-600' : 'text-red-500'}`}>
              {notionMsg}
            </p>
          )}

          {/* Notion config modal */}
          {showNotionConfig && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
              <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-md mx-4">
                <h3 className="text-base font-bold text-gray-900 mb-2">결과 전송 설정</h3>
                <p className="text-xs text-gray-500 mb-4">
                  결과를 전송받을 웹훅 URL을 입력하세요 (Notion Proxy, Google Apps Script 등).
                </p>
                <input
                  type="url"
                  value={notionUrl}
                  onChange={(e) => setNotionUrl(e.target.value)}
                  placeholder="https://..."
                  className="w-full px-3 py-2.5 border-2 border-gray-200 rounded-lg text-sm focus:outline-none focus:border-violet-500 transition-colors mb-4"
                />
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowNotionConfig(false)}
                    className="flex-1 py-2.5 text-sm font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    취소
                  </button>
                  <button
                    onClick={handleSaveNotionConfig}
                    disabled={!notionUrl.trim()}
                    className="flex-1 py-2.5 text-sm font-medium text-white bg-violet-600 rounded-lg hover:bg-violet-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    저장 후 전송
                  </button>
                </div>
              </div>
            </div>
          )}
        </section>

        {/* Footer */}
        <footer className="text-center text-xs text-gray-400 py-4 border-t border-gray-100 print:border-gray-300">
          Kraljic Matrix 실습 시뮬레이션 &copy; 2025 |
          세션: {data.sessionId}
        </footer>
      </main>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Helper Components */
/* ------------------------------------------------------------------ */

function QuickStat({
  label,
  value,
  sub,
  color,
}: {
  label: string;
  value: string;
  sub: string;
  color: string;
}) {
  return (
    <div className="bg-gray-50 rounded-xl p-3 text-center print:border print:border-gray-200">
      <p className="text-[10px] text-gray-400 font-medium uppercase tracking-wider">
        {label}
      </p>
      <p className="text-xl font-extrabold mt-0.5" style={{ color }}>
        {value}
      </p>
      <p className="text-[10px] text-gray-400">{sub}</p>
    </div>
  );
}

function SectionHeader({
  title,
  subtitle,
}: {
  title: string;
  subtitle: string;
}) {
  return (
    <div className="mb-4">
      <h2 className="text-lg font-bold text-gray-900">{title}</h2>
      <p className="text-xs text-gray-500 mt-0.5">{subtitle}</p>
    </div>
  );
}
