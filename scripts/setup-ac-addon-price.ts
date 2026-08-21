/**
 * One-time setup: creates the fixed Stripe Product/Price for the AC
 * maintenance add-on (€4.00/month per additional registered AC unit).
 *
 * Run once per Stripe mode/environment (test and production are separate
 * Stripe accounts/keys, so this must be run once against each):
 *
 *   npx tsx scripts/setup-ac-addon-price.ts
 *
 * Then paste the printed Price ID into STRIPE_AC_ADDON_PRICE_ID in that
 * environment's .env / deployment config. Never hardcode it in application
 * code — src/lib/stripe.ts's acAddonPriceId() reads it from configuration.
 */
import { createAcAddonPrice } from "../src/lib/stripe";

async function main() {
  if (!process.env.STRIPE_SECRET_KEY) {
    console.error("STRIPE_SECRET_KEY is not set in this environment.");
    process.exit(1);
  }
  const price = await createAcAddonPrice();
  console.log("Created AC add-on Product/Price:");
  console.log(`  Price ID:   ${price.id}`);
  console.log(`  Product ID: ${price.product}`);
  console.log("\nAdd this to your environment configuration:");
  console.log(`  STRIPE_AC_ADDON_PRICE_ID=${price.id}`);
}

main().catch((err) => {
  console.error("Failed to create AC add-on price:", err instanceof Error ? err.message : err);
  process.exit(1);
});
