import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useLocation } from "wouter";
import { Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { IMAGES } from "@/lib/images";

const navItems = [
  { label: "Home", href: "/" },
  { label: "About", href: "/about" },
  { label: "Services", href: "/services" },
  { label: "Products", href: "/products" },
  { label: "Contact", href: "/contact" },
];

const SCROLL_DOWN_THRESHOLD = 12;
const SCROLL_UP_THRESHOLD = 8;
const TOP_THRESHOLD = 24;

export default function Navbar() {
  const [location] = useLocation();
  const isHome = location === "/";
  const [open, setOpen] = useState(false);
  const [visible, setVisible] = useState(!isHome);
  const lastScrollY = useRef(0);
  const isActive = useMemo(
    () => (href) => (href === "/" ? location === "/" : location.startsWith(href)),
    [location],
  );

  useEffect(() => {
    setOpen(false);
  }, [location]);

  useEffect(() => {
    if (isHome) setVisible(false);
    else setVisible(true);
  }, [isHome]);

  useEffect(() => {
    const handleScroll = () => {
      const current = window.scrollY;
      const last = lastScrollY.current;
      lastScrollY.current = current;

      if (isHome) {
        setVisible(current > TOP_THRESHOLD);
      } else {
        if (current <= TOP_THRESHOLD) {
          setVisible(true);
          return;
        }
        const diff = current - last;
        if (diff > SCROLL_DOWN_THRESHOLD) setVisible(false);
        else if (diff < -SCROLL_UP_THRESHOLD) setVisible(true);
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [isHome]);

  return (
    <div
      className={cn(
        "fixed inset-x-0 top-0 z-50 border-b-2 border-blue-500 bg-white/95 text-black backdrop-blur-sm transition-transform duration-300 ease-out",
        visible ? "translate-y-0 shadow-sm" : "-translate-y-full",
      )}
    >
      <div className="container-pad">
        <div className="flex h-20 items-center justify-between">
          <Link href="/">
            <span
              data-testid="link-brand"
              className="flex items-center gap-3 text-black cursor-pointer"
            >
              <img
                src={IMAGES.LOGO}
                alt="Petrozen"
                className="h-12 w-auto rounded-xl object-contain"
                data-testid="navbar-logo"
              />
              <div className="leading-tight">
                <div className="text-lg font-semibold tracking-tight">Petrozen</div>
                <div className="text-base text-black/70">Ignite Sucess, Fuel Progress</div>
              </div>
            </span>
          </Link>

          <nav className="hidden lg:flex items-center gap-6">
            {navItems.map((item) => (
              <Link key={item.href} href={item.href}>
                <span
                  data-testid={`link-nav-${item.label.toLowerCase().replace(/\s+/g, "-")}`}
                  className={cn(
                    "text-base transition-colors cursor-pointer hover:text-primary hover:underline underline-offset-8 decoration-primary/60",
                    isActive(item.href) ? "text-primary font-semibold" : "text-black/70",
                  )}
                >
                  {item.label}
                </span>
              </Link>
            ))}
          </nav>

          <button
            data-testid="button-nav-mobile"
            className="lg:hidden inline-flex h-12 w-12 items-center justify-center rounded-xl border border-border/70 bg-white text-black"
            onClick={() => setOpen((s) => !s)}
            aria-label="Toggle menu"
          >
            {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {open ? (
        <div className="lg:hidden border-t border-border/70 bg-white">
          <div className="container-pad py-4">
            <div className="grid gap-2">
              {navItems.map((item) => (
                <Link key={item.href} href={item.href}>
                  <span
                    data-testid={`link-mobile-${item.label.toLowerCase().replace(/\s+/g, "-")}`}
                    className={cn(
                      "block rounded-xl px-4 py-3 text-base transition-colors cursor-pointer",
                      isActive(item.href)
                        ? "bg-primary/10 text-primary font-semibold"
                        : "text-black/70 hover:bg-primary/10 hover:text-primary",
                    )}
                  >
                    {item.label}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
