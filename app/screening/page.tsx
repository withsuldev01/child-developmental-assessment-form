"use client";

import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  Brain,
  Hand,
  Heart,
  type LucideIcon,
  PersonStanding,
  Speech,
  TriangleAlert,
  Users,
  Waves,
  Zap,
} from "lucide-react";

import { ConcernCard } from "@/components/concern-card";
import { StepProgress } from "@/components/step-progress";
import { Button } from "@/components/ui/button";
import { SECTION_03_QUESTIONS } from "@/lib/questions";
import { useConsultationForm } from "@/lib/consultation-form";

const PREV_STEP = "/basic-check";
// 04 상세 체크(03 선택 영역만 조건부 노출). 추후 구현.
const NEXT_STEP = "/details";

// 항목 id → 아이콘. 라벨·문항은 questions.ts(원본)에서 가져온다.
const ICONS: Record<string, LucideIcon> = {
  s1: Speech,
  s2: PersonStanding,
  s3: Hand,
  s4: Users,
  s5: Brain,
  s6: Zap,
  s7: Waves,
  s8: Heart,
  s9: TriangleAlert,
};

export default function ScreeningPage() {
  const router = useRouter();
  const { form, update } = useConsultationForm();
  const answers = form.section03;

  const selectedCount = SECTION_03_QUESTIONS.filter(
    (q) => answers[q.id] === "yes",
  ).length;
  const canProceed = selectedCount >= 1;

  function toggle(id: string) {
    update((prev) => {
      const next = { ...prev.section03 };
      if (next[id] === "yes") delete next[id];
      else next[id] = "yes";
      return { ...prev, section03: next };
    });
  }

  function handleNext() {
    if (!canProceed) return;
    // 미선택 항목을 "아니요"로 확정해 9항목 응답을 완성한다(PDF·검토용).
    update((prev) => {
      const filled = { ...prev.section03 };
      for (const q of SECTION_03_QUESTIONS) {
        filled[q.id] = filled[q.id] === "yes" ? "yes" : "no";
      }
      return { ...prev, section03: filled };
    });
    router.push(NEXT_STEP);
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
            <p className="text-xs font-medium text-orange-700">3 / 6 단계</p>
            <h1 className="text-base font-bold text-zinc-900">
              주호소 영역 빠른 선별
            </h1>
          </div>
        </div>
        <StepProgress step={3} total={6} className="h-1 rounded-none bg-orange-100" />
      </header>

      {/* 본문 */}
      <div className="mx-auto w-full max-w-md flex-1 px-5 pt-6 pb-32">
        <h2
          id="screening-heading"
          className="text-2xl leading-snug font-bold text-zinc-900"
        >
          어떤 점이 가장 걱정되시나요?
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-zinc-600">
          해당하는 항목을 모두 선택해주세요. (복수 선택 가능)
        </p>

        <div
          role="group"
          aria-labelledby="screening-heading"
          className="mt-6 grid grid-cols-2 gap-3"
        >
          {SECTION_03_QUESTIONS.map((q) => (
            <ConcernCard
              key={q.id}
              label={q.shortLabel}
              description={q.text}
              icon={ICONS[q.id]}
              selected={answers[q.id] === "yes"}
              onToggle={() => toggle(q.id)}
            />
          ))}
        </div>
      </div>

      {/* 하단 고정 CTA */}
      <div className="fixed inset-x-0 bottom-0 border-t border-orange-100/70 bg-amber-50/90 backdrop-blur-sm">
        <div className="mx-auto w-full max-w-md px-5 pt-3 pb-[max(1rem,env(safe-area-inset-bottom))]">
          <p
            aria-live="polite"
            className="mb-2 text-center text-xs font-medium text-zinc-500 tabular-nums"
          >
            {selectedCount > 0
              ? `${selectedCount}개 선택됨`
              : "최소 1개 이상 선택해주세요"}
          </p>
          <Button
            type="button"
            disabled={!canProceed}
            onClick={handleNext}
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
