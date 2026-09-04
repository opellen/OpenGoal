// The OpenGoal mark in text: an open frame with the current goal inside it.
//
// Two-layer logo. Layers are overlaid at render time: any non-space char in
// `inner` wins over `frame`. This lets the same block char carry a different
// color depending on which layer it belongs to, without a parallel mask array
// to keep in sync — `frame` renders in the muted structural tone, `inner` in
// goal orange (§50: structure stays quiet, the present gets the color).
//
// Palette: █ (full), ▓ (dark), ▒ (medium), ░ (light) — shade blocks give a
// pseudo-anti-aliased gradient that renders uniformly across monospace fonts.
// The focus point is a blob shaded radially in four rings — █ core, ▓, ▒,
// then ░ at the corners. All three rows share one width: the cross-arm
// illusion comes from rows of different lengths, not from dark centres, so
// equal widths allow a real ring gradient. Density under a single orange.
//
// Geometry: 16x9 cells (a terminal cell is roughly twice as tall as it is
// wide, so the frame reads near-square). The right side stays open across
// 3 of 9 rows; the top and bottom bars are half-blocks (▄/▀) inset by one
// column, which both thickens the stroke and stair-steps the corners.
export const OPENGOAL_LOGO = {
  frame: [
    "  ▄▄▄▄▄▄▄▄▄▄▄▄  ",
    " ██          ██ ",
    " ██          ██ ",
    " ██             ",
    " ██             ",
    " ██             ",
    " ██          ██ ",
    " ██          ██ ",
    "  ▀▀▀▀▀▀▀▀▀▀▀▀  ",
  ],
  inner: [
    "                ",
    "                ",
    "                ",
    "     ░▒▒▒▒░     ",
    "     ▒▒██▒▒     ",
    "     ░▒▒▒▒░     ",
    "                ",
    "                ",
    "                ",
  ],
} as const;

export const OPENGOAL_LOGO_WIDTH = OPENGOAL_LOGO.frame[0].length;
export const OPENGOAL_LOGO_HEIGHT = OPENGOAL_LOGO.frame.length;
