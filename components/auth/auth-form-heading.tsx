import { cn } from "@/lib/utils";

type AuthFormHeadingProps = {
  title: string;
  subtitle: string;
  className?: string;
};

export function AuthFormHeading({
  title,
  subtitle,
  className,
}: AuthFormHeadingProps) {
  return (
    <div className={cn("w-full", className)}>
      <h1 className="font-display text-center text-[1.75rem] leading-9 font-bold tracking-[-0.03em] text-ob-ink">
        {title}
      </h1>
      <p className="mt-2 text-center text-[15px] leading-6 text-ob-mute">
        {subtitle}
      </p>
    </div>
  );
}
