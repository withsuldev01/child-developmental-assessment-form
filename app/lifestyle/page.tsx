"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight } from "lucide-react";

import { StepProgress } from "@/components/step-progress";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import {
  MEDIA_TIME_DESCRIPTION,
  MEDIA_TIME_OPTIONS,
  MEDIA_TIME_QUESTION,
  getSelectedDomains,
} from "@/lib/questions";
import {
  useConsultationForm,
  type MediaTimeOption,
} from "@/lib/consultation-form";

const NEXT_STEP = "/additional";
const OTHER_MAX_LEN = 80;

export default function LifestylePage() {
  const router = useRouter();
  const { form, update } = useConsultationForm();
  const { mediaTime, mediaTimeOtherText } = form.section05_lifestyle;

  const domains = getSelectedDomains(form.section03);
  const prevStep =
    domains.length > 0 ? `/details/${domains[domains.length - 1]}` : "/screening";
  const canProceed =
    mediaTime !== null &&
    (mediaTime !== "other" || mediaTimeOtherText.trim().length > 0);

  function setMediaTime(value: MediaTimeOption) {
    update((prev) => ({
      ...prev,
      section05_lifestyle: {
        ...prev.section05_lifestyle,
        mediaTime: value,
      },
    }));
  }

  function setOtherText(value: string) {
    update((prev) => ({
      ...prev,
      section05_lifestyle: {
        ...prev.section05_lifestyle,
        mediaTimeOtherText: value.slice(0, OTHER_MAX_LEN),
      },
    }));
  }

  return (
    <main className="flex min-h-dvh flex-col bg-linear-to-b from-amber-50 via-orange-50/50 to-rose-50">
      <header className="sticky top-0 z-10 border-b border-orange-100/70 bg-amber-50/80 pt-[env(safe-area-inset-top)] backdrop-blur-sm">
        <div className="mx-auto flex w-full max-w-md items-center gap-2 px-4 py-3">
          <button
            type="button"
            onClick={() => router.push(prevStep)}
            aria-label="뒤로 가기"
            className="flex size-11 shrink-0 items-center justify-center rounded-full text-zinc-600 transition-colors hover:bg-orange-100/70 focus-visible:ring-3 focus-visible:ring-ring/30 focus-visible:outline-none active:bg-orange-100"
          >
            <ArrowLeft className="size-5" />
          </button>
          <div className="flex-1">
            <p className="text-xs font-medium text-orange-700">5 / 8 단계</p>
            <h1 className="text-base font-bold text-zinc-900">생활습관 확인</h1>
          </div>
        </div>
        <StepProgress step={5} total={8} className="h-1 rounded-none bg-orange-100" />
      </header>

      <div className="mx-auto w-full max-w-md flex-1 px-5 pt-6 pb-32">
        <h2
          id="media-time-heading"
          className="text-2xl leading-snug font-bold text-zinc-900"
        >
          {MEDIA_TIME_QUESTION}
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-zinc-600">
          {MEDIA_TIME_DESCRIPTION}
        </p>

        <section
          aria-labelledby="media-time-heading"
          className="mt-6 rounded-3xl bg-white/85 p-5 ring-1 ring-zinc-200/70"
        >
          <div role="radiogroup" className="space-y-3">
            {MEDIA_TIME_OPTIONS.map((option) => {
              const selected = mediaTime === option.value;
              return (
                <label
                  key={option.value}
                  className={cn(
                    "flex min-h-14 cursor-pointer items-center rounded-2xl border px-4 py-3 text-base font-semibold transition-colors has-[:focus-visible]:ring-3 has-[:focus-visible]:ring-ring/30",
                    selected
                      ? "border-primary bg-primary text-primary-foreground shadow-sm"
                      : "border-zinc-200 bg-white text-zinc-700 hover:border-orange-200 hover:bg-orange-50/50",
                  )}
                >
                  <input
                    type="radio"
                    name="mediaTime"
                    value={option.value}
                    checked={selected}
                    onChange={() => setMediaTime(option.value)}
                    className="sr-only"
                  />
                  {option.label}
                </label>
              );
            })}
          </div>

          {mediaTime === "other" && (
            <div className="mt-5">
              <Label
                htmlFor="mediaTimeOtherText"
                className="mb-2 text-sm font-medium text-zinc-700"
              >
                기타 내용
              </Label>
              <Input
                id="mediaTimeOtherText"
                value={mediaTimeOtherText}
                onChange={(e) => setOtherText(e.target.value)}
                placeholder="예: 평일 1시간, 주말 3시간 정도"
                maxLength={OTHER_MAX_LEN}
                className="h-13 rounded-xl px-4 text-base"
                aria-invalid={mediaTimeOtherText.trim().length === 0}
              />
              <p className="mt-1.5 text-right text-xs text-zinc-400 tabular-nums">
                {mediaTimeOtherText.length} / {OTHER_MAX_LEN}
              </p>
            </div>
          )}
        </section>
      </div>

      <div className="fixed inset-x-0 bottom-0 border-t border-orange-100/70 bg-amber-50/90 backdrop-blur-sm">
        <div className="mx-auto w-full max-w-md px-5 pt-3 pb-[max(1rem,env(safe-area-inset-bottom))]">
          <p
            aria-live="polite"
            className="mb-2 text-center text-xs font-medium text-zinc-500"
          >
            {canProceed ? "응답 완료" : "미디어 시청 시간을 선택해주세요"}
          </p>
          <Button
            type="button"
            disabled={!canProceed}
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
