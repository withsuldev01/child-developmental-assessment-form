"use client";

import * as React from "react";
import { ImageDown, Printer, Share2, X } from "lucide-react";

import { PrintableForm } from "@/components/printable-form";
import { Button } from "@/components/ui/button";
import type { ConsultationForm } from "@/lib/consultation-form";
import {
  buildReportImageFileName,
  createReportImageFile,
  saveReportImage,
  saveReportImageFile,
  shareReportImageFile,
} from "@/lib/report-image";

/**
 * 전체 화면 문서(평가지) 미리보기 + 인쇄 오버레이.
 * 인쇄 시에는 fixed/overflow를 풀어(static) 문서 전체가 여러 페이지로 출력되게 한다.
 */
export function PdfPreviewOverlay({
  form,
  onClose,
}: {
  form: ConsultationForm;
  onClose: () => void;
}) {
  const printRef = React.useRef<HTMLButtonElement>(null);
  const imageSourceRef = React.useRef<HTMLDivElement>(null);
  const [reportImageFile, setReportImageFile] = React.useState<File | null>(null);
  const [imagePreparing, setImagePreparing] = React.useState(true);
  const [imagePrepareError, setImagePrepareError] = React.useState(false);
  const [imageSaving, setImageSaving] = React.useState(false);
  const [imageSharing, setImageSharing] = React.useState(false);
  const [imageError, setImageError] = React.useState(false);
  const [shareError, setShareError] = React.useState(false);
  const reportImageFileName = React.useMemo(
    () => buildReportImageFileName(form),
    [form],
  );

  // ESC로 닫기 + 열려 있는 동안 배경 스크롤 잠금 + 인쇄 버튼에 포커스.
  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    printRef.current?.focus();
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [onClose]);

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
    <div
      role="dialog"
      aria-modal="true"
      aria-label="결과 문서"
      className="fixed inset-0 z-50 flex flex-col bg-zinc-200/95 backdrop-blur-sm print:static print:bg-white print:backdrop-blur-none"
    >
      {/* 상단 바 (인쇄 제외) */}
      <div className="flex items-center justify-between gap-2 border-b border-zinc-300 bg-white px-3 py-2.5 pt-[max(0.625rem,env(safe-area-inset-top))] print:hidden">
        <button
          type="button"
          onClick={onClose}
          aria-label="닫기"
          className="flex size-11 shrink-0 items-center justify-center rounded-full text-zinc-600 transition-colors hover:bg-zinc-100 focus-visible:ring-3 focus-visible:ring-ring/30 focus-visible:outline-none active:bg-zinc-200"
        >
          <X className="size-5" />
        </button>
        <p className="min-w-0 flex-1 text-center text-sm font-bold text-zinc-800">
          결과 문서
        </p>
        <div className="flex shrink-0 items-center gap-2">
          <Button
            type="button"
            variant="outline"
            aria-label="이미지 공유"
            onClick={handleShareImage}
            disabled={
              imageSaving ||
              imageSharing ||
              imagePreparing ||
              imagePrepareError ||
              !reportImageFile
            }
            className="size-11 rounded-xl border-orange-200 bg-white p-0 font-semibold text-primary shadow-sm hover:bg-orange-50 sm:w-auto sm:gap-1.5 sm:px-3"
          >
            <Share2 className="size-4" strokeWidth={2.2} />
            <span className="hidden sm:inline">
              {imagePreparing
                ? "공유 준비 중..."
                : imageSharing
                  ? "공유 중..."
                  : "이미지 공유"}
            </span>
          </Button>
          <Button
            type="button"
            variant="outline"
            aria-label="이미지로 저장"
            onClick={handleSaveImage}
            disabled={imageSaving || imageSharing}
            className="size-11 rounded-xl border-orange-200 bg-white p-0 font-semibold text-primary shadow-sm hover:bg-orange-50 sm:w-auto sm:gap-1.5 sm:px-3"
          >
            <ImageDown className="size-4" strokeWidth={2.2} />
            <span className="hidden sm:inline">
              {imageSaving ? "저장 중..." : "이미지로 저장"}
            </span>
          </Button>
          <Button
            ref={printRef}
            type="button"
            aria-label="PDF 저장 또는 인쇄"
            onClick={() => window.print()}
            className="size-11 rounded-xl p-0 font-semibold shadow-sm hover:bg-orange-800 sm:w-auto sm:gap-1.5 sm:px-3"
          >
            <Printer className="size-4" strokeWidth={2.2} />
            <span className="hidden sm:inline">PDF 저장 · 인쇄</span>
          </Button>
        </div>
      </div>

      {/* 문서 (스크롤 영역 → 인쇄 시 static으로 풀림) */}
      <div className="flex-1 overflow-y-auto overscroll-contain p-4 print:flex-none print:overflow-visible print:p-0">
        {imageError && (
          <p
            role="status"
            aria-live="polite"
            className="mx-auto mb-3 max-w-[800px] rounded-xl border border-red-100 bg-white px-3 py-2 text-sm text-red-600"
          >
            이미지 저장에 실패했어요. PDF 저장 · 인쇄를 이용해주세요.
          </p>
        )}
        {shareError && (
          <p
            role="status"
            aria-live="polite"
            className="mx-auto mb-3 max-w-[800px] rounded-xl border border-red-100 bg-white px-3 py-2 text-sm text-red-600"
          >
            이 브라우저에서는 이미지 공유를 지원하지 않아요. 이미지로 저장을
            이용해주세요.
          </p>
        )}
        {imagePrepareError && (
          <p
            role="status"
            aria-live="polite"
            className="mx-auto mb-3 max-w-[800px] rounded-xl border border-red-100 bg-white px-3 py-2 text-sm text-red-600"
          >
            이미지 공유 준비에 실패했어요. 이미지로 저장을 이용해주세요.
          </p>
        )}
        <div className="mx-auto max-w-[800px] bg-white shadow-lg ring-1 ring-zinc-300 print:max-w-none print:shadow-none print:ring-0">
          <div ref={imageSourceRef} className="bg-white p-6 print:p-0">
            <PrintableForm form={form} />
          </div>
        </div>
      </div>
    </div>
  );
}
