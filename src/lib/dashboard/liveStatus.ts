/**
 * The `staff_live_status.status` vocabulary, in one place.
 *
 * The dashboard used to answer "what is happening right now?" from two tables
 * with overlapping words: the Live operations board read `staff_live_status`
 * (working/driving/break/waiting/finished/sick/offline) while the tiles above it
 * counted `service_visits` (working/driving/completed/delayed/cancelled). Both
 * have a `working`, neither means the same thing by it, and nothing summed to
 * anything else - the board listed 16 people while "Running" said 0 and
 * "Employees working" said 7.
 *
 * So: every "right now" number comes from LIVE_STATUSES below, and the board
 * shows exactly those rows. The counts add up to the number of cards on screen
 * because they are literally the same query.
 */

/** Someone is on the clock and their status is worth showing on the board. */
export const LIVE_STATUSES = ["working", "driving", "break", "waiting"] as const;

/** Off the clock: the shift is over, or it never started today. */
export const OFF_SHIFT_STATUSES = ["finished", "sick", "offline"] as const;

/**
 * "Employees working" counts these two. A driver on the way to a job is on
 * shift; someone on a break or waiting for a key is live but not producing.
 */
export const ON_SHIFT_STATUSES = ["working", "driving"] as const;

export type LiveStatus = (typeof LIVE_STATUSES)[number];
export type OffShiftStatus = (typeof OFF_SHIFT_STATUSES)[number];
export type StaffStatus = LiveStatus | OffShiftStatus;

export const ALL_STAFF_STATUSES: readonly StaffStatus[] = [...LIVE_STATUSES, ...OFF_SHIFT_STATUSES];

export function isLiveStatus(status: string): status is LiveStatus {
  return (LIVE_STATUSES as readonly string[]).includes(status);
}

export function isOnShift(status: string): boolean {
  return (ON_SHIFT_STATUSES as readonly string[]).includes(status);
}

export type LiveStatusCounts = Record<StaffStatus, number> & {
  /** Rows the board shows: the LIVE_STATUSES total. */
  live: number;
  /** working + driving. */
  onShift: number;
};

/**
 * Count a set of live-status rows into every bucket the dashboard displays.
 *
 * Unknown statuses are ignored rather than lumped into a bucket - inventing a
 * home for a value we do not recognise is how the counts drifted apart in the
 * first place.
 */
export function countLiveStatuses(rows: readonly { status: string }[]): LiveStatusCounts {
  const counts = Object.fromEntries(ALL_STAFF_STATUSES.map((status) => [status, 0])) as Record<StaffStatus, number>;

  for (const row of rows) {
    if (row.status in counts) counts[row.status as StaffStatus] += 1;
  }

  return {
    ...counts,
    live: LIVE_STATUSES.reduce((sum, status) => sum + counts[status], 0),
    onShift: ON_SHIFT_STATUSES.reduce((sum, status) => sum + counts[status], 0),
  };
}

/**
 * Resolve a `?status=` query parameter into the statuses a page should show.
 *
 * `undefined` (no parameter) means the live board's default view. `all` is the
 * escape hatch for "show me everyone, including who went home".
 */
export function resolveStatusFilter(param: string | undefined): readonly string[] {
  if (!param) return LIVE_STATUSES;
  if (param === "all") return ALL_STAFF_STATUSES;
  if (param === "live") return LIVE_STATUSES;
  if (param === "on_shift") return ON_SHIFT_STATUSES;
  const requested = param.split(",").filter((status) => (ALL_STAFF_STATUSES as readonly string[]).includes(status));
  return requested.length ? requested : LIVE_STATUSES;
}
