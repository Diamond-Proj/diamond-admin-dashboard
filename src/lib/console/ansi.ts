// ansi.ts — ANSI color utility

const ESC = "\x1b[";
const RESET = `${ESC}0m`;

const STYLES = {
  bright: "1",
  dim: "2",
  underscore: "4",
} as const;

const COLORS = {
  black: "30",
  red: "31",
  green: "32",
  yellow: "33",
  blue: "34",
  magenta: "35",
  cyan: "36",
  white: "37",
} as const;

type StyleCode = keyof typeof STYLES;
type FgColor = keyof typeof COLORS;

export function wrap(text: string, ...codes: (StyleCode | FgColor)[]) {
  const seq = codes
    .map((c) => {
      if (c in STYLES) return STYLES[c as StyleCode];
      if (c in COLORS) return COLORS[c as FgColor];
      throw new Error(`Unknown ANSI code: ${c}`);
    })
    .join(";");

  return `${ESC}${seq}m${text}${RESET}`;
}
