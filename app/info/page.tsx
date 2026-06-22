"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight } from "lucide-react";

import { StepProgress } from "@/components/step-progress";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import {
  calcAge,
  formatAge,
  useConsultationForm,
  type Gender,
} from "@/lib/consultation-form";

// 다음 단계(02. 초기 상담 기본 확인) 경로. 해당 페이지는 추후 구현.
const NEXT_STEP = "/basic-check";

// 생년월일 연도 선택 범위: 올해부터 18년 전까지 (아동 대상).
const CURRENT_YEAR = new Date().getFullYear();
const YEARS = Array.from({ length: 19 }, (_, i) => CURRENT_YEAR - i);
const MONTHS = Array.from({ length: 12 }, (_, i) => i + 1);

function daysInMonth(year: number, month: number): number {
  if (!year || !month) return 31;
  return new Date(year, month, 0).getDate();
}

const PHONE_RE = /^01\d-\d{3,4}-\d{4}$/;

/** 숫자만 추출해 휴대폰 번호 형식(3-4-4)으로 하이픈을 넣는다. */
function formatPhone(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 11);
  if (digits.length < 4) return digits;
  if (digits.length < 8) return `${digits.slice(0, 3)}-${digits.slice(3)}`;
  return `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7)}`;
}

const pad2 = (n: string | number) => String(n).padStart(2, "0");

type FieldErrors = {
  childName?: string;
  gender?: string;
  birthDate?: string;
  guardianName?: string;
  guardianPhone?: string;
};

export default function InfoPage() {
  const router = useRouter();
  const { form, updateBasicInfo } = useConsultationForm();
  const bi = form.basicInfo;

  const [submitted, setSubmitted] = React.useState(false);
  const [errors, setErrors] = React.useState<FieldErrors>({});

  // 생년월일은 연/월/일 부분 선택을 로컬에서 관리하고, 셋이 모두 채워지면 ISO로 커밋한다.
  const [birth, setBirth] = React.useState({ y: "", m: "", d: "" });

  // 스토어의 birthDate(하이드레이션·뒤로가기 복원 등)가 바뀌면 셀렉트 상태를 맞춘다.
  // 렌더 중 동기화 패턴 — 부분 선택 중(birthDate=null)에는 로컬 값을 덮어쓰지 않는다.
  const [syncedDate, setSyncedDate] = React.useState<string | null>("\0");
  if (bi.birthDate !== syncedDate) {
    setSyncedDate(bi.birthDate);
    if (bi.birthDate) {
      const [y, m, d] = bi.birthDate.split("-");
      setBirth({ y, m, d });
    }
  }

  const age = calcAge(bi.birthDate);

  // 모든 필수 항목이 유효해야 "다음" 활성화 (렌더 중 상태 변경 없이 계산만)
  const isValid =
    bi.childName.trim() !== "" &&
    bi.gender !== null &&
    age !== null &&
    bi.guardianName.trim() !== "" &&
    PHONE_RE.test(bi.guardianPhone);

  function commitBirth(next: { y: string; m: string; d: string }) {
    // 선택한 월의 마지막 날을 넘는 일자는 보정
    const maxDay = daysInMonth(Number(next.y), Number(next.m));
    if (next.d && Number(next.d) > maxDay) next.d = pad2(maxDay);

    setBirth(next);
    const birthDate =
      next.y && next.m && next.d ? `${next.y}-${next.m}-${next.d}` : null;
    updateBasicInfo({ birthDate });
    if (submitted) validate({ birthDate });
  }

  function validate(overrides?: { birthDate?: string | null }): FieldErrors {
    const birthDate =
      overrides && "birthDate" in overrides ? overrides.birthDate : bi.birthDate;
    const next: FieldErrors = {};

    if (!bi.childName.trim()) next.childName = "아동 이름을 입력해주세요.";
    if (!bi.gender) next.gender = "성별을 선택해주세요.";
    if (!birthDate) {
      next.birthDate = "생년월일을 선택해주세요.";
    } else if (!calcAge(birthDate)) {
      next.birthDate = "올바른 생년월일을 선택해주세요.";
    }
    if (!bi.guardianName.trim()) next.guardianName = "보호자 이름을 입력해주세요.";
    if (!bi.guardianPhone.trim()) {
      next.guardianPhone = "연락처를 입력해주세요.";
    } else if (!PHONE_RE.test(bi.guardianPhone)) {
      next.guardianPhone = "올바른 휴대폰 번호를 입력해주세요.";
    }

    setErrors(next);
    return next;
  }

  function handleNext() {
    setSubmitted(true);
    const next = validate();
    if (Object.keys(next).length > 0) {
      // 첫 오류 필드로 이동 + 포커스 (스크린리더 사용자도 바로 인지)
      const firstKey = Object.keys(next)[0];
      document
        .getElementById(`field-${firstKey}`)
        ?.scrollIntoView({ behavior: "smooth", block: "center" });
      document
        .getElementById(`input-${firstKey}`)
        ?.focus({ preventScroll: true });
      return;
    }
    router.push(NEXT_STEP);
  }

  const maxDay = daysInMonth(Number(birth.y), Number(birth.m));
  const DAYS = Array.from({ length: maxDay }, (_, i) => i + 1);

  return (
    <main className="flex min-h-dvh flex-col bg-linear-to-b from-amber-50 via-orange-50/50 to-rose-50">
      {/* 헤더 (상단 세이프에어리어 확보) */}
      <header className="sticky top-0 z-10 border-b border-orange-100/70 bg-amber-50/80 pt-[env(safe-area-inset-top)] backdrop-blur-sm">
        <div className="mx-auto flex w-full max-w-md items-center gap-2 px-4 py-3">
          <button
            type="button"
            onClick={() => router.push("/")}
            aria-label="뒤로 가기"
            className="flex size-11 shrink-0 items-center justify-center rounded-full text-zinc-600 transition-colors hover:bg-orange-100/70 focus-visible:ring-3 focus-visible:ring-ring/30 focus-visible:outline-none active:bg-orange-100"
          >
            <ArrowLeft className="size-5" />
          </button>
          <div className="flex-1">
            <p className="text-xs font-medium text-orange-700">1 / 7 단계</p>
            <h1 className="text-base font-bold text-zinc-900">기본 정보</h1>
          </div>
        </div>
        {/* 진행률 */}
        <StepProgress step={1} total={7} className="h-1 rounded-none bg-orange-100" />
      </header>

      {/* 본문 */}
      <div className="mx-auto w-full max-w-md flex-1 px-5 pt-6 pb-32">
        <p className="text-sm leading-relaxed text-zinc-600">
          아이와 보호자님의 기본 정보를 입력해주세요.
        </p>

        {/* 아동 정보 */}
        <section className="mt-6 space-y-5 rounded-3xl bg-white/85 p-5 ring-1 ring-zinc-200/70">
          <h2 className="text-sm font-semibold text-zinc-600">아동 정보</h2>

          {/* 아동 이름 */}
          <Field name="childName" label="아동 이름" required error={errors.childName}>
            {(field) => (
              <Input
                {...field}
                value={bi.childName}
                onChange={(e) => updateBasicInfo({ childName: e.target.value })}
                onBlur={() => submitted && validate()}
                placeholder="이름"
                autoComplete="off"
                className="h-13 rounded-xl px-4 text-base"
              />
            )}
          </Field>

          {/* 성별 (네이티브 라디오로 그룹 시맨틱 + 키보드 지원) */}
          <Field name="gender" label="성별" required error={errors.gender}>
            {(field) => (
              <div
                role="radiogroup"
                aria-label="성별"
                aria-describedby={field["aria-describedby"]}
                className="grid grid-cols-2 gap-3"
              >
                {(["male", "female"] as Gender[]).map((g, i) => {
                  const selected = bi.gender === g;
                  return (
                    <label
                      key={g}
                      className={cn(
                        "flex h-13 cursor-pointer items-center justify-center rounded-xl border text-base font-semibold transition-colors has-[:focus-visible]:ring-3 has-[:focus-visible]:ring-ring/30",
                        selected
                          ? "border-primary bg-primary text-primary-foreground shadow-sm"
                          : "border-zinc-200 bg-white text-zinc-700 hover:border-orange-200 hover:bg-orange-50/50",
                      )}
                    >
                      <input
                        type="radio"
                        name="gender"
                        value={g}
                        checked={selected}
                        id={i === 0 ? field.id : undefined}
                        onChange={() => {
                          updateBasicInfo({ gender: g });
                          if (submitted)
                            setErrors((p) => ({ ...p, gender: undefined }));
                        }}
                        className="sr-only"
                      />
                      {g === "male" ? "남자" : "여자"}
                    </label>
                  );
                })}
              </div>
            )}
          </Field>

          {/* 생년월일 */}
          <Field name="birthDate" label="생년월일" required error={errors.birthDate}>
            {(field) => (
              <>
                <div
                  role="group"
                  aria-label="생년월일"
                  aria-describedby={field["aria-describedby"]}
                  className="grid grid-cols-3 gap-2"
                >
                  <BirthSelect
                    id={field.id}
                    ariaLabel="출생 연도"
                    value={birth.y}
                    placeholder="년"
                    onChange={(y) => commitBirth({ ...birth, y })}
                    options={YEARS.map((y) => ({
                      value: String(y),
                      label: `${y}년`,
                    }))}
                    invalid={!!errors.birthDate}
                  />
                  <BirthSelect
                    ariaLabel="출생 월"
                    value={birth.m}
                    placeholder="월"
                    onChange={(m) => commitBirth({ ...birth, m: pad2(m) })}
                    options={MONTHS.map((m) => ({
                      value: pad2(m),
                      label: `${m}월`,
                    }))}
                    invalid={!!errors.birthDate}
                  />
                  <BirthSelect
                    ariaLabel="출생 일"
                    value={birth.d}
                    placeholder="일"
                    onChange={(d) => commitBirth({ ...birth, d: pad2(d) })}
                    options={DAYS.map((d) => ({
                      value: pad2(d),
                      label: `${d}일`,
                    }))}
                    invalid={!!errors.birthDate}
                  />
                </div>
                {age && (
                  <p className="mt-2.5 inline-flex items-center rounded-lg bg-orange-100/70 px-3 py-1.5 text-sm font-semibold text-orange-800">
                    {formatAge(age)}
                  </p>
                )}
              </>
            )}
          </Field>
        </section>

        {/* 보호자 정보 */}
        <section className="mt-5 space-y-5 rounded-3xl bg-white/85 p-5 ring-1 ring-zinc-200/70">
          <h2 className="text-sm font-semibold text-zinc-600">보호자 정보</h2>

          {/* 보호자 이름 */}
          <Field
            name="guardianName"
            label="보호자 이름"
            required
            error={errors.guardianName}
          >
            {(field) => (
              <Input
                {...field}
                value={bi.guardianName}
                onChange={(e) =>
                  updateBasicInfo({ guardianName: e.target.value })
                }
                onBlur={() => submitted && validate()}
                placeholder="이름"
                autoComplete="off"
                className="h-13 rounded-xl px-4 text-base"
              />
            )}
          </Field>

          {/* 보호자 연락처 */}
          <Field
            name="guardianPhone"
            label="보호자 연락처"
            required
            error={errors.guardianPhone}
          >
            {(field) => (
              <Input
                {...field}
                value={bi.guardianPhone}
                onChange={(e) =>
                  updateBasicInfo({ guardianPhone: formatPhone(e.target.value) })
                }
                onBlur={() => submitted && validate()}
                placeholder="010-1234-5678"
                type="tel"
                inputMode="numeric"
                autoComplete="off"
                className="h-13 rounded-xl px-4 text-base tabular-nums"
              />
            )}
          </Field>
        </section>
      </div>

      {/* 하단 고정 CTA */}
      <div className="fixed inset-x-0 bottom-0 border-t border-orange-100/70 bg-amber-50/90 backdrop-blur-sm">
        <div className="mx-auto w-full max-w-md px-5 pt-3 pb-[max(1rem,env(safe-area-inset-bottom))]">
          <Button
            type="button"
            disabled={!isValid}
            onClick={handleNext}
            className="h-14 w-full gap-2 rounded-2xl text-[1.05rem] font-semibold shadow-lg shadow-orange-900/15 hover:bg-orange-800 disabled:bg-zinc-300 disabled:text-zinc-500 disabled:opacity-100 disabled:shadow-none"
          >
            다음
            <ArrowRight className="size-5" strokeWidth={2.2} />
          </Button>
        </div>
      </div>
    </main>
  );
}

type FieldRenderProps = {
  id: string;
  "aria-describedby"?: string;
  "aria-invalid"?: true;
};

/** 라벨 + 필수 표시 + 인라인 오류(스크린리더 announce)를 묶는 필드 래퍼 */
function Field({
  name,
  label,
  required,
  error,
  children,
}: {
  name: string;
  label: string;
  required?: boolean;
  error?: string;
  children: (props: FieldRenderProps) => React.ReactNode;
}) {
  const controlId = `input-${name}`;
  const errorId = `error-${name}`;
  return (
    <div id={`field-${name}`} className="scroll-mt-24">
      <Label
        htmlFor={controlId}
        className="mb-2 text-sm font-medium text-zinc-700"
      >
        {label}
        {required && (
          <span className="text-primary" aria-hidden>
            *
          </span>
        )}
      </Label>
      {children({
        id: controlId,
        "aria-describedby": error ? errorId : undefined,
        "aria-invalid": error ? true : undefined,
      })}
      {error && (
        <p
          id={errorId}
          role="alert"
          className="mt-1.5 text-sm font-medium text-destructive"
        >
          {error}
        </p>
      )}
    </div>
  );
}

/** 생년월일용 큰 터치 영역 셀렉트 */
function BirthSelect({
  id,
  ariaLabel,
  value,
  placeholder,
  options,
  onChange,
  invalid,
}: {
  id?: string;
  ariaLabel: string;
  value: string;
  placeholder: string;
  options: { value: string; label: string }[];
  onChange: (value: string) => void;
  invalid?: boolean;
}) {
  return (
    <Select value={value || undefined} onValueChange={onChange}>
      <SelectTrigger
        id={id}
        aria-label={ariaLabel}
        aria-invalid={invalid}
        className="h-13 rounded-xl px-3.5 text-base"
      >
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {options.map((o) => (
          <SelectItem key={o.value} value={o.value}>
            {o.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
