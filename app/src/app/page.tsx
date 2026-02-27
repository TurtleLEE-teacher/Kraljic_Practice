'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useGameStore } from '@/store/gameStore';
import { QUADRANT_META, QUADRANT_ORDER } from '@/data/quadrants';
import type { QuadrantId } from '@/lib/types';
import InventoryCalculator from '@/components/InventoryCalculator';

type LandingTab = 'simulation' | 'calculator';

const QUADRANT_CARDS: {
  id: QuadrantId;
  company: string;
  item: string;
  bgClass: string;
  borderClass: string;
  dotClass: string;
  textClass: string;
}[] = [
  { id: 'bottleneck', company: '한빛전자', item: '세라믹 절연체', bgClass: 'bg-red-50 hover:bg-red-100', borderClass: 'border-red-200 hover:border-red-400', dotClass: 'bg-red-500', textClass: 'text-red-900' },
  { id: 'leverage', company: '노바텍', item: 'MLCC 커패시터', bgClass: 'bg-emerald-50 hover:bg-emerald-100', borderClass: 'border-emerald-200 hover:border-emerald-400', dotClass: 'bg-emerald-500', textClass: 'text-emerald-900' },
  { id: 'strategic', company: '미래모터스', item: '배터리셀', bgClass: 'bg-violet-50 hover:bg-violet-100', borderClass: 'border-violet-200 hover:border-violet-400', dotClass: 'bg-violet-500', textClass: 'text-violet-900' },
  { id: 'noncritical', company: '대한중공업', item: 'MRO 소모품', bgClass: 'bg-slate-50 hover:bg-slate-100', borderClass: 'border-slate-200 hover:border-slate-400', dotClass: 'bg-slate-500', textClass: 'text-slate-900' },
];

export default function LandingPage() {
  const [activeTab, setActiveTab] = useState<LandingTab>('simulation');
  const [name, setName] = useState('');
  const store = useGameStore();
  const router = useRouter();

  const completedQuadrants = QUADRANT_ORDER.filter((qId) => {
    return store.submissions.filter((s) => s.quadrant === qId).length >= 4;
  });

  const handleQuadrantClick = (qId: QuadrantId) => {
    const trimmedName = name.trim();
    if (!trimmedName) return;

    if (!store.sessionId) {
      store.startSession(trimmedName);
    }

    router.push(`/scenario/${qId}/1`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-slate-800 via-slate-700 to-slate-800 px-6 py-6 text-center">
            <h1 className="text-xl font-bold text-white">
              Kraljic 매트릭스 워크샵
            </h1>
            <p className="text-slate-400 text-xs mt-1">팀 기반 전략구매 의사결정 실습</p>
          </div>

          {/* Tab nav */}
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => setActiveTab('simulation')}
              className={`flex-1 py-2.5 text-sm font-semibold transition-colors cursor-pointer ${
                activeTab === 'simulation'
                  ? 'text-slate-800 border-b-2 border-slate-800 bg-white'
                  : 'text-gray-400 hover:text-gray-600 bg-gray-50'
              }`}
            >
              워크샵
            </button>
            <button
              onClick={() => setActiveTab('calculator')}
              className={`flex-1 py-2.5 text-sm font-semibold transition-colors cursor-pointer ${
                activeTab === 'calculator'
                  ? 'text-blue-700 border-b-2 border-blue-600 bg-white'
                  : 'text-gray-400 hover:text-gray-600 bg-gray-50'
              }`}
            >
              재고 계산기
            </button>
          </div>

          {/* ===== Simulation Tab ===== */}
          {activeTab === 'simulation' && (
            <div className="px-6 py-5">
              {/* Name input */}
              <div className="mb-5">
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="팀명 입력"
                  className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl text-sm
                             focus:outline-none focus:border-blue-500
                             placeholder:text-gray-400 transition-colors"
                  autoFocus
                />
              </div>

              {/* Quadrant selection */}
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                팀이 맡을 사분면을 선택하세요
              </p>

              <div className="grid grid-cols-1 gap-2.5">
                {QUADRANT_CARDS.map((card) => {
                  const meta = QUADRANT_META[card.id];
                  const isCompleted = completedQuadrants.includes(card.id);
                  const disabled = !name.trim();

                  return (
                    <button
                      key={card.id}
                      onClick={() => handleQuadrantClick(card.id)}
                      disabled={disabled}
                      className={`
                        relative w-full text-left px-4 py-3.5 rounded-xl border-2 transition-all duration-150
                        ${disabled
                          ? 'bg-gray-50 border-gray-200 opacity-50 cursor-not-allowed'
                          : `${card.bgClass} ${card.borderClass} cursor-pointer active:scale-[0.98]`
                        }
                      `}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`w-3 h-3 rounded-full ${disabled ? 'bg-gray-300' : card.dotClass}`} />
                          <div>
                            <div className={`text-sm font-bold ${disabled ? 'text-gray-400' : card.textClass}`}>
                              {meta.nameKo}
                              <span className="text-[10px] font-normal text-gray-400 ml-1.5">{meta.nameEn}</span>
                            </div>
                            <div className="text-xs text-gray-500 mt-0.5">
                              {card.company} &middot; {card.item}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          {isCompleted && (
                            <span className="text-[10px] font-medium text-green-600 bg-green-100 px-2 py-0.5 rounded-full">
                              완료
                            </span>
                          )}
                          <svg className="w-4 h-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Progress + result link */}
              {completedQuadrants.length > 0 && (
                <div className="mt-4 flex items-center justify-between">
                  <span className="text-xs text-gray-400">
                    {completedQuadrants.length}개 완료
                  </span>
                  <button
                    onClick={() => router.push('/dashboard')}
                    className="text-xs font-semibold text-violet-600 hover:text-violet-800 cursor-pointer"
                  >
                    최근 결과 보기 &rarr;
                  </button>
                </div>
              )}

              {/* Team tip */}
              <div className="mt-4 bg-slate-50 rounded-lg px-4 py-3">
                <p className="text-[11px] text-gray-500 leading-relaxed">
                  <strong className="text-gray-700">워크샵 진행 방법:</strong>{' '}
                  각 팀이 사분면을 하나씩 맡아 토론하며 의사결정을 내리고, 완료 후 팀 간 결과를 비교해 보세요. 정답은 없습니다.
                </p>
              </div>
            </div>
          )}

          {/* ===== Calculator Tab ===== */}
          {activeTab === 'calculator' && (
            <div className="p-4">
              <InventoryCalculator />
            </div>
          )}
        </div>

        <p className="text-center text-xs text-gray-400 mt-4">
          {activeTab === 'simulation'
            ? '사분면 1개 선택 → 팀 토론 → 4단계 의사결정 → 가치 성향 분석'
            : 'EOQ · Safety Stock · Reorder Point'}
        </p>
      </div>
    </div>
  );
}
