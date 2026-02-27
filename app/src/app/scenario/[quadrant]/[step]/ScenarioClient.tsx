'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useGameStore } from '@/store/gameStore';
import { QUADRANT_ORDER, QUADRANT_META } from '@/data/quadrants';
import { normalizeScore } from '@/lib/scoring';
import type { QuadrantId, ScenarioData, Choice, WeightedScore } from '@/lib/types';

import ScenarioBriefing from '@/components/ScenarioBriefing';
import ChoiceCard from '@/components/ChoiceCard';
import FeedbackPanel from '@/components/FeedbackPanel';
import StepProgress from '@/components/StepProgress';

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

function calculateWeightedScore(choice: Choice, quadrantId: QuadrantId): WeightedScore {
  const meta = QUADRANT_META[quadrantId];
  const { ce, ss, sv } = choice.scores;
  const weighted = ce * meta.weights.ce + ss * meta.weights.ss + sv * meta.weights.sv;
  return { raw: choice.scores, weighted };
}

export default function ScenarioClient() {
  const params = useParams();
  const router = useRouter();

  const quadrantParam = params.quadrant as string;
  const stepParam = params.step as string;

  const quadrantId = QUADRANT_ORDER.includes(quadrantParam as QuadrantId)
    ? (quadrantParam as QuadrantId)
    : null;
  const stepNumber = parseInt(stepParam, 10);
  const stepIndex = stepNumber - 1;

  const {
    sessionId,
    submissions,
    showFeedback,
    lastFeedback,
    submitChoice,
    showChoiceFeedback,
    dismissFeedback,
  } = useGameStore();

  // 현재 사분면의 누적 점수 (정규화된 100점 기준)
  const quadrantScore = useMemo(() => {
    if (!quadrantId) return 0;
    const raw = submissions
      .filter((s) => s.quadrant === quadrantId)
      .reduce((sum, s) => sum + s.scores.weighted, 0);
    return normalizeScore(raw, quadrantId);
  }, [submissions, quadrantId]);

  const isStepSubmitted = useMemo(() => {
    if (!quadrantId) return false;
    return submissions.some((s) => s.quadrant === quadrantId && s.step === stepIndex);
  }, [submissions, quadrantId, stepIndex]);

  const [scenarioData, setScenarioData] = useState<ScenarioData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedChoiceId, setSelectedChoiceId] = useState<string | null>(null);
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [briefingCollapsed, setBriefingCollapsed] = useState(false);
  const [reason, setReason] = useState('');

  useEffect(() => {
    if (!quadrantId) return;
    setIsLoading(true);
    loadScenarioData(quadrantId).then((data) => {
      setScenarioData(data);
      setIsLoading(false);
    });
  }, [quadrantId]);

  useEffect(() => {
    setSelectedChoiceId(null);
    setIsConfirmed(false);
    setBriefingCollapsed(stepIndex > 0);
    setReason('');
  }, [quadrantId, stepIndex]);

  useEffect(() => {
    if (isStepSubmitted) setIsConfirmed(true);
  }, [isStepSubmitted]);

  const handleConfirm = useCallback(() => {
    if (!selectedChoiceId || !scenarioData || !quadrantId) return;
    const step = scenarioData.steps[stepIndex];
    if (!step) return;
    const choice = step.choices.find((c) => c.id === selectedChoiceId);
    if (!choice) return;

    const weightedScore = calculateWeightedScore(choice, quadrantId);
    submitChoice({
      quadrant: quadrantId,
      step: stepIndex,
      choiceId: selectedChoiceId,
      scores: weightedScore,
      reason: reason.trim() || undefined,
      timestamp: Date.now(),
    });
    setIsConfirmed(true);
    showChoiceFeedback(choice.feedback);
  }, [selectedChoiceId, scenarioData, quadrantId, stepIndex, submitChoice, showChoiceFeedback, reason]);

  const handleFeedbackContinue = useCallback(() => {
    dismissFeedback();
    if (!quadrantId) return;

    if (stepNumber < 4) {
      router.push(`/scenario/${quadrantId}/${stepNumber + 1}`);
    } else {
      router.push('/dashboard');
    }
  }, [quadrantId, stepNumber, dismissFeedback, router]);

  useEffect(() => {
    if (!sessionId && typeof window !== 'undefined') {
      const timer = setTimeout(() => {
        if (!useGameStore.getState().sessionId) router.push('/');
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [sessionId, router]);

  if (!quadrantId || stepNumber < 1 || stepNumber > 4) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <p className="text-gray-500">잘못된 경로입니다</p>
          <button onClick={() => router.push('/')} className="mt-4 px-6 py-2 bg-slate-800 text-white rounded-lg text-sm">
            처음으로
          </button>
        </div>
      </div>
    );
  }

  const quadrantMeta = QUADRANT_META[quadrantId];

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-10 h-10 border-4 border-gray-200 border-t-violet-500 rounded-full animate-spin mx-auto" />
      </div>
    );
  }

  if (!scenarioData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-md text-center">
          <h2 className="text-lg font-bold text-gray-800 mb-2">데이터 준비 중</h2>
          <p className="text-sm text-gray-600 mb-4">{quadrantMeta.nameKo} 시나리오가 아직 준비되지 않았습니다.</p>
          <button onClick={() => router.push('/')} className="px-6 py-2.5 bg-slate-800 text-white rounded-lg text-sm font-medium">
            처음으로
          </button>
        </div>
      </div>
    );
  }

  const currentStep = scenarioData.steps[stepIndex];
  if (!currentStep) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 상단 바 */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button onClick={() => router.push('/')} className="text-gray-400 hover:text-gray-600" title="홈으로">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <h1 className="text-sm font-bold text-gray-800">
              {quadrantMeta.nameKo}
              <span className="text-xs font-normal text-gray-400 ml-1">({quadrantMeta.nameEn})</span>
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs text-gray-400">{stepNumber}/4 단계</span>
            {quadrantScore > 0 && (
              <span className="text-xs font-semibold text-violet-600 bg-violet-50 px-2 py-0.5 rounded-full">
                {quadrantScore}점
              </span>
            )}
          </div>
        </div>
      </header>

      {/* 스텝 진행 */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-3xl mx-auto px-4 py-4">
          <StepProgress currentStep={stepIndex} totalSteps={4} quadrantColor={quadrantMeta.color} />
        </div>
      </div>

      {/* 본문 */}
      <main className="max-w-5xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* 왼쪽: 브리핑 */}
          <div className="lg:col-span-4">
            <div className="sticky top-32">
              {briefingCollapsed ? (
                <button
                  onClick={() => setBriefingCollapsed(false)}
                  className="w-full text-left bg-white rounded-xl border border-gray-200 p-4 hover:border-gray-300 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-sm font-semibold text-gray-800">{scenarioData.background.companyName}</span>
                      <span className="text-xs text-gray-500 block mt-0.5">{scenarioData.background.itemName}</span>
                    </div>
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </button>
              ) : (
                <div className="relative">
                  {stepIndex > 0 && (
                    <button
                      onClick={() => setBriefingCollapsed(true)}
                      className="absolute top-3 right-3 z-10 p-1 rounded-lg hover:bg-black/5 transition-colors"
                      title="접기"
                    >
                      <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                      </svg>
                    </button>
                  )}
                  <ScenarioBriefing background={scenarioData.background} quadrant={quadrantMeta} />
                </div>
              )}
            </div>
          </div>

          {/* 오른쪽: 상황 + 토론 + 선택지 */}
          <div className="lg:col-span-8 space-y-6">
            {/* 상황 설명 */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-center gap-2 mb-3">
                <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-gray-100 text-gray-600 text-xs font-bold">
                  {stepNumber}
                </span>
                <h2 className="text-lg font-bold text-gray-900">{currentStep.title}</h2>
              </div>
              <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">{currentStep.situation}</p>
            </div>

            {/* 팀 토론 질문 */}
            {currentStep.discussionPrompt && (
              <div className="bg-violet-50 rounded-xl border border-violet-200 p-5">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-violet-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <svg className="w-4 h-4 text-violet-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-violet-800 mb-1">팀 토론 질문</h3>
                    <p className="text-sm text-violet-700 leading-relaxed">{currentStep.discussionPrompt}</p>
                    <p className="text-xs text-violet-500 mt-2">선택 전에 충분히 생각해 보세요. 정답은 없습니다.</p>
                  </div>
                </div>
              </div>
            )}

            {/* 선택지 */}
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide px-1">선택지</h3>
              {currentStep.choices.map((choice) => (
                <ChoiceCard
                  key={choice.id}
                  choice={choice}
                  isSelected={selectedChoiceId === choice.id}
                  onSelect={() => setSelectedChoiceId(choice.id)}
                  disabled={isConfirmed}
                />
              ))}
            </div>

            {/* 선택 이유 + 제출 */}
            {!isConfirmed && (
              <div className="space-y-4 pt-2">
                {selectedChoiceId && (
                  <div className="bg-white rounded-xl border border-gray-200 p-5">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      선택 이유 <span className="text-xs font-normal text-gray-400">(선택사항)</span>
                    </label>
                    <textarea
                      value={reason}
                      onChange={(e) => setReason(e.target.value)}
                      placeholder="왜 이 선택을 했는지 간단히 적어주세요..."
                      className="w-full px-4 py-3 border border-gray-200 rounded-lg text-sm resize-none
                                 focus:outline-none focus:border-violet-400 focus:ring-1 focus:ring-violet-200
                                 placeholder:text-gray-400 transition-colors"
                      rows={3}
                    />
                  </div>
                )}

                <button
                  onClick={handleConfirm}
                  disabled={!selectedChoiceId}
                  className={`w-full py-3.5 rounded-xl text-base font-bold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                    selectedChoiceId
                      ? 'bg-slate-800 text-white hover:bg-slate-700 active:bg-slate-900 focus:ring-slate-500 cursor-pointer'
                      : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  결론 제출
                </button>

                <p className="text-center text-xs text-gray-400">
                  각 선택에는 장단점이 있습니다. 상황에 맞는 최선의 판단을 내려주세요.
                </p>
              </div>
            )}

            {isConfirmed && !showFeedback && (
              <div className="text-center py-4">
                <p className="text-sm text-gray-500">이 단계는 이미 완료되었습니다.</p>
              </div>
            )}
          </div>
        </div>
      </main>

      {showFeedback && lastFeedback && (
        <FeedbackPanel feedback={lastFeedback} onContinue={handleFeedbackContinue} />
      )}
    </div>
  );
}
