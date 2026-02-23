'use client';

import type { CompanyBackground, QuadrantMeta } from '@/lib/types';

interface ScenarioBriefingProps {
  background: CompanyBackground;
  quadrant: QuadrantMeta;
}

const quadrantAccentMap: Record<string, { border: string; bg: string; badge: string; badgeText: string; icon: string }> = {
  amber: {
    border: 'border-bottleneck-300',
    bg: 'bg-bottleneck-50',
    badge: 'bg-bottleneck-100',
    badgeText: 'text-bottleneck-800',
    icon: 'text-bottleneck-500',
  },
  emerald: {
    border: 'border-leverage-300',
    bg: 'bg-leverage-50',
    badge: 'bg-leverage-100',
    badgeText: 'text-leverage-800',
    icon: 'text-leverage-500',
  },
  blue: {
    border: 'border-strategic-300',
    bg: 'bg-strategic-50',
    badge: 'bg-strategic-100',
    badgeText: 'text-strategic-800',
    icon: 'text-strategic-500',
  },
  slate: {
    border: 'border-noncritical-300',
    bg: 'bg-noncritical-100',
    badge: 'bg-noncritical-200',
    badgeText: 'text-noncritical-800',
    icon: 'text-noncritical-500',
  },
};

export default function ScenarioBriefing({ background, quadrant }: ScenarioBriefingProps) {
  const accent = quadrantAccentMap[quadrant.color] || quadrantAccentMap.slate;

  return (
    <div className={`rounded-xl border-2 ${accent.border} ${accent.bg} p-6 space-y-5`}>
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900">{background.companyName}</h2>
          <p className="text-sm text-gray-500 mt-1">{background.industry}</p>
        </div>
        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${accent.badge} ${accent.badgeText}`}>
          {quadrant.nameKo} ({quadrant.nameEn})
        </span>
      </div>

      {/* Company info grid */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white/70 rounded-lg px-4 py-3">
          <span className="text-xs text-gray-500 block">매출액</span>
          <span className="text-sm font-semibold text-gray-800">{background.revenue}</span>
        </div>
        <div className="bg-white/70 rounded-lg px-4 py-3">
          <span className="text-xs text-gray-500 block">임직원 수</span>
          <span className="text-sm font-semibold text-gray-800">{background.employees}</span>
        </div>
      </div>

      {/* Item info */}
      <div className="bg-white/70 rounded-lg p-4">
        <div className="flex items-center gap-2 mb-2">
          <svg className={`w-5 h-5 ${accent.icon}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
          </svg>
          <h3 className="font-semibold text-gray-900">{background.itemName}</h3>
        </div>
        <p className="text-sm text-gray-600 leading-relaxed">{background.itemDescription}</p>
        <div className="mt-2 text-xs text-gray-500">
          연간 지출: <span className="font-semibold text-gray-700">{background.annualSpend}</span>
        </div>
      </div>

      {/* Key metrics */}
      <div>
        <h4 className="text-sm font-semibold text-gray-700 mb-2">핵심 지표</h4>
        <ul className="space-y-1.5">
          {background.keyMetrics.map((metric, index) => (
            <li key={index} className="flex items-start gap-2 text-sm text-gray-600">
              <span className={`mt-1 w-1.5 h-1.5 rounded-full flex-shrink-0 ${accent.icon.replace('text-', 'bg-')}`} />
              {metric}
            </li>
          ))}
        </ul>
      </div>

      {/* Situation briefing */}
      <div className="border-t border-gray-200 pt-4">
        <h4 className="text-sm font-semibold text-gray-700 mb-2">상황 브리핑</h4>
        <p className="text-sm text-gray-600 leading-relaxed">{background.situationBriefing}</p>
      </div>
    </div>
  );
}
