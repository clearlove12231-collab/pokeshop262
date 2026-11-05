/** Game tabs of the clone (the source's other tabs are not cloned). */
export const FAMILIES = ["pokemon", "onepiece"] as const;
export type Family = (typeof FAMILIES)[number];

/** Reads the source's ?qo_tab= value; anything else opens the Pokemon tab. */
export function parseFamily(value: string | string[] | undefined): Family {
  const v = Array.isArray(value) ? value[0] : value;
  return FAMILIES.find((f) => f === v) ?? "pokemon";
}
