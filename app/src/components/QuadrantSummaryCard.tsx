'use client';

import React from 'react';
import type { QuadrantResult, QuadrantMeta, WeightedScore } from '@/lib/types';

/** Map quadrant color names to Tailwind-compatible hex and style values */
const COLOR_STYLES: Record<string, { border: string; bg: string; badge: string; accent: string; bar: string }> = {
  amber: {
    border: '#f59e0b',
    bg: '#fffbeb',
    badge: '#92400e',
    accent: '#fbbf24',
    bar: '#f59e0b',
  },
  emerald: {
    border: '#10b981',
    bg: '#ecfdf5',
    badge: '#065f46',
    accent: '#34d399',
    bar: '#10b981',
  },
  blue: {
    border: '#3b82f6',
    bg: '#eff6ff',
    badge: '#1e40af',
    accent: '#60a5fa',
    bar: '#3b82f6',
  },
  slate: {
    border: '#64748b',
    bg: '#f8fafc',
    badge: '#1e293b',
    accent: '#94a3b8',
    bar: '#64748b',
  },
};

interface QuadrantSummaryCardProps {
  result: QuadrantResult;
  meta: QuadrantMeta;
  eventResult?: {
    choiceId: string;
    score: WeightedScore;
  };
}

export default function QuadrantSummaryCard({
  result,
  meta,
  eventResult,
}: QuadrantSummaryCardProps) {
  const colors = COLOR_STYLES[meta.color] || COLOR_STYLES.slate;
  const percentage = result.percentOfOptimal;

  return (
    <div
      className="rounded-xl overflow-hidden shadow-md transition-shadow hover:shadow-lg print:shadow-none print:border print:border-gray-300"
      style={{ borderLeft: `4px solid ${colors.border}` }}
    >
      {/* Header */}
      <div
        className="px-5 py-3 flex items-center justify-between"
        style={{ backgroundColor: colors.bg }}
      >
        <div className="flex items-center gap-2.5">
          <span
            className="inline-block w-3 h-3 rounded-full"
            style={{ backgroundColor: colors.border }}
          />
          <h3 className="text-base font-bold text-gray-900">
            {meta.nameKo}
            <span className="ml-1.5 text-xs font-normal text-gray-500">
              ({meta.nameEn})
            </span>
          </h3>
        </div>
        <span
          className="text-xs font-semibold px-2.5 py-1 rounded-full text-white"
          style={{ backgroundColor: colors.badge }}
        >
          {result.totalWeighted.toFixed(1)} / {result.optimalScore.toFixed(1)}
        </span>
      </div>

      {/* Body */}
      <div className="px-5 py-4 bg-white">
        {/* Percentage bar */}
        <div className="mb-4">
          <div className="flex justify-between items-center mb-1.5">
            <span className="text-xs text-gray-500 font-medium">달성률</span>
            <span
              className="text-sm font-bold"
              style={{ color: colors.border }}
            >
              {percentage.toFixed(1)}%
            </span>
          </div>
          <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-700"
              style={{
                width: `${Math.min(percentage, 100)}%`,
                backgroundColor: colors.bar,
              }}
            />
          </div>
        </div>

        {/* Per-step score breakdown */}
        <div className="mb-3">
          <p className="text-xs text-gray-500 font-medium mb-2">
            단계별 성과
          </p>
          <div className="grid grid-cols-4 gap-2">
            {result.stepScores.map((ws, idx) => {
              const maxStepScore = 5; // max weighted per step = 5*w_ce + 5*w_ss + 5*w_sv = 5
              const stepPct = (ws.weighted / maxStepScore) * 100;
              return (
                <div key={idx} className="text-center">
                  <div className="text-[10px] text-gray-400 mb-1">
                    Step {idx + 1}
                  </div>
                  <div className="w-full h-8 bg-gray-50 rounded relative overflow-hidden">
                    <div
                      className="absolute bottom-0 left-0 right-0 rounded transition-all duration-500"
                      style={{
                        height: `${Math.min(stepPct, 100)}%`,
                        backgroundColor: colors.accent,
                        opacity: 0.7,
                      }}
                    />
                    <span className="absolute inset-0 flex items-center justify-center text-[11px] font-semibold text-gray-700">
                      {ws.weighted.toFixed(1)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Dimension breakdown mini info */}
        <div className="flex gap-3 text-[11px] text-gray-500 mb-3">
          <span>
            CE:{' '}
            {result.stepScores.reduce((s, ws) => s + ws.raw.ce, 0)}
          </span>
          <span>
            SS:{' '}
            {result.stepScores.reduce((s, ws) => s + ws.raw.ss, 0)}
          </span>
          <span>
            SV:{' '}
            {result.stepScores.reduce((s, ws) => s + ws.raw.sv, 0)}
          </span>
        </div>

        {/* Event response score */}
        {eventResult && (
          <div
            className="mt-3 pt-3 border-t border-gray-100"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-500 font-medium">
                이벤트 대응
              </span>
              <span
                className="text-sm font-bold"
                style={{ color: colors.border }}
              >
                +{eventResult.score.weighted.toFixed(1)}점
              </span>
            </div>
            <div className="flex gap-2 mt-1 text-[10px] text-gray-400">
              <span>CE: {eventResult.score.raw.ce}</span>
              <span>SS: {eventResult.score.raw.ss}</span>
              <span>SV: {eventResult.score.raw.sv}</span>
            </div>
          </div>
        )}

        {/* Core dilemma */}
        <div className="mt-3 pt-3 border-t border-gray-100">
          <p className="text-[11px] text-gray-400 italic">
            핵심 딜레마: {meta.coreDilemma}
          </p>
        </div>
      </div>
    </div>
  );
}
