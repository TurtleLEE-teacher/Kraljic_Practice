'use client';

import React, { useMemo } from 'react';
import {
  RadarChart as RechartsRadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Legend,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';
import type { QuadrantResult, QuadrantMeta, QuadrantId } from '@/lib/types';

/** Map quadrant color names to actual hex values for Recharts */
const COLOR_MAP: Record<string, string> = {
  amber: '#f59e0b',
  emerald: '#10b981',
  blue: '#3b82f6',
  slate: '#64748b',
};

/** Dimension labels in Korean */
const DIMENSION_LABELS: Record<string, string> = {
  ce: '비용효율성',
  ss: '공급안정성',
  sv: '전략적가치',
};

interface RadarChartProps {
  quadrantResults: QuadrantResult[];
  quadrantMeta: Record<string, QuadrantMeta>;
}

export default function RadarChartComponent({
  quadrantResults,
  quadrantMeta,
}: RadarChartProps) {
  const chartData = useMemo(() => {
    // Build data for 3 axes: CE, SS, SV
    // Each data point has a value per quadrant
    const dimensions: Array<'ce' | 'ss' | 'sv'> = ['ce', 'ss', 'sv'];

    return dimensions.map((dim) => {
      const point: Record<string, string | number> = {
        dimension: DIMENSION_LABELS[dim],
      };

      for (const qr of quadrantResults) {
        const meta = quadrantMeta[qr.quadrant];
        // Sum the raw scores for this dimension across all 4 steps
        const total = qr.stepScores.reduce(
          (sum, ws) => sum + ws.raw[dim],
          0
        );
        point[meta.nameKo] = total;
      }

      return point;
    });
  }, [quadrantResults, quadrantMeta]);

  const quadrantEntries = useMemo(() => {
    return quadrantResults.map((qr) => {
      const meta = quadrantMeta[qr.quadrant];
      return {
        id: qr.quadrant as QuadrantId,
        nameKo: meta.nameKo,
        color: COLOR_MAP[meta.color] || '#6b7280',
      };
    });
  }, [quadrantResults, quadrantMeta]);

  return (
    <div className="w-full h-[400px] print:h-[300px]">
      <ResponsiveContainer width="100%" height="100%">
        <RechartsRadarChart data={chartData} cx="50%" cy="50%" outerRadius="70%">
          <PolarGrid stroke="#e5e7eb" />
          <PolarAngleAxis
            dataKey="dimension"
            tick={{ fill: '#374151', fontSize: 13, fontWeight: 600 }}
          />
          <PolarRadiusAxis
            angle={90}
            domain={[0, 20]}
            tick={{ fill: '#9ca3af', fontSize: 11 }}
            tickCount={5}
          />
          {quadrantEntries.map((entry) => (
            <Radar
              key={entry.id}
              name={entry.nameKo}
              dataKey={entry.nameKo}
              stroke={entry.color}
              fill={entry.color}
              fillOpacity={0.15}
              strokeWidth={2}
            />
          ))}
          <Legend
            wrapperStyle={{ fontSize: 13, paddingTop: 8 }}
            iconType="circle"
          />
          <Tooltip
            contentStyle={{
              backgroundColor: '#fff',
              border: '1px solid #e5e7eb',
              borderRadius: 8,
              fontSize: 13,
            }}
          />
        </RechartsRadarChart>
      </ResponsiveContainer>
    </div>
  );
}
