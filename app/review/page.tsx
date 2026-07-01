"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, Check, Pencil } from "lucide-react";

import { StepProgress } from "@/components/step-progress";
import { Button } from "@/components/ui/button";
import {
  DOMAIN_TITLES,
  SECTION_02_QUESTIONS,
  SECTION_03_QUESTIONS,
  SECTION_04_QUESTIONS,
  formatMediaTime,
  getSelectedDomains,
} from "@/lib/questions";
import {
  calcAge,
  formatAge,
  useConsultationForm,
} from "@/lib/consultation-form";

const PREV_STEP = "/additional";
const NEXT_STEP = "/complete";

function formatBirth(iso: string | null): string {
  if (!iso) return "-";
  const [y, m, d] = iso.split("-");
  return `${y}년 ${Number(m)}월 ${Number(d)}일`;
}

export default function ReviewPage() {
  const router = useRouter();
  const { form } = useConsultationForm();
  const bi = form.basicInfo;
  const age = calcAge(bi.birthDate);

  const domains = getSelectedDomains(form.section03);
  const yes02 = SECTION_02_QUESTIONS.filter((q) => form.section02[q.id] === "yes");
  const yes03 = SECTION_03_QUESTIONS.filter((q) => form.section03[q.id] === "yes");

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
            <p className="text-xs font-medium text-orange-700">7 / 8 단계</p>
            <h1 className="text-base font-bold text-zinc-900">작성 내용 검토</h1>
          </div>
        </div>
        <StepProgress step={7} total={8} className="h-1 rounded-none bg-orange-100" />
      </header>

      {/* 본문 */}
      <div className="mx-auto w-full max-w-md flex-1 px-5 pt-6 pb-32">
        <p className="text-sm leading-relaxed text-zinc-600">
          작성하신 내용을 확인하고, 수정이 필요하면 각 항목의{" "}
          <span className="font-semibold text-zinc-800">수정</span>을 눌러주세요.
        </p>

        {/* 기본 정보 */}
        <Section title="기본 정보" onEdit={() => router.push("/info")}>
          <dl className="space-y-2.5">
            <Row label="아동 이름" value={bi.childName || "-"} />
            <Row
              label="성별"
              value={bi.gender === "male" ? "남자" : bi.gender === "female" ? "여자" : "-"}
            />
            <Row
              label="생년월일"
              value={
                age
                  ? `${formatBirth(bi.birthDate)} (${formatAge(age)})`
                  : formatBirth(bi.birthDate)
              }
            />
            <Row label="보호자 이름" value={bi.guardianName || "-"} />
            <Row label="보호자 연락처" value={bi.guardianPhone || "-"} />
          </dl>
        </Section>

        {/* 02. 초기 상담 기본 확인 */}
        <Section
          title="초기 상담 기본 확인"
          caption={`${SECTION_02_QUESTIONS.length}문항 중 ${yes02.length}개 “예”`}
          onEdit={() => router.push("/basic-check")}
        >
          {yes02.length > 0 ? (
            <YesList items={yes02.map((q) => q.text)} />
          ) : (
            <Empty>“예”로 응답한 항목이 없습니다.</Empty>
          )}
        </Section>

        {/* 03. 주호소 영역 빠른 선별 */}
        <Section
          title="걱정되는 영역"
          caption={`${yes03.length}개 선택`}
          onEdit={() => router.push("/screening")}
        >
          <div className="flex flex-wrap gap-2">
            {yes03.map((q) => (
              <span
                key={q.id}
                className="rounded-full bg-primary/10 px-3 py-1.5 text-sm font-semibold text-primary"
              >
                {q.shortLabel}
              </span>
            ))}
          </div>
        </Section>

        {/* 04. 영역별 상세 (선택 영역이 있을 때만) */}
        {domains.length > 0 && (
          <Section title="영역별 상세 체크">
            <div className="space-y-5">
              {domains.map((domain) => {
                const all = SECTION_04_QUESTIONS[domain];
                const yes = all.filter(
                  (q) => form.section04[domain]?.[q.id] === "yes",
                );
                return (
                  <div key={domain}>
                    <div className="mb-2 flex items-center justify-between gap-2">
                      <h3 className="text-sm font-bold text-zinc-800">
                        {DOMAIN_TITLES[domain]}
                        <span className="ml-1.5 font-medium text-zinc-400">
                          {all.length}문항 중 {yes.length}개 “예”
                        </span>
                      </h3>
                      <EditButton
                        onClick={() => router.push(`/details/${domain}`)}
                      />
                    </div>
                    {yes.length > 0 ? (
                      <YesList items={yes.map((q) => q.text)} />
                    ) : (
                      <Empty>“예”로 응답한 항목이 없습니다.</Empty>
                    )}
                  </div>
                );
              })}
            </div>
          </Section>
        )}

        {/* 05. 생활습관 확인 */}
        <Section title="생활습관 확인" onEdit={() => router.push("/lifestyle")}>
          <dl className="space-y-2.5">
            <Row
              label="미디어 시청 시간"
              value={formatMediaTime(
                form.section05_lifestyle.mediaTime,
                form.section05_lifestyle.mediaTimeOtherText,
              )}
            />
          </dl>
        </Section>

        {/* 06. 추가 입력 */}
        <Section title="추가 입력" onEdit={() => router.push("/additional")}>
          <dl className="space-y-3">
            <NoteRow label="추가로 알리고 싶은 점" value={form.additional.note} />
            <NoteRow label="상담 희망사항" value={form.additional.hopes} />
          </dl>
        </Section>

        <p className="mt-5 px-1 text-xs leading-relaxed text-zinc-400">
          본 체크리스트는 초기상담 및 검사 방향 설정을 위한 참고자료이며, 자동
          점수화나 진단을 제공하지 않습니다.
        </p>
      </div>

      {/* 하단 고정 CTA */}
      <div className="fixed inset-x-0 bottom-0 border-t border-orange-100/70 bg-amber-50/90 backdrop-blur-sm">
        <div className="mx-auto w-full max-w-md px-5 pt-3 pb-[max(1rem,env(safe-area-inset-bottom))]">
          <Button
            type="button"
            onClick={() => router.push(NEXT_STEP)}
            className="h-14 w-full gap-2 rounded-2xl text-[1.05rem] font-semibold shadow-lg shadow-orange-900/15 hover:bg-orange-800"
          >
            제출하고 완료
            <ArrowRight className="size-5" strokeWidth={2.2} />
          </Button>
        </div>
      </div>
    </main>
  );
}

function Section({
  title,
  caption,
  onEdit,
  children,
}: {
  title: string;
  caption?: string;
  onEdit?: () => void;
  children: React.ReactNode;
}) {
  return (
    <section className="mt-5 rounded-3xl bg-white/85 p-5 ring-1 ring-zinc-200/70">
      <div className="mb-3.5 flex items-center justify-between gap-2">
        <div>
          <h2 className="text-base font-bold text-zinc-900">{title}</h2>
          {caption && (
            <p className="mt-0.5 text-xs font-medium text-zinc-400">{caption}</p>
          )}
        </div>
        {onEdit && <EditButton onClick={onEdit} />}
      </div>
      {children}
    </section>
  );
}

function EditButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex shrink-0 items-center gap-1 rounded-lg px-2.5 py-1.5 text-sm font-semibold text-orange-700 transition-colors hover:bg-orange-100/70 focus-visible:ring-3 focus-visible:ring-ring/30 focus-visible:outline-none active:bg-orange-100"
    >
      <Pencil className="size-3.5" strokeWidth={2.2} />
      수정
    </button>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-4">
      <dt className="shrink-0 text-sm text-zinc-500">{label}</dt>
      <dd className="text-right text-sm font-semibold text-zinc-800">{value}</dd>
    </div>
  );
}

function NoteRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="mb-1 text-sm text-zinc-500">{label}</dt>
      <dd
        className={
          value
            ? "text-sm leading-relaxed whitespace-pre-wrap text-zinc-800"
            : "text-sm text-zinc-400"
        }
      >
        {value || "작성한 내용 없음"}
      </dd>
    </div>
  );
}

function YesList({ items }: { items: string[] }) {
  return (
    <ul className="space-y-2">
      {items.map((text, i) => (
        <li key={i} className="flex gap-2 text-sm leading-relaxed text-zinc-800">
          <Check
            className="mt-0.5 size-4 shrink-0 text-primary"
            strokeWidth={2.5}
            aria-hidden
          />
          <span>{text}</span>
        </li>
      ))}
    </ul>
  );
}

function Empty({ children }: { children: React.ReactNode }) {
  return <p className="text-sm text-zinc-400">{children}</p>;
}
