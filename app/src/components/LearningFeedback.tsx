'use client';

import React, { useState, useMemo } from 'react';
import type { QuadrantResult, QuadrantMeta, QuadrantId } from '@/lib/types';

/** Color map for quadrant themes */
const COLOR_MAP: Record<string, { primary: string; bg: string }> = {
  red: { primary: '#ef4444', bg: '#fef2f2' },
  emerald: { primary: '#10b981', bg: '#ecfdf5' },
  violet: { primary: '#8b5cf6', bg: '#f5f3ff' },
  slate: { primary: '#64748b', bg: '#f8fafc' },
};

/** Key takeaway messages per quadrant based on their core dilemma */
const QUADRANT_TAKEAWAYS: Record<QuadrantId, string> = {
  bottleneck:
    '병목 품목은 구매 금액이 작더라도 공급이 중단되면 전체 생산에 심각한 영향을 미칩니다. 비용보다 공급 안정성을 우선시하고, 대체 공급원 확보와 안전 재고 관리가 핵심입니다.',
  leverage:
    '레버리지 품목은 다수의 공급원이 존재하므로 경쟁을 활용한 비용 절감이 핵심 전략입니다. 단, 지나친 가격 압박은 공급사 관계를 훼손할 수 있으므로 장기적 관점의 균형이 필요합니다.',
  strategic:
    '전략 품목은 기업의 경쟁력을 좌우하는 핵심 자원입니다. 공급사와의 전략적 파트너십을 통해 혁신을 추구하되, 과도한 종속을 피하는 리스크 관리가 병행되어야 합니다.',
  noncritical:
    '일상(비핵심) 품목은 관리 에너지 최소화가 목표입니다. 프로세스 자동화, 전자 카탈로그, 일괄 발주 등을 통해 효율성을 높이되, 완전 방치로 인한 낭비를 주의해야 합니다.',
};

/** Step-level learning points */
const STEP_TITLES: Record<number, string> = {
  0: 'Step 1',
  1: 'Step 2',
  2: 'Step 3',
  3: 'Step 4',
};

interface LearningFeedbackProps {
  quadrant: QuadrantId;
  result: QuadrantResult;
  meta: QuadrantMeta;
}

export default function LearningFeedback({
  quadrant,
  result,
  meta,
}: LearningFeedbackProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const colors = COLOR_MAP[meta.color] || COLOR_MAP.slate;

  // Analyze step performance
  const analysis = useMemo(() => {
    const maxStepWeighted = 5; // max possible weighted score per step
    const threshold = 0.7; // 70% of max is the threshold for "good"

    const highSteps: number[] = [];
    const lowSteps: number[] = [];

    result.stepScores.forEach((ws, idx) => {
      const ratio = ws.weighted / maxStepWeighted;
      if (ratio >= threshold) {
        highSteps.push(idx);
      } else {
        lowSteps.push(idx);
      }
    });

    return { highSteps, lowSteps };
  }, [result.stepScores]);

  // Generate dimension-specific insight
  const dimensionInsight = useMemo(() => {
    const w = meta.weights;
    const dims: Array<{ key: 'ce' | 'ss' | 'sv'; label: string; weight: number }> = [
      { key: 'ce', label: '비용효율성(CE)', weight: w.ce },
      { key: 'ss', label: '공급안정성(SS)', weight: w.ss },
      { key: 'sv', label: '전략적가치(SV)', weight: w.sv },
    ];

    // Sort by weight descending to find the most important dimension for this quadrant
    const sorted = [...dims].sort((a, b) => b.weight - a.weight);
    const primaryDim = sorted[0];

    // Check how the participant performed on the primary dimension
    const primaryTotal = result.stepScores.reduce(
      (sum, ws) => sum + ws.raw[primaryDim.key],
      0
    );
    const primaryMax = 20; // 4 steps * 5 max
    const primaryPct = (primaryTotal / primaryMax) * 100;

    if (primaryPct >= 75) {
      return `이 사분면에서 가장 중요한 ${primaryDim.label} 차원에서 우수한 성과(${primaryTotal}/${primaryMax})를 보였습니다.`;
    } else if (primaryPct >= 50) {
      return `이 사분면의 핵심 차원인 ${primaryDim.label}에서 양호한 성과(${primaryTotal}/${primaryMax})를 보였으나, 더 높은 점수를 노릴 수 있었습니다.`;
    } else {
      return `이 사분면에서 가장 중요한 ${primaryDim.label} 차원의 점수(${primaryTotal}/${primaryMax})가 낮습니다. 해당 차원에 더 집중하는 전략이 필요합니다.`;
    }
  }, [meta.weights, result.stepScores]);

  return (
    <div
      className="rounded-xl overflow-hidden border transition-all duration-200 print:break-inside-avoid"
      style={{ borderColor: colors.primary + '40' }}
    >
      {/* Clickable header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-5 py-3.5 flex items-center justify-between text-left transition-colors hover:brightness-95"
        style={{ backgroundColor: colors.bg }}
      >
        <div className="flex items-center gap-2.5">
          <span
            className="w-2.5 h-2.5 rounded-full flex-shrink-0"
            style={{ backgroundColor: colors.primary }}
          />
          <h4 className="text-sm font-bold text-gray-800">
            {meta.nameKo} 학습 피드백
          </h4>
          {/* Quick performance indicator */}
          <span className="text-xs text-gray-500 ml-1">
            ({result.percentOfOptimal.toFixed(0)}% 달성)
          </span>
        </div>
        <svg
          className="w-4 h-4 text-gray-400 transition-transform duration-200 flex-shrink-0 print:hidden"
          style={{ transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)' }}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {/* Expandable content — always visible in print */}
      <div
        className={`transition-all duration-300 overflow-hidden print:max-h-none print:opacity-100 ${
          isExpanded ? 'max-h-[1000px] opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="px-5 py-4 bg-white space-y-4">
          {/* What went well */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-green-500 text-sm">&#9679;</span>
              <h5 className="text-sm font-semibold text-gray-700">
                잘한 점
              </h5>
            </div>
            {analysis.highSteps.length > 0 ? (
              <ul className="space-y-1.5 ml-5">
                {analysis.highSteps.map((stepIdx) => {
                  const ws = result.stepScores[stepIdx];
                  return (
                    <li
                      key={stepIdx}
                      className="text-sm text-gray-600 list-disc"
                    >
                      <span className="font-medium">
                        {STEP_TITLES[stepIdx]}
                      </span>
                      : 가중 점수 {ws.weighted.toFixed(1)}점으로 우수한 판단을 보여주었습니다.
                      <span className="text-xs text-gray-400 ml-1">
                        (CE:{ws.raw.ce} SS:{ws.raw.ss} SV:{ws.raw.sv})
                      </span>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <p className="text-sm text-gray-500 ml-5">
                이 사분면에서는 대부분의 단계에서 개선의 여지가 있습니다.
              </p>
            )}
          </div>

          {/* What could improve */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-red-400 text-sm">&#9679;</span>
              <h5 className="text-sm font-semibold text-gray-700">
                개선 포인트
              </h5>
            </div>
            {analysis.lowSteps.length > 0 ? (
              <ul className="space-y-1.5 ml-5">
                {analysis.lowSteps.map((stepIdx) => {
                  const ws = result.stepScores[stepIdx];
                  return (
                    <li
                      key={stepIdx}
                      className="text-sm text-gray-600 list-disc"
                    >
                      <span className="font-medium">
                        {STEP_TITLES[stepIdx]}
                      </span>
                      : 가중 점수 {ws.weighted.toFixed(1)}점으로, 더 나은 선택이 가능했습니다.
                      <span className="text-xs text-gray-400 ml-1">
                        (CE:{ws.raw.ce} SS:{ws.raw.ss} SV:{ws.raw.sv})
                      </span>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <p className="text-sm text-gray-500 ml-5">
                모든 단계에서 우수한 성과를 달성했습니다!
              </p>
            )}
          </div>

          {/* Dimension insight */}
          <div className="py-2 px-3 rounded-lg bg-gray-50">
            <p className="text-sm text-gray-600">{dimensionInsight}</p>
          </div>

          {/* Key takeaway */}
          <div
            className="py-3 px-4 rounded-lg"
            style={{
              backgroundColor: colors.bg,
              borderLeft: `3px solid ${colors.primary}`,
            }}
          >
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                핵심 교훈
              </span>
            </div>
            <p className="text-sm text-gray-700 leading-relaxed">
              {QUADRANT_TAKEAWAYS[quadrant]}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
