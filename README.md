# Kraljic Matrix Practice

크랄직 매트릭스 기반 **품목군 분류 실습 사이트**

**[Live Demo](https://turtlelee-teacher.github.io/Kraljic_Practice/)**

---

## 실습 개요

10개 품목(A~J)의 **원천 데이터**를 분석해 각 품목을 크랄직 매트릭스의 4개 품목군으로 분류하는 실습입니다.

```
원천 데이터 확인 → KPI 직접 계산 → 품목군 분류 → Tally 폼 제출
```

### 품목군 (4개 사분면)

| 품목군 | 공급위험 | 수익영향 |
|--------|---------|---------|
| 병목 (Bottleneck) | 높음 | 낮음 |
| 전략 (Strategic)  | 높음 | 높음 |
| 일반 (Non-critical) | 낮음 | 낮음 |
| 레버리지 (Leverage) | 낮음 | 높음 |

### 산출 KPI 인자 (7개)

**공급위험 축 (Supply Risk)**
- ① 평균 납기 리드타임 (일) — 납기이력 테이블
- ② 납기준수율 (%) — 납기이력 테이블
- ③ 리드타임 변동계수 CV (%) — 납기이력 테이블
- ④ 등록 공급업체 수 (개) — 공급업체 현황 테이블
- ⑤ 1위 공급업체 집중도 (%) — 공급업체 현황 테이블
- ⑥ 대체 가능 업체 수 (개) — 공급업체 현황 테이블

**수익영향 축 (Profit Impact)**
- ⑦ 지출 비중 (%) — 구매 지출 현황 테이블

---

## 사이트 구조

```
/           랜딩 — 실습 개요 + 진행 단계
/guide      KPI 가이드 — 계산 공식 + 보조 계산기 + 분류 기준표
/items      품목 목록 — 10개 품목 요약
/items/[id] 품목 상세 — 3종 원천 데이터 테이블 (납기이력 / 공급업체 / 지출)
```

---

## Tech Stack

- **Framework**: Next.js 16 (App Router, Static Export) + TypeScript
- **Styling**: Tailwind CSS v4
- **Data**: 정적 데이터 (`src/data/items.ts`) — 10개 품목 × 3종 테이블

## Getting Started

```bash
cd app
npm install
npm run dev    # http://localhost:3000
npm run build  # 정적 빌드
```

---

## 브랜치 전략

- `main` — 안정 배포본
- `claude/redesign-product-kpi-site-VREBS` — 현재 개발 브랜치
