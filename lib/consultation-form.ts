"use client";

import * as React from "react";

// PRD §8 데이터 모델. 서버 영속 저장은 1차 범위 외 — sessionStorage에만 보관하고
// 작성 완료/초기화 시 비운다(FR-10). 키오스크 기기에 개인정보가 잔존하지 않도록 한다.

export type Gender = "male" | "female";
export type YesNo = "yes" | "no";

/** 03 선별 문항 ↔ 04 상세 섹션 매핑에 쓰이는 영역 키 (PRD FR-5) */
export type DomainKey =
  | "language"
  | "grossMotor"
  | "fineMotor"
  | "social"
  | "cognitive"
  | "sensorySensitive"
  | "sensorySeeking";

export interface BasicInfo {
  childName: string;
  gender: Gender | null;
  birthDate: string | null; // ISO "YYYY-MM-DD"
  guardianName: string;
  guardianPhone: string; // "010-1234-5678" 형식
}

export interface ConsultationForm {
  basicInfo: BasicInfo;
  section02: Record<string, YesNo>; // 02 기본 확인 6문항
  section03: Record<string, YesNo>; // 03 빠른 선별 9문항 (분기 트리거)
  section04: Partial<Record<DomainKey, Record<string, YesNo>>>; // 04 상세
  // 05 추가 입력 (모두 선택 입력)
  additional: {
    note: string; // 자유 서술 메모 (추가로 알리고 싶은 점·특이사항)
    hopes: string; // 상담 희망사항 (이번 상담에서 도움받고 싶은 점)
  };
  meta: {
    startedAt: string | null; // 작성 시작 시각 ISO
    completedAt: string | null; // 작성 완료 시각 ISO
    version: number;
  };
}

export const FORM_VERSION = 1;
const STORAGE_KEY = "consultation-form";

export function createEmptyForm(): ConsultationForm {
  return {
    basicInfo: {
      childName: "",
      gender: null,
      birthDate: null,
      guardianName: "",
      guardianPhone: "",
    },
    section02: {},
    section03: {},
    section04: {},
    additional: { note: "", hopes: "" },
    meta: { startedAt: null, completedAt: null, version: FORM_VERSION },
  };
}

export function loadForm(): ConsultationForm {
  if (typeof window === "undefined") return createEmptyForm();
  try {
    const raw = window.sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return createEmptyForm();
    const parsed = JSON.parse(raw) as Partial<ConsultationForm>;
    // 버전이 다르면 폐기하고 새로 시작
    if (parsed?.meta?.version !== FORM_VERSION) return createEmptyForm();
    const empty = createEmptyForm();
    return {
      ...empty,
      ...parsed,
      basicInfo: { ...empty.basicInfo, ...parsed.basicInfo },
      section02: { ...parsed.section02 },
      section03: { ...parsed.section03 },
      section04: { ...parsed.section04 },
      additional: { ...empty.additional, ...parsed.additional },
      meta: { ...empty.meta, ...parsed.meta },
    };
  } catch {
    return createEmptyForm();
  }
}

export function saveForm(form: ConsultationForm): void {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(form));
  } catch {
    // 저장 실패는 무시 (시크릿 모드 등)
  }
}

export function clearForm(): void {
  if (typeof window === "undefined") return;
  window.sessionStorage.removeItem(STORAGE_KEY);
}

/** 생년월일(ISO) 기준 현재 만 나이. 미래 날짜나 미입력이면 null. */
export function calcAge(
  birthDate: string | null,
  now: Date = new Date(),
): { years: number; months: number } | null {
  if (!birthDate) return null;
  const birth = new Date(birthDate + "T00:00:00");
  if (Number.isNaN(birth.getTime())) return null;
  if (birth.getTime() > now.getTime()) return null;

  let years = now.getFullYear() - birth.getFullYear();
  let months = now.getMonth() - birth.getMonth();
  if (now.getDate() < birth.getDate()) months -= 1;
  if (months < 0) {
    years -= 1;
    months += 12;
  }
  return { years, months };
}

/** "만 N세 M개월" 한국어 표기 */
export function formatAge(age: { years: number; months: number } | null): string {
  if (!age) return "";
  return `만 ${age.years}세 ${age.months}개월`;
}

// --- 외부 스토어 (모든 단계 페이지가 공유) ---
// sessionStorage를 단일 소스로 두고 useSyncExternalStore로 구독한다.
// 서버 렌더 시에는 빈 폼을, 클라이언트에서는 복원된 값을 사용해 하이드레이션 불일치를 피한다.

let cache: ConsultationForm | null = null;
const listeners = new Set<() => void>();
const SERVER_SNAPSHOT = createEmptyForm();

function getClientSnapshot(): ConsultationForm {
  if (cache === null) cache = loadForm();
  return cache;
}

function getServerSnapshot(): ConsultationForm {
  return SERVER_SNAPSHOT;
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function setStore(next: ConsultationForm): void {
  cache = next;
  saveForm(next);
  listeners.forEach((l) => l());
}

/**
 * 폼 상태 훅. sessionStorage에서 복원하고, 변경 시 즉시 저장한다.
 * 여러 페이지에서 같은 스토어를 공유한다.
 */
export function useConsultationForm() {
  const form = React.useSyncExternalStore(
    subscribe,
    getClientSnapshot,
    getServerSnapshot,
  );

  const update = React.useCallback(
    (updater: (prev: ConsultationForm) => ConsultationForm) => {
      setStore(updater(getClientSnapshot()));
    },
    [],
  );

  const updateBasicInfo = React.useCallback(
    (patch: Partial<BasicInfo>) => {
      update((prev) => ({
        ...prev,
        basicInfo: { ...prev.basicInfo, ...patch },
        // 첫 입력 시점을 작성 시작 시각으로 기록
        meta: {
          ...prev.meta,
          startedAt: prev.meta.startedAt ?? new Date().toISOString(),
        },
      }));
    },
    [update],
  );

  const clear = React.useCallback(() => {
    cache = createEmptyForm();
    clearForm();
    listeners.forEach((l) => l());
  }, []);

  return { form, update, updateBasicInfo, clear };
}
