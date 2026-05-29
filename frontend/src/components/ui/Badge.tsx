import clsx from "clsx";

interface BadgeProps {
  label: string;
  variant?: "gold" | "dim";
  className?: string;
}

export function Badge({ label, variant = "dim", className }: BadgeProps) {
  return (
    <span
      className={clsx(
        "inline-block text-[10px] uppercase tracking-widest px-2 py-1",
        variant === "gold"
          ? "border border-gold/60 text-gold"
          : "border border-white/10 text-text-muted",
        className
      )}
    >
      {label}
    </span>
  );
}
