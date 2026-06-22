"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight } from "lucide-react";

import { StepProgress } from "@/components/step-progress";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { getSelectedDomains } from "@/lib/questions";
import { useConsultationForm } from "@/lib/consultation-form";

const NEXT_STEP = "/review"; // 06 검토/요약 (추후 구현)
const MAX_LEN = 500;

export default function AdditionalPage() {
  const router = useRouter();
  const { form, update } = useConsultationForm();
  const { note, hopes } = form.additional;

  // 이전 단계: 선택한 영역이 있으면 마지막 상세 영역, 없으면 03 선별로.
  const domains = getSelectedDomains(form.section03);
  const prevStep =
    domains.length > 0 ? `/details/${domains[domains.length - 1]}` : "/screening";

  function setField(field: "note" | "hopes", value: string) {
    update((prev) => ({
      ...prev,
      additional: { ...prev.additional, [field]: value.slice(0, MAX_LEN) },
    }));
  }

  return (
    <main className="flex min-h-dvh flex-col bg-linear-to-b from-amber-50 via-orange-50/50 to-rose-50">
      {/* 헤더 */}
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
            <p className="text-xs font-medium text-orange-700">5 / 7 단계</p>
            <h1 className="text-base font-bold text-zinc-900">추가 입력</h1>
          </div>
        </div>
        <StepProgress step={5} total={7} className="h-1 rounded-none bg-orange-100" />
      </header>

      {/* 본문 */}
      <div className="mx-auto w-full max-w-md flex-1 px-5 pt-6 pb-32">
        <p className="text-sm leading-relaxed text-zinc-600">
          상담에 도움이 될 내용을 자유롭게 적어주세요. 모두 선택 입력입니다.
        </p>

        <section className="mt-6 space-y-6 rounded-3xl bg-white/85 p-5 ring-1 ring-zinc-200/70">
          <Note
            id="note"
            label="추가로 알리고 싶은 점"
            placeholder="아이의 특이사항, 가정에서의 모습 등 자유롭게 적어주세요."
            value={note}
            onChange={(v) => setField("note", v)}
          />
          <Note
            id="hopes"
            label="상담 희망사항"
            placeholder="이번 상담에서 가장 도움받고 싶은 점을 적어주세요."
            value={hopes}
            onChange={(v) => setField("hopes", v)}
          />
        </section>
      </div>

      {/* 하단 고정 CTA */}
      <div className="fixed inset-x-0 bottom-0 border-t border-orange-100/70 bg-amber-50/90 backdrop-blur-sm">
        <div className="mx-auto w-full max-w-md px-5 pt-3 pb-[max(1rem,env(safe-area-inset-bottom))]">
          <Button
            type="button"
            onClick={() => router.push(NEXT_STEP)}
            className="h-14 w-full gap-2 rounded-2xl text-[1.05rem] font-semibold shadow-lg shadow-orange-900/15 hover:bg-orange-800"
          >
            다음
            <ArrowRight className="size-5" strokeWidth={2.2} />
          </Button>
        </div>
      </div>
    </main>
  );
}

function Note({
  id,
  label,
  placeholder,
  value,
  onChange,
}: {
  id: string;
  label: string;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div>
      <Label htmlFor={id} className="mb-2 text-sm font-medium text-zinc-700">
        {label}
      </Label>
      <Textarea
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        maxLength={MAX_LEN}
        rows={4}
        className="rounded-xl"
      />
      <p className="mt-1.5 text-right text-xs text-zinc-400 tabular-nums">
        {value.length} / {MAX_LEN}
      </p>
    </div>
  );
}
