/**
 * The one place that touches libphonenumber-js directly.
 *
 * Why this wrapper exists: importing the package's default entry pulls its
 * metadata JSON through whichever module interop the current runtime uses, and
 * under the ESM test runner that arrives wrapped as `{ default: … }`. The
 * library then rejects it with "metadata argument was passed but it's not a
 * valid metadata". So we import the metadata explicitly, unwrap the interop
 * shape once, and use the `/core` API that takes metadata as an argument.
 *
 * Everything else in the codebase imports from here, never from the package.
 */
import rawMetadata from "libphonenumber-js/metadata.min.json";
import {
  getCountries as coreGetCountries,
  getCountryCallingCode as coreGetCountryCallingCode,
  parsePhoneNumberFromString as coreParse,
  type CountryCode,
  type MetadataJson,
} from "libphonenumber-js/core";

/** Unwrap the `{ default: … }` interop wrapper when a loader adds one. */
const metadata = ((rawMetadata as unknown as { default?: unknown }).default ??
  rawMetadata) as MetadataJson;

export type { CountryCode };

/** Every country the library has dialing metadata for. */
export function getCountries(): CountryCode[] {
  return coreGetCountries(metadata);
}

/** Calling code WITHOUT the plus, e.g. "212". */
export function getCountryCallingCode(country: CountryCode): string {
  return String(coreGetCountryCallingCode(country, metadata));
}

/** True when the string is a country we have metadata for. */
export function isSupportedCountry(value: string | undefined | null): value is CountryCode {
  if (!value) return false;
  return (getCountries() as string[]).includes(value.toUpperCase());
}

/**
 * Parse a number against a default country. Returns undefined rather than
 * throwing on malformed input, so callers never need a try/catch.
 */
export function parsePhone(text: string, country?: CountryCode) {
  try {
    // The /core overload has no "no default country" form, so pass an options
    // object when we don't have one, an already-international number still
    // parses, and a national one correctly fails instead of being guessed.
    return (country
      ? coreParse(text, country, metadata)
      : coreParse(text, {}, metadata)) ?? undefined;
  } catch {
    return undefined;
  }
}
