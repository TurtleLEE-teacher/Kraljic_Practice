'use client';

import React, { useMemo } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  LabelList,
} from 'recharts';
import type { DimensionProfile } from '@/lib/types';

const DIMENSION_INFO: Record<
  'ce' | 'ss' | 'sv',
  { label: string; shortLabel: string }
> = {
  ce: { label: '비용효율성(CE)', shortLabel: 'CE' },
  ss: { label: '공급안정성(SS)', shortLabel: 'SS' },
  sv: { label: '전략적가치(SV)', shortLabel: 'SV' },
};

const COLORS = {
  strongest: '#10b981', // green
  weakest: '#ef4444', // red
  normal: '#6b7280', // gray
};

interface DimensionProfileChartProps {
  profile: DimensionProfile;
}

export default function DimensionProfileChart({
  profile,
}: DimensionProfileChartProps) {
  const chartData = useMemo(() => {
    const dims: Array<'ce' | 'ss' | 'sv'> = ['ce', 'ss', 'sv'];
    return dims.map((dim) => ({
      dimension: DIMENSION_INFO[dim].label,
      shortLabel: DIMENSION_INFO[dim].shortLabel,
      total: profile[dim].total,
      average: profile[dim].average,
      isStrongest: profile.strongest === dim,
      isWeakest: profile.weakest === dim,
    }));
  }, [profile]);

  const maxValue = useMemo(
    () => Math.max(...chartData.map((d) => d.total)) + 4,
    [chartData]
  );

  return (
    <div className="w-full">
      {/* Labels above chart */}
      <div className="flex items-center gap-4 mb-3 text-xs">
        <div className="flex items-center gap-1.5">
          <span
            className="inline-block w-3 h-3 rounded-sm"
            style={{ backgroundColor: COLORS.strongest }}
          />
          <span className="text-gray-600">가장 강한 역량</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span
            className="inline-block w-3 h-3 rounded-sm"
            style={{ backgroundColor: COLORS.weakest }}
          />
          <span className="text-gray-600">개선 필요 역량</span>
        </div>
      </div>

      <div className="w-full h-[220px] print:h-[180px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            layout="vertical"
            margin={{ top: 5, right: 40, left: 10, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" horizontal={false} />
            <XAxis type="number" domain={[0, maxValue]} tick={{ fontSize: 11 }} />
            <YAxis
              type="category"
              dataKey="dimension"
              width={110}
              tick={{ fontSize: 12, fill: '#374151' }}
            />
            <Tooltip
              formatter={(value: unknown, _name: unknown, props: unknown) => {
                const v = value as number;
                const p = props as { payload?: { average?: number } };
                const avg = p?.payload?.average ?? 0;
                return [`총점: ${v} (평균: ${avg})`, ''];
              }}
              contentStyle={{
                backgroundColor: '#fff',
                border: '1px solid #e5e7eb',
                borderRadius: 8,
                fontSize: 12,
              }}
            />
            <Bar dataKey="total" radius={[0, 6, 6, 0]} barSize={28}>
              {chartData.map((entry, idx) => (
                <Cell
                  key={idx}
                  fill={
                    entry.isStrongest
                      ? COLORS.strongest
                      : entry.isWeakest
                        ? COLORS.weakest
                        : COLORS.normal
                  }
                />
              ))}
              <LabelList
                dataKey="total"
                position="right"
                style={{ fill: '#374151', fontSize: 12, fontWeight: 600 }}
              />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Dimension summary text */}
      <div className="mt-2 grid grid-cols-3 gap-2 text-center">
        {chartData.map((d) => (
          <div
            key={d.shortLabel}
            className="py-2 px-3 rounded-lg"
            style={{
              backgroundColor: d.isStrongest
                ? '#ecfdf5'
                : d.isWeakest
                  ? '#fef2f2'
                  : '#f9fafb',
            }}
          >
            <div className="text-xs text-gray-500">{d.shortLabel}</div>
            <div
              className="text-lg font-bold"
              style={{
                color: d.isStrongest
                  ? COLORS.strongest
                  : d.isWeakest
                    ? COLORS.weakest
                    : COLORS.normal,
              }}
            >
              {d.total}
            </div>
            <div className="text-[10px] text-gray-400">
              평균 {d.average.toFixed(1)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
