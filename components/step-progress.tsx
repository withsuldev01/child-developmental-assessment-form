"use client";

import * as React from "react";

import { Progress } from "@/components/ui/progress";

/**
 * 설문 단계 진행률 바.
 * 마운트 시 이전 단계 값에서 현재 단계 값으로 차오르며 애니메이션된다
 * (페이지 전환마다 한 칸씩 채워지는 느낌).
 */
export function StepProgress({
  step,
  total,
  className,
}: {
  step: number;
  total: number;
  className?: string;
}) {
  const target = Math.round((step / total) * 100);
  const previous = Math.round(((step - 1) / total) * 100);

  // 이전 단계 값에서 시작 → 마운트 후 현재 값으로 전환
  const [value, setValue] = React.useState(previous);
  React.useEffect(() => {
    const id = requestAnimationFrame(() => setValue(target));
    return () => cancelAnimationFrame(id);
  }, [target]);

  return (
    <Progress
      value={value}
      className={className}
      aria-label={`전체 ${total}단계 중 ${step}단계`}
    />
  );
}
