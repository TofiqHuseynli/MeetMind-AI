import { ChevronsUpDown, LogOut } from "lucide-react";
import { PersonAvatar } from "@/components/common/person-avatar";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SidebarMenu, SidebarMenuButton, SidebarMenuItem } from "@/components/ui/sidebar";
import { usePersonOfUser, useSignOut } from "../../auth.queries";
import { useAuthStore } from "../../auth.store";

/** Who is signed in, at the foot of the sidebar, with the way out. */
export function SidebarUser() {
  const user = useAuthStore((s) => s.session?.user);
  const person = usePersonOfUser(user?.id);
  const signOut = useSignOut();
  if (!user) return null;

  const email = user.email ?? "";
  const name = person.data?.name ?? email;

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton size="lg" tooltip={name} className="rounded-xl">
              {person.data ? (
                <PersonAvatar person={person.data} size="sm" tooltip={false} />
              ) : (
                <Avatar size="sm">
                  <AvatarFallback className="text-[10px] font-bold">
                    {email.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              )}
              <span className="grid min-w-0 flex-1 text-left leading-tight">
                <span className="truncate text-[13px] font-semibold">{name}</span>
                <span className="truncate text-xs text-subtle-foreground">
                  {person.data?.role || email}
                </span>
              </span>
              <ChevronsUpDown aria-hidden className="ml-auto size-4 text-subtle-foreground" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent side="top" align="start" className="w-56">
            <DropdownMenuLabel className="truncate font-normal text-muted-foreground">
              {email}
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem disabled={signOut.isPending} onSelect={() => signOut.mutate()}>
              <LogOut aria-hidden />
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
