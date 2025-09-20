import drawBox, { type Options } from "boxen";
import { wrap } from "@/lib/console/ansi";
import { Inspect } from "@/lib/console/logger";

export function boxLog(label: string, data: unknown, opts: Options = {}) {
  if (process.env.NODE_ENV === "production") {
    console.log(`[${label}]`, data);
    return;
  }

  const { borderStyle = "round", borderColor = "cyan", padding = 1 } = opts;

  const title = wrap(label, "bright", "magenta");
  const body = Inspect(data);
  const content = `${title}\n\n${body}`;

  console.log(drawBox(content, { ...opts, padding, borderStyle, borderColor }));
}
