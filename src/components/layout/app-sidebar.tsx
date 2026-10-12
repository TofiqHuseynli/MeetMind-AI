import { NavLink, useLocation } from "react-router";
import { isNavActive, navItems } from "@/components/layout/nav";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  useSidebar,
} from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";
import { Brand } from "./brand";

// The indigo tint marks the current page, also while the pointer is over it.
const itemClass = cn(
  "h-10 gap-2.5 rounded-xl px-3 text-sm font-medium",
  "data-active:bg-primary/10 data-active:font-semibold data-active:text-primary",
  "data-active:hover:bg-primary/10 data-active:hover:text-primary",
);

/** The main navigation: a sidebar that collapses to an icon rail, a sheet on phones. */
export function AppSidebar() {
  const { pathname } = useLocation();
  const { state, isMobile, setOpenMobile } = useSidebar();
  const compact = state === "collapsed" && !isMobile;

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="h-15 justify-center">
        <Brand compact={compact} className={cn(!compact && "px-1")} />
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <nav aria-label="Main">
            <SidebarMenu>
              {navItems.map(({ to, label, icon: Icon }) => (
                <SidebarMenuItem key={to}>
                  <SidebarMenuButton
                    asChild
                    isActive={isNavActive(pathname, to)}
                    tooltip={label}
                    className={itemClass}
                  >
                    <NavLink to={to} onClick={() => setOpenMobile(false)}>
                      <Icon aria-hidden />
                      <span>{label}</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </nav>
        </SidebarGroup>
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  );
}
