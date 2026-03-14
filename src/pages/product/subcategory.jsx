import { useEffect, useState } from "react";
import { Link, useParams } from "wouter";
import PageLayout from "@/components/PageLayout";
import SeoHead from "@/components/SeoHead";
import SectionTitle from "@/components/SectionTitle";
import { apiClient } from "@/lib/apiClient";
import { HERO_URLS } from "@/lib/images";
import { IMAGES } from "@/lib/images";
import { ChevronLeft } from "lucide-react";
import { useSeo } from "@/hooks/useSeo";

const HERO = HERO_URLS.OIL_GAS || IMAGES.HERO_OIL_GAS;

function toPublicUrl(maybePath) {
  if (!maybePath) return "";
  const apiBase = String(import.meta.env.VITE_API_BASE_URL || "").replace(/\/$/, "");
  if (/^https?:\/\//i.test(maybePath)) return maybePath;
  const path = String(maybePath).startsWith("/") ? maybePath : `/${maybePath}`;
  return apiBase ? `${apiBase}${path}` : maybePath;
}

export default function Subcategory() {
  const { categoryId } = useParams();
  const { seo } = useSeo("category", categoryId);
  const [category, setCategory] = useState(null);
  const [subcategories, setSubcategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const elements = Array.from(document.querySelectorAll("[data-reveal]"));
    if (elements.length === 0) return;
    const prefersReducedMotion = typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;
    if (prefersReducedMotion || !("IntersectionObserver" in window)) {
      elements.forEach((el) => el.classList.add("is-revealed"));
      return;
    }
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-revealed");
        io.unobserve(entry.target);
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -8% 0px" });
    elements.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [subcategories]);

  useEffect(() => {
    if (!categoryId) return;
    let mounted = true;
    setLoading(true);
    setError("");
    Promise.all([
      apiClient.get(`/api/categories/${categoryId}`),
      apiClient.get("/api/subcategories", { params: { categoryId, active: true } }),
    ]).then(([catRes, subRes]) => {
      if (!mounted) return;
      setCategory(catRes?.data?.item ?? null);
      setSubcategories(subRes?.data?.items ?? []);
    }).catch(() => {
      if (!mounted) return;
      setError("Failed to load category.");
      setCategory(null);
      setSubcategories([]);
    }).finally(() => { if (mounted) setLoading(false); });
    return () => { mounted = false; };
  }, [categoryId]);

  if (!categoryId) return null;

  return (
    <PageLayout testId="page-product-category" title="Subcategories" heroImage={category?.imageUrl ? toPublicUrl(category.imageUrl) : HERO} heroTitleFont="sans">
      <SeoHead
        seo={seo}
        fallbackTitle={`${category?.title || "Category"} | Petrozen`}
        fallbackDescription={category?.description || "Explore subcategories and discover suitable industrial products for your project needs."}
        fallbackKeywords={`${category?.title || "category"}, petrozen, industrial products`}
        ogImage={category?.imageUrl ? toPublicUrl(category.imageUrl) : HERO}
      />
      <section data-testid="section-breadcrumb" className="py-6 border-b border-border/50">
        <div className="container-pad">
          <Link href="/products">
            <a data-testid="link-back-to-products" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors">
              <ChevronLeft className="h-4 w-4" /> Back to categories
            </a>
          </Link>
        </div>
      </section>
      {loading ? (
        <section className="py-16 sm:py-20"><div className="container-pad"><p className="text-base text-muted-foreground">Loading…</p></div></section>
      ) : error || !category ? (
        <section className="py-16 sm:py-20">
          <div className="container-pad">
            <p className="text-base text-destructive">{error || "Category not found."}</p>
            <Link href="/products"><a className="mt-4 inline-block text-sm text-primary hover:underline">Back to categories</a></Link>
          </div>
        </section>
      ) : (
        <>
          <section data-testid="section-subcategories" className="pt-8 sm:pt-10 pb-16 sm:pb-20 bg-secondary">
            <div className="container-pad reveal" data-reveal="fade">
              <SectionTitle testId="title-subcategories" eyebrow={category.title} description={category.description} align="left" titleFont="sans" eyebrowClassName="text-base sm:text-lg font-bold text-foreground" descriptionClassName="text-xs" className="max-w-none" />
            </div>
            {subcategories.length === 0 ? (
              <div className="container-pad mt-6"><p className="text-base text-muted-foreground text-center">No subcategories in this category.</p></div>
            ) : (
              <div className="mx-auto mt-10 w-full max-w-[90rem] px-3 sm:px-4 lg:px-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-6 lg:gap-8 items-stretch">
                  {subcategories.map((sub, idx) => (
                    <Link key={sub._id} href={`/products/${categoryId}/${sub._id}`}>
                      <a className="min-w-0 w-full block reveal" data-reveal={idx % 2 === 0 ? "left" : "right"} style={{ transitionDelay: `${idx * 120}ms` }} data-testid={`card-subcategory-${sub._id}`}>
                        <div className="group relative w-full rounded-2xl overflow-hidden shadow-sm shadow-black/5 h-[200px] sm:h-[220px] lg:h-[240px] transition-all duration-300 hover:shadow-xl hover:shadow-black/10 hover:-translate-y-1">
                          <img src={toPublicUrl(sub.imageUrl) || IMAGES.LOGO} alt="" className={`absolute z-0 transition-all duration-300 group-hover:scale-105 group-hover:blur-sm ${sub.imageUrl ? "inset-0 h-full w-full object-cover" : "left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 max-w-[60%] max-h-[60%] object-contain"}`} />
                          <div className="absolute inset-0 z-10 bg-gradient-to-t from-black/85 via-black/30 to-transparent" aria-hidden />
                          <div className="absolute inset-0 z-20 flex flex-col justify-end p-6">
                            <h3 className="text-xl sm:text-2xl font-semibold text-white">{sub.title}</h3>
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
        </>
      )}
    </PageLayout>
  );
}
