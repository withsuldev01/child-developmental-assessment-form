"use client";

import { cn } from "@/lib/utils";
import type { YesNo } from "@/lib/consultation-form";

const OPTIONS: { value: YesNo; label: string }[] = [
  { value: "yes", label: "예" },
  { value: "no", label: "아니요" },
];

/**
 * 예/아니요 단일 선택 문항. 02·03·04 모든 체크리스트 섹션에서 재사용한다.
 * 큰 터치 타깃(h-13)의 2분할 세그먼트로, 한 번에 응답하도록 한다(NFR 모바일 UX).
 * 미응답 상태에서 제출하면 `error`로 테두리를 강조하고 스크린리더에 안내한다.
 */
export function YesNoQuestion({
  index,
  text,
  value,
  onChange,
  error,
}: {
  /** 섹션 내 1-based 순번 (라벨·앵커용) */
  index: number;
  text: string;
  value: YesNo | undefined;
  onChange: (value: YesNo) => void;
  error?: boolean;
}) {
  const labelId = `question-${index}-label`;
  return (
    <div id={`question-${index}`} className="scroll-mt-28">
      <p
        id={labelId}
        className="flex gap-2 text-[0.975rem] leading-relaxed font-medium text-zinc-800"
      >
        <span className="shrink-0 font-bold text-orange-600 tabular-nums">
          {index}.
        </span>
        <span>{text}</span>
      </p>

      <div
        role="radiogroup"
        aria-labelledby={labelId}
        aria-invalid={error || undefined}
        className="mt-3 grid grid-cols-2 gap-3"
      >
        {OPTIONS.map((o) => {
          const selected = value === o.value;
          return (
            <label
              key={o.value}
              className={cn(
                "flex h-13 cursor-pointer items-center justify-center rounded-xl border text-base font-semibold transition-colors has-[:focus-visible]:ring-3 has-[:focus-visible]:ring-ring/30",
                selected
                  ? "border-primary bg-primary text-primary-foreground shadow-sm"
                  : error
                    ? "border-destructive/50 bg-white text-zinc-700 hover:bg-orange-50/50"
                    : "border-zinc-200 bg-white text-zinc-700 hover:border-orange-200 hover:bg-orange-50/50",
              )}
            >
              <input
                type="radio"
                name={`question-${index}`}
                value={o.value}
                checked={selected}
                onChange={() => onChange(o.value)}
                className="sr-only"
              />
              {o.label}
            </label>
          );
        })}
      </div>
    </div>
  );
}
