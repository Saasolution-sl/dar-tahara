/**
 * Dar Tahara, AC add-on Stripe/database quantity reconciliation.
 *
 * The database is the operational source for which AC units exist and are
 * paid (spec: "the database must be the operational source"). This module
 * decides what Stripe action (if any) is needed to match Stripe's live item
 * quantity to that count, then the caller (a webhook handler or an admin
 * "synchronize" action) performs the actual Stripe/DB I/O and audit-logs it.
 * The decision function itself is pure and directly unit-testable, same
 * split as every other lib/*.ts module in this codebase.
 */

export type AcQuantityReconciliation =
  | { matches: true }
  | { matches: false; action: "add"; targetQuantity: number }
  | { matches: false; action: "update"; targetQuantity: number }
  | { matches: false; action: "remove" };

/**
 * `stripeItem` is null when no AC add-on subscription item currently exists
 * on the Stripe subscription (either never added, or previously removed).
 */
export function reconcileAcQuantity(
  dbPaidUnitCount: number,
  stripeItem: { quantity: number } | null,
): AcQuantityReconciliation {
  const target = Math.max(Math.trunc(dbPaidUnitCount), 0);
  if (!stripeItem) {
    return target > 0 ? { matches: false, action: "add", targetQuantity: target } : { matches: true };
  }
  if (target === 0) return { matches: false, action: "remove" };
  if (stripeItem.quantity === target) return { matches: true };
  return { matches: false, action: "update", targetQuantity: target };
}

// The functions below perform real Stripe/DB I/O. They are intentionally
// thin: all decision logic lives in the pure reconcileAcQuantity above, so
// this stays a straightforward "do what the decision said, then record what
// happened" orchestrator rather than a second place business rules could
// drift out of sync.
import "server-only";
import {
  addAcAddonSubscriptionItem,
  findAcAddonSubscriptionItem,
  removeAcAddonSubscriptionItem,
  updateAcAddonSubscriptionItemQuantity,
} from "./stripe";
import { serviceInsert, serviceSelect } from "./supabase-rpc";

type SubscriptionForSync = { id: string; stripe_subscription_id: string | null };

/**
 * Recomputes the database-authoritative paid AC unit count for a
 * subscription, compares it to Stripe's live item quantity, and applies
 * whatever change is needed. Logs a `ac_billing_mismatch` audit_logs row
 * whenever a correction was needed (not on every no-op call), so admin can
 * see when and how often drift actually happens rather than only its
 * current state.
 */
export async function reconcileAcStripeQuantity(subscriptionId: string): Promise<AcQuantityReconciliation> {
  const [subscription] = await serviceSelect<SubscriptionForSync[]>(
    `subscriptions?id=eq.${subscriptionId}&select=id,stripe_subscription_id&limit=1`,
  );
  if (!subscription?.stripe_subscription_id) return { matches: true };

  const dbPaidUnitCount = await countPaidAcUnits(subscriptionId);

  const stripeItem = await findAcAddonSubscriptionItem(subscription.stripe_subscription_id);
  const decision = reconcileAcQuantity(dbPaidUnitCount, stripeItem ? { quantity: stripeItem.quantity } : null);
  if (decision.matches) return decision;

  const idempotencyKey = `ac_addon_sync_${subscriptionId}_${Date.now()}`;
  if (decision.action === "add") {
    await addAcAddonSubscriptionItem({ subscriptionId: subscription.stripe_subscription_id, quantity: decision.targetQuantity, idempotencyKey });
  } else if (decision.action === "update" && stripeItem) {
    await updateAcAddonSubscriptionItemQuantity({ subscriptionItemId: stripeItem.id, quantity: decision.targetQuantity, idempotencyKey });
  } else if (decision.action === "remove" && stripeItem) {
    await removeAcAddonSubscriptionItem({ subscriptionItemId: stripeItem.id, idempotencyKey });
  }

  await serviceInsert("audit_logs", {
    action: "ac_billing_mismatch_corrected",
    resource_type: "ac_billing_mismatch",
    resource_id: subscriptionId,
    previous_value: { stripe_quantity: stripeItem?.quantity ?? 0 },
    new_value: { db_paid_unit_count: dbPaidUnitCount, action: decision.action },
  });

  return decision;
}

/** Read-only check for the admin dashboard: whether a subscription's Stripe AC quantity currently matches the database, without correcting anything. */
export async function checkAcStripeQuantityMismatch(subscriptionId: string): Promise<AcQuantityReconciliation> {
  const [subscription] = await serviceSelect<SubscriptionForSync[]>(
    `subscriptions?id=eq.${subscriptionId}&select=id,stripe_subscription_id&limit=1`,
  );
  if (!subscription?.stripe_subscription_id) return { matches: true };
  const dbPaidUnitCount = await countPaidAcUnits(subscriptionId);
  const stripeItem = await findAcAddonSubscriptionItem(subscription.stripe_subscription_id);
  return reconcileAcQuantity(dbPaidUnitCount, stripeItem ? { quantity: stripeItem.quantity } : null);
}

// paid_addon rows already exclude the included unit (a separate
// coverage_type), so this row count is directly the paid-unit count -- no
// further subtraction needed. Matches the `.length` counting convention
// used throughout the codebase (e.g. deep-clean-requests/route.ts) rather
// than a PostgREST aggregate with no prior usage here.
async function countPaidAcUnits(subscriptionId: string): Promise<number> {
  const rows = await serviceSelect<Array<{ id: string }>>(
    `ac_units?subscription_id=eq.${subscriptionId}&coverage_type=eq.paid_addon&status=in.(active,pending_activation)&select=id`,
  );
  return rows.length;
}
