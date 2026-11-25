// pigeon-pitch-one-line — a city pigeon's one-line elevator pitch.
//
// The program does exactly one thing: it writes the chosen pitch to
// /output/entry.txt (or to $MAKEFUN_OUTPUT_DIR/entry.txt when that
// variable is set, so the entry can be checked locally). The pitch is a
// single line of English, at most 200 characters, with no trailing
// newline — the gate scorer reads the file as-is, so any extra byte
// would count against the 200-character cap.
//
// The pitch itself lives in CHOSEN_PITCH below. Five other lines were
// drafted and rejected; the reasons are recorded in README.md.

import { chmodSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

// The hard cap from the bounty rules: entry.txt must hold 1-200 chars.
const CHAR_LIMIT = 200;

// The winning line. A pigeon selling statues protection from itself:
// the business is a protection racket, the product is the pigeon, and
// the punchline lands on the last clause, where the speaker admits it.
const CHOSEN_PITCH =
  "My startup sells statues a monthly subscription to never be pooped on again — I'm the pigeon, so I know exactly what they're paying to avoid.";

// Where the entry goes. The harness mounts /output; a local run can
// point somewhere else with MAKEFUN_OUTPUT_DIR instead.
function outputFolder(): string {
  const override = process.env.MAKEFUN_OUTPUT_DIR;
  if (override !== undefined && override.trim() !== "") {
    return override;
  }
  return "/output";
}

// Count characters the way a reader counts them: one code point each,
// so an em dash or an apostrophe never inflates the total.
function charCount(text: string): number {
  return [...text].length;
}

// Refuse to write anything the gate would reject, rather than writing
// a bad file and hoping nobody notices.
function guardPitch(text: string): void {
  if (text.trim().length === 0) {
    throw new Error("pitch is empty or only whitespace");
  }
  if (text.includes("\n") || text.includes("\r")) {
    throw new Error("pitch must be exactly one line");
  }
  const size = charCount(text);
  if (size > CHAR_LIMIT) {
    throw new Error(`pitch is ${size} characters, over the ${CHAR_LIMIT} limit`);
  }
}

function main(): void {
  guardPitch(CHOSEN_PITCH);

  const folder = outputFolder();
  mkdirSync(folder, { recursive: true });

  const target = join(folder, "entry.txt");
  writeFileSync(target, CHOSEN_PITCH, "utf8");

  // The grader collects the output as a different user, so the file
  // must be world-readable: 0644, never the 0600 a temp file gets.
  chmodSync(target, 0o644);

  // Read the file back and confirm it holds exactly the pitch — no
  // trailing newline, no encoding surprise, nothing appended.
  const written = readFileSync(target, "utf8");
  if (written !== CHOSEN_PITCH) {
    throw new Error("entry.txt does not match the pitch after writing");
  }
  guardPitch(written);

  console.log(`wrote ${target} (${charCount(CHOSEN_PITCH)} characters)`);
}

main();
