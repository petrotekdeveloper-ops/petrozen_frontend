import { useEffect, useState } from "react";
import { Link, useParams } from "wouter";
import PageLayout from "@/components/PageLayout";
import SectionTitle from "@/components/SectionTitle";
import Button from "@/components/Button";
import { apiClient } from "@/lib/apiClient";
import { HERO_URLS } from "@/lib/images";
import { IMAGES } from "@/lib/images";
import { ChevronLeft } from "lucide-react";

const HERO = HERO_URLS.OIL_GAS || IMAGES.HERO_OIL_GAS;

function toPublicUrl(maybePath) {
  if (!maybePath) return "";
  const apiBase = String(import.meta.env.VITE_API_BASE_URL || "").replace(/\/$/, "");
  if (/^https?:\/\//i.test(maybePath)) return maybePath;
  const path = String(maybePath).startsWith("/") ? maybePath : `/${maybePath}`;
  return apiBase ? `${apiBase}${path}` : maybePath;
}

export default function Product() {
  const { categoryId, subcategoryId } = useParams();
  const [subcategory, setSubcategory] = useState(null);
  const [category, setCategory] = useState(null);
  const [products, setProducts] = useState([]);
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
  }, [products]);

  useEffect(() => {
    if (!subcategoryId || !categoryId) return;
    let mounted = true;
    setLoading(true);
    setError("");

    Promise.all([
      apiClient.get(`/api/subcategories/${subcategoryId}`),
      apiClient.get(`/api/categories/${categoryId}`),
      apiClient.get(`/api/products`, {
        params: { subCategoryId: subcategoryId, active: true },
      }),
    ])
      .then(([subRes, catRes, prodRes]) => {
        if (!mounted) return;
        setSubcategory(subRes?.data?.item ?? null);
        setCategory(catRes?.data?.item ?? null);
        setProducts(prodRes?.data?.items ?? []);
      })
      .catch(() => {
        if (!mounted) return;
        setError("Failed to load products.");
        setSubcategory(null);
        setCategory(null);
        setProducts([]);
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => { mounted = false; };
  }, [categoryId, subcategoryId]);

  if (!categoryId || !subcategoryId) return null;

  const heroImage = subcategory?.imageUrl
    ? toPublicUrl(subcategory.imageUrl)
    : category?.imageUrl
      ? toPublicUrl(category.imageUrl)
      : HERO;

  const pathEyebrow = category && subcategory
    ? `${category.title} / ${subcategory.title}`
    : undefined;

  return (
    <PageLayout
      testId="page-products-list"
      title="Products"
      subtitle={pathEyebrow}
      heroImage={heroImage}
      heroTitleFont="sans"
    >
      <section data-testid="section-breadcrumb" className="py-6 border-b border-border/50">
        <div className="container-pad">
          <Link href={`/products/${categoryId}`}>
            <a
              data-testid="link-back-to-subcategories"
              className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
            >
              <ChevronLeft className="h-4 w-4" />
              Back to subcategories
            </a>
          </Link>
        </div>
      </section>

      {loading ? (
        <section className="py-16 sm:py-20">
          <div className="container-pad">
            <p className="text-base text-muted-foreground">Loading…</p>
          </div>
        </section>
      ) : error || !subcategory ? (
        <section className="py-16 sm:py-20">
          <div className="container-pad">
            <p className="text-base text-destructive">
              {error || "Subcategory not found."}
            </p>
            <Link href={`/products/${categoryId}`}>
              <a className="mt-4 inline-block text-sm text-primary hover:underline">
                Back to subcategories
              </a>
            </Link>
          </div>
        </section>
      ) : (
        <section data-testid="section-products" className="pt-8 sm:pt-10 pb-16 sm:pb-20 bg-secondary">
          <div className="container-pad reveal" data-reveal="fade">
            <SectionTitle
              testId="title-products"
              eyebrow={subcategory.title}
              description={subcategory.description}
              align="left"
              titleFont="sans"
              eyebrowClassName="text-base sm:text-lg font-bold text-foreground"
              descriptionClassName="text-xs"
              className="max-w-none"
            />
          </div>

          {products.length === 0 ? (
            <div className="container-pad mt-10">
              <p className="text-base text-muted-foreground">
                No products in this subcategory.
              </p>
            </div>
          ) : (
            <div className="mx-auto mt-10 w-full max-w-[90rem] px-3 sm:px-4 lg:px-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-6 lg:gap-8 items-stretch">
                {products.map((p, idx) => (
                  <div
                    key={p._id}
                    className="min-w-0 w-full reveal"
                    data-reveal={idx % 2 === 0 ? "left" : "right"}
                    style={{ transitionDelay: `${idx * 80}ms` }}
                  >
                    <div
                      data-testid={`card-product-${p._id}`}
                      className="group relative w-full rounded-2xl overflow-hidden shadow-sm shadow-black/5 h-[200px] sm:h-[220px] lg:h-[240px] transition-all duration-300 hover:shadow-xl hover:shadow-black/10 hover:-translate-y-1"
                    >
                      <img
                        src={toPublicUrl(p.imageUrl) || IMAGES.INDUSTRY_REFINERY}
                        alt=""
                        className="absolute inset-0 z-0 h-full w-full object-cover transition-all duration-300 group-hover:scale-105 group-hover:blur-sm"
                      />
                      <div
                        className="absolute inset-0 z-10 bg-gradient-to-t from-black/85 via-black/30 to-transparent"
                        aria-hidden
                      />
                      <div className="absolute inset-0 z-20 flex flex-col justify-end p-6">
                        <h3 className="text-xl sm:text-2xl font-semibold text-white">
                          {p.title}
                        </h3>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <Button
                            as="link"
                            href="/contact"
                            testId={`button-enquiry-product-${p._id}`}
                            className="rounded-xl px-4 py-2 text-sm font-medium bg-[#064CCA] text-white shadow-sm opacity-0 translate-y-2 transition-all duration-300 group-hover:opacity-100 group-hover:translate-y-0 group-hover:scale-105 hover:bg-[#053a9e]"
                          >
                            Enquiry now
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>
      )}
    </PageLayout>
  );
}
