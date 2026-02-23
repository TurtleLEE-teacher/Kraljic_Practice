'use client';

import React, { useMemo } from 'react';
import type { Grade } from '@/lib/types';

const GRADE_CONFIG: Record<
  Grade,
  { color: string; bgColor: string; labelKo: string; description: string }
> = {
  Excellent: {
    color: '#3b82f6',
    bgColor: '#eff6ff',
    labelKo: '우수',
    description: '각 사분면의 핵심을 정확히 이해하고 최적 전략을 선택',
  },
  Good: {
    color: '#10b981',
    bgColor: '#ecfdf5',
    labelKo: '양호',
    description: '대체로 적절한 판단이나 일부 사분면에서 핵심을 놓침',
  },
  Fair: {
    color: '#f59e0b',
    bgColor: '#fffbeb',
    labelKo: '보통',
    description: '사분면별 차이를 인식하지만 일관된 적용에 미숙',
  },
  Poor: {
    color: '#ef4444',
    bgColor: '#fef2f2',
    labelKo: '미흡',
    description: '사분면별 전략 차별화 인식이 부족, 추가 학습 필요',
  },
};

interface ScoreGaugeProps {
  score: number;
  maxScore: number;
  grade: Grade;
  layer1Score?: number;
  layer2Score?: number;
}

export default function ScoreGauge({
  score,
  maxScore,
  grade,
  layer1Score,
  layer2Score,
}: ScoreGaugeProps) {
  const config = GRADE_CONFIG[grade];
  const percentage = (score / maxScore) * 100;

  // SVG semicircular gauge parameters
  const size = 200;
  const strokeWidth = 16;
  const radius = (size - strokeWidth) / 2;
  const centerX = size / 2;
  const centerY = size / 2 + 10;

  // Arc from 180 degrees (left) to 0 degrees (right), i.e., top semicircle
  const startAngle = Math.PI; // 180 degrees
  const endAngle = 0;

  const arcLength = Math.PI * radius; // half circumference
  const filledLength = (percentage / 100) * arcLength;

  const describeArc = useMemo(() => {
    const startX = centerX + radius * Math.cos(startAngle);
    const startY = centerY - radius * Math.sin(startAngle);
    const endX = centerX + radius * Math.cos(endAngle);
    const endY = centerY - radius * Math.sin(endAngle);

    return `M ${startX} ${startY} A ${radius} ${radius} 0 0 1 ${endX} ${endY}`;
  }, [centerX, centerY, radius]);

  return (
    <div className="flex flex-col items-center">
      {/* Gauge SVG */}
      <div className="relative" style={{ width: size, height: size / 2 + 40 }}>
        <svg
          width={size}
          height={size / 2 + 30}
          viewBox={`0 0 ${size} ${size / 2 + 30}`}
        >
          {/* Background arc */}
          <path
            d={describeArc}
            fill="none"
            stroke="#e5e7eb"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
          />
          {/* Filled arc */}
          <path
            d={describeArc}
            fill="none"
            stroke={config.color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={`${arcLength}`}
            strokeDashoffset={arcLength - filledLength}
            style={{
              transition: 'stroke-dashoffset 1.2s ease-out',
            }}
          />
          {/* Min label */}
          <text
            x={centerX - radius - 2}
            y={centerY + 18}
            textAnchor="middle"
            fill="#9ca3af"
            fontSize="10"
          >
            0
          </text>
          {/* Max label */}
          <text
            x={centerX + radius + 2}
            y={centerY + 18}
            textAnchor="middle"
            fill="#9ca3af"
            fontSize="10"
          >
            {maxScore}
          </text>
        </svg>

        {/* Score text overlay */}
        <div
          className="absolute flex flex-col items-center"
          style={{
            left: '50%',
            bottom: '20px',
            transform: 'translateX(-50%)',
          }}
        >
          <span
            className="text-4xl font-extrabold leading-none"
            style={{ color: config.color }}
          >
            {score.toFixed(1)}
          </span>
          <span className="text-xs text-gray-400 mt-0.5">
            / {maxScore}점
          </span>
        </div>
      </div>

      {/* Grade badge */}
      <div
        className="mt-1 px-5 py-2 rounded-full text-center"
        style={{ backgroundColor: config.bgColor }}
      >
        <span
          className="text-lg font-bold"
          style={{ color: config.color }}
        >
          {config.labelKo}
        </span>
        <span className="text-xs text-gray-500 ml-1.5">({grade})</span>
      </div>

      {/* Grade description */}
      <p className="text-xs text-gray-500 mt-2 text-center max-w-[260px]">
        {config.description}
      </p>

      {/* Score breakdown */}
      {layer1Score !== undefined && layer2Score !== undefined && (
        <div className="mt-4 flex items-center gap-2 text-sm">
          <div className="px-3 py-1.5 bg-gray-50 rounded-lg text-center">
            <div className="text-[10px] text-gray-400">Layer 1</div>
            <div className="font-bold text-gray-700">
              {layer1Score.toFixed(1)}
            </div>
          </div>
          <span className="text-gray-400 text-lg font-light">+</span>
          <div className="px-3 py-1.5 bg-gray-50 rounded-lg text-center">
            <div className="text-[10px] text-gray-400">Layer 2</div>
            <div className="font-bold text-gray-700">
              {layer2Score.toFixed(1)}
            </div>
          </div>
          <span className="text-gray-400 text-lg font-light">=</span>
          <div
            className="px-3 py-1.5 rounded-lg text-center"
            style={{ backgroundColor: config.bgColor }}
          >
            <div className="text-[10px]" style={{ color: config.color }}>
              Total
            </div>
            <div className="font-bold" style={{ color: config.color }}>
              {score.toFixed(1)}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
