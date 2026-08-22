"use client";

import { AppSidebar } from "@/components/app/app-sidebar";
import { type SidebarUser } from "@/components/app/sidebar-user-menu";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { TooltipProvider } from "@/components/ui/tooltip";

export function AppShell({
  user,
  children,
}: {
  user: SidebarUser;
  children: React.ReactNode;
}) {
  return (
    <TooltipProvider>
      <SidebarProvider className="h-dvh min-h-0 overflow-hidden">
        <AppSidebar user={user} />
        <SidebarInset className="min-h-0 overflow-hidden">
          <div className="flex h-16 shrink-0 items-center gap-2 border-b border-ob-line/80 px-4 md:hidden">
            <SidebarTrigger className="text-muted-foreground" />
            <span className="font-display text-xl font-bold tracking-[-0.03em]">
              outboard
            </span>
          </div>
          <div className="flex min-h-0 flex-1 flex-col overflow-auto">
            {children}
          </div>
        </SidebarInset>
      </SidebarProvider>
    </TooltipProvider>
  );
}
