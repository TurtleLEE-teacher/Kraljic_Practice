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
          <h2 className="text-lg font-bold">의사결정 분석</h2>
          <p className="text-slate-300 text-sm mt-0.5">이 선택의 장단점을 함께 살펴봅시다</p>
        </div>

        <div className="p-6 space-y-5">
          {/* Section 1: Result */}
          <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-5">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-7 h-7 rounded-full bg-emerald-100 flex items-center justify-center">
                <svg className="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <h3 className="font-bold text-emerald-900 text-base">이 선택의 결과</h3>
            </div>
            <p className="text-sm text-emerald-800 leading-relaxed">{feedback.result}</p>
          </div>

          {/* Section 2: Trade-off */}
          <div className="rounded-xl border border-amber-200 bg-amber-50 p-5">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-7 h-7 rounded-full bg-amber-100 flex items-center justify-center">
                <svg className="w-4 h-4 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
                </svg>
              </div>
              <h3 className="font-bold text-amber-900 text-base">얻은 것 vs 포기한 것</h3>
            </div>
            <p className="text-sm text-amber-800 leading-relaxed">{feedback.tradeoff}</p>
          </div>

          {/* Section 3: Theory connection */}
          <div className="rounded-xl border border-blue-200 bg-blue-50 p-5">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-7 h-7 rounded-full bg-blue-100 flex items-center justify-center">
                <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <h3 className="font-bold text-blue-900 text-base">이론적 관점</h3>
            </div>
            <p className="text-sm text-blue-800 leading-relaxed">{feedback.theoryConnection}</p>
          </div>

          {/* Discussion prompt */}
          <div className="rounded-xl bg-gray-50 border border-gray-200 p-4">
            <p className="text-xs text-gray-500 leading-relaxed">
              <strong className="text-gray-700">팀 토론:</strong>{' '}
              다른 선택을 했다면 어떤 결과가 나왔을까요? 각 선택의 트레이드오프를 팀원들과 비교해 보세요.
            </p>
          </div>
        </div>

        {/* Continue button */}
        <div className="px-6 pb-6">
          <button
            onClick={onContinue}
            className="w-full py-3.5 bg-slate-800 text-white font-semibold rounded-xl
                       hover:bg-slate-700 active:bg-slate-900 transition-colors duration-200
                       focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2
                       cursor-pointer"
          >
            다음 단계로
          </button>
        </div>
      </div>
    </div>
  );
}
