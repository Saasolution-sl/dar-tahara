import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { ISO27001_DRIFT_CHECKS, evaluateIso27001Drift } from "../src/lib/iso27001-drift";

const root = process.cwd();
const sources = Object.fromEntries(ISO27001_DRIFT_CHECKS.map((check) => {
  try {
    return [check.file, readFileSync(resolve(root, check.file), "utf8")];
  } catch {
    return [check.file, undefined];
  }
}));
const checks = evaluateIso27001Drift(sources);
const failed = checks.filter((check) => check.status === "fail");
const report = {
  schema: "dar-tahara.iso27001.control-drift.v1",
  generated_at: new Date().toISOString(),
  summary: { total: checks.length, passed: checks.length - failed.length, failed: failed.length },
  checks,
};

process.stdout.write(`${JSON.stringify(report, null, 2)}\n`);
if (failed.length > 0) process.exitCode = 1;
