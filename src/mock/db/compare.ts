/** Text by its letters, ignoring case and accents; numbers by size. For the list sorts. */
export function compareValues(a: string | number, b: string | number): number {
  if (typeof a === "string" && typeof b === "string") {
    return a.localeCompare(b, "en", { sensitivity: "base" });
  }
  return Number(a) - Number(b);
}
