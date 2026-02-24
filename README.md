# Kraljic Matrix Practice Simulation

Kraljic 매트릭스 기반 구매전략 의사결정 시뮬레이션 — 품목군별 실습 플랫폼

## Overview

구매/조달 전문가를 위한 인터랙티브 학습 시뮬레이션입니다. Kraljic 매트릭스의 4개 사분면(병목, 레버리지, 전략, 비핵심)에 대해 실제 산업 시나리오를 기반으로 의사결정을 연습하고, 돌발 이벤트 대응까지 경험합니다.

## Architecture

### 2-Layer Structure

```
Layer 1: Individual Scenario (4 Quadrants × 4 Steps × 3 Choices)
  ├── Bottleneck  — 한빛전자 / 세라믹 절연체
  ├── Leverage    — 노바텍 / MLCC 커패시터
  ├── Strategic   — 미래모터스 / 차세대 배터리셀
  └── Non-critical — 대한중공업 / MRO 소모품

Layer 2: Event Response (공통 위기 시나리오)
  └── 동아시아 공급망 복합 위기 (항만 파업 + 수출 규제 + 공장 화재)
```

### Scoring System

| Dimension | Description | Range |
|-----------|-------------|-------|
| CE (Cost Efficiency) | 단기 재무 성과 | 1-5 |
| SS (Supply Stability) | 공급 안정성/리스크 관리 | 1-5 |
| SV (Strategic Value) | 장기 경쟁우위 구축 | 1-5 |

**Quadrant-Specific Weights:**

| Quadrant | CE | SS | SV | Core Dilemma |
|----------|------|------|------|-------------|
| Bottleneck | 0.20 | 0.50 | 0.30 | 저비용 품목에 얼마나 투자할 것인가 |
| Leverage | 0.50 | 0.20 | 0.30 | 공격적 원가 절감 vs 공급사 관계 |
| Strategic | 0.20 | 0.30 | 0.50 | 파트너십 심화 vs 종속 회피 |
| Non-critical | 0.50 | 0.15 | 0.35 | 관리 효율화 vs 방치 위험 |

### Score Distribution

- Layer 1 (4 quadrants): ~16–80 points (realistic range: 45–65)
- Layer 2 (event): max 20 points (realistic range: 10–16)
- Total: max 100 points (realistic max: ~78)

## Design Documents

| # | Document | Description |
|---|----------|-------------|
| 01 | [Common Framework](docs/01_common_framework.md) | 전체 구조, 스코어링, 대시보드 설계 |
| 02 | [Bottleneck Scenario](docs/02_scenario_bottleneck.md) | 한빛전자 세라믹 절연체 시나리오 |
| 03 | [Leverage Scenario](docs/03_scenario_leverage.md) | 노바텍 MLCC 커패시터 시나리오 |
| 04 | [Strategic Scenario](docs/04_scenario_strategic.md) | 미래모터스 배터리셀 시나리오 |
| 05 | [Non-critical Scenario](docs/05_scenario_noncritical.md) | 대한중공업 MRO 소모품 시나리오 |
| 06 | [Event Scenario](docs/06_event_scenario.md) | 돌발 이벤트 + 역전 로직 설계 |
| 07 | [Integration Verification](docs/07_integration_verification.md) | 통합 검증 및 밸런스 확인 |

## Key Features

- **48 Decision Points**: 4 quadrants × 4 steps × 3 choices, no branching
- **Immediate Feedback**: 결과 → 트레이드오프 → 이론 연결 (매 선택 후)
- **Event Reversal**: Layer 2에서 최대 ~8.6점 역전 가능 (긴장감 유지)
- **No Perfect Choice**: 모든 선택에 CE/SS/SV 트레이드오프 존재
- **Comprehensive Dashboard**: 레이더 차트, 사분면별 분석, 순위 변동 추적

## Tech Stack

- **Framework**: Next.js 16 (App Router) + TypeScript
- **Styling**: Tailwind CSS v4
- **State**: Zustand (with localStorage persist)
- **Charts**: Recharts (Radar, Bar)
- **Database**: SQLite (better-sqlite3) + Drizzle ORM
- **Runtime**: Node.js 20+

## Development Status

- [x] Common Framework Design
- [x] Bottleneck Scenario Design
- [x] Leverage Scenario Design
- [x] Strategic Scenario Design
- [x] Non-critical Scenario Design
- [x] Event & Reversal Logic Design
- [x] Integration Verification
- [x] Frontend Implementation (4 pages, 13 components)
- [x] Backend / Scoring Engine (6 functions + 4 API routes)
- [x] Database & State Management (SQLite + Zustand persist)
- [x] Dashboard & Visualization (ScoreGauge, RadarChart, RankTracker)
- [ ] Testing & QA

## Getting Started

```bash
cd app
npm install
npm run dev    # http://localhost:3000
```
