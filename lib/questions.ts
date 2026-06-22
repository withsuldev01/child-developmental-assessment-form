// 설문 문항 정의. 원본 `docs/아동 발달 초기 체크리스트.md`와 1:1로 대응한다 (PRD §8).
// 문항 텍스트는 원본을 그대로 사용하며, id는 응답 저장·PDF·검토 화면에서 안정적으로
// 참조하기 위한 키다(원본 순서 기준, 변경 금지).

import type { DomainKey } from "@/lib/consultation-form";

export interface Question {
  /** section02/03/04 응답 Record의 키. 원본 순서 고정 — 절대 재배치/재사용 금지. */
  id: string;
  /** 원본 문항 텍스트 그대로. */
  text: string;
}

/** 02. 초기 상담 기본 확인 — 예/아니요 6문항 (항상 표시, 분기 영향 없음 · FR-3) */
export const SECTION_02_QUESTIONS: Question[] = [
  {
    id: "b1",
    text: "현재 보호자가 발달 지연 또는 발달 차이에 대한 걱정을 가지고 있다.",
  },
  {
    id: "b2",
    text: "어린이집·유치원·학교에서 발달, 행동, 또래관계 관련 피드백을 받은 적이 있다.",
  },
  {
    id: "b3",
    text: "이전에 발달검사, 언어평가, 심리검사, 작업치료평가 등을 받은 적이 있다.",
  },
  {
    id: "b4",
    text: "현재 언어치료, 작업치료, 감각통합치료, 놀이치료, 인지치료 등을 받고 있다.",
  },
  {
    id: "b5",
    text: "출생, 영유아기, 질병, 입원, 수술 등 발달에 영향을 줄 수 있는 특이사항이 있었다.",
  },
  {
    id: "b6",
    text: "최근 아이의 말, 행동, 놀이, 생활습관에서 이전보다 퇴행된 모습이 관찰된다.",
  },
];

/**
 * 03. 주호소 영역 빠른 선별 — 9항목 (항상 표시 · 분기 트리거 · FR-4).
 * 아이콘 그리드에서 복수 선택한다(선택=예, 미선택=아니요). `domain`이 있는 항목의
 * 선택이 04 상세 섹션 노출을 결정한다(FR-5). 마지막 2항목은 대응 상세 섹션이 없어
 * 기록만 한다(domain 없음).
 *
 * `text`는 원본 문항 그대로(PDF·검토 화면용), `shortLabel`은 카드 표시용 짧은 라벨이다.
 */
export const SECTION_03_QUESTIONS: (Question & {
  domain?: DomainKey;
  shortLabel: string;
})[] = [
  { id: "s1", shortLabel: "언어", text: "언어발달 지연이 의심된다.", domain: "language" },
  { id: "s2", shortLabel: "대근육", text: "대근육 발달 지연이 의심된다.", domain: "grossMotor" },
  { id: "s3", shortLabel: "소근육", text: "소근육 발달 지연이 의심된다.", domain: "fineMotor" },
  { id: "s4", shortLabel: "사회성", text: "사회성 또는 또래 상호작용 어려움이 의심된다.", domain: "social" },
  { id: "s5", shortLabel: "인지", text: "인지발달 또는 학습준비 어려움이 의심된다.", domain: "cognitive" },
  { id: "s6", shortLabel: "감각 예민", text: "감각 예민함이 의심된다.", domain: "sensorySensitive" },
  { id: "s7", shortLabel: "감각 둔감·추구", text: "감각 둔감함 또는 감각추구 행동이 의심된다.", domain: "sensorySeeking" },
  { id: "s8", shortLabel: "주의·정서조절", text: "주의집중, 감정조절, 행동조절 어려움이 동반된다." },
  {
    id: "s9",
    shortLabel: "일상 속 불편",
    text: "일상생활, 기관생활, 또래관계, 학습활동 중 실제 불편함이 발생하고 있다.",
  },
];
