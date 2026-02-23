import { create } from 'zustand';
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

export const useGameStore = create<GameStore>((set, get) => ({
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
  },

  submitChoice: (record: SubmissionRecord) => {
    set((state) => ({
      submissions: [...state.submissions, record],
    }));
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
        // Stay at the last step; the page will handle the transition
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
        // All quadrants complete, stay on the last one;
        // the page will handle transition to event
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
}));
