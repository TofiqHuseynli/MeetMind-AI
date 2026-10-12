import { Outlet } from "react-router";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { TopBar } from "@/components/layout/top-bar";
import { SidebarProvider } from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";

// 240 px open; the icon rail keeps shadcn's 3rem.
const sidebarStyle = { "--sidebar-width": "15rem" } as React.CSSProperties;

export function RootLayout() {
  return (
    <SidebarProvider style={sidebarStyle}>
      <a
        href="#main"
        className={cn(
          "sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-20",
          "focus:rounded-lg focus:bg-card focus:px-3 focus:py-2",
        )}
      >
        Skip to content
      </a>
      <AppSidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <TopBar />
        <main
          id="main"
          className="w-full min-w-0 flex-1 px-4 py-6 pb-10 sm:px-6 lg:px-9"
        >
          <Outlet />
        </main>
      </div>
    </SidebarProvider>
  );
}
