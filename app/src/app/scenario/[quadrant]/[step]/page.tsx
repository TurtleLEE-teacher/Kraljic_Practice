'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useGameStore } from '@/store/gameStore';
import { QUADRANT_ORDER, QUADRANT_META } from '@/data/quadrants';
import type { QuadrantId, ScenarioData, Choice, WeightedScore } from '@/lib/types';

import ScenarioBriefing from '@/components/ScenarioBriefing';
import ChoiceCard from '@/components/ChoiceCard';
import FeedbackPanel from '@/components/FeedbackPanel';
import StepProgress from '@/components/StepProgress';
import QuadrantNav from '@/components/QuadrantNav';
import ScoreBar from '@/components/ScoreBar';

// Dynamic import of scenario data based on quadrant
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
  const weighted =
    ce * meta.weights.ce +
    ss * meta.weights.ss +
    sv * meta.weights.sv;
  return {
    raw: choice.scores,
    weighted,
  };
}

export default function ScenarioPage() {
  const params = useParams();
  const router = useRouter();

  const quadrantParam = params.quadrant as string;
  const stepParam = params.step as string;

  // Validate params
  const quadrantId = QUADRANT_ORDER.includes(quadrantParam as QuadrantId)
    ? (quadrantParam as QuadrantId)
    : null;
  const stepNumber = parseInt(stepParam, 10); // 1-based from URL
  const stepIndex = stepNumber - 1; // 0-based for data access

  // Store state
  const {
    sessionId,
    phase,
    submissions,
    showFeedback,
    lastFeedback,
    submitChoice,
    showChoiceFeedback,
    dismissFeedback,
  } = useGameStore();

  // Derive completed quadrants from submissions
  const completedQuadrants = useMemo(() => {
    const completed: QuadrantId[] = [];
    for (const qId of QUADRANT_ORDER) {
      const qSubs = submissions.filter((s) => s.quadrant === qId);
      if (qSubs.length >= 4) {
        completed.push(qId);
      }
    }
    return completed;
  }, [submissions]);

  // Check if this specific step has already been submitted
  const isStepSubmitted = useMemo(() => {
    if (!quadrantId) return false;
    return submissions.some(
      (s) => s.quadrant === quadrantId && s.step === stepIndex
    );
  }, [submissions, quadrantId, stepIndex]);

  // Calculate running score
  const runningScore = useMemo(() => {
    return submissions.reduce((sum, s) => sum + s.scores.weighted, 0);
  }, [submissions]);

  // Scenario data loading
  const [scenarioData, setScenarioData] = useState<ScenarioData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedChoiceId, setSelectedChoiceId] = useState<string | null>(null);
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [briefingCollapsed, setBriefingCollapsed] = useState(false);

  useEffect(() => {
    if (!quadrantId) return;
    setIsLoading(true);
    loadScenarioData(quadrantId).then((data) => {
      setScenarioData(data);
      setIsLoading(false);
    });
  }, [quadrantId]);

  // Reset selection when navigating to a new step
  useEffect(() => {
    setSelectedChoiceId(null);
    setIsConfirmed(false);
    // Collapse briefing on steps 2-4
    setBriefingCollapsed(stepIndex > 0);
  }, [quadrantId, stepIndex]);

  // If already submitted, mark as confirmed
  useEffect(() => {
    if (isStepSubmitted) {
      setIsConfirmed(true);
    }
  }, [isStepSubmitted]);

  const handleConfirm = useCallback(() => {
    if (!selectedChoiceId || !scenarioData || !quadrantId) return;

    const step = scenarioData.steps[stepIndex];
    if (!step) return;

    const choice = step.choices.find((c) => c.id === selectedChoiceId);
    if (!choice) return;

    const weightedScore = calculateWeightedScore(choice, quadrantId);

    // Submit the choice
    submitChoice({
      quadrant: quadrantId,
      step: stepIndex,
      choiceId: selectedChoiceId,
      scores: weightedScore,
      timestamp: Date.now(),
    });

    setIsConfirmed(true);

    // Show feedback
    showChoiceFeedback(choice.feedback);
  }, [selectedChoiceId, scenarioData, quadrantId, stepIndex, submitChoice, showChoiceFeedback]);

  const handleFeedbackContinue = useCallback(() => {
    dismissFeedback();

    if (!quadrantId) return;

    const nextStepNumber = stepNumber + 1;

    if (nextStepNumber <= 4) {
      // Go to next step in same quadrant
      router.push(`/scenario/${quadrantId}/${nextStepNumber}`);
    } else {
      // Quadrant complete, go to next quadrant or event
      const currentQIndex = QUADRANT_ORDER.indexOf(quadrantId);
      const nextQIndex = currentQIndex + 1;

      if (nextQIndex < QUADRANT_ORDER.length) {
        // Go to next quadrant
        const nextQuadrant = QUADRANT_ORDER[nextQIndex];
        router.push(`/scenario/${nextQuadrant}/1`);
      } else {
        // All quadrants done, go to event
        router.push('/event');
      }
    }
  }, [quadrantId, stepNumber, dismissFeedback, router]);

  // Redirect if no session
  useEffect(() => {
    if (!sessionId && typeof window !== 'undefined') {
      // Allow a brief moment for hydration
      const timer = setTimeout(() => {
        if (!useGameStore.getState().sessionId) {
          router.push('/');
        }
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [sessionId, router]);

  // Invalid route handling
  if (!quadrantId || stepNumber < 1 || stepNumber > 4) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <p className="text-gray-500 text-lg">잘못된 경로입니다</p>
          <button
            onClick={() => router.push('/')}
            className="mt-4 px-6 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-700 text-sm"
          >
            처음으로 돌아가기
          </button>
        </div>
      </div>
    );
  }

  const quadrantMeta = QUADRANT_META[quadrantId];

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-gray-200 border-t-blue-500 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-500 text-sm">시나리오 데이터를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  // No data available (Agent 1 hasn't created the data files yet)
  if (!scenarioData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-md text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-amber-100 flex items-center justify-center">
            <svg className="w-8 h-8 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h2 className="text-lg font-bold text-gray-800 mb-2">시나리오 데이터 준비 중</h2>
          <p className="text-sm text-gray-600 leading-relaxed mb-4">
            {quadrantMeta.nameKo} 사분면의 시나리오 데이터가 아직 준비되지 않았습니다.
            데이터 파일이 추가되면 자동으로 표시됩니다.
          </p>
          <button
            onClick={() => router.push('/')}
            className="px-6 py-2.5 bg-slate-800 text-white rounded-lg hover:bg-slate-700 text-sm font-medium"
          >
            처음으로 돌아가기
          </button>
        </div>
      </div>
    );
  }

  const currentStep = scenarioData.steps[stepIndex];
  if (!currentStep) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top navigation bar */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between gap-4">
            <QuadrantNav
              currentQuadrant={quadrantId}
              completedQuadrants={completedQuadrants}
            />
            <div className="flex-shrink-0 w-48">
              <ScoreBar
                currentScore={runningScore}
                maxScore={80}
                label="누적 점수"
              />
            </div>
          </div>
        </div>
      </header>

      {/* Step progress */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-3xl mx-auto px-4 py-4">
          <StepProgress
            currentStep={stepIndex}
            totalSteps={4}
            quadrantColor={quadrantMeta.color}
          />
        </div>
      </div>

      {/* Main content */}
      <main className="max-w-5xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left sidebar: Briefing (collapsible on steps 2-4) */}
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
                  <ScenarioBriefing
                    background={scenarioData.background}
                    quadrant={quadrantMeta}
                  />
                </div>
              )}
            </div>
          </div>

          {/* Right content: Step situation + choices */}
          <div className="lg:col-span-8 space-y-6">
            {/* Step situation */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-center gap-2 mb-3">
                <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-gray-100 text-gray-600 text-xs font-bold">
                  {stepNumber}
                </span>
                <h2 className="text-lg font-bold text-gray-900">{currentStep.title}</h2>
              </div>
              <p className="text-sm text-gray-700 leading-relaxed">{currentStep.situation}</p>
            </div>

            {/* Choice cards */}
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide px-1">
                선택지를 선택해 주세요
              </h3>
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

            {/* Confirm button */}
            {!isConfirmed && (
              <div className="pt-2">
                <button
                  onClick={handleConfirm}
                  disabled={!selectedChoiceId}
                  className={`
                    w-full py-3.5 rounded-xl text-base font-bold transition-all duration-200
                    focus:outline-none focus:ring-2 focus:ring-offset-2
                    ${selectedChoiceId
                      ? 'bg-slate-800 text-white hover:bg-slate-700 active:bg-slate-900 focus:ring-slate-500 cursor-pointer'
                      : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    }
                  `}
                >
                  선택 확정
                </button>
              </div>
            )}

            {/* Already submitted indicator */}
            {isConfirmed && !showFeedback && (
              <div className="text-center py-4">
                <p className="text-sm text-gray-500">이 단계는 이미 완료되었습니다.</p>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Feedback panel overlay */}
      {showFeedback && lastFeedback && (
        <FeedbackPanel
          feedback={lastFeedback}
          onContinue={handleFeedbackContinue}
        />
      )}
    </div>
  );
}
