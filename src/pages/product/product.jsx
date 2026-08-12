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
import { matchesSlugOrId, toSlug } from "@/lib/slug";
const HERO = HERO_URLS.OIL_GAS || IMAGES.HERO_OIL_GAS;

function toPublicUrl(maybePath) {
  if (!maybePath) return "";
  const apiBase = String(import.meta.env.VITE_API_BASE_URL || "").replace(/\/$/, "");
  if (/^https?:\/\//i.test(maybePath)) return maybePath;
  const path = String(maybePath).startsWith("/") ? maybePath : `/${maybePath}`;
  return apiBase ? `${apiBase}${path}` : maybePath;
}

export default function Product() {
  const { categorySlug, subcategorySlug, productSlug } = useParams();
  const isDetailView = Boolean(productSlug);
  const [subcategory, setSubcategory] = useState(null);
  const [category, setCategory] = useState(null);
  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const seoPageKey = isDetailView ? selectedProduct?._id : subcategory?._id;
  const { seo } = useSeo(isDetailView ? "product" : "subcategory", seoPageKey);

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
    if (!subcategorySlug || !categorySlug) return;
    let mounted = true;
    setLoading(true);
    setError("");
    setSubcategory(null);
    setCategory(null);
    setProducts([]);
    setSelectedProduct(null);

    apiClient.get("/api/categories", { params: { active: true } })
      .then(async (catRes) => {
        if (!mounted) return;
        const categories = catRes?.data?.items ?? [];
        const currentCategory = categories.find((item) => matchesSlugOrId(categorySlug, item)) || null;
        if (!currentCategory) {
          setError("Category not found.");
          return;
        }

        const subRes = await apiClient.get("/api/subcategories", {
          params: { categoryId: currentCategory._id, active: true },
        });
        if (!mounted) return;

        const subItems = subRes?.data?.items ?? [];
        const currentSub = subItems.find((item) => matchesSlugOrId(subcategorySlug, item)) || null;
        if (!currentSub) {
          setError("Subcategory not found.");
          setCategory(currentCategory);
          return;
        }

        const productListRes = await apiClient.get("/api/products", {
          params: { subCategoryId: currentSub._id, active: true },
        });
        if (!mounted) return;

        const productItems = productListRes?.data?.items ?? [];
        let currentDetail = null;
        if (isDetailView) {
          const matchedProduct = productItems.find((item) => matchesSlugOrId(productSlug, item)) || null;
          if (!matchedProduct) {
            setError("Product not found.");
            setCategory(currentCategory);
            setSubcategory(currentSub);
            return;
          }

          const detailRes = await apiClient.get(`/api/products/${matchedProduct._id}`);
          if (!mounted) return;
          currentDetail = detailRes?.data?.item ?? null;
        }

        setCategory(currentCategory);
        setSubcategory(currentSub);
        setProducts(productItems);
        setSelectedProduct(currentDetail);
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
  }, [categorySlug, subcategorySlug, productSlug, isDetailView]);

  if (!categorySlug || !subcategorySlug) return null;

  const heroImage = subcategory?.imageUrl
    ? toPublicUrl(subcategory.imageUrl)
    : category?.imageUrl
      ? toPublicUrl(category.imageUrl)
      : HERO;

  const pathEyebrow = category && subcategory
    ? `${category.title} / ${subcategory.title}`
    : undefined;
  const categoryPath = category ? toSlug(category.title) : categorySlug;
  const subcategoryPath = subcategory ? toSlug(subcategory.title) : subcategorySlug;
  const productDescription = useMemo(() => {
    if (!selectedProduct?.description) return "";
    return String(selectedProduct.description);
  }, [selectedProduct]);

  const varietySection = useMemo(() => {
    if (!selectedProduct) return { keyword: "grade", values: [] };
    if (Array.isArray(selectedProduct.varietyValues) && selectedProduct.varietyValues.length > 0) {
      return {
        keyword: String(selectedProduct.varietyKeyword || "grade").trim() || "grade",
        values: selectedProduct.varietyValues
          .map((s) => String(s || "").trim())
          .filter(Boolean),
      };
    }
    if (Array.isArray(selectedProduct.varieties) && selectedProduct.varieties.length > 0) {
      return {
        keyword: String(selectedProduct.varieties[0]?.keyword || "grade").trim() || "grade",
        values: selectedProduct.varieties.map((v) => String(v?.grade || "").trim()).filter(Boolean),
      };
    }
    if (Array.isArray(selectedProduct.grades) && selectedProduct.grades.length > 0) {
      return {
        keyword: "grade",
        values: selectedProduct.grades.map((g) => String(g || "").trim()).filter(Boolean),
      };
    }
    return { keyword: "grade", values: [] };
  }, [selectedProduct]);
  const pageTitle = isDetailView
    ? ""
    : "Products";
  const pageSubtitle = isDetailView
    ? ""
    : pathEyebrow;
  const pageHeroImage = isDetailView ? "" : heroImage;

  return (
    <PageLayout
      testId={isDetailView ? "page-product-detail" : "page-products-list"}
      title={pageTitle}
      subtitle={pageSubtitle}
      heroImage={pageHeroImage}
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
      <section data-testid="section-breadcrumb" className="py-6 border-b border-border/50 bg-secondary">
        <div className="container-pad">
          {isDetailView ? (
            <Link href={`/products/${categoryPath}/${subcategoryPath}`}>
              <a
                data-testid="link-back-to-products"
                className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                <ChevronLeft className="h-4 w-4" />
                Back to product list
              </a>
            </Link>
          ) : (
            <Link href={`/products/${categoryPath}`}>
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
            <Link href={`/products/${categoryPath}`}>
              <a className="mt-4 inline-block text-sm text-primary hover:underline">
                Back to subcategories
              </a>
            </Link>
          </div>
        </section>
      ) : isDetailView ? (
        !selectedProduct ? (
          <section className="py-16 sm:py-20">
            <div className="container-pad">
              <p className="text-base text-destructive">Product not found.</p>
            </div>
          </section>
        ) : (
          <>
            <section data-testid="section-product-overview" className="py-16 sm:py-20 bg-background">
              <div className="container-pad">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
                  <div className="lg:col-span-6">
                    <div className="rounded-2xl overflow-hidden shadow-lg bg-white flex items-center justify-center">
                      <img
                        src={toPublicUrl(selectedProduct.imageUrl) || IMAGES.LOGO}
                        alt={selectedProduct.title}
                        loading="eager"
                        decoding="async"
                        width={1200}
                        height={900}
                        className={selectedProduct.imageUrl ? "w-full h-auto max-h-[560px] object-contain" : "max-w-[55%] max-h-[65%] object-contain"}
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
            </section>

            {[
              Array.isArray(selectedProduct.features) && selectedProduct.features.length > 0 && { key: "features", title: "Features", items: selectedProduct.features },
              Array.isArray(selectedProduct.specifications) && selectedProduct.specifications.length > 0 && { key: "specifications", title: "Specifications", items: selectedProduct.specifications },
              Array.isArray(selectedProduct.applications) && selectedProduct.applications.length > 0 && { key: "applications", title: "Applications", items: selectedProduct.applications },
            ]
              .filter(Boolean)
              .map((section, idx) => (
                <section
                  key={section.key}
                  data-testid={`section-product-${section.key}`}
                  className={`py-8 sm:py-10 ${idx % 2 === 0 ? "bg-secondary" : "bg-background"}`}
                >
                  <div className="container-pad">
                    <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-3">{section.title}</h3>
                    <ul className="list-disc space-y-2 pl-5 text-base sm:text-lg text-foreground">
                      {section.items.map((entry, i) => (
                        <li key={`${section.key}-${i}`}>{entry}</li>
                      ))}
                    </ul>
                  </div>
                </section>
              ))}

            {varietySection.values.length > 0 ? (
              <section
                data-testid="section-product-varieties"
                className={`py-8 sm:py-10 ${([!!(selectedProduct.features?.length), !!(selectedProduct.specifications?.length), !!(selectedProduct.applications?.length)].filter(Boolean).length % 2 === 1 ? "bg-background" : "bg-secondary")}`}
              >
                <div>
                  <div className="container-pad mb-6 sm:mb-8">
                    <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                      {varietySection.keyword}
                    </h3>
                  </div>
                  <div className="mx-auto w-full max-w-[90rem] pl-6 pr-2 sm:pl-8 sm:pr-4 lg:pl-10 lg:pr-6 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5">
                    {varietySection.values.map((val, i) => (
                      <div
                        key={`variety-${i}`}
                        className="rounded-xl border border-border/70 bg-card p-6 sm:p-8 flex flex-col gap-3 shadow-sm min-h-[180px]"
                      >
                        <p className="text-lg sm:text-xl font-medium text-foreground">{val}</p>
                        <div className="mt-auto flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
                          <span className="text-xs text-muted-foreground">Need to make an enquiry for this {varietySection.keyword}</span>
                          <Button
                            as="link"
                            href="/contact"
                            className="rounded-lg text-sm font-medium bg-[#064CCA] text-white hover:bg-[#053a9e] w-fit"
                          >
                            Enquiry
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </section>
            ) : null}
          </>
        )
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
                  <Link key={p._id} href={`/products/${toSlug(category.title)}/${toSlug(subcategory.title)}/${toSlug(p.title)}`}>
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
                          src={toPublicUrl(p.imageUrl) || IMAGES.LOGO}
                          alt={p.title}
                          loading="lazy"
                          decoding="async"
                          width={900}
                          height={600}
                          className={`absolute z-0 transition-all duration-300 group-hover:scale-105 group-hover:blur-sm ${p.imageUrl ? "inset-0 h-full w-full object-cover" : "left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 max-w-[60%] max-h-[60%] object-contain"}`}
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
