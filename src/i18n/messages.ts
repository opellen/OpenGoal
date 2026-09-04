const en = {
  "welcome.tagline": "Goal-centric AI harness. Open structure, clear present.",
  "welcome.setsUp": "Installs:",
  "welcome.skills": "Slash commands",
  "welcome.commands": "Agent skills",
  "welcome.pressEnter": "Press Enter to select tools.",

  "select.message": "Select tools",
  "select.typeToFilter": "type to filter",
  "select.detected": "detected",
  "select.selected": "selected",
  "select.none": "none",
  "select.error.empty": "Select at least one tool.",
  "select.hint": "↑↓ navigate • Space toggle • Backspace remove • Enter confirm",
  "select.available": "available",
  "select.selectedLabel": "Selected:",
  "select.searchLabel": "Search:",

  "cli.dryRun": "Dry run — files that would be created:",
  "cli.complete": "opengoal init complete.",
  "cli.installed": "Installed files:",
  "cli.skipped": "Skipped (use --force to overwrite):",
  "cli.nextSteps": "What's next:",
  "cli.step1": "Review installed files",
  "cli.step2": "Run {cmd}",
} as const;

const ko: Record<keyof typeof en, string> = {
  "welcome.tagline": "목표 중심 AI 하네스. 열린 구조, 선명한 현재.",
  "welcome.setsUp": "포함:",
  "welcome.skills": "슬래시 커맨드",
  "welcome.commands": "에이전트 스킬",
  "welcome.pressEnter": "Enter를 눌러 도구를 선택합니다.",

  "select.message": "설치할 도구 선택",
  "select.typeToFilter": "검색어 입력",
  "select.detected": "감지됨",
  "select.selected": "선택됨",
  "select.none": "없음",
  "select.error.empty": "하나 이상 선택해야 합니다.",
  "select.hint": "↑↓ 이동 • Space 토글 • Backspace 제거 • Enter 확인",
  "select.available": "개",
  "select.selectedLabel": "선택:",
  "select.searchLabel": "검색:",

  "cli.dryRun": "드라이 런 — 생성될 파일:",
  "cli.complete": "opengoal init 완료.",
  "cli.installed": "설치된 파일:",
  "cli.skipped": "건너뜀 (--force로 덮어쓰기):",
  "cli.nextSteps": "다음:",
  "cli.step1": "설치된 파일 확인",
  "cli.step2": "{cmd} 실행",
};

export type MessageKey = keyof typeof en;
export type Locale = "en" | "ko";

export const messages: Record<Locale, Record<MessageKey, string>> = { en, ko };
