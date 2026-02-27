'use client';

interface ScoreBarProps {
  currentScore: number;
  maxScore: number;
  label: string;
}

export default function ScoreBar({ currentScore, maxScore, label }: ScoreBarProps) {
  const percentage = maxScore > 0 ? Math.min((currentScore / maxScore) * 100, 100) : 0;

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-sm font-medium text-gray-600">{label}</span>
        <span className="text-sm font-bold text-gray-800">
          {Math.round(currentScore)} <span className="text-gray-400 font-normal">/ {Math.round(maxScore)}</span>
        </span>
      </div>
      <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full bg-gradient-to-r from-violet-500 to-violet-600 transition-all duration-700 ease-out"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
