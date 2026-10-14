import {
  CalendarDays,
  LayoutDashboard,
  ListChecks,
  Upload,
  Users,
  type LucideIcon,
} from "lucide-react";

export type NavItem = { to: string; label: string; icon: LucideIcon };

// One list for the sidebar on desktop and the sheet it becomes on phones.
export const navItems: NavItem[] = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/meetings", label: "Meetings", icon: CalendarDays },
  { to: "/action-items", label: "Action items", icon: ListChecks },
  { to: "/people", label: "People", icon: Users },
  { to: "/upload", label: "Upload", icon: Upload },
];

/** True on the item's own page and below it: `/meetings/m_1` keeps "Meetings" active. */
export function isNavActive(pathname: string, to: string): boolean {
  return pathname === to || pathname.startsWith(`${to}/`);
}
