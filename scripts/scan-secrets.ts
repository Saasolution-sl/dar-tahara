import { spawnSync } from "node:child_process";
import { readFileSync, statSync } from "node:fs";

import { formatSecretFinding, scanTextForSecrets } from "../src/lib/security/secret-scan";

const MAX_FILE_SIZE = 2 * 1024 * 1024;
const listed = spawnSync(
  "git",
  ["ls-files", "-z", "--cached", "--others", "--exclude-standard"],
  { encoding: "utf8" },
);

if (listed.status !== 0) {
  process.stderr.write("Secret scan could not enumerate repository files.\n");
  process.exit(2);
}

const files = listed.stdout.split("\0").filter(Boolean);
let findingCount = 0;
let skippedLargeFiles = 0;

for (const file of files) {
  let contents: Buffer;
  try {
    if (statSync(file).size > MAX_FILE_SIZE) {
      skippedLargeFiles += 1;
      continue;
    }
    contents = readFileSync(file);
  } catch {
    continue;
  }

  if (contents.includes(0)) continue;

  for (const finding of scanTextForSecrets(contents.toString("utf8"))) {
    process.stderr.write(`${formatSecretFinding(file, finding)}\n`);
    findingCount += 1;
  }
}

if (skippedLargeFiles > 0) {
  process.stdout.write(`Secret scan skipped ${skippedLargeFiles} file(s) larger than 2 MiB.\n`);
}

if (findingCount > 0) {
  process.stderr.write(`Secret scan failed with ${findingCount} possible secret(s). Values were suppressed.\n`);
  process.exit(1);
}

process.stdout.write(`Secret scan passed for ${files.length} repository file(s).\n`);
