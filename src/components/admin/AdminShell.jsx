import { useEffect } from "react";
import { useLocation } from "wouter";
import AdminSidebar from "@/components/admin/AdminSidebar";
import { getAdminToken } from "@/lib/adminAuth";
import { cn } from "@/lib/utils";

export default function AdminShell({
  testId,
  title,
  subtitle,
  actions,
  children,
  className,
  headerBare = false,
  headerLogo,
  sectionBare = false,
}) {
  const [, setLocation] = useLocation();

  useEffect(() => {
    // Simple guard: if not logged in, redirect to login
    if (!getAdminToken()) {
      setLocation("/admin/login");
    }
  }, [setLocation]);

  return (
    <div
      data-testid={testId}
      className="flex min-h-screen bg-background text-foreground"
    >
      <AdminSidebar />
      <div className="w-[280px] shrink-0" aria-hidden />

      <main className="min-w-0 flex-1 overflow-auto">
        <div className="space-y-6 p-6 sm:p-8">
          <header
            className={cn(
              "flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between",
              !headerBare && "rounded-2xl soft-border bg-card p-5 sm:p-6 shadow-sm shadow-black/5",
            )}
          >
            <div className="min-w-0 flex items-center gap-3">
              {headerLogo ? (
                <img
                  src={headerLogo}
                  alt=""
                  className="h-9 w-9 shrink-0 object-contain"
                  aria-hidden
                />
              ) : null}
              <div>
                <h1 className="text-2xl sm:text-[28px] font-semibold tracking-tight">
                  {title}
                </h1>
                {subtitle ? (
                  <p className="mt-1 text-sm text-muted-foreground">
                    {subtitle}
                  </p>
                ) : null}
              </div>
            </div>
            {actions ? (
              <div className="flex flex-wrap items-center gap-2 sm:justify-end">
                {actions}
              </div>
            ) : null}
          </header>

            <section
              className={cn(
                sectionBare ? "" : "rounded-2xl soft-border bg-card p-6 sm:p-8 shadow-sm shadow-black/5",
                className,
              )}
            >
              {children}
            </section>
        </div>
      </main>
    </div>
  );
}

