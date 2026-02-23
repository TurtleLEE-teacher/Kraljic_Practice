import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Kraljic 매트릭스 의사결정 시뮬레이션",
  description:
    "Kraljic 매트릭스 기반 구매 전략 의사결정 실습 시뮬레이션 — 4개 사분면 시나리오를 통해 전략적 구매 역량을 개발합니다.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <head>
        <link
          rel="preconnect"
          href="https://fonts.googleapis.com"
        />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
