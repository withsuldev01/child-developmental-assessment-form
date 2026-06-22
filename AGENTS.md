<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# 프로젝트

아동발달센터 방문 보호자가 **센터 비치 기기(모바일 웹)**에서 작성하는 초기상담 발달 체크리스트.
작성 완료 시 PDF 출력 + 카카오톡 공유. 별도 로그인/DB 없음.

- 상세 기획: `docs/PRD.md`
- 원본 문항: `docs/아동 발달 초기 체크리스트.md`

## 스택
- Next.js (App Router) + TypeScript
- Tailwind CSS v4 + shadcn/ui
- pnpm

## 명령어
- `pnpm dev` — 개발 서버
- `pnpm build` — 프로덕션 빌드
- `pnpm lint` — 린트

## 핵심 규칙
- **모바일 우선** UI. 큰 터치 영역, 한 손 조작 고려.
- 설문 문항은 `docs/아동 발달 초기 체크리스트.md` 원본을 그대로 따른다.
- 03번 선별 결과에 따라 04번 상세 섹션을 **조건부 노출**한다 (PRD FR-5).
- UI는 shadcn/ui 컴포넌트 우선 사용.
- 한국어 UI.
