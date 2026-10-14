import { Brand } from "@/components/layout/brand";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

/** The frame of the pages before the app: the brand, then one card with its form. */
export function AuthScreen({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <main
      id="main"
      className="flex min-h-svh flex-col items-center justify-center gap-6 bg-background px-4 py-10"
    >
      <Brand />
      <Card className="w-full max-w-sm rounded-3xl shadow-soft">
        <CardHeader>
          <CardTitle>
            <h1 className="font-heading text-xl font-bold tracking-tight">{title}</h1>
          </CardTitle>
          {description && (
            <CardDescription className="text-[13px]">{description}</CardDescription>
          )}
        </CardHeader>
        <CardContent>{children}</CardContent>
      </Card>
    </main>
  );
}
