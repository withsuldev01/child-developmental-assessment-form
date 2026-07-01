"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  CircleCheckBig,
  FileText,
  ImageDown,
  RotateCcw,
  Share2,
} from "lucide-react";

import { StepProgress } from "@/components/step-progress";
import { PdfPreviewOverlay } from "@/components/pdf-preview-overlay";
import { PrintableForm } from "@/components/printable-form";
import { Button } from "@/components/ui/button";
import { useConsultationForm } from "@/lib/consultation-form";
import {
  buildReportImageFileName,
  createReportImageFile,
  saveReportImage,
  saveReportImageFile,
  shareReportImageFile,
} from "@/lib/report-image";

const PREV_STEP = "/review";

export default function CompletePage() {
  const router = useRouter();
  const { form, update, clear } = useConsultationForm();
  const [previewOpen, setPreviewOpen] = React.useState(false);
  const [reportImageFile, setReportImageFile] = React.useState<File | null>(null);
  const [imagePreparing, setImagePreparing] = React.useState(true);
  const [imagePrepareError, setImagePrepareError] = React.useState(false);
  const [imageSaving, setImageSaving] = React.useState(false);
  const [imageSharing, setImageSharing] = React.useState(false);
  const [imageError, setImageError] = React.useState(false);
  const [shareError, setShareError] = React.useState(false);
  const imageSourceRef = React.useRef<HTMLDivElement>(null);
  const reportImageFileName = React.useMemo(
    () => buildReportImageFileName(form),
    [form],
  );

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

  React.useEffect(() => {
    const source = imageSourceRef.current;
    if (!source) return;

    let cancelled = false;
    const frame = window.requestAnimationFrame(() => {
      setReportImageFile(null);
      setImagePreparing(true);
      setImagePrepareError(false);
      setShareError(false);

      void createReportImageFile(source, reportImageFileName)
        .then((file) => {
          if (!cancelled) setReportImageFile(file);
        })
        .catch(() => {
          if (!cancelled) setImagePrepareError(true);
        })
        .finally(() => {
          if (!cancelled) setImagePreparing(false);
        });
    });

    return () => {
      cancelled = true;
      window.cancelAnimationFrame(frame);
    };
  }, [form, reportImageFileName]);

  function handleReset() {
    clear();
    router.push("/");
  }

  async function handleSaveImage() {
    const source = imageSourceRef.current;
    if (!source) return;

    try {
      setImageError(false);
      setImageSaving(true);
      if (reportImageFile) {
        saveReportImageFile(reportImageFile);
      } else {
        await saveReportImage(source, reportImageFileName);
      }
    } catch {
      setImageError(true);
    } finally {
      setImageSaving(false);
    }
  }

  async function handleShareImage() {
    const source = imageSourceRef.current;
    if (!source || !reportImageFile) return;

    try {
      setShareError(false);
      setImageSharing(true);
      await shareReportImageFile(reportImageFile);
    } catch {
      setShareError(true);
    } finally {
      setImageSharing(false);
    }
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
              <p className="text-xs font-medium text-orange-700">8 / 8 단계</p>
              <h1 className="text-base font-bold text-zinc-900">작성 완료</h1>
            </div>
          </div>
          <StepProgress step={8} total={8} className="h-1 rounded-none bg-orange-100" />
        </header>

        {/* 본문 */}
        <div className="mx-auto flex w-full max-w-md flex-1 flex-col px-5 pt-8 pb-28">
          <div className="flex flex-1 flex-col items-center justify-center text-center">
            <span className="flex size-20 items-center justify-center rounded-full bg-primary/10">
              <CircleCheckBig className="size-11 text-primary" strokeWidth={2} />
            </span>
            <h2 className="mt-5 text-2xl font-bold text-zinc-900">
              작성이 완료되었어요
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-zinc-600">
              아래 버튼을 눌러 작성 내용을 결과 문서로 확인하고,
              <br />
              PDF 또는 이미지로 저장해 보호자·상담사에게 공유하세요.
            </p>

            <Button
              type="button"
              onClick={() => setPreviewOpen(true)}
              className="mt-8 h-15 w-full max-w-xs gap-2.5 rounded-2xl text-[1.1rem] font-bold shadow-lg shadow-orange-900/20 hover:bg-orange-800"
            >
              <FileText className="size-5" strokeWidth={2.2} />
              결과 문서 보기
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={handleSaveImage}
              disabled={imageSaving || imageSharing}
              className="mt-3 h-14 w-full max-w-xs gap-2.5 rounded-2xl border-orange-200 bg-white/75 text-base font-bold text-primary shadow-sm hover:bg-orange-50"
            >
              <ImageDown className="size-5" strokeWidth={2.2} />
              {imageSaving ? "이미지 저장 중..." : "결과지 이미지로 저장"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={handleShareImage}
              disabled={
                imageSaving ||
                imageSharing ||
                imagePreparing ||
                imagePrepareError ||
                !reportImageFile
              }
              className="mt-3 h-14 w-full max-w-xs gap-2.5 rounded-2xl border-orange-200 bg-white/75 text-base font-bold text-primary shadow-sm hover:bg-orange-50"
            >
              <Share2 className="size-5" strokeWidth={2.2} />
              {imagePreparing
                ? "이미지 공유 준비 중..."
                : imageSharing
                  ? "이미지 공유 중..."
                  : "결과지 이미지 공유하기"}
            </Button>
            <p
              role="status"
              aria-live="polite"
              className="mt-3 min-h-5 text-xs leading-relaxed text-red-600"
            >
              {shareError
                ? "이 브라우저에서는 이미지 공유를 지원하지 않아요. 이미지 저장을 이용해주세요."
                : imagePrepareError
                  ? "이미지 공유 준비에 실패했어요. 이미지 저장을 이용해주세요."
                : imageError
                  ? "이미지 저장에 실패했어요. 결과 문서 보기에서 PDF 저장을 이용해주세요."
                  : ""}
            </p>
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

      <div
        ref={imageSourceRef}
        aria-hidden="true"
        className="pointer-events-none fixed top-0 left-[-10000px] w-[800px] bg-white p-6 print:hidden"
      >
        <PrintableForm form={form} />
      </div>

      {previewOpen && (
        <PdfPreviewOverlay form={form} onClose={() => setPreviewOpen(false)} />
      )}
    </>
  );
}
