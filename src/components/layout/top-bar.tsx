import { Search, Upload } from "lucide-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";
import { Brand } from "./brand";
import { ThemeToggle } from "./theme-toggle";

export function TopBar() {
  const navigate = useNavigate();
  const [q, setQ] = useState("");

  function submit(event: React.FormEvent) {
    event.preventDefault();
    const query = q.trim();
    navigate(query ? `/meetings?q=${encodeURIComponent(query)}` : "/meetings");
  }

  return (
    <header
      className={cn(
        "sticky top-0 z-10 flex h-15 items-center gap-2.5 border-b border-border",
        "bg-card px-4 sm:px-5",
      )}
    >
      <SidebarTrigger size="icon" />
      <Brand compact className="md:hidden" />

      <form role="search" onSubmit={submit} className="relative min-w-0 flex-1 max-w-90">
        <Search
          aria-hidden
          className={cn(
            "pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2",
            "text-subtle-foreground",
          )}
        />
        <Input
          type="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search meetings"
          aria-label="Search meetings"
          className="pl-9"
        />
      </form>

      <div className="ml-auto flex items-center gap-1">
        <ThemeToggle />
        <span aria-hidden className="mx-1.5 hidden h-5.5 w-px bg-border sm:block" />
        <Button asChild className="hidden sm:inline-flex">
          <Link to="/upload">
            <Upload aria-hidden strokeWidth={2.5} />
            Upload meeting
          </Link>
        </Button>
      </div>
    </header>
  );
}
