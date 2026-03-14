import { useEffect, useState } from "react";
import { Link } from "wouter";
import PageLayout from "@/components/PageLayout";
import SeoHead from "@/components/SeoHead";
import SectionTitle from "@/components/SectionTitle";
import { apiClient } from "@/lib/apiClient";
import { HERO_URLS } from "@/lib/images";
import { IMAGES } from "@/lib/images";
import { useSeo } from "@/hooks/useSeo";

const HERO = HERO_URLS.OIL_GAS || IMAGES.HERO_OIL_GAS;

function toPublicUrl(maybePath) {
  if (!maybePath) return "";
  const apiBase = String(import.meta.env.VITE_API_BASE_URL || "").replace(/\/$/, "");
  if (/^https?:\/\//i.test(maybePath)) return maybePath;
  const path = String(maybePath).startsWith("/") ? maybePath : `/${maybePath}`;
  return apiBase ? `${apiBase}${path}` : maybePath;
}

export default function Category() {
  const { seo } = useSeo("static", "products");
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const elements = Array.from(document.querySelectorAll("[data-reveal]"));
    if (elements.length === 0) return;
    const prefersReducedMotion =
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;
    if (prefersReducedMotion || !("IntersectionObserver" in window)) {
      elements.forEach((el) => el.classList.add("is-revealed"));
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-revealed");
          io.unobserve(entry.target);
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -8% 0px" },
    );
    elements.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [categories]);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    setError("");
    apiClient.get("/api/categories", { params: { active: true } })
      .then((res) => {
        if (!mounted) return;
        setCategories(res?.data?.items ?? []);
      })
      .catch(() => {
        if (!mounted) return;
        setError("Failed to load categories.");
        setCategories([]);
      })
      .finally(() => { if (mounted) setLoading(false); });
    return () => { mounted = false; };
  }, []);

  return (
    <PageLayout testId="page-products" title="Products" subtitle="Explore our industrial equipment and solutions by category." heroImage={HERO} heroTitleFont="sans">
      <SeoHead
        seo={seo}
        fallbackTitle="Product Categories | Petrozen"
        fallbackDescription="Browse Petrozen product categories and discover industrial equipment solutions tailored for oil and gas operations."
        fallbackKeywords="petrozen products, product categories, industrial equipment"
        ogImage={HERO}
      />
      <section data-testid="section-products-categories" className="py-16 sm:py-20">
        <div className="container-pad reveal" data-reveal="up">
          <SectionTitle testId="title-products" eyebrow="Browse by category" title="Product categories" titleFont="sans" />
        </div>
        {loading ? (
          <div className="container-pad mt-10"><p className="text-base text-muted-foreground">Loading categories…</p></div>
        ) : error ? (
          <div className="container-pad mt-10"><p className="text-base text-destructive">{error}</p></div>
        ) : categories.length === 0 ? (
          <div className="container-pad mt-10"><p className="text-base text-muted-foreground">No categories available.</p></div>
        ) : (
          <div className="mx-auto mt-10 w-full max-w-[90rem] px-3 sm:px-4 lg:px-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-6 lg:gap-8 items-stretch">
              {categories.map((cat, idx) => (
                <Link key={cat._id} href={`/products/${cat._id}`}>
                  <a className="min-w-0 w-full block reveal" data-reveal={idx % 2 === 0 ? "left" : "right"} style={{ transitionDelay: `${idx * 120}ms` }} data-testid={`card-category-${cat._id}`}>
                    <div className="group relative w-full rounded-2xl overflow-hidden shadow-sm shadow-black/5 h-[200px] sm:h-[220px] lg:h-[240px] transition-all duration-300 hover:shadow-xl hover:shadow-black/10 hover:-translate-y-1">
                      <img src={toPublicUrl(cat.imageUrl) || IMAGES.LOGO} alt="" className={`absolute z-0 transition-all duration-300 group-hover:scale-105 group-hover:blur-sm ${cat.imageUrl ? "inset-0 h-full w-full object-cover" : "left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 max-w-[60%] max-h-[60%] object-contain"}`} />
                      <div className="absolute inset-0 z-10 bg-gradient-to-t from-black/85 via-black/30 to-transparent" aria-hidden />
                      <div className="absolute inset-0 z-20 flex flex-col justify-end p-6">
                        <h3 className="text-2xl sm:text-3xl font-semibold text-white">{cat.title}</h3>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className="rounded-xl px-4 py-2 text-sm font-medium bg-[#064CCA] text-white shadow-sm opacity-0 translate-y-2 transition-all duration-300 group-hover:opacity-100 group-hover:translate-y-0 group-hover:scale-105">Explore</span>
                        </div>
                      </div>
                    </div>
                  </a>
                </Link>
              ))}
            </div>
          </div>
        )}
      </section>
    </PageLayout>
  );
}
