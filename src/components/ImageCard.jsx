import { cn } from "@/lib/utils";

export default function ImageCard({
  title,
  description,
  imageSrc,
  imageAlt,
  badge,
  variant = "default",
  aspectRatio = "16/10",
  className,
  testId,
}) {
  return (
    <div
      data-testid={testId}
      tabIndex={variant === "overlay" ? 0 : undefined}
      className={cn(
        "group overflow-hidden rounded-2xl soft-border bg-card shadow-sm shadow-black/5",
        variant === "overlay"
          ? "focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          : "",
        className,
      )}
    >
      <div className="relative overflow-hidden" style={{ aspectRatio }}>
        <img
          src={imageSrc}
          alt={imageAlt}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.05]"
        />
        {variant !== "overlay" ? <div className="absolute inset-0 bg-black/20" /> : null}
        {badge ? (
          <div className="absolute left-4 top-4 rounded-full bg-white/90 px-3 py-1 text-xs font-medium text-foreground shadow-sm">
            {badge}
          </div>
        ) : null}

        {variant === "overlay" ? (
          <>
            {/* Title always visible at bottom */}
            <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/70 via-black/35 to-transparent" />

            {/* Dark shade on hover/focus */}
            <div className="absolute inset-0 bg-black/45 opacity-0 transition-opacity duration-500 ease-out group-hover:opacity-100 group-focus-visible:opacity-100" />

            <div className="absolute inset-x-0 bottom-0 p-4 sm:p-5">
              <div className="text-xl sm:text-2xl font-semibold tracking-tight text-white">
                {title}
              </div>
              {description ? (
                <p className="mt-2 text-sm sm:text-base text-white/85 leading-relaxed overflow-hidden max-h-0 opacity-0 translate-y-2 transition-all duration-500 ease-out group-hover:max-h-40 group-hover:opacity-100 group-hover:translate-y-0 group-focus-visible:max-h-40 group-focus-visible:opacity-100 group-focus-visible:translate-y-0">
                  {description}
                </p>
              ) : null}
            </div>
          </>
        ) : null}
      </div>
      {variant !== "overlay" ? (
        <div className="p-6">
          <div className="text-lg font-semibold serif">{title}</div>
          <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
            {description}
          </p>
        </div>
      ) : null}
    </div>
  );
}
