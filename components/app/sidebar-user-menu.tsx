"use client";

import { useClerk } from "@clerk/nextjs";
import {
  CaretUpDownIcon,
  DesktopIcon,
  MoonIcon,
  SignOutIcon,
  SunIcon,
  UserIcon,
} from "@phosphor-icons/react";
import { useTheme } from "next-themes";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";

export type SidebarUser = {
  name: string;
  email: string;
  imageUrl?: string | null;
};

function getInitials(name: string, email: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return `${parts[0]![0]}${parts[parts.length - 1]![0]}`.toUpperCase();
  }
  if (name.trim()) {
    return name.slice(0, 2).toUpperCase();
  }
  if (email) {
    return email.slice(0, 2).toUpperCase();
  }
  return "OB";
}

export function SidebarUserMenu({ user }: { user: SidebarUser }) {
  const { signOut, openUserProfile } = useClerk();
  const { isMobile, state } = useSidebar();
  const { theme, setTheme } = useTheme();
  const collapsed = state === "collapsed";
  const initials = getInitials(user.name, user.email);

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <SidebarMenuButton
                size="lg"
                tooltip={user.name}
                className="h-12 justify-start rounded-xl data-open:bg-sidebar-accent data-open:text-sidebar-accent-foreground group-data-[collapsible=icon]:mx-auto"
              />
            }
          >
            <span className="flex size-11 shrink-0 items-center justify-center">
              <Avatar className="size-9 after:border-sidebar-border">
                {user.imageUrl ? (
                  <AvatarImage src={user.imageUrl} alt={user.name} />
                ) : null}
                <AvatarFallback className="bg-sidebar-accent text-xs font-medium text-sidebar-accent-foreground">
                  {initials}
                </AvatarFallback>
              </Avatar>
            </span>
            <div className="grid min-w-0 flex-1 text-left text-[15px] leading-tight">
              <span className="truncate font-medium">{user.name}</span>
              <span className="truncate text-sm text-muted-foreground">
                {user.email}
              </span>
            </div>
            <CaretUpDownIcon
              size={18}
              weight="bold"
              className="mr-2 ml-auto shrink-0 text-muted-foreground"
            />
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-64"
            side={isMobile ? "bottom" : collapsed ? "right" : "top"}
            align="start"
            sideOffset={8}
          >
            <div className="px-2.5 py-2 text-[15px] text-muted-foreground">
              {user.email || user.name}
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem
                className="px-2.5 py-2.5 text-sm"
                onClick={() => openUserProfile()}
              >
                <UserIcon size={20} weight="duotone" />
                Manage account
              </DropdownMenuItem>
              <DropdownMenuSub>
                <DropdownMenuSubTrigger className="px-2.5 py-2.5 text-sm">
                  <SunIcon size={20} weight="duotone" className="dark:hidden" />
                  <MoonIcon
                    size={20}
                    weight="duotone"
                    className="hidden dark:block"
                  />
                  Theme
                </DropdownMenuSubTrigger>
                <DropdownMenuSubContent className="w-48">
                  {(
                    [
                      { value: "light", label: "Light", Icon: SunIcon },
                      { value: "dark", label: "Dark", Icon: MoonIcon },
                      { value: "system", label: "System", Icon: DesktopIcon },
                    ] as const
                  ).map(({ value, label, Icon }) => (
                    <DropdownMenuItem
                      key={value}
                      onClick={() => setTheme(value)}
                      className={cn(
                        "px-2.5 py-2.5 text-sm",
                        theme === value && "bg-accent text-accent-foreground",
                      )}
                    >
                      <Icon
                        size={20}
                        weight={theme === value ? "fill" : "duotone"}
                      />
                      {label}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuSubContent>
              </DropdownMenuSub>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              variant="destructive"
              className="px-2.5 py-2.5 text-sm"
              onClick={() => {
                void signOut({ redirectUrl: "/" });
              }}
            >
              <SignOutIcon size={20} weight="duotone" />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
