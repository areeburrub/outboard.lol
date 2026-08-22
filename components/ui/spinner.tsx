import { CircleNotchIcon } from "@phosphor-icons/react/ssr";

import { cn } from "@/lib/utils";

function Spinner({ className, ...props }: React.ComponentProps<"svg">) {
  return (
    <CircleNotchIcon
      data-slot="spinner"
      role="status"
      aria-label="Loading"
      weight="bold"
      className={cn("size-4 animate-spin", className)}
      {...props}
    />
  );
}

export { Spinner };
