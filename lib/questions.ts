// 설문 문항 정의. 02~04는 원본 `docs/아동 발달 초기 체크리스트.md`와 1:1로 대응한다.
// 문항 텍스트는 원본을 그대로 사용하며, id는 응답 저장·PDF·검토 화면에서 안정적으로
// 참조하기 위한 키다(원본 순서 기준, 변경 금지). 05는 제품 추가 문항이다.

import type {
  DomainKey,
  MediaTimeOption,
  YesNo,
} from "@/lib/consultation-form";

export interface Question {
  /** section02/03/04 응답 Record의 키. 원본 순서 고정 — 절대 재배치/재사용 금지. */
  id: string;
  /** 원본 문항 텍스트 그대로. */
  text: string;
}

export const MEDIA_TIME_QUESTION =
  "하루 평균 미디어 시청 시간";

export const MEDIA_TIME_DESCRIPTION =
  "아동이 하루에 TV, 스마트폰, 태블릿, 유튜브, 게임, 영상통화 등 영상/디지털 미디어를 이용하거나 시청하는 평균 시간을 선택해주세요.";

export const MEDIA_TIME_OPTIONS: {
  value: MediaTimeOption;
  label: string;
}[] = [
  { value: "under30m", label: "30분 이하" },
  { value: "over30m_under1h", label: "30분 초과 ~ 1시간 이하" },
  { value: "over1h_under2h", label: "1시간 초과 ~ 2시간 이하" },
  { value: "over2h_under3h", label: "2시간 초과 ~ 3시간 이하" },
  { value: "over3h", label: "3시간 초과" },
  { value: "other", label: "기타" },
];

export function formatMediaTime(
  value: MediaTimeOption | null,
  otherText: string,
): string {
  if (value === "other") return otherText.trim() || "기타";
  return MEDIA_TIME_OPTIONS.find((option) => option.value === value)?.label ?? "-";
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

/** 04 상세 섹션 제목 (원본 04-1~04-7 헤딩 그대로). */
export const DOMAIN_TITLES: Record<DomainKey, string> = {
  language: "언어발달",
  grossMotor: "대근육 발달",
  fineMotor: "소근육 발달",
  social: "사회성 및 상호작용",
  cognitive: "인지발달 및 학습준비",
  sensorySensitive: "감각 예민함",
  sensorySeeking: "감각 둔감함 및 감각추구",
};

/**
 * 04. 영역별 상세 체크 — 7영역 × 8문항 (조건부 노출 · FR-5).
 * 03에서 "예"로 선택된 영역만 노출한다(`getSelectedDomains`). id는 영역(domain)
 * 내에서만 유일하면 되며, 원본 순서 기준으로 고정한다.
 */
export const SECTION_04_QUESTIONS: Record<DomainKey, Question[]> = {
  language: [
    { id: "lang1", text: "이름을 불러도 반응이 늦거나 일관되지 않다." },
    { id: "lang2", text: "간단한 지시를 이해하는 데 어려움이 있다. 예: 가져와, 앉아, 신발 신자" },
    { id: "lang3", text: "원하는 것을 말보다 울음, 손끌기, 짜증으로 표현하는 경우가 많다." },
    { id: "lang4", text: "또래에 비해 사용하는 단어 수가 적다고 느껴진다." },
    { id: "lang5", text: "두 단어 이상을 연결하거나 문장으로 표현하는 것이 어렵다." },
    { id: "lang6", text: "질문에 대답이 늦거나 엉뚱한 답을 하는 경우가 있다." },
    { id: "lang7", text: "발음이 부정확하여 가족 외 사람이 알아듣기 어렵다." },
    { id: "lang8", text: "대화를 주고받기보다 혼잣말, 반복어, 특정 표현이 많다." },
  ],
  grossMotor: [
    { id: "gm1", text: "걷기, 뛰기, 점프 등 기본 움직임이 또래보다 서툴다." },
    { id: "gm2", text: "자주 넘어지거나 균형을 잡기 어려워한다." },
    { id: "gm3", text: "계단을 오르내릴 때 불안정하거나 도움이 필요하다." },
    { id: "gm4", text: "공 차기, 던지기, 받기 활동을 어려워한다." },
    { id: "gm5", text: "놀이터 기구 사용을 무서워하거나 회피한다." },
    { id: "gm6", text: "몸의 힘이 약해 보이거나 쉽게 피곤해한다." },
    { id: "gm7", text: "한 발 서기, 선 따라 걷기 등 균형 활동을 어려워한다." },
    { id: "gm8", text: "앉은 자세를 오래 유지하기 어렵다." },
  ],
  fineMotor: [
    { id: "fm1", text: "연필, 색연필, 크레용을 잡고 사용하는 것이 서툴다." },
    { id: "fm2", text: "선 긋기, 색칠하기, 따라 그리기를 어려워한다." },
    { id: "fm3", text: "가위질을 어려워하거나 위험하게 사용한다." },
    { id: "fm4", text: "블록 끼우기, 퍼즐 맞추기, 작은 물건 집기를 어려워한다." },
    { id: "fm5", text: "숟가락, 포크, 젓가락 사용이 또래보다 서툴다." },
    { id: "fm6", text: "단추, 지퍼, 양말, 신발 착용을 어려워한다." },
    { id: "fm7", text: "손의 힘 조절이 어려워 너무 세게 누르거나 약하게 잡는다." },
    { id: "fm8", text: "종이접기, 만들기, 스티커 붙이기 등 손 사용 활동을 회피한다." },
  ],
  social: [
    { id: "soc1", text: "눈맞춤이 짧거나 잘 이루어지지 않는다." },
    { id: "soc2", text: "보호자나 또래와 함께 놀이를 이어가는 것이 어렵다." },
    { id: "soc3", text: "혼자 노는 것을 선호하고 또래에게 관심이 적다." },
    { id: "soc4", text: "장난감 나누기, 순서 기다리기, 차례 지키기를 어려워한다." },
    { id: "soc5", text: "상대방의 표정이나 감정을 알아차리는 것이 어려워 보인다." },
    { id: "soc6", text: "자신의 감정을 말이나 행동으로 적절히 표현하기 어렵다." },
    { id: "soc7", text: "낯선 환경이나 새로운 사람을 지나치게 불편해한다." },
    { id: "soc8", text: "규칙이 있는 놀이를 이해하거나 따르는 데 어려움이 있다." },
  ],
  cognitive: [
    { id: "cog1", text: "사물 이름, 색깔, 모양, 크기 등을 구분하는 데 어려움이 있다." },
    { id: "cog2", text: "새로운 놀이 방법이나 활동 규칙을 익히는 데 시간이 오래 걸린다." },
    { id: "cog3", text: "같은 설명을 여러 번 반복해야 이해하는 경우가 많다." },
    { id: "cog4", text: "그림책이나 이야기 내용을 이해하고 기억하는 데 어려움이 있다." },
    { id: "cog5", text: "숫자, 순서, 많고 적음 등의 개념 이해가 또래보다 늦다." },
    { id: "cog6", text: "분류하기, 짝 맞추기, 퍼즐 등 사고 활동을 어려워한다." },
    { id: "cog7", text: "집중 시간이 짧고 활동을 끝까지 마치기 어렵다." },
    { id: "cog8", text: "기관 활동 또는 수업 흐름을 따라가기 어렵다는 피드백을 받은 적이 있다." },
  ],
  sensorySensitive: [
    { id: "ss1", text: "큰 소리, 특정 소리, 사람이 많은 장소를 힘들어한다." },
    { id: "ss2", text: "밝은 빛이나 특정 시각 자극을 불편해한다." },
    { id: "ss3", text: "옷 라벨, 양말, 특정 옷감의 촉감을 싫어한다." },
    { id: "ss4", text: "머리 감기, 양치, 손톱 깎기 등을 매우 싫어한다." },
    { id: "ss5", text: "특정 음식의 냄새, 맛, 질감 때문에 먹기를 거부한다." },
    { id: "ss6", text: "손에 묻는 것을 싫어해 모래, 물감, 점토 놀이를 회피한다." },
    { id: "ss7", text: "안기거나 만져지는 것을 불편해한다." },
    { id: "ss8", text: "그네, 미끄럼틀, 놀이기구 등 움직임 자극을 무서워한다." },
  ],
  sensorySeeking: [
    { id: "sk1", text: "불러도 잘 듣지 못한 것처럼 반응이 늦다." },
    { id: "sk2", text: "넘어지거나 부딪혀도 통증 반응이 약한 편이다." },
    { id: "sk3", text: "계속 뛰거나 점프하거나 몸을 부딪히는 행동이 많다." },
    { id: "sk4", text: "빙글빙글 돌기, 흔들기, 매달리기 같은 움직임을 자주 찾는다." },
    { id: "sk5", text: "물건을 입에 넣거나 씹는 행동이 많다." },
    { id: "sk6", text: "손으로 만지거나 두드리거나 누르는 행동이 많다." },
    { id: "sk7", text: "위험한 행동을 해도 무서워하지 않는 것처럼 보인다." },
    { id: "sk8", text: "강한 압박, 꽉 안기기, 이불 속에 들어가기 등을 좋아한다." },
  ],
};

/**
 * 03 선별 응답에서 04 상세가 노출될 영역을 원본 순서대로 반환한다(FR-5).
 * `domain`이 있는 항목 중 "예"로 선택된 것만 포함한다(s8·s9는 매핑 없음 → 제외).
 */
export function getSelectedDomains(
  section03: Record<string, YesNo>,
): DomainKey[] {
  return SECTION_03_QUESTIONS.flatMap((q) =>
    q.domain && section03[q.id] === "yes" ? [q.domain] : [],
  );
}
