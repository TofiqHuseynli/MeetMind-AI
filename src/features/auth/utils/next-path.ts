const HOME = "/dashboard";

/**
 * Where to go after signing in: the page the visitor wanted, from `?next=`. Only a path of this
 * app counts, so a crafted link can never send them to another site.
 */
export function nextPathFrom(params: URLSearchParams): string {
  const next = params.get("next");
  if (!next || !next.startsWith("/") || next.startsWith("//") || next.startsWith("/login")) {
    return HOME;
  }
  return next;
}

/** The sign-in page, remembering the page the visitor asked for. */
export function loginPathFor(path: string): string {
  return path === "/" || path === HOME ? "/login" : `/login?next=${encodeURIComponent(path)}`;
}
