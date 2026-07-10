/** Widen literal primitives (from `as const`) back to their base types. */
type Widen<T> = T extends string
  ? string
  : T extends number
    ? number
    : T extends boolean
      ? boolean
      : T;

/**
 * Deep-partial that also widens literal primitives, so locale override files
 * can supply any string/number where the English base has a literal type.
 */
export type DeepPartial<T> = T extends readonly (infer U)[]
  ? readonly DeepPartial<U>[]
  : T extends object
    ? { [P in keyof T]?: DeepPartial<T[P]> }
    : Widen<T>;
