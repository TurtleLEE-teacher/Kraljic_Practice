'use client';

import type { Choice } from '@/lib/types';

interface ChoiceCardProps {
  choice: Choice;
  isSelected: boolean;
  onSelect: () => void;
  disabled: boolean;
}

export default function ChoiceCard({ choice, isSelected, onSelect, disabled }: ChoiceCardProps) {
  // Extract the letter label (e.g., "A" from "A. 현상 유지")
  const letterLabel = choice.label.charAt(0);

  return (
    <button
      type="button"
      onClick={onSelect}
      disabled={disabled}
      className={`
        w-full text-left rounded-xl border-2 p-5 transition-all duration-200
        ${disabled
          ? 'opacity-60 cursor-not-allowed bg-gray-50 border-gray-200'
          : isSelected
            ? 'border-blue-500 bg-blue-50 shadow-md ring-2 ring-blue-200'
            : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm cursor-pointer'
        }
      `}
    >
      <div className="flex items-start gap-4">
        {/* Radio indicator + letter label */}
        <div className="flex-shrink-0 flex flex-col items-center gap-1.5 pt-0.5">
          <div
            className={`
              w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold
              transition-colors duration-200
              ${disabled
                ? 'bg-gray-100 text-gray-400'
                : isSelected
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 text-gray-500'
              }
            `}
          >
            {letterLabel}
          </div>
          <div
            className={`
              w-4 h-4 rounded-full border-2 flex items-center justify-center
              transition-colors duration-200
              ${disabled
                ? 'border-gray-300'
                : isSelected
                  ? 'border-blue-500'
                  : 'border-gray-300'
              }
            `}
          >
            {isSelected && (
              <div className="w-2 h-2 rounded-full bg-blue-500" />
            )}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <h3
            className={`
              font-semibold text-base leading-snug
              ${disabled ? 'text-gray-400' : isSelected ? 'text-blue-900' : 'text-gray-800'}
            `}
          >
            {choice.title}
          </h3>
          <p
            className={`
              mt-2 text-sm leading-relaxed
              ${disabled ? 'text-gray-400' : isSelected ? 'text-blue-700' : 'text-gray-600'}
            `}
          >
            {choice.description}
          </p>
        </div>
      </div>
    </button>
  );
}
