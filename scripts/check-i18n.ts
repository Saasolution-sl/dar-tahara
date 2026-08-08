/**
 * i18n coverage check: every leaf key in the English source must be present
 * in every locale override, and (for informational purposes) flags any leaf
 * whose value is byte-identical to English so it can be reviewed.
 */
import en from "../src/i18n/dictionaries/en";
import nl from "../src/i18n/dictionaries/nl";
import fr from "../src/i18n/dictionaries/fr";
import ar from "../src/i18n/dictionaries/ar";
import es from "../src/i18n/dictionaries/es";
import de from "../src/i18n/dictionaries/de";
import pt from "../src/i18n/dictionaries/pt";

const locales: Record<string, unknown> = { nl, fr, ar, es, de, pt };

// Leaves that are expected to match English (brand marks, units, tokens).
const allowIdentical = new Set([
  "brand.name",
  "calculator.sizeUnit",
  "enquiry.fields", // parents skipped anyway
  "footer.whatsapp",
  "nav.faq",
  "hero.stat1Value",
]);

function flatten(obj: unknown, prefix = "", out: Record<string, string> = {}) {
  if (typeof obj === "string") {
    out[prefix] = obj;
    return out;
  }
  if (Array.isArray(obj)) {
    obj.forEach((v, i) => flatten(v, `${prefix}[${i}]`, out));
    return out;
  }
  if (obj && typeof obj === "object") {
    for (const [k, v] of Object.entries(obj)) {
      flatten(v, prefix ? `${prefix}.${k}` : k, out);
    }
  }
  return out;
}

const enFlat = flatten(en);
const enKeys = Object.keys(enFlat);

let hadMissing = false;

for (const [name, dict] of Object.entries(locales)) {
  const flat = flatten(dict);
  const missing = enKeys.filter((k) => !(k in flat));
  const identical = enKeys.filter(
    (k) => k in flat && flat[k] === enFlat[k] && !allowIdentical.has(k.replace(/\[\d+\]/g, "")),
  );

  const coverage = (((enKeys.length - missing.length) / enKeys.length) * 100).toFixed(1);
  console.log(`\n${name.toUpperCase()}, ${coverage}% keys present (${enKeys.length - missing.length}/${enKeys.length})`);

  if (missing.length) {
    hadMissing = true;
    console.log(`  ❌ MISSING (${missing.length}):`);
    missing.forEach((k) => console.log(`     - ${k}`));
  }
  if (identical.length) {
    console.log(`  ⚠️  identical to English (${identical.length}, review if unintended):`);
    identical.slice(0, 20).forEach((k) => console.log(`     · ${k} = ${JSON.stringify(enFlat[k])}`));
    if (identical.length > 20) console.log(`     …and ${identical.length - 20} more`);
  }
  if (!missing.length && !identical.length) console.log("  ✅ complete, no English left-overs");
}

console.log(`\nTotal English leaves: ${enKeys.length}`);
if (hadMissing) {
  console.error("\nFAIL: some locales are missing keys.");
  process.exit(1);
} else {
  console.log("\nPASS: all locales have every key.");
}
