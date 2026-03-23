import { useState } from "react";
import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import logo from "@/assets/logo.webp";
import { FolderTree, Layers, Package, LogOut, Search, Inbox, Award, Bot, MessageSquare, HelpCircle, Wrench, FileText, ChevronDown, LayoutGrid } from "lucide-react";
import { clearAdminToken, getAdminToken } from "@/lib/adminAuth";

const productManagementItems = [
  { label: "Categories", href: "/admin/categories", icon: FolderTree },
  { label: "Subcategories", href: "/admin/subcategories", icon: Layers },
  { label: "Products", href: "/admin/products", icon: Package },
];

const chatbotManagementItems = [
  { label: "Chatbot Products", href: "/admin/chatbot-products", icon: MessageSquare },
  { label: "Manage Questions", href: "/admin/chatbot-questions", icon: HelpCircle },
  { label: "Service Questions", href: "/admin/chatbot-service-questions", icon: Wrench },
  { label: "Quote Questions", href: "/admin/chatbot-quote-questions", icon: FileText },
];

const navItems = [
  { label: "Brands", href: "/admin/brands", icon: Award },
  { label: "Enquiries", href: "/admin/enquiries", icon: Inbox },
  { label: "Chatbot Enquiries", href: "/admin/chat-enquiries", icon: Bot },
  { label: "SEO", href: "/admin/seo", icon: Search },
];

export default function AdminSidebar({ className }) {
  const [location, setLocation] = useLocation();
  const [productMgmtOpen, setProductMgmtOpen] = useState(
    () => productManagementItems.some((item) => location === item.href || location.startsWith(`${item.href}/`))
  );
  const [chatbotMgmtOpen, setChatbotMgmtOpen] = useState(
    () => chatbotManagementItems.some((item) => location === item.href || location.startsWith(`${item.href}/`))
  );

  const isActive = (href) =>
    location === href || location.startsWith(`${href}/`);
  const isLoggedIn = Boolean(getAdminToken());

  return (
    <aside
      className={cn(
        "fixed inset-y-0 left-0 z-30 flex w-[280px] flex-col border-r border-border/80 bg-card",
        className,
      )}
    >
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-border/80 px-5 py-4">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-xl">
          <img
            src={logo}
            alt="Petrozen"
            loading="eager"
            decoding="async"
            width={96}
            height={96}
            className="h-full w-full object-contain"
          />
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

        {/* Product Management dropdown */}
        <div className="space-y-0.5">
          <button
            type="button"
            onClick={() => setProductMgmtOpen((o) => !o)}
            className={cn(
              "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
              "border-l-[3px] border-transparent",
              productManagementItems.some((item) => isActive(item.href))
                ? "border-l-primary text-primary"
                : "border-transparent text-muted-foreground hover:bg-muted/80 hover:text-foreground",
            )}
          >
            <LayoutGrid className="h-[18px] w-[18px] shrink-0" aria-hidden />
            <span className="truncate flex-1 text-left">Product Management</span>
            <ChevronDown
              className={cn("h-4 w-4 shrink-0 transition-transform", productMgmtOpen && "rotate-180")}
              aria-hidden
            />
          </button>
          {productMgmtOpen && (
            <div className="ml-4 flex flex-col gap-0.5 border-l border-border/60 pl-3">
              {productManagementItems.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.href);
                return (
                  <Link key={item.href} href={item.href}>
                    <a
                      data-testid={`link-admin-${item.label.toLowerCase()}`}
                      className={cn(
                        "flex items-center gap-3 rounded-lg px-2.5 py-2 text-sm font-medium transition-colors",
                        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                        "border-l-[3px] border-transparent",
                        active
                          ? "border-l-primary bg-primary/10 text-primary"
                          : "text-muted-foreground hover:bg-muted/80 hover:text-foreground",
                      )}
                    >
                      <Icon
                        className="h-[16px] w-[16px] shrink-0"
                        strokeWidth={active ? 2.25 : 2}
                        aria-hidden
                      />
                      <span className="truncate">{item.label}</span>
                    </a>
                  </Link>
                );
              })}
            </div>
          )}
        </div>

        {/* Chatbot Management dropdown */}
        <div className="space-y-0.5">
          <button
            type="button"
            onClick={() => setChatbotMgmtOpen((o) => !o)}
            className={cn(
              "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
              "border-l-[3px] border-transparent",
              chatbotManagementItems.some((item) => isActive(item.href))
                ? "border-l-primary text-primary"
                : "border-transparent text-muted-foreground hover:bg-muted/80 hover:text-foreground",
            )}
          >
            <Bot className="h-[18px] w-[18px] shrink-0" aria-hidden />
            <span className="truncate flex-1 text-left">Chatbot Management</span>
            <ChevronDown
              className={cn("h-4 w-4 shrink-0 transition-transform", chatbotMgmtOpen && "rotate-180")}
              aria-hidden
            />
          </button>
          {chatbotMgmtOpen && (
            <div className="ml-4 flex flex-col gap-0.5 border-l border-border/60 pl-3">
              {chatbotManagementItems.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.href);
                return (
                  <Link key={item.href} href={item.href}>
                    <a
                      data-testid={`link-admin-${item.label.toLowerCase()}`}
                      className={cn(
                        "flex items-center gap-3 rounded-lg px-2.5 py-2 text-sm font-medium transition-colors",
                        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                        "border-l-[3px] border-transparent",
                        active
                          ? "border-l-primary bg-primary/10 text-primary"
                          : "text-muted-foreground hover:bg-muted/80 hover:text-foreground",
                      )}
                    >
                      <Icon
                        className="h-[16px] w-[16px] shrink-0"
                        strokeWidth={active ? 2.25 : 2}
                        aria-hidden
                      />
                      <span className="truncate">{item.label}</span>
                    </a>
                  </Link>
                );
              })}
            </div>
          )}
        </div>

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
