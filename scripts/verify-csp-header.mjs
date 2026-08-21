const url = process.argv[2] || "http://127.0.0.1:3000/en";
const response = await fetch(url, {
  redirect: "manual",
  headers: process.env.HOST_HEADER ? { Host: process.env.HOST_HEADER } : {},
});
const enforced = response.headers.get("content-security-policy");
const reportOnly = response.headers.get("content-security-policy-report-only");
console.log(JSON.stringify({ status: response.status, enforced: Boolean(enforced), reportOnly: Boolean(reportOnly) }));
if (process.env.EXPECT_CSP_ENFORCE === "true" && (!enforced || reportOnly)) process.exitCode = 1;
if (process.env.EXPECT_CSP_ENFORCE === "false" && (enforced || !reportOnly)) process.exitCode = 1;
