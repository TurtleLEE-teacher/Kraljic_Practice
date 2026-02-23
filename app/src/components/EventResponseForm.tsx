'use client';

import { useState } from 'react';
import type { QuadrantId, Choice } from '@/lib/types';
import { QUADRANT_META } from '@/data/quadrants';

interface EventResponseFormProps {
  quadrantId: QuadrantId;
  situation: string;
  choices: Choice[];
  onSubmit: (choiceId: string) => void;
}

const quadrantColorMap: Record<QuadrantId, { border: string; bg: string; accent: string; btn: string; btnHover: string; selectedBorder: string; selectedBg: string }> = {
  bottleneck: {
    border: 'border-bottleneck-300',
    bg: 'bg-bottleneck-50',
    accent: 'text-bottleneck-700',
    btn: 'bg-bottleneck-500',
    btnHover: 'hover:bg-bottleneck-600',
    selectedBorder: 'border-bottleneck-500',
    selectedBg: 'bg-bottleneck-50',
  },
  leverage: {
    border: 'border-leverage-300',
    bg: 'bg-leverage-50',
    accent: 'text-leverage-700',
    btn: 'bg-leverage-500',
    btnHover: 'hover:bg-leverage-600',
    selectedBorder: 'border-leverage-500',
    selectedBg: 'bg-leverage-50',
  },
  strategic: {
    border: 'border-strategic-300',
    bg: 'bg-strategic-50',
    accent: 'text-strategic-700',
    btn: 'bg-strategic-500',
    btnHover: 'hover:bg-strategic-600',
    selectedBorder: 'border-strategic-500',
    selectedBg: 'bg-strategic-50',
  },
  noncritical: {
    border: 'border-noncritical-300',
    bg: 'bg-noncritical-100',
    accent: 'text-noncritical-700',
    btn: 'bg-noncritical-500',
    btnHover: 'hover:bg-noncritical-600',
    selectedBorder: 'border-noncritical-500',
    selectedBg: 'bg-noncritical-100',
  },
};

export default function EventResponseForm({ quadrantId, situation, choices, onSubmit }: EventResponseFormProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const meta = QUADRANT_META[quadrantId];
  const colors = quadrantColorMap[quadrantId];

  const handleSubmit = () => {
    if (selectedId) {
      setIsSubmitted(true);
      onSubmit(selectedId);
    }
  };

  return (
    <div className={`rounded-xl border-2 ${colors.border} overflow-hidden`}>
      {/* Header */}
      <div className={`${colors.bg} px-5 py-3 border-b ${colors.border}`}>
        <div className="flex items-center justify-between">
          <h3 className={`font-bold text-base ${colors.accent}`}>
            {meta.nameKo} ({meta.nameEn})
          </h3>
          {isSubmitted && (
            <span className="flex items-center gap-1 text-green-600 text-sm font-medium">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              제출 완료
            </span>
          )}
        </div>
      </div>

      <div className="p-5 space-y-4">
        {/* Situation */}
        <p className="text-sm text-gray-700 leading-relaxed bg-gray-50 rounded-lg p-3 border border-gray-100">
          {situation}
        </p>

        {/* Choices */}
        <div className="space-y-2.5">
          {choices.map((choice) => {
            const isSelected = selectedId === choice.id;
            return (
              <button
                key={choice.id}
                type="button"
                onClick={() => !isSubmitted && setSelectedId(choice.id)}
                disabled={isSubmitted}
                className={`
                  w-full text-left rounded-lg border-2 p-3.5 transition-all duration-200
                  ${isSubmitted
                    ? isSelected
                      ? `${colors.selectedBorder} ${colors.selectedBg} opacity-100`
                      : 'border-gray-100 bg-gray-50 opacity-50'
                    : isSelected
                      ? `${colors.selectedBorder} ${colors.selectedBg} shadow-sm`
                      : 'border-gray-200 bg-white hover:border-gray-300 cursor-pointer'
                  }
                `}
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`
                      w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0
                      ${isSelected
                        ? `${colors.btn} text-white`
                        : 'bg-gray-100 text-gray-500'
                      }
                    `}
                  >
                    {choice.label.charAt(0)}
                  </div>
                  <div>
                    <span className="text-sm font-semibold text-gray-800 block">{choice.title}</span>
                    <span className="text-xs text-gray-500 mt-0.5 block leading-relaxed">{choice.description}</span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Submit button */}
        {!isSubmitted && (
          <button
            onClick={handleSubmit}
            disabled={!selectedId}
            className={`
              w-full py-2.5 rounded-lg text-sm font-semibold text-white transition-all duration-200
              ${selectedId
                ? `${colors.btn} ${colors.btnHover} cursor-pointer`
                : 'bg-gray-300 cursor-not-allowed'
              }
            `}
          >
            선택 확정
          </button>
        )}
      </div>
    </div>
  );
}
