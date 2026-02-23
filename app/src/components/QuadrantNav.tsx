'use client';

import type { QuadrantId } from '@/lib/types';
import { QUADRANT_ORDER, QUADRANT_META } from '@/data/quadrants';

interface QuadrantNavProps {
  currentQuadrant: QuadrantId;
  completedQuadrants: QuadrantId[];
}

const quadrantStyles: Record<QuadrantId, { active: string; activeBg: string; completed: string; completedBg: string }> = {
  bottleneck: {
    active: 'border-bottleneck-500 text-bottleneck-800',
    activeBg: 'bg-bottleneck-50',
    completed: 'border-bottleneck-400 text-bottleneck-700',
    completedBg: 'bg-bottleneck-50/50',
  },
  leverage: {
    active: 'border-leverage-500 text-leverage-800',
    activeBg: 'bg-leverage-50',
    completed: 'border-leverage-400 text-leverage-700',
    completedBg: 'bg-leverage-50/50',
  },
  strategic: {
    active: 'border-strategic-500 text-strategic-800',
    activeBg: 'bg-strategic-50',
    completed: 'border-strategic-400 text-strategic-700',
    completedBg: 'bg-strategic-50/50',
  },
  noncritical: {
    active: 'border-noncritical-500 text-noncritical-800',
    activeBg: 'bg-noncritical-100',
    completed: 'border-noncritical-400 text-noncritical-700',
    completedBg: 'bg-noncritical-100/50',
  },
};

const quadrantIcons: Record<QuadrantId, string> = {
  bottleneck: 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z',
  leverage: 'M13 7h8m0 0v8m0-8l-8 8-4-4-6 6',
  strategic: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z',
  noncritical: 'M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10',
};

export default function QuadrantNav({ currentQuadrant, completedQuadrants }: QuadrantNavProps) {
  return (
    <nav className="flex items-center gap-2 overflow-x-auto pb-1">
      {QUADRANT_ORDER.map((qId, index) => {
        const meta = QUADRANT_META[qId];
        const styles = quadrantStyles[qId];
        const isCurrent = qId === currentQuadrant;
        const isCompleted = completedQuadrants.includes(qId);
        const isPending = !isCurrent && !isCompleted;

        return (
          <div key={qId} className="flex items-center">
            <div
              className={`
                flex items-center gap-2.5 px-4 py-2.5 rounded-lg border-2 transition-all duration-200 min-w-fit
                ${isCurrent
                  ? `${styles.active} ${styles.activeBg} border-l-4 shadow-sm`
                  : isCompleted
                    ? `${styles.completed} ${styles.completedBg} border-transparent`
                    : 'border-transparent bg-gray-50 text-gray-400'
                }
              `}
            >
              {/* Icon */}
              <div className="flex-shrink-0">
                {isCompleted ? (
                  <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                ) : (
                  <svg className={`w-5 h-5 ${isPending ? 'text-gray-300' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={quadrantIcons[qId]} />
                  </svg>
                )}
              </div>

              {/* Label */}
              <div className="flex flex-col">
                <span className={`text-sm font-semibold leading-tight ${isPending ? 'text-gray-400' : ''}`}>
                  {meta.nameKo}
                </span>
                <span className={`text-xs leading-tight ${isPending ? 'text-gray-300' : 'opacity-70'}`}>
                  {meta.nameEn}
                </span>
              </div>
            </div>

            {/* Arrow separator */}
            {index < QUADRANT_ORDER.length - 1 && (
              <svg className="w-5 h-5 text-gray-300 mx-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            )}
          </div>
        );
      })}
    </nav>
  );
}
