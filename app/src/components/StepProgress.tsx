'use client';

interface StepProgressProps {
  currentStep: number; // 0-indexed
  totalSteps: number;
  quadrantColor: string; // e.g., 'amber', 'emerald', 'blue', 'slate'
}

const colorClasses: Record<string, { active: string; completed: string; text: string }> = {
  amber: {
    active: 'bg-bottleneck-500 ring-bottleneck-200',
    completed: 'bg-bottleneck-500',
    text: 'text-bottleneck-700',
  },
  emerald: {
    active: 'bg-leverage-500 ring-leverage-200',
    completed: 'bg-leverage-500',
    text: 'text-leverage-700',
  },
  blue: {
    active: 'bg-strategic-500 ring-strategic-200',
    completed: 'bg-strategic-500',
    text: 'text-strategic-700',
  },
  slate: {
    active: 'bg-noncritical-500 ring-noncritical-200',
    completed: 'bg-noncritical-500',
    text: 'text-noncritical-700',
  },
};

export default function StepProgress({ currentStep, totalSteps, quadrantColor }: StepProgressProps) {
  const colors = colorClasses[quadrantColor] || colorClasses.slate;

  return (
    <div className="w-full">
      {/* Step indicators */}
      <div className="flex items-center justify-between gap-2">
        {Array.from({ length: totalSteps }).map((_, index) => {
          const isCompleted = index < currentStep;
          const isCurrent = index === currentStep;
          const isFuture = index > currentStep;

          return (
            <div key={index} className="flex items-center flex-1">
              {/* Step circle */}
              <div className="flex flex-col items-center">
                <div
                  className={`
                    w-9 h-9 rounded-full flex items-center justify-center text-sm font-semibold
                    transition-all duration-300
                    ${isCompleted
                      ? `${colors.completed} text-white`
                      : isCurrent
                        ? `${colors.active} text-white ring-4`
                        : 'bg-gray-200 text-gray-400'
                    }
                  `}
                >
                  {isCompleted ? (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    index + 1
                  )}
                </div>
                <span
                  className={`
                    text-xs mt-1.5 font-medium
                    ${isCurrent ? colors.text : isFuture ? 'text-gray-400' : 'text-gray-500'}
                  `}
                >
                  Step {index + 1}
                </span>
              </div>

              {/* Connector line */}
              {index < totalSteps - 1 && (
                <div className="flex-1 mx-2 mb-5">
                  <div className="h-0.5 w-full rounded-full bg-gray-200 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${colors.completed}`}
                      style={{ width: isCompleted ? '100%' : '0%' }}
                    />
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
