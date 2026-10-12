import { useEffect } from "react";

const SITE_NAME = "Recap";

/** Sets the browser tab title for the page that renders it. */
export function PageTitle({ title }: { title: string }) {
  useEffect(() => {
    document.title = `${title} | ${SITE_NAME}`;
    return () => {
      document.title = SITE_NAME;
    };
  }, [title]);
  return null;
}
