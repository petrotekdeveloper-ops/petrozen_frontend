import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "wouter";
import PageLayout from "@/components/PageLayout";
import SeoHead from "@/components/SeoHead";
import SectionTitle from "@/components/SectionTitle";
import Button from "@/components/Button";
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

export default function Product() {
  const { categoryId, subcategoryId, productId } = useParams();
  const isDetailView = Boolean(productId);
  const { seo } = useSeo(isDetailView ? "product" : "subcategory", isDetailView ? productId : subcategoryId);
  const [subcategory, setSubcategory] = useState(null);
  const [category, setCategory] = useState(null);
  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
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
  }, [products, selectedProduct]);

  useEffect(() => {
    if (!subcategoryId || !categoryId) return;
    let mounted = true;
    setLoading(true);
    setError("");

    const detailPromise = isDetailView
      ? apiClient.get(`/api/products/${productId}`)
      : Promise.resolve({ data: { item: null } });
    const listPromise = isDetailView
      ? Promise.resolve({ data: { items: [] } })
      : apiClient.get(`/api/products`, {
          params: { subCategoryId: subcategoryId, active: true },
        });

    Promise.all([
      apiClient.get(`/api/subcategories/${subcategoryId}`),
      apiClient.get(`/api/categories/${categoryId}`),
      listPromise,
      detailPromise,
    ])
      .then(([subRes, catRes, prodRes, detailRes]) => {
        if (!mounted) return;
        const currentSub = subRes?.data?.item ?? null;
        const currentDetail = detailRes?.data?.item ?? null;

        setSubcategory(currentSub);
        setCategory(catRes?.data?.item ?? null);
        setProducts(prodRes?.data?.items ?? []);
        setSelectedProduct(currentDetail);

        if (isDetailView && currentDetail && String(currentDetail?.subCategory?._id || currentDetail?.subCategory || "") !== String(subcategoryId)) {
          setError("Product does not belong to this subcategory.");
        }
      })
      .catch(() => {
        if (!mounted) return;
        setError(isDetailView ? "Failed to load product details." : "Failed to load products.");
        setSubcategory(null);
        setCategory(null);
        setProducts([]);
        setSelectedProduct(null);
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => { mounted = false; };
  }, [categoryId, subcategoryId, productId, isDetailView]);

  if (!categoryId || !subcategoryId) return null;

  const heroImage = subcategory?.imageUrl
    ? toPublicUrl(subcategory.imageUrl)
    : category?.imageUrl
      ? toPublicUrl(category.imageUrl)
      : HERO;

  const pathEyebrow = category && subcategory
    ? `${category.title} / ${subcategory.title}`
    : undefined;
  const productDescription = useMemo(() => {
    if (!selectedProduct?.description) return "";
    return String(selectedProduct.description);
  }, [selectedProduct]);
  const pageTitle = isDetailView
    ? selectedProduct?.title || "Product details"
    : "Products";
  const pageSubtitle = isDetailView
    ? pathEyebrow
    : pathEyebrow;

  return (
    <PageLayout
      testId={isDetailView ? "page-product-detail" : "page-products-list"}
      title={pageTitle}
      subtitle={pageSubtitle}
      heroImage={isDetailView && selectedProduct?.imageUrl ? toPublicUrl(selectedProduct.imageUrl) : heroImage}
      heroTitleFont="sans"
    >
      <SeoHead
        seo={seo}
        fallbackTitle={`${isDetailView ? (selectedProduct?.title || "Product") : (subcategory?.title || "Products")} | Petrozen`}
        fallbackDescription={
          isDetailView
            ? (productDescription || "Review product specifications and contact Petrozen for technical support and availability.")
            : (subcategory?.description || "Browse products in this subcategory and contact Petrozen for availability and technical support.")
        }
        fallbackKeywords={`${isDetailView ? (selectedProduct?.title || "product") : (subcategory?.title || "products")}, petrozen, oil and gas equipment`}
        ogImage={isDetailView && selectedProduct?.imageUrl ? toPublicUrl(selectedProduct.imageUrl) : heroImage}
      />
      <section data-testid="section-breadcrumb" className="py-6 border-b border-border/50">
        <div className="container-pad">
          {isDetailView ? (
            <Link href={`/products/${categoryId}/${subcategoryId}`}>
              <a
                data-testid="link-back-to-products"
                className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                <ChevronLeft className="h-4 w-4" />
                Back to products
              </a>
            </Link>
          ) : (
            <Link href={`/products/${categoryId}`}>
              <a
                data-testid="link-back-to-subcategories"
                className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                <ChevronLeft className="h-4 w-4" />
                Back to subcategories
              </a>
            </Link>
          )}
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
      ) : isDetailView ? (
        <section data-testid="section-product-detail" className="pt-8 sm:pt-10 pb-16 sm:pb-20 bg-secondary">
          {!selectedProduct ? (
            <div className="container-pad">
              <p className="text-base text-destructive">Product not found.</p>
            </div>
          ) : (
            <div className="container-pad">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
                <div className="lg:col-span-6">
                  <div className="rounded-2xl overflow-hidden shadow-lg bg-white">
                    <img
                      src={toPublicUrl(selectedProduct.imageUrl) || IMAGES.INDUSTRY_REFINERY}
                      alt={selectedProduct.title}
                      className="w-full h-[320px] sm:h-[420px] object-contain bg-white"
                    />
                  </div>
                </div>
                <div className="lg:col-span-6">
                  <SectionTitle
                    testId="title-product-detail"
                    eyebrow={pathEyebrow}
                    title={selectedProduct.title}
                    description={selectedProduct.description || "Detailed product information will be updated shortly."}
                    align="left"
                    titleFont="sans"
                    className="max-w-none"
                  />

                  <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="rounded-xl border border-border/70 bg-card px-4 py-3">
                      <div className="text-xs uppercase tracking-wide text-muted-foreground">Category</div>
                      <div className="mt-1 text-sm font-medium">{category?.title || "—"}</div>
                    </div>
                    <div className="rounded-xl border border-border/70 bg-card px-4 py-3">
                      <div className="text-xs uppercase tracking-wide text-muted-foreground">Subcategory</div>
                      <div className="mt-1 text-sm font-medium">{subcategory?.title || "—"}</div>
                    </div>
                    <div className="rounded-xl border border-border/70 bg-card px-4 py-3">
                      <div className="text-xs uppercase tracking-wide text-muted-foreground">Availability</div>
                      <div className="mt-1 text-sm font-medium">{selectedProduct.active ? "Active" : "Inactive"}</div>
                    </div>
                    <div className="rounded-xl border border-border/70 bg-card px-4 py-3">
                      <div className="text-xs uppercase tracking-wide text-muted-foreground">Product ID</div>
                      <div className="mt-1 text-sm font-medium break-all">{selectedProduct._id}</div>
                    </div>
                  </div>

                  <div className="mt-8">
                    <Button
                      as="link"
                      href="/contact"
                      testId="button-enquiry-product-detail"
                      className="rounded-xl px-5 py-3 text-sm font-medium bg-[#064CCA] text-white hover:bg-[#053a9e]"
                    >
                      Enquiry now
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}
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
                  <Link key={p._id} href={`/products/${categoryId}/${subcategoryId}/${p._id}`}>
                    <a
                      className="min-w-0 w-full reveal block"
                      data-reveal={idx % 2 === 0 ? "left" : "right"}
                      style={{ transitionDelay: `${idx * 80}ms` }}
                    >
                      <div
                        data-testid={`card-product-${p._id}`}
                        className="group relative w-full rounded-2xl overflow-hidden shadow-sm shadow-black/5 h-[200px] sm:h-[220px] lg:h-[240px] transition-all duration-300 hover:shadow-xl hover:shadow-black/10 hover:-translate-y-1"
                      >
                        <img
                          src={toPublicUrl(p.imageUrl) || IMAGES.INDUSTRY_REFINERY}
                          alt={p.title}
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
                            <span className="rounded-xl px-4 py-2 text-sm font-medium bg-[#064CCA] text-white shadow-sm opacity-0 translate-y-2 transition-all duration-300 group-hover:opacity-100 group-hover:translate-y-0 group-hover:scale-105">
                              View details
                            </span>
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
      )}
    </PageLayout>
  );
}
