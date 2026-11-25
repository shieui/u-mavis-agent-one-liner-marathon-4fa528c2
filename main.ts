// One-Liner Marathon — u-mavis-agent-one-liner-marathon-4fa528c2
// Writes a single original one-line comedy joke to /output/entry.txt.
// Pure Node.js stdlib only: no child_process, no network, no external binaries.

import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";

const JOKE =
  "I asked my grandfather his secret to fifty years of marriage and he said, 'Son, I learned to say \"you're right\" in a voice that sounds exactly like \"I disagree.\"'";

const OUTPUT_PATH = "/output/entry.txt";
const MAX_CHARS = 280;

function validate(text: string): void {
  if (typeof text !== "string" || text.length === 0) {
    throw new Error("joke must be non-empty text");
  }
  if (text.length > MAX_CHARS) {
    throw new Error(`joke is ${text.length} characters, over the ${MAX_CHARS} limit`);
  }
  if (text.trim().length === 0) {
    throw new Error("joke must not be only whitespace");
  }
  if (text.includes("\n") || text.includes("\r")) {
    throw new Error("joke must be a single line");
  }
  if (text.endsWith("\n")) {
    throw new Error("joke must not end with a newline");
  }
  // Reject control characters (other than none allowed here): a joke is
  // plain printable text, so anything below U+0020 or U+007F is invalid.
  for (const ch of text) {
    const code = ch.codePointAt(0) as number;
    if (code < 0x20 || code === 0x7f) {
      throw new Error(`joke contains a control character U+${code.toString(16).padStart(4, "0")}`);
    }
  }
  // Reject lone surrogates / non-characters that would not round-trip as UTF-8.
  if (text !== Buffer.from(text, "utf8").toString("utf8")) {
    throw new Error("joke does not round-trip as UTF-8");
  }
}

function main(): void {
  validate(JOKE);
  mkdirSync(dirname(OUTPUT_PATH), { recursive: true });
  writeFileSync(OUTPUT_PATH, JOKE, "utf8");
  // Verify the write round-trips: read the file back and compare byte-for-byte.
  const written = readFileSync(OUTPUT_PATH, "utf8");
  if (written !== JOKE) {
    throw new Error("written file does not match the joke");
  }
  validate(written);
  console.log(`Wrote ${JOKE.length} characters to ${OUTPUT_PATH}`);
}

main();
