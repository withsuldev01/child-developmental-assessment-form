"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, CircleCheckBig, FileText, RotateCcw } from "lucide-react";

import { StepProgress } from "@/components/step-progress";
import { PdfPreviewOverlay } from "@/components/pdf-preview-overlay";
import { Button } from "@/components/ui/button";
import { useConsultationForm } from "@/lib/consultation-form";

const PREV_STEP = "/review";

export default function CompletePage() {
  const router = useRouter();
  const { form, update, clear } = useConsultationForm();
  const [previewOpen, setPreviewOpen] = React.useState(false);

  // 완료 시각을 한 번 기록(작성일/PDF 표기용). 이미 있으면 그대로 둔다.
  React.useEffect(() => {
    update((prev) =>
      prev.meta.completedAt
        ? prev
        : {
            ...prev,
            meta: { ...prev.meta, completedAt: new Date().toISOString() },
          },
    );
  }, [update]);

  function handleReset() {
    clear();
    router.push("/");
  }

  return (
    <>
      {/* 완료 화면 (인쇄 시에는 오버레이만 출력되도록 숨김) */}
      <main className="flex min-h-dvh flex-col bg-linear-to-b from-amber-50 via-orange-50/50 to-rose-50 print:hidden">
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
              <p className="text-xs font-medium text-orange-700">7 / 7 단계</p>
              <h1 className="text-base font-bold text-zinc-900">작성 완료</h1>
            </div>
          </div>
          <StepProgress step={7} total={7} className="h-1 rounded-none bg-orange-100" />
        </header>

        {/* 본문 */}
        <div className="mx-auto flex w-full max-w-md flex-1 flex-col px-5 pb-32">
          <div className="flex flex-1 flex-col items-center justify-center text-center">
            <span className="flex size-20 items-center justify-center rounded-full bg-primary/10">
              <CircleCheckBig className="size-11 text-primary" strokeWidth={2} />
            </span>
            <h2 className="mt-5 text-2xl font-bold text-zinc-900">
              작성이 완료되었어요
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-zinc-600">
              아래 버튼을 눌러 작성 내용을 평가지 형태로 확인하고,
              <br />
              PDF로 저장하거나 인쇄해 보호자·상담사에게 공유하세요.
            </p>

            <Button
              type="button"
              onClick={() => setPreviewOpen(true)}
              className="mt-8 h-15 w-full max-w-xs gap-2.5 rounded-2xl text-[1.1rem] font-bold shadow-lg shadow-orange-900/20 hover:bg-orange-800"
            >
              <FileText className="size-5" strokeWidth={2.2} />
              문서 보기 · PDF 저장
            </Button>
          </div>
        </div>

        {/* 하단 고정 - 새 작성(초기화) */}
        <div className="fixed inset-x-0 bottom-0 bg-linear-to-t from-rose-50 to-transparent">
          <div className="mx-auto w-full max-w-md px-5 pt-3 pb-[max(1rem,env(safe-area-inset-bottom))]">
            <Button
              type="button"
              variant="ghost"
              onClick={handleReset}
              className="h-12 w-full gap-2 rounded-2xl text-base font-semibold text-zinc-500 hover:bg-white/60 hover:text-zinc-700"
            >
              <RotateCcw className="size-4" strokeWidth={2.2} />
              처음으로 (새 작성)
            </Button>
          </div>
        </div>
      </main>

      {previewOpen && (
        <PdfPreviewOverlay form={form} onClose={() => setPreviewOpen(false)} />
      )}
    </>
  );
}
