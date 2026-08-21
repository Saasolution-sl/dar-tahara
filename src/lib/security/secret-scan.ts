export type SecretFinding = {
  detector: string;
  line: number;
};

type Detector = {
  name: string;
  pattern: RegExp;
};

const detectors: Detector[] = [
  { name: "private-key", pattern: /-----BEGIN (?:RSA |EC |OPENSSH |DSA )?PRIVATE KEY-----/ },
  { name: "aws-access-key", pattern: /\b(?:AKIA|ASIA)[A-Z0-9]{16}\b/ },
  { name: "github-token", pattern: /\bgh[pousr]_[A-Za-z0-9]{36,255}\b/ },
  { name: "stripe-secret-key", pattern: /\b(?:sk|rk)_(?:live|test)_[A-Za-z0-9]{16,}\b/ },
  { name: "stripe-webhook-secret", pattern: /\bwhsec_[A-Za-z0-9]{24,}\b/ },
  { name: "supabase-secret-key", pattern: /\bsb_secret_[A-Za-z0-9_-]{20,}\b/ },
  { name: "slack-token", pattern: /\bxox[baprs]-[A-Za-z0-9-]{20,}\b/ },
  { name: "google-api-key", pattern: /\bAIza[A-Za-z0-9_-]{35}\b/ },
];

export function scanTextForSecrets(text: string): SecretFinding[] {
  const findings: SecretFinding[] = [];

  for (const [index, line] of text.split(/\r?\n/).entries()) {
    for (const detector of detectors) {
      if (detector.pattern.test(line)) {
        findings.push({ detector: detector.name, line: index + 1 });
      }
    }
  }

  return findings;
}

export function formatSecretFinding(file: string, finding: SecretFinding): string {
  return `${file}:${finding.line} [${finding.detector}] possible secret`;
}
