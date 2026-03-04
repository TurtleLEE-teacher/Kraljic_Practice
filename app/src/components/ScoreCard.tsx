'use client';

import { useMemo } from 'react';
import type { ItemData } from '@/lib/types';
import { computeAxisScores, type KpiScore } from '@/lib/scoring';

const LEVEL_CLS = {
  LOW:  'bg-emerald-100 text-emerald-700',
  MID:  'bg-amber-100 text-amber-700',
  HIGH: 'bg-red-100 text-red-700',
} as const;

const Q_LABELS: Record<string, { name: string; cls: string }> = {
  strategic:   { name: '전략',    cls: 'bg-violet-600 text-white' },
  leverage:    { name: '레버리지', cls: 'bg-emerald-600 text-white' },
  bottleneck:  { name: '병목',    cls: 'bg-red-600 text-white' },
  noncritical: { name: '일반',    cls: 'bg-slate-600 text-white' },
};

function KpiBadge({ kpi }: { kpi: KpiScore }) {
  return (
    <div className="flex items-center justify-between py-1.5 border-b border-gray-50 last:border-0">
      <div className="flex items-center gap-1.5 min-w-0">
        <span className="text-[10px] font-black text-gray-400 w-4 text-center shrink-0">{kpi.num}</span>
        <span className="text-xs text-gray-600 truncate">{kpi.name}</span>
      </div>
      <div className="flex items-center gap-1.5 shrink-0">
        <span className="text-xs font-semibold text-gray-700">
          {kpi.value !== null ? (kpi.unit === '%' ? kpi.value.toFixed(1) : kpi.value.toFixed(0)) : '—'}{kpi.unit}
        </span>
        <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${LEVEL_CLS[kpi.level]}`}>
          {kpi.level}
        </span>
      </div>
    </div>
  );
}

function ScoreBar({ label, score, color }: { label: string; score: number; color: string }) {
  const pct = ((score - 1) / 2) * 100; // 1→0%, 2→50%, 3→100%
  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs font-bold text-gray-700">{label}</span>
        <span className="text-sm font-black text-gray-800">{score.toFixed(2)}</span>
      </div>
      <div className="relative h-3 bg-gray-100 rounded-full overflow-hidden">
        <div className={`h-full rounded-full transition-all ${color}`} style={{ width: `${Math.max(pct, 5)}%` }} />
        {/* 2.0 기준선 */}
        <div className="absolute top-0 left-1/2 w-0.5 h-full bg-gray-400 opacity-50" />
      </div>
      <div className="flex justify-between text-[9px] text-gray-400 mt-0.5">
        <span>1.0 (LOW)</span><span>2.0 기준</span><span>3.0 (HIGH)</span>
      </div>
    </div>
  );
}

export default function ScoreCard({ item }: { item: ItemData }) {
  const { srKpis, piKpis, srScore, piScore, recommended } = useMemo(
    () => computeAxisScores(item), [item]
  );

  const q = Q_LABELS[recommended];

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <div className="px-4 py-2.5 bg-blue-50 border-b border-blue-100 flex items-center justify-between">
        <span className="text-sm font-bold text-blue-800">종합 스코어카드</span>
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-blue-400">시스템 추천</span>
          <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${q.cls}`}>{q.name}</span>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Score bars */}
        <div className="space-y-3">
          <ScoreBar label="공급위험 종합" score={srScore} color="bg-red-500" />
          <ScoreBar label="수익영향 종합" score={piScore} color="bg-emerald-500" />
        </div>

        {/* KPI details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="rounded-lg border border-red-100 bg-red-50/30 px-3 py-2">
            <p className="text-[10px] font-bold text-red-400 mb-1 uppercase tracking-wider">공급위험 KPI (①~⑥)</p>
            {srKpis.map(k => <KpiBadge key={k.num} kpi={k} />)}
          </div>
          <div className="rounded-lg border border-emerald-100 bg-emerald-50/30 px-3 py-2">
            <p className="text-[10px] font-bold text-emerald-400 mb-1 uppercase tracking-wider">수익영향 KPI (⑦~⑩)</p>
            {piKpis.map(k => <KpiBadge key={k.num} kpi={k} />)}
          </div>
        </div>

        <p className="text-[10px] text-gray-400 text-center">
          종합점수 ≥ 2.0 → HIGH / &lt; 2.0 → LOW · 시스템 추천은 참고용이며 최종 분류는 직접 판단하세요
        </p>
      </div>
    </div>
  );
}
