import chalk from "chalk";

// Palette tokens from docs/design/visual-design-guide.md §11.
//
// A terminal's background is unknown at runtime, so the guide's --og-ink
// (#20211F) and --og-canvas (#F7F6F2) cannot be used directly — either one
// disappears against half the terminals in use. The frame therefore takes
// --og-ink-muted, the one neutral that holds contrast on light and dark
// surfaces alike, and the title falls back to the terminal's own foreground.
//
// This preserves the rule that matters (§50): structure stays quiet, the
// present gets the color.

/** --og-ink-muted — the open frame, and anything structural. */
export const structure = chalk.hex("#6B6B66");

/** --og-goal — the current goal, and the one action worth taking now (§13). */
export const goal = chalk.hex("#F45A3A");

/** Terminal foreground, so the wordmark is legible on any background. */
export const title = chalk.bold;
