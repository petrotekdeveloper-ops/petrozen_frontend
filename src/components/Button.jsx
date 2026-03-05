import { Link } from "wouter";
import { cn } from "@/lib/utils";

export default function Button({
  as = "button",
  href,
  variant = "primary",
  size = "md",
  children,
  className,
  onClick,
  type = "button",
  disabled,
  testId,
}) {
  const base =
    "inline-flex items-center justify-center rounded-xl font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:opacity-50 disabled:pointer-events-none";

  const variants = {
    primary:
      "bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm shadow-black/5",
    secondary:
      "bg-secondary text-secondary-foreground hover:bg-secondary/80 border border-border/70",
    ghost:
      "text-foreground hover:bg-muted border border-transparent hover:border-border/60",
  };

  const sizes = {
    sm: "h-10 px-4 text-sm",
    md: "h-11 px-5 text-sm",
    lg: "h-12 px-6 text-base",
  };

  const classes = cn(base, variants[variant], sizes[size], className);

  if (as === "link") {
    return (
      <Link href={href || "/"}>
        <a data-testid={testId} className={classes}>
          {children}
        </a>
      </Link>
    );
  }

  return (
    <button
      data-testid={testId}
      type={type}
      className={classes}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
}
