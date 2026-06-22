"use client";

import * as React from "react";
import { Printer, X } from "lucide-react";

import { PrintableForm } from "@/components/printable-form";
import { Button } from "@/components/ui/button";
import type { ConsultationForm } from "@/lib/consultation-form";

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

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="PDF 미리보기"
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
        <p className="text-sm font-bold text-zinc-800">PDF 미리보기</p>
        <Button
          ref={printRef}
          type="button"
          onClick={() => window.print()}
          className="h-11 gap-2 rounded-xl px-4 font-semibold shadow-sm hover:bg-orange-800"
        >
          <Printer className="size-4" strokeWidth={2.2} />
          PDF 저장 · 인쇄
        </Button>
      </div>

      {/* 문서 (스크롤 영역 → 인쇄 시 static으로 풀림) */}
      <div className="flex-1 overflow-y-auto overscroll-contain p-4 print:flex-none print:overflow-visible print:p-0">
        <div className="mx-auto max-w-[800px] bg-white p-6 shadow-lg ring-1 ring-zinc-300 print:max-w-none print:p-0 print:shadow-none print:ring-0">
          <PrintableForm form={form} />
        </div>
      </div>
    </div>
  );
}
