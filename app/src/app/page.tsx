import Link from 'next/link';
import KraljicMatrixDiagram from '@/components/KraljicMatrixDiagram';

const STEPS = [
  { icon: '📊', label: '데이터 확인' },
  { icon: '🧮', label: 'KPI 계산' },
  { icon: '🎯', label: '품목군 분류' },
  { icon: '📝', label: '결과 제출' },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-50">

      {/* ── Hero ── */}
      <div className="bg-slate-900 text-center px-4 pt-8 pb-6">
        <p className="text-[11px] tracking-widest text-blue-300 uppercase mb-3">
          Kraljic Matrix Practice
        </p>
        <h1 className="text-2xl font-black text-white leading-tight mb-2">
          크랄직 매트릭스<br />
          <span className="text-slate-300 font-semibold text-xl">품목군 분류 실습</span>
        </h1>
        <p className="text-sm text-slate-400">
          10개 품목 원천데이터 → KPI 산출 → 4개 품목군 분류
        </p>

        {/* 4-step strip */}
        <div className="flex items-center justify-center gap-1 mt-5 overflow-x-auto px-2">
          {STEPS.map((s, i) => (
            <div key={s.label} className="flex items-center gap-1">
              <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-700">
                <span className="text-sm">{s.icon}</span>
                <span className="text-[11px] font-semibold text-slate-200">{s.label}</span>
              </div>
              {i < STEPS.length - 1 && <span className="text-slate-600 text-xs">›</span>}
            </div>
          ))}
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-4">

        {/* ── Primary CTAs ── */}
        <div className="grid grid-cols-2 gap-3">
          <Link
            href="/items"
            className="flex flex-col items-center gap-3 py-7 rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-700 text-white hover:from-emerald-400 hover:to-emerald-600 transition-all hover:scale-[1.02] shadow-md"
          >
            <span className="text-4xl">📊</span>
            <div className="text-center">
              <p className="text-sm font-bold">품목 데이터 보기</p>
              <p className="text-[11px] text-emerald-200 mt-0.5">10개 품목 원천 데이터</p>
            </div>
          </Link>
          <Link
            href="/guide"
            className="flex flex-col items-center gap-3 py-7 rounded-2xl bg-slate-800 text-white hover:bg-slate-700 transition-all hover:scale-[1.02] shadow-md"
          >
            <span className="text-4xl">🧮</span>
            <div className="text-center">
              <p className="text-sm font-bold">KPI 가이드 & 계산기</p>
              <p className="text-[11px] text-slate-400 mt-0.5">공식 + 보조 계산기</p>
            </div>
          </Link>
        </div>

        {/* ── Survey CTA ── */}
        <Link
          href="/survey"
          className="flex items-center gap-4 px-5 py-4 rounded-2xl bg-white border-2 border-dashed border-gray-300 hover:border-emerald-400 hover:bg-emerald-50/30 transition-all group"
        >
          <span className="text-3xl shrink-0">📝</span>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-gray-800 group-hover:text-emerald-700 whitespace-nowrap">분류 결과 제출</p>
            <p className="text-xs text-gray-400 whitespace-nowrap">10개 품목 품목군 선택 + 근거 입력</p>
          </div>
          <span className="text-gray-300 group-hover:text-emerald-500 text-lg shrink-0">→</span>
        </Link>

        {/* ── KPI quick tags ── */}
        <div className="bg-white rounded-xl border border-gray-100 px-4 py-3.5">
          <p className="text-xs font-bold text-gray-700 mb-2.5">
            산출해야 할 KPI 인자
            <span className="ml-1.5 text-[10px] font-normal text-gray-400">원천 데이터에서 직접 계산</span>
          </p>
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-[10px] font-semibold text-red-500 shrink-0">공급위험 ↗</span>
              {['①리드타임', '②납기준수율', '③CV', '④업체수', '⑤집중도', '⑥대체가능'].map(k => (
                <span key={k} className="text-[11px] bg-red-50 text-red-600 border border-red-100 px-2 py-0.5 rounded-full">{k}</span>
              ))}
            </div>
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-[10px] font-semibold text-emerald-600 shrink-0">수익영향 ↗</span>
              <span className="text-[11px] bg-emerald-50 text-emerald-700 border border-emerald-100 px-2 py-0.5 rounded-full">⑦지출비중</span>
            </div>
          </div>
        </div>

        {/* ── Collapsible matrix diagram ── */}
        <details className="bg-white rounded-xl border border-gray-200 overflow-hidden group">
          <summary className="flex items-center justify-between px-4 py-3.5 cursor-pointer list-none hover:bg-gray-50 transition-colors">
            <div className="flex items-center gap-2">
              <span className="text-sm">🗺️</span>
              <span className="text-sm font-bold text-gray-800">크랄직 매트릭스 개요</span>
              <span className="text-[11px] text-gray-400">참고용</span>
            </div>
            <span className="text-gray-400 text-lg group-open:rotate-90 transition-transform">›</span>
          </summary>
          <div className="px-4 pb-5 border-t border-gray-100">
            <p className="text-[11px] text-gray-400 mt-3 mb-3">
              Kraljic (1983) — Harvard Business Review
            </p>
            <KraljicMatrixDiagram />
          </div>
        </details>

      </div>
    </div>
  );
}
