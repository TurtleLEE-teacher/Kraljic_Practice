'use client';

import React from 'react';

interface RankTrackerProps {
  before: number;
  after: number;
  total: number;
}

export default function RankTracker({ before, after, total }: RankTrackerProps) {
  const diff = before - after; // positive = improved (went up in rank)
  const direction: 'up' | 'down' | 'same' =
    diff > 0 ? 'up' : diff < 0 ? 'down' : 'same';

  const arrowSymbol = direction === 'up' ? '▲' : direction === 'down' ? '▼' : '─';

  const directionColor =
    direction === 'up'
      ? '#10b981'
      : direction === 'down'
        ? '#ef4444'
        : '#9ca3af';

  const directionBg =
    direction === 'up'
      ? '#ecfdf5'
      : direction === 'down'
        ? '#fef2f2'
        : '#f9fafb';

  const directionText =
    direction === 'up'
      ? `${arrowSymbol}${Math.abs(diff)}`
      : direction === 'down'
        ? `${arrowSymbol}${Math.abs(diff)}`
        : '변동 없음';

  return (
    <div className="flex items-center gap-3 p-4 bg-white rounded-xl shadow-sm print:shadow-none print:border print:border-gray-200">
      {/* Before rank */}
      <div className="flex flex-col items-center min-w-[72px]">
        <span className="text-[10px] text-gray-400 font-medium uppercase tracking-wider">
          Layer 1
        </span>
        <span className="text-2xl font-extrabold text-gray-700 mt-0.5">
          #{before}
        </span>
        <span className="text-[10px] text-gray-400">/ {total}명</span>
      </div>

      {/* Arrow connector */}
      <div className="flex flex-col items-center flex-shrink-0">
        <div className="flex items-center gap-1">
          <div className="w-8 h-px bg-gray-300" />
          <svg
            width="20"
            height="20"
            viewBox="0 0 20 20"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="flex-shrink-0"
          >
            <path
              d="M4 10H16M16 10L12 6M16 10L12 14"
              stroke="#9ca3af"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <div className="w-8 h-px bg-gray-300" />
        </div>
      </div>

      {/* After rank */}
      <div className="flex flex-col items-center min-w-[72px]">
        <span className="text-[10px] text-gray-400 font-medium uppercase tracking-wider">
          최종
        </span>
        <span className="text-2xl font-extrabold text-gray-900 mt-0.5">
          #{after}
        </span>
        <span className="text-[10px] text-gray-400">/ {total}명</span>
      </div>

      {/* Change badge */}
      <div
        className="ml-2 px-3 py-1.5 rounded-full flex items-center gap-1"
        style={{ backgroundColor: directionBg }}
      >
        <span
          className="text-sm font-bold"
          style={{ color: directionColor }}
        >
          {directionText}
        </span>
      </div>

      {/* Summary text */}
      <div className="ml-auto text-right">
        <span className="text-xs text-gray-500">
          Layer 1: #{before} → 최종: #{after}
          {diff !== 0 && (
            <span
              className="ml-1 font-semibold"
              style={{ color: directionColor }}
            >
              ({directionText})
            </span>
          )}
        </span>
      </div>
    </div>
  );
}
