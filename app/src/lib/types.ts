// ============================================================
// Kraljic Matrix Practice Simulation — Shared Type Definitions
// ============================================================

// --- Quadrant ---

export type QuadrantId = 'bottleneck' | 'leverage' | 'strategic' | 'noncritical';

export interface QuadrantWeights {
  ce: number; // Cost Efficiency weight
  ss: number; // Supply Stability weight
  sv: number; // Strategic Value weight
}

export interface QuadrantMeta {
  id: QuadrantId;
  nameKo: string;
  nameEn: string;
  supplyRisk: 'HIGH' | 'LOW';
  profitImpact: 'HIGH' | 'LOW';
  coreDilemma: string;
  weights: QuadrantWeights;
  color: string; // Tailwind color class
}

// --- Score ---

export interface RawScore {
  ce: number; // 1-5
  ss: number; // 1-5
  sv: number; // 1-5
}

export interface WeightedScore {
  raw: RawScore;
  weighted: number; // ce*w_ce + ss*w_ss + sv*w_sv
}

// --- Scenario Data ---

export interface CompanyBackground {
  companyName: string;
  industry: string;
  revenue: string;
  employees: string;
  itemName: string;
  itemDescription: string;
  annualSpend: string;
  keyMetrics: string[];
  situationBriefing: string;
}

export interface Feedback {
  result: string;        // 결과
  tradeoff: string;      // 트레이드오프
  theoryConnection: string; // 이론 연결
}

export interface Choice {
  id: string;           // e.g., "bottleneck_step1_A"
  label: string;        // e.g., "A. 현상 유지"
  title: string;        // Short title
  description: string;  // Full description
  scores: RawScore;
  feedback: Feedback;
}

export interface Step {
  stepNumber: number;   // 1-4
  title: string;
  situation: string;    // Situation description for this step
  choices: [Choice, Choice, Choice]; // Always exactly 3 choices (A, B, C)
}

export interface ScenarioData {
  quadrant: QuadrantId;
  background: CompanyBackground;
  steps: [Step, Step, Step, Step]; // Always exactly 4 steps
}

// --- Event (Layer 2) ---

export interface EventBackground {
  title: string;
  description: string;
  shocks: { name: string; description: string; timeframe: string }[];
}

export interface EventQuadrantResponse {
  quadrantId: QuadrantId;
  situation: string;      // How the event affects this quadrant's item
  choices: [Choice, Choice, Choice];
}

export interface EventData {
  background: EventBackground;
  responses: [EventQuadrantResponse, EventQuadrantResponse, EventQuadrantResponse, EventQuadrantResponse];
}

// --- Session / Game State ---

export interface SubmissionRecord {
  quadrant: QuadrantId;
  step: number;
  choiceId: string;
  scores: WeightedScore;
  timestamp: number;
}

export interface EventSubmissionRecord {
  quadrant: QuadrantId;
  choiceId: string;
  scores: WeightedScore;
  timestamp: number;
}

export type GamePhase =
  | 'landing'
  | 'scenario'     // Layer 1: playing through quadrant scenarios
  | 'event'        // Layer 2: responding to disruptive event
  | 'dashboard';   // Viewing final results

export interface GameState {
  sessionId: string | null;
  participantName: string;
  phase: GamePhase;
  currentQuadrant: QuadrantId;
  currentStep: number; // 0-3 (index)
  submissions: SubmissionRecord[];
  eventSubmissions: EventSubmissionRecord[];
  showFeedback: boolean;
  lastFeedback: Feedback | null;
}

// --- Dashboard ---

export interface QuadrantResult {
  quadrant: QuadrantId;
  stepScores: WeightedScore[];
  totalWeighted: number;
  choiceIds: string[];
  optimalScore: number;
  percentOfOptimal: number;
}

export interface DimensionProfile {
  ce: { total: number; average: number };
  ss: { total: number; average: number };
  sv: { total: number; average: number };
  strongest: 'ce' | 'ss' | 'sv';
  weakest: 'ce' | 'ss' | 'sv';
}

export type Grade = 'Excellent' | 'Good' | 'Fair' | 'Poor';

export interface DashboardData {
  sessionId: string;
  participantName: string;
  layer1Score: number;
  layer2Score: number;
  finalScore: number;
  grade: Grade;
  quadrantResults: QuadrantResult[];
  eventResults: {
    quadrant: QuadrantId;
    choiceId: string;
    score: WeightedScore;
  }[];
  dimensionProfile: DimensionProfile;
  rank?: { before: number; after: number; total: number };
}
