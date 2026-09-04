<div align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="https://raw.githubusercontent.com/opellen/opengoal/main/assets/opengoal-banner-light.webp">
    <img src="https://raw.githubusercontent.com/opellen/opengoal/main/assets/opengoal-banner-dark.webp" alt="OpenGoal — goal-centric AI harness"/>
  </picture>
  <p>질문 하나에 파일 하나 — <code>CONTEXT.md</code>, <code>GOAL.md</code>, <code>ROADMAP.md</code></p>

  <p>
    <code>GOAL.md</code>를 열면 <b>지금 할 일</b>이 보이고,<br/>
    <code>CONTEXT.md</code>를 열면 <b>현재 맥락</b>이 보입니다.<br/>
    <code>ROADMAP.md</code>를 열면 <b>현재 큰 그림</b>이 보입니다.
  </p>
  <p><a href="README.md">English</a> · <strong>한국어</strong> · <a href="README.zh-CN.md">简体中文</a> · <a href="README.ja.md">日本語</a></p>
</div>

## 무엇인가요?

OpenGoal은 지금의 목표를 나와 AI 에이전트 양쪽에 마크다운으로 보이게 유지합니다.

`npx` 명령어 한 줄이면 마크다운 슬래시 커맨드와 에이전트 스킬 설치가 끝납니다. 실행 중에 CLI가 끼어들지 않고, 훅(Hook)이 매 동작을 가로채지 않으며, MCP 서버가 도구 정의를 상시 점유하지 않습니다. 남는 것은 에이전트가 읽고 사용자가 어떤 에디터로든 편하게 고칠 수 있는 마크다운뿐입니다.

## 무엇을 해결하나요?

**지금 당장 무엇을 해야 할지 보이지 않습니다.**
현재 목표가 여러 상태 파일, 태스크 목록, 설계 문서 곳곳에 흩어져 있습니다.
파일 하나만 열어서 다음에 할 일을 바로 확인하기 어렵고, AI 에이전트는 상황이 더 심각합니다. 방금 읽은 파편화된 정보만 믿고 엉뚱한 방향으로 거침없이 작업을 진행해 버리기 때문입니다.

OpenGoal에서는 질문 하나에 파일 하나가 답합니다.

```text
ROADMAP.md  ─────────  큰 그림에서 지금 어디쯤인가?
     CONTEXT.md  ──────  이 프로젝트는 무엇인가?
            ● GOAL.md  ──  지금 당장 무엇을 해야 하는가?
```

**맥락을 유지하는 비용이 맥락보다 커서는 안 됩니다.**
세션을 넘어 상태를 유지하려는 프레임워크들은 CLI, 훅(Hook), MCP 서버에 의존하는 경향이 있습니다. 가벼운 탐색 작업에도 매번 CLI가 실행되고, 훅이 모든 동작을 가로채며, 설정된 MCP 서버는 호출하지도 않는 세션에서 도구 정의(Tool Definition)로 토큰을 낭비합니다. 상태를 영속화하는 것은 분명히 가치 있는 일이지만, 저 대가는 과도합니다.

## 빠른 시작

```bash
npx @opellen/opengoal init
```

프로젝트에 마크다운 커맨드가 설치됩니다. 이후에는 별도의 CLI가 필요 없습니다.

```
/opgl:scout          # 세션 시작 — 이것만 기억하세요
```

새 프로젝트이든 기존 코드베이스이든, `/opgl:scout`이 현재 상태를 파악하고 다음 단계를 안내합니다.
기존 코드가 있다면 프로젝트 맥락 설정(`/opgl:context`)부터, 빈 프로젝트라면 대화를 통해 아이디어를 구체화하는 것부터 시작합니다.

대부분의 커맨드는 처음 실행할 때 `init`이 자동으로 처리되므로, `init`을 따로 칠 필요 없이 `/opgl:goal "목표"`처럼 바로 시작할 수 있습니다.

### 옵션

```bash
opengoal init --docs .planning      # docs/ 대신 다른 문서 경로 지정
opengoal init --codebase src        # 소스 코드가 하위 디렉토리에 있을 때 (기본값: .)
opengoal init --tools cursor        # 특정 도구 전용으로 설치
opengoal init --tools cursor,windsurf  # 여러 도구에 동시 설치
opengoal init --no-subagent         # 서브에이전트 위임 비활성화 (기본값: 활성화)
opengoal init --root path/to/proj   # 다른 프로젝트 경로에 설치
opengoal init --force               # 기존 파일 덮어쓰기
opengoal init --dry-run             # 설치될 파일 목록 미리보기
opengoal init --prefix <name>       # 슬래시 커맨드 접두사 변경 (기본값: opgl)
opengoal init --from-prefix <name>  # 이전 접두사로 생성된 커맨드 파일 정리
```

`--tools`는 `Claude Code`, `Cursor`, `Windsurf` 외 [20여 개 도구](docs/supported-tools.md)를 지원합니다.

## 문서 구조

```
docs/
├── CONTEXT.md       ← 프로젝트 맥락, 원칙, 워크플로우
├── GOAL.md          ← 현재 목표와 체크리스트
├── CHECKPOINT.md    ← 마지막 세션 진행 상황
├── DESIGN.md        ← 구현 설계 (필요 시)
├── PLAN.md          ← 구현 계획 (복잡한 태스크에서 자동 생성)
├── ROADMAP.md       ← 마일스톤 단위 전체 계획
├── BACKLOG.md       ← 범위 밖 발견 사항 보관
├── OVERVIEW.md      ← 프로젝트 전체 조망 (필요 시)
└── suspended/       ← 중단된 목표 및 대기 중인 서브골
```

| 문서 | 질문 | 수명 |
|------|------|------|
| `CONTEXT.md` | 이 프로젝트는 무엇이고, 어떻게 작업하지? | 프로젝트 전체 |
| `GOAL.md` | 지금 무엇을 해야 하지? | 목표 달성까지 |
| `CHECKPOINT.md` | 이전 세션에서 어디까지 진행했지? | 세션 단위 (덮어쓰기) |
| `DESIGN.md` | 어떻게 구현하지? | 목표 달성까지 |
| `PLAN.md` | 이 작업을 어떻게 구현하지? | 자동 생성 → 자동 아카이브 |
| `ROADMAP.md` | 큰 그림에서 지금 어디쯤에 있지? | 프로젝트 전체 |
| `BACKLOG.md` | 발견했지만 미뤄둔 건 뭐지? | 프로젝트 전체 |
| `OVERVIEW.md` | 프로젝트 전체를 한눈에 조망하면? | 프로젝트 전체 |

`GOAL.md` 하나로 작게 시작해서 `ROADMAP.md`로 확장해도 되고, `ROADMAP.md`에서 큰 그림을 그리고 `GOAL.md`로 내려와도 됩니다. 어느 방향으로 가든 OpenGoal은 '지금 당장 해야 할 일'을 마크다운으로 한 눈에 보이게 유지합니다.

<details>
<summary>GOAL.md 예시</summary>

```markdown
---
id: session-auth
goal: 인증을 JWT에서 세션 기반으로 전환
status: in-progress
started: 2026-04-04
---

## Tasks

- [x] 1. 세션 스토어 설정
- [ ] 2. 미들웨어 교체 — Step 1/2 (세션 미들웨어 구현 중)
  - [x] 2.1. 세션 미들웨어 구현
  - [ ] 2.2. 기존 JWT 코드 제거
- [ ] 3. DB 스키마 마이그레이션
- [ ] 4. 통합 테스트
```

</details>

<details>
<summary>CONTEXT.md 예시</summary>

```markdown
# Project Overview
Express + PostgreSQL 기반 REST API 서버.
인증은 JWT → 세션 전환 진행 중.

# Architecture
- src/server/ — HTTP 라우팅 (Express)
- src/auth/ — 인증 미들웨어
- src/db/ — DB 접근 계층

# Principles
- 마이그레이션 중 무중단 운영
- 기존 클라이언트 하위호환

# Resources
- DB: PostgreSQL 14, 마이그레이션은 prisma
- 인증: express-session + connect-pg-simple
```

</details>

<details>
<summary>ROADMAP.md 예시</summary>

```markdown
---
id: api-v2
title: API v2 마이그레이션
status: active
started: 2026-03-01
---

- [x] **M1: 인증 전환**
- [ ] **M2: Rate limiting 도입**
- [ ] **M3: API 버저닝**
```

</details>

## 커맨드

| | 커맨드 | 설명 |
|---|--------|------|
| <picture><source media="(prefers-color-scheme: dark)" srcset="https://raw.githubusercontent.com/opellen/opengoal/main/assets/icons/opengoal-icon-scout-dark.webp"><img src="https://raw.githubusercontent.com/opellen/opengoal/main/assets/icons/opengoal-icon-scout.webp" alt="" width="20"/></picture> | `/opgl:scout` | 세션 시작 — 문서를 읽고 현재 상태를 파악한 뒤 다음 행동을 제안 |
| <picture><source media="(prefers-color-scheme: dark)" srcset="https://raw.githubusercontent.com/opellen/opengoal/main/assets/icons/opengoal-icon-go-dark.webp"><img src="https://raw.githubusercontent.com/opellen/opengoal/main/assets/icons/opengoal-icon-go.webp" alt="" width="20"/></picture> | `/opgl:go` | 목표 실행 — `GOAL.md`의 다음 태스크부터 순서대로 진행 |
| <picture><source media="(prefers-color-scheme: dark)" srcset="https://raw.githubusercontent.com/opellen/opengoal/main/assets/icons/opengoal-icon-context-dark.webp"><img src="https://raw.githubusercontent.com/opellen/opengoal/main/assets/icons/opengoal-icon-context.webp" alt="" width="20"/></picture> | `/opgl:context` | `CONTEXT.md` 생성 및 동기화 |
| <picture><source media="(prefers-color-scheme: dark)" srcset="https://raw.githubusercontent.com/opellen/opengoal/main/assets/icons/opengoal-icon-goal-dark.webp"><img src="https://raw.githubusercontent.com/opellen/opengoal/main/assets/icons/opengoal-icon-goal.webp" alt="" width="20"/></picture> | `/opgl:goal` | `GOAL.md` 관리 (init, breakdown, checkpoint, suspend, resume, subgoal, archive) |
| <picture><source media="(prefers-color-scheme: dark)" srcset="https://raw.githubusercontent.com/opellen/opengoal/main/assets/icons/opengoal-icon-design-dark.webp"><img src="https://raw.githubusercontent.com/opellen/opengoal/main/assets/icons/opengoal-icon-design.webp" alt="" width="20"/></picture> | `/opgl:design` | `DESIGN.md` 관리 (init, sync, archive) |
| <picture><source media="(prefers-color-scheme: dark)" srcset="https://raw.githubusercontent.com/opellen/opengoal/main/assets/icons/opengoal-icon-roadmap-dark.webp"><img src="https://raw.githubusercontent.com/opellen/opengoal/main/assets/icons/opengoal-icon-roadmap.webp" alt="" width="20"/></picture> | `/opgl:roadmap` | `ROADMAP.md` 마일스톤 관리 (init, add, archive) |
| <picture><source media="(prefers-color-scheme: dark)" srcset="https://raw.githubusercontent.com/opellen/opengoal/main/assets/icons/opengoal-icon-overview-dark.webp"><img src="https://raw.githubusercontent.com/opellen/opengoal/main/assets/icons/opengoal-icon-overview.webp" alt="" width="20"/></picture> | `/opgl:overview` | `OVERVIEW.md` 프로젝트 전체 조망 관리 |
| <picture><source media="(prefers-color-scheme: dark)" srcset="https://raw.githubusercontent.com/opellen/opengoal/main/assets/icons/opengoal-icon-verify-dark.webp"><img src="https://raw.githubusercontent.com/opellen/opengoal/main/assets/icons/opengoal-icon-verify.webp" alt="" width="20"/></picture> | `/opgl:verify` | 목표, 설계, 구현의 정합성 검증 |
| <picture><source media="(prefers-color-scheme: dark)" srcset="https://raw.githubusercontent.com/opellen/opengoal/main/assets/icons/opengoal-icon-recap-dark.webp"><img src="https://raw.githubusercontent.com/opellen/opengoal/main/assets/icons/opengoal-icon-recap.webp" alt="" width="20"/></picture> | `/opgl:recap` | 세션 마무리 — 논의된 결정을 문서에 반영 |

커맨드와 함께 스킬 2개가 설치됩니다 — `opengoal-flow`(언제 문서화할지, 언제 체크포인트를 기록할지, 새로운 발견을 언제 별도 목표로 전환할지)와
`opengoal-subagent`(위임). 스킬은 커맨드에서 필요로 할 때 자동으로 로드됩니다.

### 호출 방식

맥락이 명확하면 `/opgl:`를 매번 타이핑하지 않아도 됩니다 — 자연어로도 실행 가능합니다.

| 경로 | `/opgl` 필요? | 예시 |
|------|---------------|------|
| **명시적 호출** | 필요 | `/opgl goal init`, `/opgl:goal init & design init` |
| **직전 제안 확인** | 불필요 | AI: "`/opgl:goal init` 권장" → User: "ok" / "진행해" |
| **연속 맥락 서술** | 불필요 | (goal init 직후) User: "breakdown now" |
| **태스크 실행 의도** | 불필요 | "proceed with task 6" → `/opgl:go`, "save progress" → `/opgl:goal checkpoint` |

맥락이 명확하면 자연어만으로 실행됩니다. `/opgl`는 맥락이 모호할 때 쓰는 명시적 호출 수단입니다.

## 사용 흐름

### 기존 프로젝트에 적용

```
You: /opgl:scout
AI:  코드베이스를 확인했습니다. CONTEXT.md가 없네요.
     `/opgl:context init`으로 프로젝트 맥락을 설정할까요?

You: /opgl:context init
AI:  ✓ docs/CONTEXT.md 생성 완료
     목표를 설정하려면 `/opgl:goal init`

You: /opgl:goal 인증 모듈을 JWT에서 세션 기반으로 전환
AI:  ✓ docs/GOAL.md 생성 완료 (5개 태스크)
     `/opgl:design init` 권장 — 파일 수준 결정이 필요한 구현 태스크입니다.

You: /opgl:design init
AI:  ✓ docs/DESIGN.md 생성 완료
     세션 스토어 선택, 마이그레이션 전략, 롤백 계획 포함

You: /opgl:go
AI:  Task 1/5: 세션 스토어 설정... ✓ done
     Task 2/5: 미들웨어 교체... ✓ done
     Task 3/5에서 DB 스키마 변경이 필요합니다. 진행할까요?
```

### 새 프로젝트

```
You: /opgl:scout 실시간 협업 에디터를 만들기 위한 논의를 시작하자
AI:  (Discovery Mode — 기술 스택, 요구사항, 제약조건을 대화로 탐색)
     ...
     ✓ docs/CONTEXT.md 생성 완료

You: /opgl:roadmap init
AI:  ✓ docs/ROADMAP.md 생성 완료
     ├── M1: 코어 에디터 엔진
     ├── M2: 실시간 동기화 (CRDT)
     └── M3: 배포 및 인프라

You: /opgl:goal
AI:  ROADMAP.md에서 M1을 선택합니다.
     ✓ docs/GOAL.md 생성 완료

You: /opgl:goal breakdown
AI:  7개 서브태스크로 분해 완료

You: /opgl:goal breakdown 3
AI:  Task 3을 4개 서브태스크로 분해 완료 (3.1–3.4)

You: /opgl:go
AI:  Task 1/7: 프로젝트 초기화... ✓ done
     Task 2/7: 에디터 코어 구현... ✓ done
     Task 3/7: CRDT 동기화 엔진... ✓ done

You: /opgl:goal checkpoint
AI:  ✓ docs/CHECKPOINT.md 저장 완료
     (세션이 끊겨도 다음 세션이 이어받습니다)

     ... (다음 세션에서 이어서 작업, 모든 태스크 완료)

You: /opgl:goal archive
AI:  ✓ docs/archive/goals/2026-04-04-editor-core/에 4개 파일 아카이브
     (GOAL.md, DESIGN.md, PLAN.md, CHECKPOINT.md)
     ROADMAP.md에서 M1을 done으로 표시했습니다.
```

### 작업 재개

```
You: /opgl:scout
AI:  CONTEXT.md ✓ | GOAL.md ✓ (3/5 완료)
     이전 세션에서 API 엔드포인트 작업 중이었습니다.
     `/opgl:go`로 이어서 진행할까요?
```

### 컨텍스트 compact 이후

작업 중 대화가 compact됐다면, 커맨드를 다시 입력하면 됩니다:

```
You: /opgl:go
AI:  GOAL.md ✓ (3/7 완료) — Task 4, Step 2/3
     이어서 진행: CRDT 동기화 엔진의 충돌 해소.
```

커맨드 하나로 필요한 것이 모두 돌아옵니다 — `GOAL.md`와 (만들어 뒀다면) 체크포인트까지. 작업은 처음부터가 아니라 `— Step N/M` 표기 지점부터 바로 이어집니다. 현재 상태를 먼저 확인하고 싶다면 `/opgl:scout`을 실행하면 됩니다.

### 블로커 대응

골 진행 중 먼저 해결해야 할 일이 생겼을 때:

```
You: (Goal A 진행 중) 이 의존성 버그 먼저 고치자.
AI:  추천: /opgl:goal suspend + /opgl:goal init "의존성 버그 수정"
You: ok
AI:  ✓ Goal A를 docs/suspended/goal-a/로 중단 보관
     ✓ 블로커용 새 GOAL.md 생성

     ... (블로커 작업 → 완료 시 archive)

You: /opgl:goal resume
AI:  Goal A 복귀. `/opgl:go`로 이어서 진행할까요?
```

중첩된 블로커도 동일한 패턴으로 처리됩니다. `suspend`할 때마다 차곡차곡 쌓이며, 중단된 골이 여러 개라면 `resume` 시 선택 목록을 보여줍니다. 만약 서브골이 활성 상태라면 먼저 `/opgl:goal subgoal pause`로 일시 중단해 두세요. 서브골이 활성화되어 있는 동안에는 `suspend`와 `init`을 실행할 수 없습니다.

### 서브골 대응

블로커는 아니라서 골 진행 자체는 가능하지만, 일반 태스크보다 크고 지금 당장 필요하며, 골의 성격과 달라 `BACKLOG.md`에 넣어둘 수 없을 때:

```
You: (Goal A: 구직 지원 파이프라인 진행 중) 여기 쓸 YAML→PDF 포트폴리오 빌더가 필요한데, 먼저 아키텍처 결정부터 해야 해.
AI:  Goal A를 막는 건 아니지만, 인라인으로 처리하기엔 너무 큽니다. 추천: /opgl:goal subgoal init "포트폴리오 PDF 빌더"
You: ok
AI:  ✓ Goal A를 docs/suspended/job-application-pipeline/로 중단 보관
     ✓ Goal A와 연결된 새 GOAL.md 생성

     ... (포트폴리오 도구 설계 및 구현 → 완료 시 archive)

AI:  ✓ 서브골 아카이브 완료. Goal A로 복귀 — 포인터 태스크 체크 완료.
```

골 진행 자체가 완전히 막혀 있다면 서브골 대신 **블로커**로 처리해야 합니다. (위 '블로커 대응' 참고)

## 현장에서

여러 해에 걸친 애플리케이션 개발도, 주말에 만드는 플러그인도 같은 목표 문서로 진행됩니다.
이렇게 규모가 다른 작업을 하나의 방식으로 다룰 수 있다는 점이 핵심입니다.

**긴 호흡의 개발**

- [Planura](https://github.com/opellen/Planura) — 네이티브 다이렉트 모델링 3D 애플리케이션
  (C++20 / Qt 6 / OpenGL). half-edge 지오메트리 커널, CSG 솔리드 모델링, 추론 기반 드로잉을
  자체 프레임워크인 [Ordo](https://github.com/opellen/Ordo) 기반으로 구현했습니다.
- [Ordo](https://github.com/opellen/Ordo) — Planura에서 추출된 C++20용 타입 이벤트 애플리케이션 프레임워크입니다.
  이벤트는 평범한 구조체이며, 타입이 곧 정체성이고 필드가 곧 페이로드입니다.
- 리버스엔지니어링 캠페인 — OpenGoal이 처음 고안된 도메인입니다. 목표는 거대하고 길은
  보이지 않아서, 목표를 잘게 쪼갤 수 있을 때에만 전진할 수 있는 영역입니다.

**애플리케이션과 도구**

- [SeedNote](https://github.com/opellen/Seed-Note) — Android용 구조화 블록 에디터 (Kotlin / Jetpack Compose)
- [ScreenUse](https://github.com/opellen/Screen-Use) — 시나리오 기반 UI 재생 및 검증 도구 (실제 앱을 구동해 녹화)
- [OpenIllust](https://github.com/opellen/OpenIllust) — Claude Code와 Codex를 위한 캠페인 기반 AI 벡터 에셋 제작
  도구입니다. 이 저장소의 로고 세트도 OpenIllust로 제작했습니다.

**집중형 도구**

- [Hilo](https://github.com/opellen/Hilo) — Obsidian 하이라이트 플러그인
- [Loft](https://github.com/opellen/Loft) — Obsidian 이미지 업로드 플러그인

## **틈새**에서

> **시작은 애플리케이션 개발이 아니었습니다.**
>
> OpenGoal은 목표가 거대하고 길이 보이지 않는 작업을 위해 만들어졌습니다.
> 그런 일은 미지를 사람과 에이전트가 긴 호흡으로 주고받을 수 있는,
> 작고 검증 가능한 걸음으로 쪼갤 수 있을 때에만 전진합니다.
> 처음의 그 일은 긴 리버스엔지니어링 캠페인이었고,
> OpenGoal이 쓰이는 다른 모든 곳은 그 형태를 물려받았습니다.
>
> **무거운 워크플로우가 항상 필요하지는 않았습니다.**
>
> 작은 수정을 하려는 것뿐인데 이게 다 필요한가라는 의문이 들었습니다.
> 질문 폭탄을 수반하는 완벽한 논의와 물 샐 틈 없는 사양이 항상 필요하지는 않았습니다.
> 완벽한 절차는 매력적입니다. 하지만 AI는 점점 더 많은 것을 흡수해가고 있고,
> 어쩌면 우리가 기대고 싶은 그 다양한 안전장치들이 많은 경우 지나친 족쇄가 될 수도 있겠다고 생각했습니다.
> 하지만 맥락 유지는 필요했습니다.
>
> **현재에 집중하고 싶었습니다.**
>
> 사양과 태스크에 묻힌 '현재 목표'를 밖으로 꺼내고 싶었습니다.
> 나와 AI가 바로 이해하고 집중할 수 있는 '현재'를 만들고 싶었습니다.
> 작은 것에서 시작해 올라가도, 큰 그림에서 내려와도 —
> 어느 방향이든 '지금 할 일'이 바로 보이는 구조를 원했습니다.
>
> **틈새를 채우고 싶었습니다.**
>
> 저는 OpenSpec으로 시작해서 OpenGoal로 건너가기도 하고 그 반대로 하기도 합니다.
> 때로는 Superpowers를 장착하기도 합니다.
> 잘 하는 것들은 여전히 잘 활용하면 됩니다.
> 완전함과 강력함의 앞에, 또는 그 사이에 놓일 수 있는 무언가가 필요했습니다.

## Notation

OpenGoal의 커맨드와 스킬은 일반 산문이 아니라 간결한 마크다운 표기법으로 작성되어 있습니다. `## Constraints`, `(condition) => action` 디스패치 규칙, `for each`, `loop until` 같은 형태입니다.

이 형태는 의사코드 프롬프팅에 대한 공개된 연구 결과를 따릅니다. CodeAgents(2025)는 에이전트 워크플로를 산문 대신 의사코드로 기술했을 때 토큰 사용량이 55–87% 감소하고 과제 성능이 3–36포인트 향상됐다고 보고합니다.

구문과 우선순위 규칙은 [docs/NOTATION.md.kr](docs/NOTATION.md.kr)에 정리되어 있습니다. 설치된 커맨드를 자기 프로젝트에 맞게 손볼 때 참고하세요. 표기법이 왜 이런 형태인지, 어떤 연구 근거가 있는지는 [docs/notation-guide.md.kr](docs/notation-guide.md.kr)에 있습니다.

## 기여하기

이슈는 무엇이든 환영합니다. 버그, 질문, 아이디어, 이견 모두 좋습니다.

PR은 플랫폼 어댑터(`src/platforms/`)에 한해 받습니다. 프롬프트 템플릿은 제가 직접
관리합니다. 자세한 내용은 [CONTRIBUTING.md](CONTRIBUTING.md)를 참고하세요.

### 개발 환경

```bash
git clone https://github.com/opellen/OpenGoal.git
cd OpenGoal
npm install
npm run build
npm test
```

## 라이선스

MIT 라이선스입니다. 자세한 내용은 [LICENSE](LICENSE)를 참고하세요.
