import Link from 'next/link';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">

      {/* Hero */}
      <div className="bg-slate-900 text-center px-6 pt-10 pb-8">
        <h1 className="text-2xl font-black text-white leading-tight mb-2">
          크랄직 매트릭스
        </h1>
        <p className="text-base text-slate-300">품목군 분류 실습</p>
        <p className="text-sm text-slate-500 mt-3">
          10개 품목의 원천 데이터를 분석하고, KPI를 산출하여, 4개 품목군으로 분류하세요.
        </p>
      </div>

      {/* 3 Action Cards */}
      <div className="flex-1 max-w-lg mx-auto w-full px-4 py-6 space-y-3">

        <Link
          href="/items"
          className="flex items-center gap-4 px-5 py-5 rounded-2xl bg-white border border-gray-200 hover:border-emerald-400 hover:shadow-md transition-all group"
        >
          <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center shrink-0">
            <span className="text-2xl">1</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-base font-bold text-gray-900 group-hover:text-emerald-700">품목 데이터 확인</p>
            <p className="text-sm text-gray-500 mt-0.5">10개 품목(A~J)의 원천 데이터 3개 테이블</p>
          </div>
          <span className="text-gray-300 group-hover:text-emerald-500 text-lg shrink-0">→</span>
        </Link>

        <Link
          href="/guide"
          className="flex items-center gap-4 px-5 py-5 rounded-2xl bg-white border border-gray-200 hover:border-blue-400 hover:shadow-md transition-all group"
        >
          <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center shrink-0">
            <span className="text-2xl">2</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-base font-bold text-gray-900 group-hover:text-blue-700">KPI 가이드 & 계산기</p>
            <p className="text-sm text-gray-500 mt-0.5">7개 KPI 공식, 분류 기준표, 보조 계산기</p>
          </div>
          <span className="text-gray-300 group-hover:text-blue-500 text-lg shrink-0">→</span>
        </Link>

        <Link
          href="/survey"
          className="flex items-center gap-4 px-5 py-5 rounded-2xl bg-white border border-gray-200 hover:border-violet-400 hover:shadow-md transition-all group"
        >
          <div className="w-12 h-12 rounded-xl bg-violet-100 flex items-center justify-center shrink-0">
            <span className="text-2xl">3</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-base font-bold text-gray-900 group-hover:text-violet-700">분류 결과 제출</p>
            <p className="text-sm text-gray-500 mt-0.5">10개 품목의 품목군 선택 + 근거 입력</p>
          </div>
          <span className="text-gray-300 group-hover:text-violet-500 text-lg shrink-0">→</span>
        </Link>

      </div>

    </div>
  );
}
