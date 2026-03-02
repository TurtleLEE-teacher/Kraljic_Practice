import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "크랄직 매트릭스 품목군 분류 실습",
  description:
    "원천 데이터(납기이력·공급업체·지출현황)에서 KPI를 직접 산출하여 10개 품목을 크랄직 4개 품목군으로 분류하는 실습 과정",
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
