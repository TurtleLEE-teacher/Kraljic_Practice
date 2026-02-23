'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useGameStore } from '@/store/gameStore';
import { QUADRANT_ORDER, QUADRANT_META } from '@/data/quadrants';
import type { QuadrantId, EventData, WeightedScore } from '@/lib/types';

import EventResponseForm from '@/components/EventResponseForm';
import ScoreBar from '@/components/ScoreBar';

// Dynamic import of event data
async function loadEventData(): Promise<EventData | null> {
  try {
    const { eventData } = await import('@/data/event');
    return eventData;
  } catch {
    return null;
  }
}

function calculateEventWeightedScore(
  choiceId: string,
  quadrantId: QuadrantId,
  eventData: EventData
): WeightedScore | null {
  const meta = QUADRANT_META[quadrantId];
  const response = eventData.responses.find((r) => r.quadrantId === quadrantId);
  if (!response) return null;

  const choice = response.choices.find((c) => c.id === choiceId);
  if (!choice) return null;

  const { ce, ss, sv } = choice.scores;
  const weighted = ce * meta.weights.ce + ss * meta.weights.ss + sv * meta.weights.sv;

  return {
    raw: choice.scores,
    weighted,
  };
}

export default function EventPage() {
  const router = useRouter();
  const {
    sessionId,
    submissions,
    eventSubmissions,
    submitEventResponse,
    goToDashboard,
  } = useGameStore();

  const [eventData, setEventData] = useState<EventData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [submittedQuadrants, setSubmittedQuadrants] = useState<Set<QuadrantId>>(new Set());
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load event data
  useEffect(() => {
    setIsLoading(true);
    loadEventData().then((data) => {
      setEventData(data);
      setIsLoading(false);
    });
  }, []);

  // Redirect if no session
  useEffect(() => {
    if (!sessionId && typeof window !== 'undefined') {
      const timer = setTimeout(() => {
        if (!useGameStore.getState().sessionId) {
          router.push('/');
        }
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [sessionId, router]);

  // Track already submitted event responses
  useEffect(() => {
    const submitted = new Set<QuadrantId>(eventSubmissions.map((s) => s.quadrant));
    setSubmittedQuadrants(submitted);
  }, [eventSubmissions]);

  // Running layer 1 score
  const layer1Score = useMemo(() => {
    return submissions.reduce((sum, s) => sum + s.scores.weighted, 0);
  }, [submissions]);

  const allQuadrantsResponded = submittedQuadrants.size >= 4;

  const handleQuadrantSubmit = useCallback(
    (quadrantId: QuadrantId, choiceId: string) => {
      if (!eventData) return;

      const weightedScore = calculateEventWeightedScore(choiceId, quadrantId, eventData);
      if (!weightedScore) return;

      submitEventResponse({
        quadrant: quadrantId,
        choiceId,
        scores: weightedScore,
        timestamp: Date.now(),
      });

      setSubmittedQuadrants((prev) => new Set(prev).add(quadrantId));
    },
    [eventData, submitEventResponse]
  );

  const handleFinalSubmit = useCallback(() => {
    setIsSubmitting(true);
    goToDashboard();
    router.push('/dashboard');
  }, [goToDashboard, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-gray-200 border-t-red-500 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-500 text-sm">돌발 이벤트 데이터를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  if (!eventData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-md text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-100 flex items-center justify-center">
            <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-lg font-bold text-gray-800 mb-2">이벤트 데이터 준비 중</h2>
          <p className="text-sm text-gray-600 leading-relaxed mb-4">
            돌발 이벤트 데이터가 아직 준비되지 않았습니다.
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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-red-700 via-red-600 to-red-700 text-white">
        <div className="max-w-5xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <svg className="w-5 h-5 text-red-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                <span className="text-sm font-medium text-red-200 uppercase tracking-wide">Layer 2</span>
              </div>
              <h1 className="text-2xl font-bold">돌발 이벤트 대응</h1>
            </div>
            <div className="w-56">
              <ScoreBar
                currentScore={layer1Score}
                maxScore={80}
                label="1층 누적 점수"
              />
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-6 space-y-6">
        {/* Event briefing */}
        <div className="bg-white rounded-xl border border-red-200 shadow-sm overflow-hidden">
          <div className="bg-red-50 px-6 py-4 border-b border-red-100">
            <h2 className="text-lg font-bold text-red-900">{eventData.background.title}</h2>
          </div>
          <div className="p-6 space-y-4">
            <p className="text-sm text-gray-700 leading-relaxed">{eventData.background.description}</p>

            {/* Shocks */}
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-gray-700">발생한 충격</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {eventData.background.shocks.map((shock, index) => (
                  <div key={index} className="bg-red-50 rounded-lg p-4 border border-red-100">
                    <h4 className="text-sm font-bold text-red-800 mb-1">{shock.name}</h4>
                    <p className="text-xs text-red-700 leading-relaxed">{shock.description}</p>
                    <span className="inline-block mt-2 text-xs text-red-500 font-medium">{shock.timeframe}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Instruction */}
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex items-start gap-3">
          <svg className="w-5 h-5 text-amber-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-sm text-amber-800">
            각 사분면 품목에 대한 대응 전략을 선택해 주세요.
            4개 사분면 모두 선택을 완료한 후 최종 제출할 수 있습니다.
          </p>
        </div>

        {/* Progress indicator */}
        <div className="flex items-center justify-between bg-white rounded-lg border border-gray-200 px-4 py-3">
          <span className="text-sm text-gray-600 font-medium">진행 상황</span>
          <div className="flex items-center gap-2">
            {QUADRANT_ORDER.map((qId) => {
              const meta = QUADRANT_META[qId];
              const isComplete = submittedQuadrants.has(qId);
              return (
                <div
                  key={qId}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium ${
                    isComplete
                      ? 'bg-green-100 text-green-700'
                      : 'bg-gray-100 text-gray-500'
                  }`}
                >
                  {isComplete && (
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                  {meta.nameKo}
                </div>
              );
            })}
          </div>
        </div>

        {/* Event response forms — 4 quadrants */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {eventData.responses.map((response) => (
            <EventResponseForm
              key={response.quadrantId}
              quadrantId={response.quadrantId}
              situation={response.situation}
              choices={[...response.choices]}
              onSubmit={(choiceId) => handleQuadrantSubmit(response.quadrantId, choiceId)}
            />
          ))}
        </div>

        {/* Final submit button */}
        <div className="pt-4 pb-8">
          <button
            onClick={handleFinalSubmit}
            disabled={!allQuadrantsResponded || isSubmitting}
            className={`
              w-full py-4 rounded-xl text-base font-bold transition-all duration-200
              focus:outline-none focus:ring-2 focus:ring-offset-2
              ${allQuadrantsResponded && !isSubmitting
                ? 'bg-red-600 text-white hover:bg-red-700 active:bg-red-800 focus:ring-red-500 cursor-pointer shadow-lg'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              }
            `}
          >
            {isSubmitting ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                제출 중...
              </span>
            ) : allQuadrantsResponded ? (
              '최종 제출'
            ) : (
              `최종 제출 (${submittedQuadrants.size}/4 완료)`
            )}
          </button>
        </div>
      </main>
    </div>
  );
}
