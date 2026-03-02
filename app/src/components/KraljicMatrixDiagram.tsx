import Link from 'next/link';

export default function KraljicMatrixDiagram() {
  return (
    <div className="w-full space-y-4">
      {/* SVG Matrix Illustration */}
      <svg
        viewBox="0 0 500 360"
        className="w-full h-auto"
        aria-label="크랄직 매트릭스 2×2 다이어그램"
      >
        <defs>
          {/* Arrow marker */}
          <marker id="arr" markerWidth="7" markerHeight="7" refX="6" refY="3.5" orient="auto">
            <polygon points="0 0, 7 3.5, 0 7" fill="#9ca3af" />
          </marker>
          {/* Quadrant gradients */}
          <linearGradient id="g-bn" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#fef2f2" />
            <stop offset="100%" stopColor="#fee2e2" />
          </linearGradient>
          <linearGradient id="g-st" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#f5f3ff" />
            <stop offset="100%" stopColor="#ede9fe" />
          </linearGradient>
          <linearGradient id="g-nc" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#f8fafc" />
            <stop offset="100%" stopColor="#f1f5f9" />
          </linearGradient>
          <linearGradient id="g-lv" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#f0fdf4" />
            <stop offset="100%" stopColor="#d1fae5" />
          </linearGradient>
        </defs>

        {/* ── Quadrant backgrounds ── */}
        {/* Bottleneck – top-left */}
        <rect x="48" y="8" width="198" height="162" rx="10" fill="url(#g-bn)" stroke="#fca5a5" strokeWidth="1.5" />
        {/* Strategic – top-right */}
        <rect x="254" y="8" width="238" height="162" rx="10" fill="url(#g-st)" stroke="#c4b5fd" strokeWidth="1.5" />
        {/* Non-critical – bottom-left */}
        <rect x="48" y="178" width="198" height="162" rx="10" fill="url(#g-nc)" stroke="#cbd5e1" strokeWidth="1.5" />
        {/* Leverage – bottom-right */}
        <rect x="254" y="178" width="238" height="162" rx="10" fill="url(#g-lv)" stroke="#6ee7b7" strokeWidth="1.5" />

        {/* ── Divider lines ── */}
        <line x1="48" y1="174" x2="492" y2="174" stroke="#e5e7eb" strokeWidth="1.5" strokeDasharray="5,4" />
        <line x1="250" y1="8" x2="250" y2="340" stroke="#e5e7eb" strokeWidth="1.5" strokeDasharray="5,4" />

        {/* ════════ BOTTLENECK (top-left) ════════ */}
        {/* Warning triangle icon */}
        <g transform="translate(126, 24)">
          <polygon points="21,2 40,36 2,36" fill="#fee2e2" stroke="#f87171" strokeWidth="2" strokeLinejoin="round" />
          <rect x="19" y="14" width="4" height="12" rx="2" fill="#ef4444" />
          <circle cx="21" cy="31" r="2.5" fill="#ef4444" />
        </g>
        <text x="147" y="74" textAnchor="middle" fontSize="16" fontWeight="800" fill="#dc2626">병목</text>
        <text x="147" y="88" textAnchor="middle" fontSize="9.5" fill="#f87171" letterSpacing="0.5">Bottleneck</text>
        <text x="147" y="107" textAnchor="middle" fontSize="8.5" fill="#6b7280">공급위험 높음  ·  수익영향 낮음</text>
        <text x="66" y="127" fontSize="8.5" fill="#b91c1c">⬡ 공급업체 수 : 적음 (≤ 2개)</text>
        <text x="66" y="142" fontSize="8.5" fill="#b91c1c">⬡ 리드타임 : 긺 (≥ 30일)</text>
        <text x="66" y="157" fontSize="8.5" fill="#b91c1c">⬡ 납기준수율 : 낮음 (&lt; 80%)</text>

        {/* ════════ STRATEGIC (top-right) ════════ */}
        {/* Diamond icon */}
        <g transform="translate(348, 24)">
          <polygon points="21,2 40,20 21,38 2,20" fill="#ede9fe" stroke="#a78bfa" strokeWidth="2" />
          <polygon points="21,10 32,20 21,30 10,20" fill="#7c3aed" opacity="0.35" />
          <text x="21" y="24" textAnchor="middle" fontSize="13" fill="#6d28d9" fontWeight="bold">✦</text>
        </g>
        <text x="373" y="74" textAnchor="middle" fontSize="16" fontWeight="800" fill="#7c3aed">전략</text>
        <text x="373" y="88" textAnchor="middle" fontSize="9.5" fill="#a78bfa" letterSpacing="0.5">Strategic</text>
        <text x="373" y="107" textAnchor="middle" fontSize="8.5" fill="#6b7280">공급위험 높음  ·  수익영향 높음</text>
        <text x="272" y="127" fontSize="8.5" fill="#6d28d9">⬡ 공급업체 수 : 적음 (≤ 3개)</text>
        <text x="272" y="142" fontSize="8.5" fill="#6d28d9">⬡ 리드타임 : 길고 변동 큼</text>
        <text x="272" y="157" fontSize="8.5" fill="#6d28d9">⬡ 지출 비중 : 높음 (≥ 10%)</text>

        {/* ════════ NON-CRITICAL (bottom-left) ════════ */}
        {/* Circle check icon */}
        <g transform="translate(126, 192)">
          <circle cx="21" cy="20" r="19" fill="#e2e8f0" stroke="#94a3b8" strokeWidth="2" />
          <polyline points="11,20 18,27 31,13" fill="none" stroke="#64748b" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        </g>
        <text x="147" y="242" textAnchor="middle" fontSize="16" fontWeight="800" fill="#475569">일반</text>
        <text x="147" y="256" textAnchor="middle" fontSize="9.5" fill="#94a3b8" letterSpacing="0.5">Non-critical</text>
        <text x="147" y="275" textAnchor="middle" fontSize="8.5" fill="#6b7280">공급위험 낮음  ·  수익영향 낮음</text>
        <text x="66" y="295" fontSize="8.5" fill="#64748b">⬡ 공급업체 수 : 많음 (≥ 5개)</text>
        <text x="66" y="310" fontSize="8.5" fill="#64748b">⬡ 리드타임 : 짧음 (≤ 5일)</text>
        <text x="66" y="325" fontSize="8.5" fill="#64748b">⬡ 지출 비중 : 낮음 (&lt; 2%)</text>

        {/* ════════ LEVERAGE (bottom-right) ════════ */}
        {/* Trend chart icon */}
        <g transform="translate(348, 192)">
          <rect x="0" y="0" width="42" height="40" rx="6" fill="#d1fae5" stroke="#34d399" strokeWidth="2" />
          {/* Bar chart */}
          <rect x="6" y="28" width="6" height="8" rx="1" fill="#059669" />
          <rect x="14" y="20" width="6" height="16" rx="1" fill="#059669" />
          <rect x="22" y="14" width="6" height="22" rx="1" fill="#059669" />
          <rect x="30" y="8" width="6" height="28" rx="1" fill="#059669" />
        </g>
        <text x="373" y="242" textAnchor="middle" fontSize="16" fontWeight="800" fill="#059669">레버리지</text>
        <text x="373" y="256" textAnchor="middle" fontSize="9.5" fill="#34d399" letterSpacing="0.5">Leverage</text>
        <text x="373" y="275" textAnchor="middle" fontSize="8.5" fill="#6b7280">공급위험 낮음  ·  수익영향 높음</text>
        <text x="272" y="295" fontSize="8.5" fill="#065f46">⬡ 공급업체 수 : 많음 (≥ 4개)</text>
        <text x="272" y="310" fontSize="8.5" fill="#065f46">⬡ 납기준수율 : 높음 (≥ 90%)</text>
        <text x="272" y="325" fontSize="8.5" fill="#065f46">⬡ 지출 비중 : 높음 (≥ 5%)</text>

        {/* ── Y Axis (Supply Risk) ── */}
        <line x1="28" y1="345" x2="28" y2="8" stroke="#6b7280" strokeWidth="1.5" markerEnd="url(#arr)" />
        <text
          x="12" y="180"
          textAnchor="middle"
          fontSize="10"
          fontWeight="700"
          fill="#6b7280"
          transform="rotate(-90, 12, 180)"
        >
          공급 위험 (Supply Risk)
        </text>

        {/* ── X Axis (Profit Impact) ── */}
        <line x1="28" y1="350" x2="492" y2="350" stroke="#6b7280" strokeWidth="1.5" markerEnd="url(#arr)" />
        <text x="265" y="360" textAnchor="middle" fontSize="10" fontWeight="700" fill="#6b7280">
          수익 영향 (Profit Impact)
        </text>

        {/* Scale hints */}
        <text x="50" y="345" fontSize="8.5" fill="#9ca3af">낮음</text>
        <text x="473" y="345" fontSize="8.5" fill="#9ca3af" textAnchor="end">높음</text>
        <text x="40" y="340" fontSize="8.5" fill="#9ca3af" textAnchor="end">낮음</text>
        <text x="40" y="16" fontSize="8.5" fill="#9ca3af" textAnchor="end">높음</text>
      </svg>

      {/* CTA buttons */}
      <div className="flex gap-3">
        <Link
          href="/guide"
          className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-slate-800 text-white text-sm font-semibold hover:bg-slate-700 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          KPI 산출 가이드
        </Link>
        <Link
          href="/items"
          className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-emerald-600 text-white text-sm font-semibold hover:bg-emerald-700 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M3 14h18M10 6l-7 4 7 4M14 6l7 4-7 4" />
          </svg>
          품목 데이터 분석
        </Link>
      </div>
    </div>
  );
}
