export const SUBSCRIPTION_PAYMENT_CONSENT_VERSION = "subscription-auto-payment-2026-07-30";
export const SUBSCRIPTION_PAYMENT_TIME_ZONE = "Europe/Amsterdam";

type ZonedDateParts = {
  year: number;
  month: number;
  day: number;
  weekday: number;
  hour: number;
  minute: number;
  second: number;
};

const WEEKDAY_NUMBER: Record<string, number> = {
  Mon: 1,
  Tue: 2,
  Wed: 3,
  Thu: 4,
  Fri: 5,
  Sat: 6,
  Sun: 7,
};

function zonedParts(date: Date, timeZone: string): ZonedDateParts {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23",
  }).formatToParts(date);
  const value = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((part) => part.type === type)?.value || "";
  return {
    year: Number(value("year")),
    month: Number(value("month")),
    day: Number(value("day")),
    weekday: WEEKDAY_NUMBER[value("weekday")] || 1,
    hour: Number(value("hour")),
    minute: Number(value("minute")),
    second: Number(value("second")),
  };
}

function localTimeToUtc(
  input: Omit<ZonedDateParts, "weekday">,
  timeZone: string,
): Date {
  const desiredAsUtc = Date.UTC(
    input.year,
    input.month - 1,
    input.day,
    input.hour,
    input.minute,
    input.second,
  );
  let candidate = new Date(desiredAsUtc);
  for (let attempt = 0; attempt < 3; attempt += 1) {
    const actual = zonedParts(candidate, timeZone);
    const actualAsUtc = Date.UTC(
      actual.year,
      actual.month - 1,
      actual.day,
      actual.hour,
      actual.minute,
      actual.second,
    );
    candidate = new Date(candidate.getTime() + desiredAsUtc - actualAsUtc);
  }
  return candidate;
}

/**
 * Returns the next Friday after authorization, at noon in the business time
 * zone. Friday itself rolls to the following Friday so no authorization can
 * produce a same-day surprise charge.
 */
export function nextFridayPaymentAt(
  authorizedAt: Date,
  timeZone = SUBSCRIPTION_PAYMENT_TIME_ZONE,
): Date {
  const local = zonedParts(authorizedAt, timeZone);
  let daysAhead = (5 - local.weekday + 7) % 7;
  if (daysAhead === 0) daysAhead = 7;
  const targetDate = new Date(Date.UTC(local.year, local.month - 1, local.day + daysAhead));
  return localTimeToUtc(
    {
      year: targetDate.getUTCFullYear(),
      month: targetDate.getUTCMonth() + 1,
      day: targetDate.getUTCDate(),
      hour: 12,
      minute: 0,
      second: 0,
    },
    timeZone,
  );
}

export function serviceWindowAfterPayment(
  paidAt: Date,
  timeZone = SUBSCRIPTION_PAYMENT_TIME_ZONE,
): { start: string; end: string } {
  const local = zonedParts(paidAt, timeZone);
  const daysUntilMonday = (8 - local.weekday) % 7 || 7;
  const monday = new Date(Date.UTC(local.year, local.month - 1, local.day + daysUntilMonday));
  const sunday = new Date(monday.getTime() + 6 * 86_400_000);
  return {
    start: monday.toISOString().slice(0, 10),
    end: sunday.toISOString().slice(0, 10),
  };
}
