"use client";

import * as React from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight } from "lucide-react";

import { YesNoQuestion } from "@/components/yes-no-question";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  DOMAIN_TITLES,
  SECTION_04_QUESTIONS,
  getSelectedDomains,
} from "@/lib/questions";
import {
  loadForm,
  useConsultationForm,
  type DomainKey,
  type YesNo,
} from "@/lib/consultation-form";

const SCREENING_STEP = "/screening";
const REVIEW_STEP = "/review"; // 검토/요약 (추후 구현)

// 전체 6단계 중 04 상세는 4단계 (영역 수와 무관하게 고정).
const MAIN_STEP = 4;
const MAIN_TOTAL = 6;

// 영역 간 이동 시 스크롤 위치 복원용(클라이언트 모듈 수명 동안 유지).
const scrollPositions = new Map<string, number>();

export default function DetailPage() {
  const router = useRouter();
  const params = useParams<{ domain: string }>();
  const domain = params.domain as DomainKey;
  const { form, update } = useConsultationForm();

  const headingRef = React.useRef<HTMLHeadingElement>(null);
  // "다음"을 눌렀는데 미응답이 있을 때만 오류 강조를 켠다(처음부터 빨갛게 두지 않음).
  // 오류를 표시한 영역을 기억해, 영역이 바뀌면 자동으로 꺼지도록 파생값으로 둔다.
  const [errorDomain, setErrorDomain] = React.useState<string | null>(null);
  const showErrors = errorDomain === domain;

  // 잘못된/미선택 영역 접근 방어. 렌더 스냅샷이 아닌 sessionStorage 원본으로 판단해
  // 하이드레이션 타이밍에 잘못 리다이렉트되는 것을 막는다.
  React.useEffect(() => {
    const domains = getSelectedDomains(loadForm().section03);
    if (domains.length === 0) router.replace(REVIEW_STEP);
    else if (!domains.includes(domain)) router.replace(`/details/${domains[0]}`);
  }, [domain, router]);

  // 영역이 바뀌면: 스크롤 복원 + 제목으로 포커스 이동(스크린리더에 새 영역 시작 안내).
  React.useEffect(() => {
    window.scrollTo(0, scrollPositions.get(domain) ?? 0);
    headingRef.current?.focus({ preventScroll: true });
  }, [domain]);

  const questions = SECTION_04_QUESTIONS[domain];
  const domains = getSelectedDomains(form.section03);
  const index = domains.indexOf(domain);
  const answers = form.section04[domain] ?? {};

  // 단일 진행 바: 03 완료(3/6)에서 시작해 영역을 하나씩 지날 때마다 4/6까지 차오른다.
  const barTotal = domains.length || 1;
  const barTarget = Math.round(
    ((MAIN_STEP - 1 + (index + 1) / barTotal) / MAIN_TOTAL) * 100,
  );
  const barStart = Math.round(
    ((MAIN_STEP - 1 + Math.max(index, 0) / barTotal) / MAIN_TOTAL) * 100,
  );
  const [barValue, setBarValue] = React.useState(barStart);
  React.useEffect(() => {
    const id = requestAnimationFrame(() => setBarValue(barTarget));
    return () => cancelAnimationFrame(id);
  }, [barTarget]);

  // 유효하지 않은 영역이면 위 effect가 리다이렉트하는 동안 아무것도 그리지 않는다.
  if (!questions) return null;

  const answered = questions.filter((q) => answers[q.id]).length;
  const total = questions.length;
  const isComplete = answered === total;
  const isLast = index === domains.length - 1;

  function setAnswer(id: string, value: YesNo) {
    update((prev) => ({
      ...prev,
      section04: {
        ...prev.section04,
        [domain]: { ...prev.section04[domain], [id]: value },
      },
    }));
  }

  function goPrev() {
    scrollPositions.set(domain, window.scrollY);
    if (index <= 0) router.push(SCREENING_STEP);
    else router.push(`/details/${domains[index - 1]}`);
  }

  function goNext() {
    if (!isComplete) {
      // 미응답이 있으면 진행 막고, 첫 미응답 문항으로 스크롤 + 오류 강조.
      setErrorDomain(domain);
      const firstUnanswered = questions.findIndex((q) => !answers[q.id]);
      if (firstUnanswered >= 0) {
        document
          .getElementById(`question-${firstUnanswered + 1}`)
          ?.scrollIntoView({ behavior: "smooth", block: "start" });
      }
      return;
    }
    scrollPositions.set(domain, window.scrollY);
    if (isLast) router.push(REVIEW_STEP);
    else router.push(`/details/${domains[index + 1]}`);
  }

  return (
    <main className="flex min-h-dvh flex-col bg-linear-to-b from-amber-50 via-orange-50/50 to-rose-50">
      {/* 헤더 */}
      <header className="sticky top-0 z-10 border-b border-orange-100/70 bg-amber-50/80 pt-[env(safe-area-inset-top)] backdrop-blur-sm">
        <div className="mx-auto flex w-full max-w-md items-center gap-2 px-4 py-3">
          <button
            type="button"
            onClick={goPrev}
            aria-label="뒤로 가기"
            className="flex size-11 shrink-0 items-center justify-center rounded-full text-zinc-600 transition-colors hover:bg-orange-100/70 focus-visible:ring-3 focus-visible:ring-ring/30 focus-visible:outline-none active:bg-orange-100"
          >
            <ArrowLeft className="size-5" />
          </button>
          <div className="flex-1">
            <p className="text-xs font-medium text-orange-700">
              {MAIN_STEP} / {MAIN_TOTAL} 단계
              {domains.length > 0 && (
                <span className="text-orange-400">
                  {" · "}영역 {index + 1} / {domains.length}
                </span>
              )}
            </p>
            <h1
              ref={headingRef}
              tabIndex={-1}
              className="text-base font-bold text-zinc-900 outline-none"
            >
              {DOMAIN_TITLES[domain]}
            </h1>
          </div>
        </div>
        <Progress
          value={barValue}
          aria-label={
            `전체 ${MAIN_TOTAL}단계 중 ${MAIN_STEP}단계` +
            (domains.length > 1 ? `, 영역 ${index + 1} / ${domains.length}` : "")
          }
          className="h-1 rounded-none bg-orange-100"
        />
      </header>

      {/* 본문 */}
      <div className="mx-auto w-full max-w-md flex-1 px-5 pt-6 pb-32">
        <p className="text-sm leading-relaxed text-zinc-600">
          <span className="font-semibold text-zinc-800">
            {DOMAIN_TITLES[domain]}
          </span>{" "}
          영역에 대해 해당하는 내용을 예/아니요로 선택해주세요.
        </p>

        <section className="mt-6 space-y-7 rounded-3xl bg-white/85 p-5 ring-1 ring-zinc-200/70">
          {questions.map((q, i) => (
            <YesNoQuestion
              key={q.id}
              index={i + 1}
              text={q.text}
              value={answers[q.id]}
              onChange={(value) => setAnswer(q.id, value)}
              error={showErrors && !answers[q.id]}
            />
          ))}
        </section>
      </div>

      {/* 하단 고정 CTA */}
      <div className="fixed inset-x-0 bottom-0 border-t border-orange-100/70 bg-amber-50/90 backdrop-blur-sm">
        <div className="mx-auto w-full max-w-md px-5 pt-3 pb-[max(1rem,env(safe-area-inset-bottom))]">
          {showErrors && !isComplete ? (
            <p
              role="alert"
              className="mb-2 text-center text-xs font-semibold text-destructive"
            >
              응답하지 않은 {total - answered}개 문항이 있어요.
            </p>
          ) : (
            <p
              aria-live="polite"
              className="mb-2 text-center text-xs font-medium text-zinc-500 tabular-nums"
            >
              {answered} / {total} 응답
            </p>
          )}
          <Button
            type="button"
            onClick={goNext}
            aria-disabled={!isComplete}
            className="h-14 w-full gap-2 rounded-2xl text-[1.05rem] font-semibold shadow-lg shadow-orange-900/15 hover:bg-orange-800"
          >
            {isLast ? "검토하기" : "다음 영역"}
            <ArrowRight className="size-5" strokeWidth={2.2} />
          </Button>
        </div>
      </div>
    </main>
  );
}
