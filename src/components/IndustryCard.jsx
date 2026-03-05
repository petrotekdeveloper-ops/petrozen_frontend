import { cn } from "@/lib/utils";

export default function IndustryCard({
  title,
  description,
  imageSrc,
  imageAlt,
  className,
  testId,
}) {
  return (
    <div
      data-testid={testId}
      className={cn(
        "group overflow-hidden rounded-2xl soft-border bg-card shadow-sm shadow-black/5",
        className,
      )}
    >
      <div className="relative aspect-[16/11] overflow-hidden">
        <img
          src={imageSrc}
          alt={imageAlt}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.03]"
        />
        <div className="absolute inset-0 bg-black/25" />
      </div>
      <div className="p-6">
        <div className="text-lg font-semibold serif">{title}</div>
        <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
          {description}
        </p>
      </div>
    </div>
  );
}
