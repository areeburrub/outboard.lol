"use client";

import { useEffect, useState } from "react";
import { Dialog as DialogPrimitive } from "@base-ui/react/dialog";
import { XIcon } from "@phosphor-icons/react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function RulesDialog({ rules }: { rules: string }) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (window.location.hash === "#rules") {
      setOpen(true);
    }
  }, []);

  function onOpenChange(next: boolean) {
    setOpen(next);
    const url = new URL(window.location.href);
    if (next) {
      url.hash = "rules";
    } else {
      url.hash = "";
    }
    window.history.replaceState(null, "", url);
  }

  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <DialogPrimitive.Trigger className="text-sm font-medium text-ob-ink hover:text-ob-win">
        Rules
      </DialogPrimitive.Trigger>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Backdrop
          className={cn(
            "fixed inset-0 z-50 bg-ob-ink/40 transition-opacity duration-200",
            "supports-backdrop-filter:backdrop-blur-[2px]",
            "data-ending-style:opacity-0 data-starting-style:opacity-0",
            "motion-reduce:transition-none",
          )}
        />
        <DialogPrimitive.Popup
          className={cn(
            "fixed z-50 flex max-h-[min(85dvh,40rem)] w-full flex-col bg-ob-surface text-ob-ink outline-none",
            "transition duration-200 ease-out motion-reduce:transition-none",
            "data-ending-style:opacity-0 data-starting-style:opacity-0",
            // Phone: app drawer from the bottom
            "inset-x-0 bottom-0 rounded-t-[1.25rem] border-t border-ob-line",
            "data-ending-style:translate-y-8 data-starting-style:translate-y-8",
            "pb-[max(1.25rem,env(safe-area-inset-bottom))]",
            // Desktop: centered dialog
            "sm:inset-auto sm:top-1/2 sm:left-1/2 sm:w-[min(28rem,calc(100vw-2rem))]",
            "sm:-translate-x-1/2 sm:-translate-y-1/2 sm:rounded-[1rem] sm:border sm:border-ob-line",
            "sm:data-ending-style:translate-y-[calc(-50%+0.75rem)] sm:data-starting-style:translate-y-[calc(-50%+0.75rem)]",
          )}
        >
          <div className="flex justify-center pt-3 sm:hidden" aria-hidden>
            <span className="h-1 w-10 rounded-full bg-ob-line" />
          </div>
          <div className="flex items-start justify-between gap-3 px-5 pt-3 pb-2 sm:px-6 sm:pt-5">
            <DialogPrimitive.Title className="font-display text-lg font-bold tracking-[-0.02em] text-ob-ink">
              Rules
            </DialogPrimitive.Title>
            <DialogPrimitive.Close
              render={
                <Button
                  variant="ghost"
                  size="icon-sm"
                  className="text-ob-mute hover:bg-ob-paper hover:text-ob-ink"
                />
              }
            >
              <XIcon weight="bold" />
              <span className="sr-only">Close</span>
            </DialogPrimitive.Close>
          </div>
          <DialogPrimitive.Description className="overflow-y-auto px-5 pb-2 text-sm leading-relaxed whitespace-pre-wrap text-ob-mute sm:px-6 sm:pb-6">
            {rules}
          </DialogPrimitive.Description>
        </DialogPrimitive.Popup>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
