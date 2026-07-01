"use client";

import { toBlob } from "html-to-image";

import type { ConsultationForm } from "@/lib/consultation-form";

export async function createReportImageBlob(node: HTMLElement): Promise<Blob> {
  await document.fonts?.ready;

  const blob = await toBlob(node, {
    backgroundColor: "#ffffff",
    cacheBust: true,
    pixelRatio: 2,
  });

  if (!blob) {
    throw new Error("이미지 생성 결과가 비어 있습니다.");
  }

  return blob;
}

export async function saveReportImage(
  node: HTMLElement,
  fileName: string,
): Promise<void> {
  const blob = await createReportImageBlob(node);
  downloadReportImageBlob(blob, fileName);
}

export async function createReportImageFile(
  node: HTMLElement,
  fileName: string,
): Promise<File> {
  const blob = await createReportImageBlob(node);
  return new File([blob], fileName, { type: "image/png" });
}

export function saveReportImageFile(file: File): void {
  downloadReportImageBlob(file, file.name);
}

export function canShareReportImage(file: File): boolean {
  return (
    typeof navigator.share === "function" &&
    navigator.canShare?.({ files: [file] }) === true
  );
}

export async function shareReportImageFile(file: File): Promise<void> {
  if (!canShareReportImage(file)) {
    throw new Error("이 브라우저는 이미지 파일 공유를 지원하지 않습니다.");
  }

  try {
    await navigator.share({
      title: "아동 발달 체크리스트 결과",
      text: "아동 발달 초기상담 체크리스트 결과지입니다.",
      files: [file],
    });
  } catch (error) {
    if (isShareCancelError(error)) return;
    throw error;
  }
}

function downloadReportImageBlob(blob: Blob, fileName: string): void {
  const url = URL.createObjectURL(blob);

  try {
    downloadBlobUrl(url, fileName);
  } finally {
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
}

export async function shareReportImage(
  node: HTMLElement,
  fileName: string,
): Promise<void> {
  const file = await createReportImageFile(node, fileName);
  await shareReportImageFile(file);
}

export function buildReportImageFileName(form: ConsultationForm): string {
  const childName = sanitizeFileName(form.basicInfo.childName.trim());
  const completedAt = form.meta.completedAt ?? new Date().toISOString();
  const date = completedAt.slice(0, 10);
  const suffix = childName ? `_${childName}` : "";

  return `발달체크리스트${suffix}_${date}.png`;
}

function downloadBlobUrl(url: string, fileName: string): void {
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = fileName;
  anchor.rel = "noopener";
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
}

function sanitizeFileName(value: string): string {
  return value.replace(/[\\/:*?"<>|]/g, "").replace(/\s+/g, " ").trim();
}

function isShareCancelError(error: unknown): boolean {
  return error instanceof DOMException && error.name === "AbortError";
}
