"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  CreditCardIcon,
  GearSixIcon,
  ListNumbersIcon,
  RankingIcon,
  SidebarSimpleIcon,
  SquaresFourIcon,
} from "@phosphor-icons/react";

import {
  SidebarUserMenu,
  type SidebarUser,
} from "@/components/app/sidebar-user-menu";
import { Button } from "@/components/ui/button";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  useSidebar,
} from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";

const navIconSlot =
  "flex size-11 shrink-0 items-center justify-center";

const primaryNav = [
  { title: "Overview", href: "/overview", icon: SquaresFourIcon, exact: true },
  { title: "Leaderboard", href: "/leaderboard", icon: ListNumbersIcon },
  { title: "Payments", href: "/payments", icon: CreditCardIcon },
  { title: "Settings", href: "/settings", icon: GearSixIcon },
] as const;

function isActivePath(pathname: string, href: string, exact?: boolean) {
  if (exact) {
    return pathname === href;
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}

function BrandSidebarTrigger() {
  const { toggleSidebar, state } = useSidebar();
  const expanded = state === "expanded";

  return (
    <Button
      data-sidebar="trigger"
      data-slot="sidebar-trigger"
      variant="ghost"
      size="icon-lg"
      className="group/brand relative size-12 text-muted-foreground"
      onClick={toggleSidebar}
    >
      <RankingIcon
        weight="fill"
        className={cn(
          "size-8 text-ob-win transition-opacity",
          expanded ? "opacity-100 group-hover/brand:opacity-0" : "opacity-0",
        )}
      />
      <SidebarSimpleIcon
        weight="duotone"
        className={cn(
          "absolute size-7 transition-opacity",
          expanded ? "opacity-0 group-hover/brand:opacity-100" : "opacity-100",
        )}
      />
      <span className="sr-only">Toggle Sidebar</span>
    </Button>
  );
}

export function AppSidebar({ user }: { user: SidebarUser }) {
  const pathname = usePathname();
  const { setOpenMobile } = useSidebar();

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="h-16 overflow-hidden px-2 py-0">
        <div className="flex h-full w-full items-center group-data-[collapsible=icon]:justify-center">
          <div className="flex size-12 shrink-0 items-center justify-center">
            <BrandSidebarTrigger />
          </div>
          <Link
            href="/overview"
            onClick={() => setOpenMobile(false)}
            className="flex min-w-0 flex-1 items-center overflow-hidden rounded-xl px-1.5 text-left group-data-[collapsible=icon]:invisible group-data-[collapsible=icon]:w-0 group-data-[collapsible=icon]:flex-none"
          >
            <span className="truncate font-display text-[1.375rem] font-bold leading-none tracking-[-0.03em] text-sidebar-foreground">
              outboard
            </span>
          </Link>
        </div>
      </SidebarHeader>

      <SidebarContent className="gap-2 pb-4">
        <SidebarGroup className="px-2">
          <SidebarGroupContent>
            <SidebarMenu className="gap-1.5">
              {primaryNav.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    render={
                      <Link
                        href={item.href}
                        onClick={() => setOpenMobile(false)}
                      />
                    }
                    isActive={isActivePath(
                      pathname,
                      item.href,
                      "exact" in item ? item.exact : false,
                    )}
                    tooltip={item.title}
                    className="h-11 justify-start rounded-xl text-[15px] font-medium group-data-[collapsible=icon]:mx-auto"
                  >
                    <span className={navIconSlot}>
                      <item.icon size={22} weight="duotone" />
                    </span>
                    <span className="min-w-0 truncate pr-2">{item.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="overflow-hidden px-2 py-2">
        <SidebarUserMenu user={user} />
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  );
}
