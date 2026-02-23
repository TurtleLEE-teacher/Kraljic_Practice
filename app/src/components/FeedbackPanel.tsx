'use client';

import type { Feedback } from '@/lib/types';

interface FeedbackPanelProps {
  feedback: Feedback;
  onContinue: () => void;
}

export default function FeedbackPanel({ feedback, onContinue }: FeedbackPanelProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto animate-scale-in">
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-800 to-slate-700 text-white px-6 py-4 rounded-t-2xl">
          <h2 className="text-lg font-bold">선택 결과 분석</h2>
          <p className="text-slate-300 text-sm mt-0.5">당신의 결정에 대한 피드백입니다</p>
        </div>

        <div className="p-6 space-y-5">
          {/* Section 1: Result */}
          <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-5">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-lg" role="img" aria-label="result">&#128203;</span>
              <h3 className="font-bold text-emerald-900 text-base">결과</h3>
            </div>
            <p className="text-sm text-emerald-800 leading-relaxed">{feedback.result}</p>
          </div>

          {/* Section 2: Trade-off */}
          <div className="rounded-xl border border-amber-200 bg-amber-50 p-5">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-lg" role="img" aria-label="trade-off">&#9878;&#65039;</span>
              <h3 className="font-bold text-amber-900 text-base">트레이드오프</h3>
            </div>
            <p className="text-sm text-amber-800 leading-relaxed">{feedback.tradeoff}</p>
          </div>

          {/* Section 3: Theory connection */}
          <div className="rounded-xl border border-blue-200 bg-blue-50 p-5">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-lg" role="img" aria-label="theory">&#128218;</span>
              <h3 className="font-bold text-blue-900 text-base">이론 연결</h3>
            </div>
            <p className="text-sm text-blue-800 leading-relaxed">{feedback.theoryConnection}</p>
          </div>
        </div>

        {/* Continue button */}
        <div className="px-6 pb-6">
          <button
            onClick={onContinue}
            className="w-full py-3.5 bg-slate-800 text-white font-semibold rounded-xl
                       hover:bg-slate-700 active:bg-slate-900 transition-colors duration-200
                       focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2"
          >
            다음으로
          </button>
        </div>
      </div>
    </div>
  );
}
