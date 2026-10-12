import { cn } from "@/lib/utils";

/**
 * The white area at the top of the meeting page. It reaches past the shell's padding
 * (routes/root-layout.tsx: px-4 sm:px-6 lg:px-9, py-6) to both edges and the top.
 */
export function HeaderArea({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <header
      className={cn(
        "-mx-4 -mt-6 border-b bg-card px-4 pt-5",
        "sm:-mx-6 sm:px-6 lg:-mx-9 lg:px-9",
        className,
      )}
    >
      {children}
    </header>
  );
}
