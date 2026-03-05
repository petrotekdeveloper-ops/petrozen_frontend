import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import logo from "@/assets/logo.png";
import { FolderTree, Layers, Package, LogOut } from "lucide-react";
import { clearAdminToken, getAdminToken } from "@/lib/adminAuth";

const navItems = [
  { label: "Categories", href: "/admin/categories", icon: FolderTree },
  { label: "Subcategories", href: "/admin/subcategories", icon: Layers },
  { label: "Products", href: "/admin/products", icon: Package },
];

export default function AdminSidebar({ className }) {
  const [location, setLocation] = useLocation();

  const isActive = (href) =>
    location === href || location.startsWith(`${href}/`);
  const isLoggedIn = Boolean(getAdminToken());

  return (
    <aside
      className={cn(
        "flex w-[280px] shrink-0 flex-col border-r border-border/80 bg-card",
        "h-screen min-h-screen",
        className,
      )}
    >
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-border/80 px-5 py-4">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-xl">
          <img src={logo} alt="Petrozen" className="h-full w-full object-contain" />
        </div>
        <div className="min-w-0">
          <h2 className="truncate font-semibold tracking-tight text-foreground">
            Admin
          </h2>
          <p className="truncate text-xs text-muted-foreground">
            Product hierarchy
          </p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-0.5 p-3" aria-label="Admin navigation">
        <p className="mb-2 px-2 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
          Content
        </p>
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);
          return (
            <Link key={item.href} href={item.href}>
              <a
                data-testid={`link-admin-${item.label.toLowerCase()}`}
                className={cn(
                  "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                  "border-l-[3px] border-transparent",
                  active
                    ? "border-l-primary bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-muted/80 hover:text-foreground",
                )}
              >
                <Icon
                  className="h-[18px] w-[18px] shrink-0"
                  strokeWidth={active ? 2.25 : 2}
                  aria-hidden
                />
                <span className="truncate">{item.label}</span>
              </a>
            </Link>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="border-t border-border/80 p-3">
        {isLoggedIn ? (
          <button
            type="button"
            data-testid="button-admin-logout"
            onClick={() => {
              clearAdminToken();
              setLocation("/admin/login");
            }}
            className={cn(
              "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium",
              "text-red-600 transition-colors hover:bg-red-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
            )}
          >
            <LogOut className="h-[18px] w-[18px] shrink-0" aria-hidden />
            <span>Logout</span>
          </button>
        ) : (
          <Link href="/admin/login">
            <a
              data-testid="button-admin-login"
              className={cn(
                "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium",
                "text-muted-foreground transition-colors hover:bg-muted/80 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
              )}
            >
              <LogOut className="h-[18px] w-[18px] shrink-0" aria-hidden />
              <span>Go to login</span>
            </a>
          </Link>
        )}
      </div>
    </aside>
  );
}
