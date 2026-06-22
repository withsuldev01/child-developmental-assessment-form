import type { ReactNode } from "react";
import { Check } from "lucide-react";

import {
  DOMAIN_TITLES,
  SECTION_02_QUESTIONS,
  SECTION_03_QUESTIONS,
  SECTION_04_QUESTIONS,
  getSelectedDomains,
} from "@/lib/questions";
import {
  calcAge,
  formatAge,
  type ConsultationForm,
  type DomainKey,
  type YesNo,
} from "@/lib/consultation-form";

// 04 상세 7영역을 원본 순서대로.
const ALL_DOMAINS: DomainKey[] = SECTION_03_QUESTIONS.flatMap((q) =>
  q.domain ? [q.domain] : [],
);

function formatDate(iso: string | null): string {
  if (!iso) return "20      년      월      일";
  const [y, m, d] = iso.slice(0, 10).split("-");
  return `${y}년 ${Number(m)}월 ${Number(d)}일`;
}

/**
 * 원본 평가지(`docs/아동 발달 초기 체크리스트.pdf`)와 동일한 전체 문항 레이아웃.
 * 인쇄(PDF 저장)용으로 화면 미리보기와 출력에 함께 쓴다.
 */
export function PrintableForm({ form }: { form: ConsultationForm }) {
  const bi = form.basicInfo;
  const age = calcAge(bi.birthDate);
  const selected = new Set(getSelectedDomains(form.section03));

  return (
    <div className="text-[12px] leading-snug text-zinc-800">
      {/* 타이틀 */}
      <p className="text-right text-[10px] text-zinc-400">
        아동발달센터 초기상담 체크리스트 | 예/아니요 현장검사용
      </p>
      <h1 className="mt-1 text-center text-xl font-bold text-sky-900">
        아동 발달 초기상담 체크리스트
      </h1>

      {/* 01. 기본정보 */}
      <SectionTitle>01. 아동 및 보호자 기본정보</SectionTitle>
      <table className="w-full border-collapse">
        <tbody>
          <tr className="break-inside-avoid">
            <ThCell>아동 이름</ThCell>
            <TdCell>{bi.childName}</TdCell>
            <ThCell>성별</ThCell>
            <TdCell>
              {bi.gender === "male" ? "남" : bi.gender === "female" ? "여" : ""}
            </TdCell>
          </tr>
          <tr className="break-inside-avoid">
            <ThCell>생년월일</ThCell>
            <TdCell>{formatDate(bi.birthDate)}</TdCell>
            <ThCell>현재 연령</ThCell>
            <TdCell>{age ? formatAge(age) : "만      세      개월"}</TdCell>
          </tr>
          <tr className="break-inside-avoid">
            <ThCell>소속기관</ThCell>
            <TdCell />
            <ThCell>학년/반</ThCell>
            <TdCell />
          </tr>
          <tr className="break-inside-avoid">
            <ThCell>보호자 성명</ThCell>
            <TdCell>{bi.guardianName}</TdCell>
            <ThCell>관계</ThCell>
            <TdCell />
          </tr>
          <tr className="break-inside-avoid">
            <ThCell>보호자 연락처</ThCell>
            <TdCell>{bi.guardianPhone}</TdCell>
            <ThCell>주 양육자</ThCell>
            <TdCell />
          </tr>
          <tr className="break-inside-avoid">
            <ThCell>형제자매</ThCell>
            <TdCell />
            <ThCell>상담일</ThCell>
            <TdCell>{formatDate(form.meta.completedAt)}</TdCell>
          </tr>
          <tr className="break-inside-avoid">
            <ThCell>상담자</ThCell>
            <TdCell />
            <ThCell>검사자</ThCell>
            <TdCell />
          </tr>
        </tbody>
      </table>

      {/* 02. 초기 상담 기본 확인 */}
      <SectionTitle>02. 초기 상담 기본 확인</SectionTitle>
      <p className="mb-1.5 text-[11px] text-zinc-500">
        해당 여부만 예/아니요로 체크하고, 세부 내용은 하단 상담자 기록란에 작성합니다.
      </p>
      <Checklist questions={SECTION_02_QUESTIONS} answers={form.section02} />

      {/* 03. 주호소 영역 빠른 선별 */}
      <SectionTitle>03. 주호소 영역 빠른 선별</SectionTitle>
      <Checklist questions={SECTION_03_QUESTIONS} answers={form.section03} />

      {/* 04. 영역별 상세 (미선택 영역은 '미선별'로 표기) */}
      {ALL_DOMAINS.map((domain, i) => (
        <div key={domain} className="break-inside-avoid">
          <SectionTitle>
            04-{i + 1}. {DOMAIN_TITLES[domain]} 체크
          </SectionTitle>
          {selected.has(domain) ? (
            <Checklist
              questions={SECTION_04_QUESTIONS[domain]}
              answers={form.section04[domain] ?? {}}
            />
          ) : (
            <p className="border border-dashed border-zinc-300 px-2 py-2 text-[11px] text-zinc-400">
              미선별 (해당 없음)
            </p>
          )}
        </div>
      ))}

      {/* 추가 기록 (05 추가 입력) */}
      <SectionTitle>추가 기록</SectionTitle>
      <div className="space-y-2 border border-zinc-300 p-2.5">
        <NoteBlock label="추가로 알리고 싶은 점" value={form.additional.note} />
        <NoteBlock label="상담 희망사항" value={form.additional.hopes} />
      </div>

      <p className="mt-6 text-center text-[10px] text-zinc-400">
        ※ 본 문서는 초기상담 및 검사 방향 설정을 위한 참고자료입니다.
      </p>
    </div>
  );
}

function SectionTitle({ children }: { children: ReactNode }) {
  return (
    <h2 className="mt-5 mb-1.5 text-[13px] font-bold break-after-avoid text-zinc-900">
      {children}
    </h2>
  );
}

function ThCell({ children }: { children?: ReactNode }) {
  return (
    <th className="w-[18%] border border-zinc-300 bg-sky-100/60 px-2 py-1.5 text-left align-middle font-bold text-zinc-700">
      {children}
    </th>
  );
}

function TdCell({ children }: { children?: ReactNode }) {
  return (
    <td className="w-[32%] border border-zinc-300 px-2 py-1.5 align-middle">
      {children}
    </td>
  );
}

function Checklist({
  questions,
  answers,
}: {
  questions: { id: string; text: string }[];
  answers: Record<string, YesNo>;
}) {
  return (
    <table className="w-full border-collapse">
      <thead>
        <tr className="break-inside-avoid bg-sky-100/60 text-zinc-700">
          <th className="border border-zinc-300 px-2 py-1.5 text-left font-bold">
            체크 문항
          </th>
          <th className="w-14 border border-zinc-300 px-2 py-1.5 font-bold">예</th>
          <th className="w-14 border border-zinc-300 px-2 py-1.5 font-bold">
            아니요
          </th>
        </tr>
      </thead>
      <tbody>
        {questions.map((q) => (
          <tr key={q.id} className="break-inside-avoid">
            <td className="border border-zinc-300 px-2 py-1.5 align-middle">
              {q.text}
            </td>
            <td className="border border-zinc-300 text-center align-middle">
              <Box checked={answers[q.id] === "yes"} />
            </td>
            <td className="border border-zinc-300 text-center align-middle">
              <Box checked={answers[q.id] === "no"} />
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function Box({ checked }: { checked?: boolean }) {
  return (
    <span className="inline-flex size-3.5 items-center justify-center border border-zinc-500 align-middle">
      {checked && <Check className="size-3 text-zinc-900" strokeWidth={3.5} />}
    </span>
  );
}

function NoteBlock({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[11px] font-bold text-zinc-600">{label}</p>
      <p className="min-h-[2.5em] whitespace-pre-wrap text-zinc-800">{value}</p>
    </div>
  );
}
