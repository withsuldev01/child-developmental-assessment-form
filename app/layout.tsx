import type { Metadata, Viewport } from "next";
import { Geist_Mono } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";
import { cn } from "@/lib/utils";

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// 한글 본문은 Pretendard 가변 폰트를 셀프호스팅(오프라인/폐쇄망에서도 안전).
const pretendard = localFont({
  src: "./fonts/PretendardVariable.woff2",
  variable: "--font-sans",
  display: "swap",
  weight: "45 920",
});

export const metadata: Metadata = {
  title: "아동 발달 초기상담 체크리스트",
  description:
    "아동발달센터 방문 보호자를 위한 초기상담 발달 체크리스트입니다. 모바일에서 약 5분이면 작성할 수 있어요.",
};

export const viewport: Viewport = {
  themeColor: "#fffbeb",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ko"
      className={cn(
        "h-full",
        "antialiased",
        geistMono.variable,
        pretendard.variable,
        "font-sans",
      )}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
