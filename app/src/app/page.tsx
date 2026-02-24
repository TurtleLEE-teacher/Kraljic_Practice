'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useGameStore } from '@/store/gameStore';
import InventoryCalculator from '@/components/InventoryCalculator';

type LandingTab = 'simulation' | 'calculator';

export default function LandingPage() {
  const [activeTab, setActiveTab] = useState<LandingTab>('simulation');
  const [name, setName] = useState('');
  const [isStarting, setIsStarting] = useState(false);
  const startSession = useGameStore((s) => s.startSession);
  const router = useRouter();

  const handleStart = async () => {
    const trimmedName = name.trim();
    if (!trimmedName) return;

    setIsStarting(true);
    startSession(trimmedName);
    router.push('/scenario/bottleneck/1');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        {/* Main card */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          {/* Header banner */}
          <div className="bg-gradient-to-r from-slate-800 via-slate-700 to-slate-800 px-8 py-8 text-center">
            <div className="w-14 h-14 mx-auto mb-3 rounded-xl bg-white/10 flex items-center justify-center">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                  d="M4 5a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1V5zm10 0a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zM4 15a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1v-4zm10 0a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" />
              </svg>
            </div>

            <h1 className="text-2xl font-bold text-white leading-snug">
              Kraljic 매트릭스<br />의사결정 시뮬레이션
            </h1>
            <p className="text-slate-300 text-sm mt-2">
              Strategic Purchasing Decision-Making Simulation
            </p>
          </div>

          {/* ===== Tab navigation ===== */}
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => setActiveTab('simulation')}
              className={`flex-1 py-3 text-sm font-semibold transition-colors cursor-pointer ${
                activeTab === 'simulation'
                  ? 'text-slate-800 border-b-2 border-slate-800 bg-white'
                  : 'text-gray-400 hover:text-gray-600 bg-gray-50'
              }`}
            >
              <span className="flex items-center justify-center gap-1.5">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                시뮬레이션
              </span>
            </button>
            <button
              onClick={() => setActiveTab('calculator')}
              className={`flex-1 py-3 text-sm font-semibold transition-colors cursor-pointer ${
                activeTab === 'calculator'
                  ? 'text-blue-700 border-b-2 border-blue-600 bg-white'
                  : 'text-gray-400 hover:text-gray-600 bg-gray-50'
              }`}
            >
              <span className="flex items-center justify-center gap-1.5">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
                재고 계산기
              </span>
            </button>
          </div>

          {/* ===== Tab content ===== */}

          {/* Simulation tab */}
          {activeTab === 'simulation' && (
            <div className="px-8 py-6">
              <p className="text-gray-600 text-sm leading-relaxed mb-5 text-center">
                4개 사분면(병목, 레버리지, 전략, 일상)의 시나리오를 통해
                전략적 구매 의사결정 역량을 진단합니다.
                총 20회의 선택을 진행합니다.
              </p>

              {/* Quadrant preview */}
              <div className="grid grid-cols-2 gap-2.5 mb-6">
                <div className="flex items-center gap-2 px-3 py-2.5 rounded-lg bg-bottleneck-50 border border-bottleneck-200">
                  <div className="w-3 h-3 rounded-full bg-bottleneck-500" />
                  <span className="text-xs font-medium text-bottleneck-800">병목 (Bottleneck)</span>
                </div>
                <div className="flex items-center gap-2 px-3 py-2.5 rounded-lg bg-leverage-50 border border-leverage-200">
                  <div className="w-3 h-3 rounded-full bg-leverage-500" />
                  <span className="text-xs font-medium text-leverage-800">레버리지 (Leverage)</span>
                </div>
                <div className="flex items-center gap-2 px-3 py-2.5 rounded-lg bg-strategic-50 border border-strategic-200">
                  <div className="w-3 h-3 rounded-full bg-strategic-500" />
                  <span className="text-xs font-medium text-strategic-800">전략 (Strategic)</span>
                </div>
                <div className="flex items-center gap-2 px-3 py-2.5 rounded-lg bg-noncritical-100 border border-noncritical-200">
                  <div className="w-3 h-3 rounded-full bg-noncritical-500" />
                  <span className="text-xs font-medium text-noncritical-800">일상 (Non-critical)</span>
                </div>
              </div>

              {/* Name input */}
              <div className="space-y-2 mb-5">
                <label htmlFor="participant-name" className="block text-sm font-semibold text-gray-700">
                  참여자 이름
                </label>
                <input
                  id="participant-name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleStart()}
                  placeholder="이름을 입력해 주세요"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-sm
                             focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100
                             placeholder:text-gray-400 transition-all duration-200"
                  disabled={isStarting}
                  autoFocus
                />
              </div>

              {/* Start button */}
              <button
                onClick={handleStart}
                disabled={!name.trim() || isStarting}
                className={`
                  w-full py-3.5 rounded-xl text-base font-bold transition-all duration-200
                  focus:outline-none focus:ring-2 focus:ring-offset-2
                  ${name.trim() && !isStarting
                    ? 'bg-slate-800 text-white hover:bg-slate-700 active:bg-slate-900 focus:ring-slate-500 cursor-pointer'
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  }
                `}
              >
                {isStarting ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    시작 중...
                  </span>
                ) : (
                  '시작하기'
                )}
              </button>
            </div>
          )}

          {/* Calculator tab */}
          {activeTab === 'calculator' && (
            <div className="p-4">
              <InventoryCalculator />
            </div>
          )}
        </div>

        {/* Footer note */}
        <p className="text-center text-xs text-gray-400 mt-5">
          {activeTab === 'simulation'
            ? '소요 시간: 약 30~40분 | 개인 실습 + 팀 토론'
            : 'EOQ · Safety Stock · Reorder Point 간편 계산'}
        </p>
      </div>
    </div>
  );
}
