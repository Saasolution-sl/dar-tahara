# REM-001 dependency remediation evidence

Date: 2026-08-21

Status: **Implemented in the worktree; controlled release pending**

Controls: A.5.21, A.8.8, A.8.29

Risk: R-002

## Change

- Upgraded Next.js and `eslint-config-next` from 15.5.20 to 15.5.23.
- Upgraded PostCSS to 8.5.26, including Next.js's overridden copy.
- Resolved the vulnerable `nanoid`, `js-yaml`, and `brace-expansion` transitive versions through the lockfile.
- Overrode Sharp to 0.35.3. The supported runtime requirement is satisfied by the repository's Node.js 22 container baseline.
- Updated `package-lock.json` using npm's dependency resolver.

## Verification

| Check | Result |
| --- | --- |
| `npm audit --omit=dev --json` | Passed: 0 vulnerabilities |
| `npm audit --json` | Passed: 0 vulnerabilities |
| `npm test` | Passed: 661/661 tests |
| `npm run typecheck` | Passed |
| `npm run lint` | Passed; existing ESLintRC deprecation warning only |
| `npm run build` | Passed with Next.js 15.5.23; 163 static pages generated |

## Residual work and boundary

This evidence proves the source and lockfile remediation in the current worktree. It does not prove production deployment. REM-003 must add recurring dependency/security gates, and an authorized release owner must deploy the reviewed change before the treatment is operationally effective. No risk acceptance is implied.
