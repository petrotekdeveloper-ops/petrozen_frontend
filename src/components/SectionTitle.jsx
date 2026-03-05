import { cn } from "@/lib/utils";

export default function SectionTitle({
  eyebrow,
  title,
  description,
  align = "left",
  className,
  descriptionClassName,
  titleClassName,
  eyebrowClassName,
  testId,
}) {
  return (
    <div
      data-testid={testId}
      className={cn(
        "max-w-3xl",
        align === "center" ? "mx-auto text-center" : "",
        className,
      )}
    >
      {eyebrow ? (
        <div className={cn("text-xs font-semibold tracking-[0.2em] uppercase text-muted-foreground", eyebrowClassName)}>
          {eyebrow}
        </div>
      ) : null}
      <h2
        className={cn(
          "mt-3 text-3xl sm:text-4xl leading-tight font-semibold font-sans",
          titleClassName,
        )}
        style={{ fontFamily: "var(--font-sans)" }}
      >
        {title}
      </h2>
      {description ? (
        <div
          className={cn(
            "mt-3 text-base sm:text-lg text-muted-foreground leading-relaxed",
            descriptionClassName,
          )}
        >
          {typeof description === "string" ? <p>{description}</p> : description}
        </div>
      ) : null}
    </div>
  );
}
