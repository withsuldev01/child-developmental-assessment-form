"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight } from "lucide-react";

import { StepProgress } from "@/components/step-progress";
import { YesNoQuestion } from "@/components/yes-no-question";
import { Button } from "@/components/ui/button";
import { SECTION_02_QUESTIONS } from "@/lib/questions";
import { useConsultationForm, type YesNo } from "@/lib/consultation-form";

// 이전/다음 단계. 03(주호소 영역 빠른 선별)은 추후 구현.
const PREV_STEP = "/info";
const NEXT_STEP = "/screening";

export default function BasicCheckPage() {
  const router = useRouter();
  const { form, update } = useConsultationForm();
  const answers = form.section02;

  const answered = SECTION_02_QUESTIONS.filter((q) => answers[q.id]).length;
  const total = SECTION_02_QUESTIONS.length;
  const isComplete = answered === total;

  function setAnswer(id: string, value: YesNo) {
    update((prev) => ({
      ...prev,
      section02: { ...prev.section02, [id]: value },
    }));
  }

  return (
    <main className="flex min-h-dvh flex-col bg-linear-to-b from-amber-50 via-orange-50/50 to-rose-50">
      {/* 헤더 */}
      <header className="sticky top-0 z-10 border-b border-orange-100/70 bg-amber-50/80 pt-[env(safe-area-inset-top)] backdrop-blur-sm">
        <div className="mx-auto flex w-full max-w-md items-center gap-2 px-4 py-3">
          <button
            type="button"
            onClick={() => router.push(PREV_STEP)}
            aria-label="뒤로 가기"
            className="flex size-11 shrink-0 items-center justify-center rounded-full text-zinc-600 transition-colors hover:bg-orange-100/70 focus-visible:ring-3 focus-visible:ring-ring/30 focus-visible:outline-none active:bg-orange-100"
          >
            <ArrowLeft className="size-5" />
          </button>
          <div className="flex-1">
            <p className="text-xs font-medium text-orange-700">2 / 8 단계</p>
            <h1 className="text-base font-bold text-zinc-900">초기 상담 기본 확인</h1>
          </div>
        </div>
        <StepProgress step={2} total={8} className="h-1 rounded-none bg-orange-100" />
      </header>

      {/* 본문 */}
      <div className="mx-auto w-full max-w-md flex-1 px-5 pt-6 pb-32">
        <p className="text-sm leading-relaxed text-zinc-600">
          아이에 대해 해당하는 내용을 예/아니요로 선택해주세요.
        </p>

        <section className="mt-6 space-y-7 rounded-3xl bg-white/85 p-5 ring-1 ring-zinc-200/70">
          {SECTION_02_QUESTIONS.map((q, i) => (
            <YesNoQuestion
              key={q.id}
              index={i + 1}
              text={q.text}
              value={answers[q.id]}
              onChange={(value) => setAnswer(q.id, value)}
            />
          ))}
        </section>
      </div>

      {/* 하단 고정 CTA */}
      <div className="fixed inset-x-0 bottom-0 border-t border-orange-100/70 bg-amber-50/90 backdrop-blur-sm">
        <div className="mx-auto w-full max-w-md px-5 pt-3 pb-[max(1rem,env(safe-area-inset-bottom))]">
          <p className="mb-2 text-center text-xs font-medium text-zinc-500 tabular-nums">
            {answered} / {total} 응답
          </p>
          <Button
            type="button"
            disabled={!isComplete}
            onClick={() => router.push(NEXT_STEP)}
            className="h-14 w-full gap-2 rounded-2xl text-[1.05rem] font-semibold shadow-lg shadow-orange-900/15 hover:bg-orange-800 disabled:bg-zinc-300 disabled:text-zinc-500 disabled:opacity-100 disabled:shadow-none"
          >
            다음
            <ArrowRight className="size-5" strokeWidth={2.2} />
          </Button>
        </div>
      </div>
    </main>
  );
}
