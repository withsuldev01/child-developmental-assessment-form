"use client";

import type { LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";

/**
 * 03 주호소 영역 선별용 아이콘 카드. 복수 선택 토글(체크박스 의미론).
 * 큰 터치 타깃과 명확한 선택 상태로 한 손 조작을 고려한다(NFR 모바일 UX).
 * 선택 상태는 색에만 의존하지 않도록 테두리·배경·아이콘을 함께 강조한다.
 */
export function ConcernCard({
  label,
  description,
  icon: Icon,
  selected,
  onToggle,
}: {
  label: string;
  /** 스크린리더용 전체 문항 텍스트(원본). 시각적으로는 숨김. */
  description: string;
  icon: LucideIcon;
  selected: boolean;
  onToggle: () => void;
}) {
  function handleClick() {
    // 키오스크 터치 확인용 가벼운 햅틱(미지원 기기는 무시됨).
    navigator.vibrate?.(10);
    onToggle();
  }

  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={selected}
      onClick={handleClick}
      className={cn(
        "flex aspect-square flex-col items-center justify-center gap-3 rounded-3xl border-2 p-4 text-center transition-[colors,transform] duration-150 focus-visible:ring-3 focus-visible:ring-ring/30 focus-visible:outline-none active:scale-[0.98]",
        selected
          ? "border-primary bg-primary/10 shadow-sm active:bg-primary/15"
          : "border-zinc-200 bg-white hover:border-orange-200 hover:bg-orange-50/50 active:bg-orange-50",
      )}
    >
      <Icon
        className={cn(
          "size-9 transition-colors",
          selected ? "text-primary" : "text-zinc-500",
        )}
        strokeWidth={1.8}
        aria-hidden
      />
      <span
        className={cn(
          "text-[0.95rem] font-semibold transition-colors",
          selected ? "text-primary" : "text-zinc-700",
        )}
      >
        {label}
      </span>
      <span className="sr-only">{description}</span>
    </button>
  );
}
