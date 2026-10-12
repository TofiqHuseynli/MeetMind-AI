import { Circle, CircleCheck, LoaderCircle } from "lucide-react";
import { cn } from "@/lib/utils";

export type ProcessingStep = {
  label: string;
  state: "done" | "current" | "waiting";
};

const stepLook = {
  done: { icon: CircleCheck, className: "text-status-done", status: "done" },
  current: { icon: LoaderCircle, className: "animate-spin text-primary", status: "running" },
  waiting: { icon: Circle, className: "text-subtle-foreground/50", status: "waiting" },
};

/** Work in progress: what is done, what runs now, and that the page updates on its own. */
export function ProcessingState({
  title,
  description,
  steps,
  className,
}: {
  title: string;
  description?: string;
  steps: ProcessingStep[];
  className?: string;
}) {
  return (
    <div
      role="status"
      className={cn("rounded-2xl border bg-card px-6 py-8 sm:px-8", className)}
    >
      <h2 className="font-heading text-[15px] font-bold text-foreground">{title}</h2>
      {description && <p className="mt-1 text-[13px] text-muted-foreground">{description}</p>}
      <ol className="mt-5 grid gap-3">
        {steps.map((step) => {
          const { icon: Icon, className: iconClass, status } = stepLook[step.state];
          return (
            <li
              key={step.label}
              className={cn(
                "flex items-center gap-3 text-sm",
                step.state === "waiting" ? "text-subtle-foreground" : "text-foreground",
                step.state === "current" && "font-semibold",
              )}
            >
              <Icon aria-hidden className={cn("size-4.5 shrink-0", iconClass)} />
              {step.label}
              <span className="sr-only">, {status}</span>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
