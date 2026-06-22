"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Sprout, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

// 센터 이름은 추후 이곳에 입력하면 타이틀 상단에 표시됩니다. (예: "써니빛 아동발달센터")
const CENTER_NAME = "";

export default function Home() {
  const router = useRouter();
  const [consent, setConsent] = useState(false);

  return (
    <main className="relative flex min-h-dvh flex-col items-center justify-center overflow-hidden bg-linear-to-b from-amber-50 via-orange-50/60 to-rose-50 px-6 py-10">
      {/* 부드러운 배경 장식 */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-24 -right-20 h-64 w-64 rounded-full bg-orange-200/40 blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-24 -left-20 h-64 w-64 rounded-full bg-rose-200/40 blur-3xl"
      />

      {/* 콘텐츠: 모바일 기준 폭으로 제한 (태블릿에서도 동일) */}
      <div className="relative flex w-full max-w-md flex-col items-center text-center">
        {/* 아이콘 배지 */}
        <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-white shadow-sm ring-1 ring-orange-100">
          <Sprout className="h-10 w-10 text-orange-500" strokeWidth={1.8} />
        </div>

        {/* 센터 이름 (선택) */}
        {CENTER_NAME && (
          <p className="mt-6 text-sm font-medium text-orange-700">
            {CENTER_NAME}
          </p>
        )}

        {/* 타이틀 */}
        <h1 className="mt-5 text-3xl font-bold leading-snug tracking-tight text-balance text-zinc-900">
          아동 발달 초기 상담 평가지
        </h1>

        {/* 설명 */}
        <p className="mt-4 max-w-76 text-base leading-relaxed text-pretty text-zinc-600">
          상담 전 간단한 문진을 작성해주세요. <br />약 5분 정도 소요됩니다.
        </p>
      </div>

      {/* 하단: 동의 + CTA */}
      <div className="relative mt-10 flex w-full max-w-md flex-col items-center">
        {/* 개인정보 동의 */}
        <div className="w-full rounded-2xl bg-white/80 p-4 ring-1 ring-zinc-200/70">
          <Label
            htmlFor="consent"
            className="cursor-pointer items-start gap-3 text-left"
          >
            <Checkbox
              id="consent"
              checked={consent}
              onCheckedChange={(value) => setConsent(value === true)}
              className="mt-0.5"
            />
            <span className="text-sm font-medium leading-relaxed text-zinc-700">
              개인정보 수집·이용 및 결과 수신에 동의합니다
              <span className="mt-1 block text-xs font-normal text-zinc-500">
                작성 내용은 상담 목적에만 사용됩니다.
              </span>
            </span>
          </Label>
        </div>

        {/* CTA */}
        <Button
          type="button"
          disabled={!consent}
          onClick={() => router.push("/info")}
          className="mt-4 h-14 w-full touch-manipulation gap-2 rounded-2xl text-[1.05rem] font-semibold shadow-lg shadow-orange-900/15 hover:bg-orange-800 disabled:bg-zinc-300 disabled:text-zinc-500 disabled:opacity-100 disabled:shadow-none"
        >
          시작하기
          <ArrowRight
            className="size-5 transition-transform group-hover/button:translate-x-0.5"
            strokeWidth={2.2}
          />
        </Button>
        <p className="mt-4 px-4 text-center text-xs leading-relaxed text-zinc-600">
          본 체크리스트는 진단 도구가 아니며, 초기상담 및 검사 방향 설정을 위한
          참고 자료입니다.
        </p>
      </div>
    </main>
  );
}
