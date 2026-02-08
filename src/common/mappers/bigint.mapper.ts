export function bigintToString<T extends Record<string, any>>(obj: T): T {
  return Object.fromEntries(
    Object.entries(obj).map(([k, v]) => [
      k,
      typeof v === 'bigint' ? v.toString() : v,
    ]),
  ) as T;
}
