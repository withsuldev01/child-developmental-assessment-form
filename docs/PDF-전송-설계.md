# PDF 전송 설계 — 노코드 웹훅(Apps Script) 방식

| 항목 | 내용 |
| --- | --- |
| 문서 상태 | 설계 초안 (구현 전) |
| 작성일 | 2026-06-22 |
| 결정 방식 | **Google Apps Script 웹훅 → 회사 메일 발송 + 구글 드라이브 저장** |
| 수신처 | **항상 같은 회사 주소 1곳(고정)** |
| 관련 | PRD FR-8(PDF), FR-9(공유), FR-10(초기화) / `components/printable-form.tsx` |

> 목표: 보호자가 센터 비치 기기에서 작성을 마치면, **회사(센터)가 결과를 즉시 확인**할 수 있어야 한다. 백엔드 없이 쉽게.

---

## 1. 왜 이 방식인가

- **이메일은 즉시·범용·첨부 가능** → 회사가 받은편지함에서 바로 확인. 카카오 알림톡은 **파일 첨부 불가(링크만)** + 채널 개설·발신대행사·템플릿 검수가 필요해 부적합.
- **Apps Script 웹훅**은 별도 서버/DB 없이 무료로 다음을 한 번에 처리:
  1. PDF/HTML 생성
  2. 고정 회사 메일로 발송 (HTML 본문 + PDF 첨부)
  3. 구글 드라이브 폴더에 PDF 보관(아카이브)
- 데이터가 **회사가 통제하는 Google Workspace 안에서만** 흐름 → 민감정보(아동·보호자) 취급에 유리.

---

## 2. 전체 데이터 흐름

```
[완료 화면 /complete]
   └─(작성 데이터로 HTML 생성)
        │  POST (HTTPS)
        ▼
[Google Apps Script 웹앱  doPost(e)]
   ├─ 1. 공유 시크릿 검증
   ├─ 2. HTML → PDF 변환
   ├─ 3. 회사 메일 발송 (본문=HTML, 첨부=PDF)
   ├─ 4. 드라이브 폴더에 PDF 저장
   └─ 5. { ok: true } 응답
        │
        ▼
[완료 화면] 전송 성공 표시 → (선택) 폼 초기화(FR-10)
```

핵심 설계 포인트: **레이아웃(평가지) HTML은 앱에서 1곳에서만 생성**하고, Apps Script는 "변환·발송·저장"만 담당(단순 파이프). 템플릿 이중 관리를 피한다.

---

## 3. PDF 생성 전략 (결정)

세 가지 후보 중 **전략 A** 채택.

| 전략 | 내용 | 장점 | 단점 |
| --- | --- | --- | --- |
| **A. 앱이 인라인 스타일 HTML 생성 → Apps Script가 PDF 변환 (채택)** | 앱이 평가지 HTML 문자열을 만들어 POST. Apps Script가 `Utilities.newBlob(html).getAs(PDF)` | 앱에 PDF 라이브러리 불필요, 레이아웃 단일 소스, 한글 OK | Apps Script 변환기는 **인라인 CSS만** 지원(Tailwind 클래스 불가) |
| B. Apps Script에 HTML 템플릿 보관 | 앱은 JSON만 POST, 템플릿은 Apps Script | 앱 변경 최소 | 템플릿 이중 관리(앱 화면 ↔ 스크립트) |
| C. 앱이 PDF 직접 생성(react-pdf) → base64 POST | 앱이 PDF까지 생성 | 레이아웃 100% 제어 | 한글 TTF 임베드 + 번들 증가 |

### 전략 A의 구현 메모
- 현재 `components/printable-form.tsx`는 Tailwind 클래스 기반 → **Apps Script 변환기/메일 클라이언트에서 스타일이 안 먹는다.**
- 따라서 **`lib/report-html.ts`(신규, 순수 함수)** 를 만들어 동일 내용의 **인라인 스타일 HTML 문자열**을 생성한다. 표/테두리/배경은 모두 `style="..."` 인라인으로.
  - 문항 데이터 소스는 기존 `lib/questions.ts`(`SECTION_02/03/04_QUESTIONS`, `DOMAIN_TITLES`, `getSelectedDomains`)를 그대로 재사용 → 문항 텍스트 단일 소스 유지.
  - 즉, 화면 미리보기는 `PrintableForm`(Tailwind), 전송용은 `buildReportHtml(form)`(인라인) — **데이터는 공유, 표현만 2벌**.
- 이 HTML은 **메일 본문**과 **PDF 변환** 양쪽에 그대로 쓰여 "회사가 본문에서 바로 보기" + "PDF 보관"을 동시에 만족.

---

## 4. 앱(클라이언트) 측 작업

### 4.1 신규 파일
- `lib/report-html.ts`
  - `export function buildReportHtml(form: ConsultationForm): string`
  - 원본 평가지와 동일한 전체 문항(미선택 04 영역은 "미선별" 표기) 인라인 HTML 반환.

### 4.2 전송 함수 (예: `lib/send-report.ts`)
```ts
// CORS 프리플라이트를 피하려고 text/plain으로 보낸다(Apps Script 권장 패턴).
export async function sendReport(form: ConsultationForm): Promise<boolean> {
  const url = process.env.NEXT_PUBLIC_REPORT_WEBHOOK_URL;
  if (!url) return false;
  const payload = {
    secret: process.env.NEXT_PUBLIC_REPORT_SECRET, // 약한 보호용 토큰
    childName: form.basicInfo.childName,
    completedAt: form.meta.completedAt,
    html: buildReportHtml(form),
  };
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    return data?.ok === true;
  } catch {
    return false;
  }
}
```

### 4.3 완료 화면(`/complete`) UX
- "회사로 전송" 동작: **자동 전송**(완료 화면 진입 시 1회) 또는 **버튼 클릭** 중 택1.
  - 권장: 완료 진입 시 자동 전송 + 결과 배지. 실패 시 **재시도 버튼** 노출(현장 네트워크 대비).
- 상태 표시: `전송 중… / ✅ 회사로 전송됨 / ⚠️ 전송 실패 — 다시 시도`. 스크린리더용 `aria-live`.
- 전송 성공과 무관하게 기존 **PDF 미리보기·인쇄**(오버레이)는 유지(현장 보관·수동 공유용).
- **중복 전송 방지**: `form.meta` 또는 세션 플래그로 "이미 전송됨" 기록(예: `meta.sentAt`). 데이터 모델에 `sentAt?: string` 추가 검토.
- 전송 성공 후 "처음으로(새 작성)"에서 폼 초기화(FR-10)는 그대로.

### 4.4 환경 변수 (`.env.local`, 커밋 금지)
```
NEXT_PUBLIC_REPORT_WEBHOOK_URL=https://script.google.com/macros/s/XXXX/exec
NEXT_PUBLIC_REPORT_SECRET=충분히-긴-랜덤-문자열
```
- `NEXT_PUBLIC_` 접두사는 클라이언트 노출됨 → 시크릿은 **남용 완화용**일 뿐 강력한 보안은 아님(아래 §6 참고).

---

## 5. Apps Script(서버리스) 측 작업

### 5.1 스크립트 개요 (`Code.gs`)
```js
const TO = "intake@회사도메인.com";        // 고정 수신처
const FOLDER_ID = "드라이브_폴더_ID";        // 아카이브 폴더
const SECRET = "충분히-긴-랜덤-문자열";       // 앱과 동일 값

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    if (data.secret !== SECRET) return json({ ok: false, error: "unauthorized" });

    const stamp = (data.completedAt || "").slice(0, 10) || Utilities.formatDate(new Date(), "Asia/Seoul", "yyyy-MM-dd");
    const name = (data.childName || "무명").replace(/[\\/:*?"<>|]/g, "");
    const fileName = `발달체크리스트_${name}_${stamp}.pdf`;

    // HTML → PDF
    const pdf = Utilities.newBlob(data.html, "text/html", fileName).getAs("application/pdf").setName(fileName);

    // 1) 회사 메일 발송 (본문=HTML, 첨부=PDF)
    GmailApp.sendEmail(TO, `[초기상담 체크리스트] ${name} (${stamp})`, "HTML 메일 본문을 지원하지 않는 클라이언트용 대체 텍스트", {
      htmlBody: data.html,
      attachments: [pdf],
    });

    // 2) 드라이브 보관
    DriveApp.getFolderById(FOLDER_ID).createFile(pdf);

    return json({ ok: true });
  } catch (err) {
    return json({ ok: false, error: String(err) });
  }
}

function json(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
```

### 5.2 배포
1. script.google.com에서 새 프로젝트 → 위 코드 붙여넣기, 상수 채우기.
2. **배포 → 새 배포 → 웹앱**.
   - 실행 계정: 본인(회사 계정)
   - 액세스 권한: **모든 사용자(Anyone)** ← 비치 기기 브라우저에서 호출하려면 필요. 시크릿으로 최소 방어.
3. 발급된 `/exec` URL을 앱 `.env.local`에 넣기.
4. 첫 실행 시 Gmail/Drive 권한 동의.

### 5.3 한글·스타일 주의
- 변환기는 **인라인 CSS + 기본 HTML**만 안정적. `<table border>`·`style="border:1px solid #..."`·배경색 정도로 평가지 재현.
- 한글은 Google 렌더러 기본 지원(별도 폰트 임베드 불필요).
- 복잡한 flex/grid·웹폰트는 미적용 → §3 전략 A의 인라인 HTML로 단순하게.

---

## 6. 보안 · 개인정보 (민감정보 취급)

- 전 구간 **HTTPS**. 수신처는 **회사가 통제하는 Gmail/Drive 한 곳**으로 고정.
- `NEXT_PUBLIC_*`는 브라우저 노출 → 시크릿은 **봇/실수 방지 수준**. 더 강하게 하려면:
  - (선택) 얇은 서버 프록시(예: Next.js Route Handler) 1개를 두고 시크릿을 서버에만 보관 → 앱은 자사 API로만 POST. "노코드 0서버" 원칙과 트레이드오프.
- 드라이브 폴더 **공유 범위 최소화**(회사 내부 한정), 보관기간·삭제 정책 수립(예: N개월 후 정리).
- 비치 기기: 전송 성공 후 **세션 데이터 완전 삭제**(FR-10) 유지 — 기기에 개인정보 잔존 금지.
- 메일 제목/본문에 최소한의 식별정보만(아동 이름·작성일). 과도한 노출 자제.

---

## 7. 구현 체크리스트 (착수 시)

**앱**
- [ ] `lib/report-html.ts` — `buildReportHtml(form)` 인라인 HTML 생성(미선택 영역 "미선별")
- [ ] `lib/send-report.ts` — 웹훅 POST(`text/plain`), 성공/실패 반환
- [ ] `/complete` — 자동 전송 + 상태 배지 + 재시도, 중복 전송 방지(`meta.sentAt`)
- [ ] (검토) `ConsultationForm.meta.sentAt?: string` 추가
- [ ] `.env.local`에 URL·시크릿 (`.gitignore` 확인)

**Apps Script**
- [ ] 프로젝트 생성·코드 작성, 상수(수신처·폴더·시크릿) 설정
- [ ] 웹앱 배포(Anyone), 권한 동의
- [ ] URL 발급 → 앱 환경변수 연결

**검증**
- [ ] 실제 기기에서 작성 → 전송 → 회사 메일 수신(본문 표시 + PDF 첨부) 확인
- [ ] 한글·표·체크 표기, 미선택 영역 "미선별" 출력 확인
- [ ] 드라이브 보관 확인, 실패 시 재시도 동작 확인

---

## 8. 한계 · 향후 대안

- Apps Script 변환 PDF는 정교한 디자인엔 한계 → 더 높은 품질이 필요하면 **전략 C(react-pdf, 한글 TTF 임베드)** 또는 서버 렌더(Playwright)로 승격.
- 발송량이 많아지면 Gmail 일일 한도(개인 ~100/일, Workspace ~1,500/일) 고려.
- 카카오 알림톡은 "작성 완료 + 열람 링크 통지"용 **부가 채널**로만 추후 검토(파일 첨부 불가).
- 장기적으로 백엔드 도입 시: 자사 API + 트랜잭션 메일(Resend) + 스토리지로 이전(§PRD 로드맵).
```
