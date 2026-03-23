import { cn } from "@/lib/utils";

export default function ServiceCard({
  title,
  description,
  icon: Icon,
  imageSrc,
  className,
  testId,
  vertical,
}) {
  const content = (
    <>
      {imageSrc && vertical ? (
        <>
          <div className="w-full aspect-[2.2/1] overflow-hidden rounded-t-2xl bg-primary/5 shrink-0">
            <img
              src={imageSrc}
              alt=""
              loading="lazy"
              decoding="async"
              width={1200}
              height={540}
              className="h-full w-full object-cover"
            />
          </div>
          <div className="p-6 flex flex-col flex-1 items-center text-center">
            <div className="text-xl font-semibold">{title}</div>
            <p className="mt-3 text-base text-muted-foreground leading-relaxed">
              {description}
            </p>
          </div>
        </>
      ) : (
        <div
          className={cn(
            "flex gap-4",
            vertical ? "flex-col items-center" : "items-start",
          )}
        >
          <div
            className={cn(
              "flex items-center justify-center rounded-xl shrink-0 overflow-hidden",
              imageSrc ? "h-16 w-16 bg-primary/5" : "h-11 w-11 bg-primary/10 text-primary",
            )}
          >
            {imageSrc ? (
              <img
                src={imageSrc}
                alt=""
                loading="lazy"
                decoding="async"
                width={180}
                height={180}
                className="h-full w-full object-contain"
              />
            ) : Icon ? (
              <Icon className="h-5 w-5" strokeWidth={2} />
            ) : null}
          </div>
          <div>
            <div className="text-lg font-semibold">{title}</div>
            <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
              {description}
            </p>
          </div>
        </div>
      )}
    </>
  );

  return (
    <div
      data-testid={testId}
      className={cn(
        "group rounded-2xl soft-border bg-card shadow-sm shadow-black/5 transition-colors hover:bg-secondary overflow-hidden",
        vertical && imageSrc && "flex flex-col p-0 min-h-[380px]",
        !imageSrc && "p-6",
        !vertical && !imageSrc && "p-6",
        className,
      )}
    >
      {content}
    </div>
  );
}
