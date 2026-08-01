import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import test from "node:test";

const root = process.cwd();

test("new-subscription assessment checkout is authenticated and account-owned", () => {
  const route = readFileSync(
    join(
      root,
      "src/app/api/account/subscriptions/new-assessment/route.ts",
    ),
    "utf8",
  );
  assert.match(route, /isSameOrigin\(req\)/);
  assert.match(route, /authorizeApi\(\["applicant", "customer"\]\)/);
  assert.match(route, /customer_id: customerId/);
  assert.match(route, /stripeCustomerId: customer\.stripe_customer_id/);
  assert.match(route, /status: "awaiting_payment"/);
  assert.match(route, /payment_status: "unpaid"/);
  assert.match(route, /payment_method_ready_at/);
  assert.doesNotMatch(route, /submittedBody\.customerId/);
});

test("the portal exposes the action and paid pending lifecycle", () => {
  const subscriptions = readFileSync(
    join(root, "src/app/account/subscriptions/page.tsx"),
    "utf8",
  );
  const modal = readFileSync(
    join(root, "src/components/portal/AddSubscriptionModal.tsx"),
    "utf8",
  );
  const properties = readFileSync(
    join(root, "src/app/account/properties/page.tsx"),
    "utf8",
  );
  const table = readFileSync(
    join(root, "src/components/portal/PropertiesTable.tsx"),
    "utf8",
  );
  assert.match(subscriptions, /AddSubscriptionModal/);
  assert.match(modal, /Add a new subscription/);
  assert.match(modal, /new-assessment/);
  assert.match(properties, /propertyPortalState/);
  assert.match(table, /cursor-not-allowed/);
  assert.match(table, /pending \? "pending" : "active"/);
});
