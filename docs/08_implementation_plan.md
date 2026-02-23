# Implementation Plan — Kraljic Matrix Practice Simulation

## Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| Framework | Next.js 14 (App Router) | SSR, routing, API routes |
| Language | TypeScript | Type safety |
| Styling | Tailwind CSS | Utility-first CSS |
| State | Zustand | Lightweight global state management |
| Charts | Recharts | Radar chart, bar chart, dashboard |
| Database | SQLite (better-sqlite3) | Lightweight, zero-config persistence |
| ORM | Drizzle ORM | Type-safe SQL queries |
| Testing | Vitest + React Testing Library | Unit/integration tests |

## Project Structure

```
src/
├── app/                          # Next.js App Router
│   ├── layout.tsx                # Root layout (Korean font, global styles)
│   ├── page.tsx                  # Landing page / session start
│   ├── scenario/
│   │   └── [quadrant]/
│   │       └── [step]/
│   │           └── page.tsx      # Scenario step page
│   ├── event/
│   │   └── page.tsx              # Layer 2 event response page
│   ├── dashboard/
│   │   └── page.tsx              # Final results dashboard
│   └── api/
│       ├── session/route.ts      # Session CRUD
│       ├── submit/route.ts       # Choice submission + scoring
│       ├── event/route.ts        # Event response submission
│       └── results/route.ts      # Dashboard data retrieval
│
├── data/                         # Static scenario data (JSON)
│   ├── quadrants.ts              # Quadrant metadata + weights
│   ├── bottleneck.ts             # Bottleneck 4 steps × 3 choices
│   ├── leverage.ts               # Leverage 4 steps × 3 choices
│   ├── strategic.ts              # Strategic 4 steps × 3 choices
│   ├── noncritical.ts            # Non-critical 4 steps × 3 choices
│   └── event.ts                  # Event scenario + 4 quadrant responses
│
├── lib/                          # Core logic
│   ├── scoring.ts                # Scoring engine (weighted calc)
│   ├── types.ts                  # Shared TypeScript interfaces
│   └── db.ts                     # Database connection + schema
│
├── components/                   # Reusable UI components
│   ├── ScenarioBriefing.tsx      # Company/item background display
│   ├── ChoiceCard.tsx            # Individual choice option (A/B/C)
│   ├── FeedbackPanel.tsx         # Post-choice feedback (결과/트레이드오프/이론)
│   ├── StepProgress.tsx          # Step progress indicator (1-4)
│   ├── QuadrantNav.tsx           # Quadrant navigation sidebar
│   ├── ScoreBar.tsx              # Real-time score bar
│   ├── RadarChart.tsx            # CE/SS/SV radar chart
│   ├── QuadrantSummary.tsx       # Per-quadrant result card
│   ├── RankTracker.tsx           # Rank before/after event
│   └── EventResponseForm.tsx     # Event quadrant response selector
│
└── store/                        # Zustand stores
    └── gameStore.ts              # Session state, choices, scores
```

## Team Agent Assignment

### Agent 1: Data + Scoring Engine

**Scope:** `src/data/`, `src/lib/`, `src/app/api/`, DB schema

**Tasks:**
1. Define TypeScript types/interfaces (`types.ts`)
   - `Quadrant`, `Step`, `Choice`, `Feedback`, `Score`
   - `Session`, `SubmissionRecord`, `EventResponse`
   - `DashboardData`, `QuadrantResult`
2. Create scenario data files from design docs
   - Convert all 4 quadrant scenarios → structured TS data
   - Convert event scenario → structured TS data
   - Include all CE/SS/SV scores and feedback text
3. Implement scoring engine (`scoring.ts`)
   - `calculateStepScore(choice, quadrant)` → weighted score
   - `calculateQuadrantScore(choices[], quadrant)` → total
   - `calculateLayer1Score(allChoices)` → sum of 4 quadrants
   - `calculateEventScore(eventResponses)` → Layer 2 score
   - `calculateFinalScore(layer1, layer2)` → total
   - `determineGrade(finalScore)` → Excellent/Good/Fair/Poor
4. Set up database schema + migrations
   - `sessions` table: id, participant_name, created_at, completed_at
   - `submissions` table: session_id, quadrant, step, choice_id, scores
   - `event_responses` table: session_id, quadrant, choice_id, scores
5. Implement API routes
   - POST `/api/session` — create new session
   - POST `/api/submit` — submit choice, return feedback + score
   - POST `/api/event` — submit event responses
   - GET `/api/results/[sessionId]` — full dashboard data

### Agent 2: UI Components + Pages

**Scope:** `src/components/`, `src/app/` pages, `src/store/`, styling

**Tasks:**
1. Project scaffolding
   - `npx create-next-app` with TypeScript + Tailwind
   - Install dependencies: zustand, recharts, better-sqlite3, drizzle-orm
   - Configure Korean font (Pretendard or Noto Sans KR)
2. Implement Zustand game store
   - Session state (current quadrant, current step, choices made)
   - Score tracking (running totals per quadrant)
   - Navigation logic (next step, next quadrant, to event, to dashboard)
3. Build core UI components
   - `ScenarioBriefing` — company background, item info, key metrics
   - `ChoiceCard` — choice label, description, selection interaction
   - `FeedbackPanel` — 3-tab feedback (결과 / 트레이드오프 / 이론 연결)
   - `StepProgress` — horizontal step indicator (1→2→3→4)
   - `QuadrantNav` — sidebar showing 4 quadrants + completion status
   - `ScoreBar` — animated running score display
4. Build pages
   - Landing page — session creation, participant name input
   - Scenario page — dynamic `[quadrant]/[step]` route
   - Event page — crisis briefing + 4-quadrant response form
   - Transition screens between quadrants
5. Styling & UX
   - Quadrant-specific color coding (4 distinct theme colors)
   - Responsive layout (desktop-first, tablet-friendly)
   - Smooth transitions between steps
   - Korean typography optimization

### Agent 3: Dashboard + Visualization

**Scope:** `src/app/dashboard/`, dashboard components, charts

**Tasks:**
1. Build dashboard page layout
   - Summary header (total score, grade, rank)
   - Tabbed or scrollable section layout
2. Implement chart components
   - `RadarChart` — CE/SS/SV per quadrant (Recharts)
   - `QuadrantSummary` — 4 cards with per-quadrant score breakdown
   - `RankTracker` — before/after event rank comparison
   - Score distribution bar chart
3. Build detailed analysis sections
   - Per-quadrant choice review (what you chose vs optimal)
   - Dimensional profile (strongest/weakest dimension)
   - Trade-off analysis visualization
   - Learning feedback display (quadrant-specific advice)
4. Event impact section
   - Layer 1 → Layer 2 score impact visualization
   - Reversal analysis (did rank change?)
   - Event response evaluation per quadrant
5. Export/Share features
   - Print-friendly CSS
   - Summary card for sharing

## Development Phases

### Phase 1: Foundation (Agent 1 + Agent 2 parallel)
- Agent 1: Types, data files, scoring engine
- Agent 2: Project scaffolding, store, base components

### Phase 2: Core Features (Agent 1 + Agent 2 + Agent 3 parallel)
- Agent 1: API routes, database integration
- Agent 2: Scenario pages, event page, navigation flow
- Agent 3: Dashboard layout, chart components

### Phase 3: Integration & Polish
- Wire API ↔ UI
- End-to-end testing
- Styling polish, responsive adjustments

## Dependencies Between Agents

```
Agent 1 (types.ts) ──────► Agent 2 (imports types)
                    ──────► Agent 3 (imports types)
Agent 1 (scoring.ts) ────► Agent 3 (score calculations for charts)
Agent 2 (store) ──────────► Agent 3 (reads game state for dashboard)
```

**Critical path:** `types.ts` must be completed first (Agent 1, Task 1)

## Scoring Logic Summary

```typescript
// Per-step weighted score
weightedScore = CE × w_ce + SS × w_ss + SV × w_sv

// Per-quadrant total
quadrantScore = sum(step1..step4 weightedScores)

// Layer 1 total
layer1Score = bottleneck + leverage + strategic + noncritical

// Event score (same weighting per quadrant)
eventScore = sum(4 quadrant event responses × weights)

// Final score
finalScore = layer1Score + eventScore
```
