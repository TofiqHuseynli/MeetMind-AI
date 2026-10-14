/**
 * A column of a view that is always set. Postgres cannot tell that a view's columns are never
 * null, so the generated types say they may be; one that is null here is a bug in the view.
 */
export function required<T>(value: T | null, column: string): T {
  if (value === null) throw new Error(`The database sent no ${column}.`);
  return value;
}

/** A person's initials for the avatar: "Amira Haddad" gives "AH", "Lena" gives "LE". */
export function initialsOf(name: string): string {
  const words = name.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return "?";
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  return `${words[0][0]}${words[words.length - 1][0]}`.toUpperCase();
}

/** A text column narrowed to its union; a value outside it is a bug in the data. */
export function oneOf<const T extends readonly string[]>(
  value: string | null,
  values: T,
  column: string,
): T[number] {
  const found = values.find((v) => v === value);
  if (found === undefined) throw new Error(`The database sent ${value} as ${column}.`);
  return found;
}
