import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type {
  GameState,
  GamePhase,
  QuadrantId,
  SubmissionRecord,
  EventSubmissionRecord,
  Feedback,
} from '@/lib/types';
import { QUADRANT_ORDER } from '@/data/quadrants';

interface GameStore extends GameState {
  // Actions
  startSession: (name: string) => void;
  submitChoice: (record: SubmissionRecord) => void;
  submitEventResponse: (record: EventSubmissionRecord) => void;
  nextStep: () => void;
  nextQuadrant: () => void;
  goToEvent: () => void;
  goToDashboard: () => void;
  showChoiceFeedback: (feedback: Feedback) => void;
  dismissFeedback: () => void;
  reset: () => void;

  // Computed helpers
  getQuadrantSubmissions: (quadrant: QuadrantId) => SubmissionRecord[];
  isQuadrantComplete: (quadrant: QuadrantId) => boolean;
  getCurrentProgress: () => {
    quadrantIndex: number;
    stepIndex: number;
    totalSteps: number;
  };
}

const STEPS_PER_QUADRANT = 4;

const initialState: GameState = {
  sessionId: null,
  participantName: '',
  phase: 'landing' as GamePhase,
  currentQuadrant: 'bottleneck' as QuadrantId,
  currentStep: 0,
  submissions: [],
  eventSubmissions: [],
  showFeedback: false,
  lastFeedback: null,
};

export const useGameStore = create<GameStore>()(
  persist(
    (set, get) => ({
      ...initialState,

      startSession: (name: string) => {
        const sessionId = crypto.randomUUID();
        set({
          sessionId,
          participantName: name,
          phase: 'scenario',
          currentQuadrant: 'bottleneck',
          currentStep: 0,
          submissions: [],
          eventSubmissions: [],
          showFeedback: false,
          lastFeedback: null,
        });

        // Persist session to backend (fire-and-forget)
        fetch('/api/session', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sessionId, participantName: name }),
        }).catch(() => {});
      },

      submitChoice: (record: SubmissionRecord) => {
        set((state) => ({
          submissions: [...state.submissions, record],
        }));

        // Persist to backend (fire-and-forget)
        const { sessionId } = get();
        if (sessionId) {
          fetch('/api/submit', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              sessionId,
              quadrant: record.quadrant,
              step: record.step,
              choiceId: record.choiceId,
              ceScore: record.scores.raw.ce,
              ssScore: record.scores.raw.ss,
              svScore: record.scores.raw.sv,
              weightedScore: record.scores.weighted,
            }),
          }).catch(() => {});
        }
      },

      submitEventResponse: (record: EventSubmissionRecord) => {
        set((state) => ({
          eventSubmissions: [...state.eventSubmissions, record],
        }));
      },

      nextStep: () => {
        set((state) => {
          const nextStepIndex = state.currentStep + 1;
          if (nextStepIndex >= STEPS_PER_QUADRANT) {
            return { currentStep: STEPS_PER_QUADRANT - 1 };
          }
          return { currentStep: nextStepIndex };
        });
      },

      nextQuadrant: () => {
        set((state) => {
          const currentIndex = QUADRANT_ORDER.indexOf(state.currentQuadrant);
          const nextIndex = currentIndex + 1;
          if (nextIndex >= QUADRANT_ORDER.length) {
            return {};
          }
          return {
            currentQuadrant: QUADRANT_ORDER[nextIndex],
            currentStep: 0,
            showFeedback: false,
            lastFeedback: null,
          };
        });
      },

      goToEvent: () => {
        set({
          phase: 'event',
          showFeedback: false,
          lastFeedback: null,
        });
      },

      goToDashboard: () => {
        // Persist all event responses to backend before transitioning
        const { sessionId, eventSubmissions } = get();
        if (sessionId && eventSubmissions.length > 0) {
          fetch('/api/event', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              sessionId,
              responses: eventSubmissions.map((r) => ({
                quadrant: r.quadrant,
                choiceId: r.choiceId,
                ceScore: r.scores.raw.ce,
                ssScore: r.scores.raw.ss,
                svScore: r.scores.raw.sv,
                weightedScore: r.scores.weighted,
              })),
            }),
          }).catch(() => {});
        }

        set({
          phase: 'dashboard',
          showFeedback: false,
          lastFeedback: null,
        });
      },

      showChoiceFeedback: (feedback: Feedback) => {
        set({
          showFeedback: true,
          lastFeedback: feedback,
        });
      },

      dismissFeedback: () => {
        set({
          showFeedback: false,
          lastFeedback: null,
        });
      },

      reset: () => {
        set({ ...initialState });
      },

      // Computed helpers
      getQuadrantSubmissions: (quadrant: QuadrantId) => {
        return get().submissions.filter((s) => s.quadrant === quadrant);
      },

      isQuadrantComplete: (quadrant: QuadrantId) => {
        const subs = get().submissions.filter((s) => s.quadrant === quadrant);
        return subs.length >= STEPS_PER_QUADRANT;
      },

      getCurrentProgress: () => {
        const state = get();
        const quadrantIndex = QUADRANT_ORDER.indexOf(state.currentQuadrant);
        return {
          quadrantIndex,
          stepIndex: state.currentStep,
          totalSteps: STEPS_PER_QUADRANT,
        };
      },
    }),
    {
      name: 'kraljic-game-store',
      // Only persist essential state, not transient UI state
      partialize: (state) => ({
        sessionId: state.sessionId,
        participantName: state.participantName,
        phase: state.phase,
        currentQuadrant: state.currentQuadrant,
        currentStep: state.currentStep,
        submissions: state.submissions,
        eventSubmissions: state.eventSubmissions,
      }),
    },
  ),
);
