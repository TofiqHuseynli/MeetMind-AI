import { useMediaQuery } from "./use-media-query";

// Below md the sidebar becomes a sheet. Rewritten from shadcn's version so the value comes from
// the media query directly, without setting state in an effect.
const MOBILE_QUERY = "(max-width: 767px)";

export function useIsMobile(): boolean {
  return useMediaQuery(MOBILE_QUERY);
}
