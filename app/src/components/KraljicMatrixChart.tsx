'use client';

import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceArea, ReferenceLine, Label } from 'recharts';

interface DataPoint {
  id: string;
  label: string;
  x: number; // supply risk score
  y: number; // profit impact score
  quadrant: string;
}

const Q_COLORS: Record<string, string> = {
  noncritical: '#64748b',
  bottleneck:  '#dc2626',
  leverage:    '#059669',
  strategic:   '#7c3aed',
};

function CustomDot(props: { cx?: number; cy?: number; payload?: DataPoint }) {
  const { cx = 0, cy = 0, payload } = props;
  if (!payload) return null;
  const color = Q_COLORS[payload.quadrant] || '#6b7280';
  return (
    <g>
      <circle cx={cx} cy={cy} r={14} fill={color} opacity={0.15} />
      <circle cx={cx} cy={cy} r={8} fill={color} />
      <text x={cx} y={cy + 1} textAnchor="middle" dominantBaseline="central"
        fill="white" fontSize={9} fontWeight="bold">
        {payload.id.toUpperCase()}
      </text>
    </g>
  );
}

function CustomTooltip({ active, payload }: { active?: boolean; payload?: Array<{ payload: DataPoint }> }) {
  if (!active || !payload?.[0]) return null;
  const d = payload[0].payload;
  const qNames: Record<string, string> = { noncritical: '일반', bottleneck: '병목', leverage: '레버리지', strategic: '전략' };
  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-lg px-3 py-2 text-xs">
      <p className="font-bold text-gray-800">{d.id.toUpperCase()} {d.label}</p>
      <p className="text-gray-500">공급위험: {d.x.toFixed(2)} / 수익영향: {d.y.toFixed(2)}</p>
      <p className="font-semibold" style={{ color: Q_COLORS[d.quadrant] }}>→ {qNames[d.quadrant]}</p>
    </div>
  );
}

export default function KraljicMatrixChart({ data }: { data: DataPoint[] }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <div className="px-4 py-2.5 border-b border-gray-100">
        <p className="text-sm font-bold text-gray-700">Kraljic 매트릭스 시각화</p>
        <p className="text-[10px] text-gray-400">X축: 공급위험 종합점수 / Y축: 수익영향 종합점수</p>
      </div>
      <div className="px-2 py-4">
        <ResponsiveContainer width="100%" height={360}>
          <ScatterChart margin={{ top: 20, right: 20, bottom: 30, left: 20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            {/* Quadrant backgrounds */}
            <ReferenceArea x1={1} x2={2} y1={2} y2={3} fill="#7c3aed" fillOpacity={0.06} />
            <ReferenceArea x1={2} x2={3} y1={2} y2={3} fill="#7c3aed" fillOpacity={0.06} />
            <ReferenceArea x1={1} x2={2} y1={1} y2={2} fill="#64748b" fillOpacity={0.06} />
            <ReferenceArea x1={2} x2={3} y1={1} y2={2} fill="#dc2626" fillOpacity={0.06} />
            {/* Quadrant labels */}
            <ReferenceArea x1={1} x2={2} y1={2} y2={3} label={{ value: '레버리지', position: 'insideTopLeft', fill: '#059669', fontSize: 11, fontWeight: 'bold' }} fill="transparent" />
            <ReferenceArea x1={2} x2={3} y1={2} y2={3} label={{ value: '전략', position: 'insideTopRight', fill: '#7c3aed', fontSize: 11, fontWeight: 'bold' }} fill="transparent" />
            <ReferenceArea x1={1} x2={2} y1={1} y2={2} label={{ value: '일반', position: 'insideBottomLeft', fill: '#64748b', fontSize: 11, fontWeight: 'bold' }} fill="transparent" />
            <ReferenceArea x1={2} x2={3} y1={1} y2={2} label={{ value: '병목', position: 'insideBottomRight', fill: '#dc2626', fontSize: 11, fontWeight: 'bold' }} fill="transparent" />
            {/* Center lines */}
            <ReferenceLine x={2} stroke="#9ca3af" strokeDasharray="5 5" />
            <ReferenceLine y={2} stroke="#9ca3af" strokeDasharray="5 5" />
            <XAxis type="number" dataKey="x" domain={[1, 3]} ticks={[1, 1.5, 2, 2.5, 3]} tickFormatter={v => v.toFixed(1)} fontSize={10}>
              <Label value="공급위험 →" offset={-10} position="insideBottom" style={{ fontSize: 11, fill: '#dc2626' }} />
            </XAxis>
            <YAxis type="number" dataKey="y" domain={[1, 3]} ticks={[1, 1.5, 2, 2.5, 3]} tickFormatter={v => v.toFixed(1)} fontSize={10}>
              <Label value="수익영향 →" angle={-90} position="insideLeft" style={{ fontSize: 11, fill: '#059669' }} />
            </YAxis>
            <Tooltip content={<CustomTooltip />} />
            <Scatter data={data} shape={<CustomDot />} />
          </ScatterChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
