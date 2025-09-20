// logger.ts — universal logger for Node + Edge environments
import { wrap } from "@/lib/console/ansi";

// simple recursive inspect for coloring and depth control
type InspectOpts = { depth?: number; indent?: number };
export function Inspect(value: unknown, { depth = 3, indent = 3 }: InspectOpts = {}) {
  const seen = new WeakSet();

  function format(val: unknown, currentDepth: number): string {
    if (val === null) return wrap("null", "dim");
    if (typeof val !== "object") {
      switch (typeof val) {
        case "string":
          return wrap(`"${val}"`, "green");
        case "number":
          return wrap(String(val), "yellow");
        case "boolean":
          return wrap(String(val), "magenta");
        case "undefined":
          return wrap("undefined", "dim");
        case "function":
          return wrap("[Function]", "dim");
        default:
          return wrap(String(val), "dim");
      }
    }
    if (seen.has(val)) return wrap("[Circular]", "dim");
    if (currentDepth > depth) return wrap("[Object]", "dim");

    seen.add(val);
    const pad = " ".repeat(currentDepth * indent);
    const padOuter = " ".repeat((currentDepth - 1) * indent);

    if (Array.isArray(val)) {
      const items = val.map((v) => format(v, currentDepth + 1));

      // Determine whether to use single-line format
      const shouldUseSingleLine = () => {
        // If array is empty or has only 1-2 elements
        if (val.length <= 2) return true;

        // If all elements are primitive types (non-object/array) and array is not too long
        const allPrimitive = val.every(
          (item) =>
            item === null ||
            typeof item !== "object" ||
            (typeof item === "object" && !Array.isArray(item) && Object.keys(item).length === 0),
        );

        if (allPrimitive && val.length <= 5) return true;

        // If the formatted total length does not exceed 80 characters
        const singleLineContent = items.join(", ");
        return singleLineContent.length <= 60;
      };

      if (shouldUseSingleLine()) {
        return `[${items.join(", ")}]`;
      } else {
        return `[\n${pad}${items.join(`,\n${pad}`)}\n${padOuter}]`;
      }
    }

    const entries = Object.entries(val).map(([k, v]) => {
      const key = wrap(k, "cyan");
      return `${pad}${key}: ${format(v, currentDepth + 1)}`;
    });

    return `{\n${entries.join(",\n")}\n${padOuter}}`;
  }

  return format(value, 1);
}

const IS_PRODUCTION = process.env.NODE_ENV === "production";

// basic log levels
export const logger = {
  info: (msg: string) => {
    if (IS_PRODUCTION) {
      console.log(`[INFO] ${msg}`);
      return;
    }
    console.log(wrap(`\nℹ️  INFO: ${msg}\n`, "blue", "bright"));
  },
  success: (msg: string) => {
    if (IS_PRODUCTION) {
      console.log(`[SUCCESS] ${msg}`);
      return;
    }
    console.log(wrap(`\n✅  SUCCESS: ${msg}\n`, "green", "bright"));
  },
  warn: (msg: string) => {
    if (IS_PRODUCTION) {
      console.log(`[WARN] ${msg}`);
      return;
    }
    console.log(wrap(`\n⚠️  WARN: ${msg}\n`, "yellow", "bright"));
  },
  error: (msg: string) => {
    if (IS_PRODUCTION) {
      console.log(`[ERROR] ${msg}`);
      return;
    }
    console.log(wrap(`\n❌  ERROR: ${msg}\n`, "red", "bright"));
  },
  dir: (data: unknown, opts?: InspectOpts) => {
    if (IS_PRODUCTION) {
      console.log(data);
      return;
    }
    console.log(Inspect(data, opts));
  },
};
