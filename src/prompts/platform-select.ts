import {
  createPrompt,
  useState,
  useKeypress,
  useMemo,
  useRef,
  usePagination,
  isUpKey,
  isDownKey,
  isSpaceKey,
  isBackspaceKey,
  isEnterKey,
} from "@inquirer/core";
import chalk from "chalk";
import { getAllAdapters, detectInstalledPlatforms, DEFAULT_PLATFORM } from "../platforms/index.js";
import { t } from "../i18n/index.js";
import { goal, title } from "../ui/colors.js";

interface Choice {
  id: string;
  displayName: string;
  detected: boolean;
}

interface PlatformSelectConfig {
  message: string;
  projectRoot: string;
}

const PAGE_SIZE = 15;

function buildChoices(projectRoot: string): Choice[] {
  const detected = new Set(detectInstalledPlatforms(projectRoot));
  const adapters = getAllAdapters();

  const choices: Choice[] = adapters.map((a) => ({
    id: a.id,
    displayName: a.displayName,
    detected: detected.has(a.id),
  }));

  choices.sort((a, b) => {
    if (a.detected !== b.detected) return a.detected ? -1 : 1;
    return a.displayName.localeCompare(b.displayName);
  });
  return choices;
}

const platformSelect = createPrompt<string[], PlatformSelectConfig>(
  (config, done) => {
    const { projectRoot } = config;

    const allChoices = useRef<Choice[] | null>(null);
    if (allChoices.current === null) {
      allChoices.current = buildChoices(projectRoot);
    }

    const initialSelected = useRef<Set<string> | null>(null);
    if (initialSelected.current === null) {
      const s = new Set<string>();
      s.add(DEFAULT_PLATFORM);
      for (const c of allChoices.current) {
        if (c.detected) s.add(c.id);
      }
      initialSelected.current = s;
    }

    const [selected, setSelected] = useState<Set<string>>(
      () => new Set(initialSelected.current!),
    );
    const [search, setSearch] = useState<string>("");
    const [cursorIndex, setCursorIndex] = useState<number>(0);
    const [submitted, setSubmitted] = useState<boolean>(false);
    const [errorMsg, setErrorMsg] = useState<string>("");

    const visibleChoices = useMemo(() => {
      if (!search) return allChoices.current!;
      const lower = search.toLowerCase();
      return allChoices.current!.filter((c) =>
        c.displayName.toLowerCase().includes(lower),
      );
    }, [search]);

    const clampedCursor = useMemo(() => {
      if (visibleChoices.length === 0) return 0;
      return Math.min(cursorIndex, visibleChoices.length - 1);
    }, [cursorIndex, visibleChoices.length]);

    useKeypress((event, rl) => {
      if (event.ctrl && event.name === "c") {
        process.exit(0);
      }

      if (submitted) return;

      if (isEnterKey(event)) {
        if (selected.size === 0) {
          setErrorMsg(t("select.error.empty"));
          return;
        }
        setSubmitted(true);
        done([...selected]);
        return;
      }

      if (isUpKey(event)) {
        if (clampedCursor > 0) {
          setCursorIndex(clampedCursor - 1);
        }
        return;
      }

      if (isDownKey(event)) {
        if (clampedCursor < visibleChoices.length - 1) {
          setCursorIndex(clampedCursor + 1);
        }
        return;
      }

      if (isSpaceKey(event)) {
        if (visibleChoices.length === 0) return;
        const choice = visibleChoices[clampedCursor];
        if (!choice) return;
        const next = new Set(selected);
        if (next.has(choice.id)) {
          next.delete(choice.id);
        } else {
          next.add(choice.id);
        }
        setSelected(next);
        setErrorMsg("");
        return;
      }

      if (isBackspaceKey(event)) {
        if (search.length > 0) {
          setSearch(search.slice(0, -1));
          setCursorIndex(0);
        } else {
          if (selected.size > 0) {
            const arr = [...selected];
            const last = arr[arr.length - 1]!;
            const next = new Set(selected);
            next.delete(last);
            setSelected(next);
          }
        }
        return;
      }

      if (event.name && event.name.length === 1 && !event.ctrl) {
        setSearch(search + event.name);
        setCursorIndex(0);
        setErrorMsg("");
      }
    });

    if (submitted) {
      const names = allChoices.current!
        .filter((c) => selected.has(c.id))
        .map((c) => title(c.displayName))
        .join(", ");
      return `${chalk.green("✔")} ${config.message} ${names}`;
    }

    const pills = allChoices.current!
      .filter((c) => selected.has(c.id))
      .map((c) => title(`[${c.displayName}]`))
      .join("  ");

    const searchDisplay = search
      ? chalk.yellow(search)
      : chalk.dim(t("select.typeToFilter"));

    const page = usePagination({
      items: visibleChoices,
      active: clampedCursor,
      pageSize: PAGE_SIZE,
      loop: false,
      renderItem({ item, isActive }: { item: Choice; index: number; isActive: boolean }) {
        const isSelected = selected.has(item.id);
        const icon = isSelected ? goal("●") : "○";
        const arrow = isActive ? goal("›") : " ";
        const label = isActive ? title(item.displayName) : item.displayName;
        const suffix = item.detected
          ? chalk.dim(` (${t("select.detected")})`)
          : isSelected
            ? chalk.dim(` (${t("select.selected")})`)
            : "";
        return `  ${arrow} ${icon} ${label}${suffix}`;
      },
    });

    const totalPages = Math.ceil(visibleChoices.length / PAGE_SIZE);
    const currentPage =
      totalPages > 0
        ? Math.floor(clampedCursor / PAGE_SIZE) + 1
        : 0;
    const pageIndicator =
      totalPages > 1
        ? chalk.dim(`  (${currentPage}/${totalPages})`)
        : "";

    const error = errorMsg ? `\n${chalk.red(errorMsg)}` : "";

    const header = `${title("?")} ${config.message} (${allChoices.current!.length} ${t("select.available")})`;
    const selectedLine = `  ${t("select.selectedLabel")} ${pills || chalk.dim(t("select.none"))}`;
    const searchLine = `  ${t("select.searchLabel")} [${searchDisplay}]`;
    const hint = chalk.dim(
      `  ${t("select.hint")}`,
    );

    return [
      `${header}\n${selectedLine}\n${searchLine}\n${hint}\n${page}${pageIndicator}${error}`,
      undefined,
    ];
  },
);

export async function selectPlatforms(
  projectRoot: string,
): Promise<string[]> {
  return platformSelect({
    message: t("select.message"),
    projectRoot,
  });
}
