import { useEffect, useRef, useState } from "react";
import PageLayout from "@/components/PageLayout";
import SectionTitle from "@/components/SectionTitle";
import ServiceCard from "@/components/ServiceCard";
import ImageCard from "@/components/ImageCard";
import Button from "@/components/Button";
import SeoHead from "@/components/SeoHead";
import { IMAGES } from "@/lib/images";
import { toast } from "@/hooks/use-toast";
import { useSeo } from "@/hooks/useSeo";
import { apiClient } from "@/lib/apiClient";
import HERO_TEST_1 from "../assets/images/heroTest1.webp";
import HERO_TEST_1_AVIF from "../assets/images/heroTest1.avif";
import HERO_TEST_1_1280 from "../assets/images/heroTest1-1280.webp";
import HERO_TEST_1_768 from "../assets/images/heroTest1-768.webp";
import HERO_TEST_1_1280_AVIF from "../assets/images/heroTest1-1280.avif";
import HERO_TEST_1_768_AVIF from "../assets/images/heroTest1-768.avif";

import { Download } from "lucide-react";

const apiBase = String(import.meta.env.VITE_API_BASE_URL || "").replace(/\/$/, "");
const toBrandImageUrl = (path) => {
  if (!path) return "";
  if (/^https?:\/\//i.test(path)) return path;
  const p = String(path).startsWith("/") ? path : `/${path}`;
  return `${apiBase}${p}`;
};

const HERO = HERO_TEST_1;
const HERO_SRCSET = `${HERO_TEST_1_768} 768w, ${HERO_TEST_1_1280} 1280w, ${HERO_TEST_1} 1920w`;
const HERO_SRCSET_AVIF = `${HERO_TEST_1_768_AVIF} 768w, ${HERO_TEST_1_1280_AVIF} 1280w, ${HERO_TEST_1_AVIF} 1920w`;
const LOGO = IMAGES.LOGO;

const SERVICE_CARDS = [
  {
    id: "card-service-1",
    title: "Industrial Equipment Supply",
    description:
      "Provide your operations with high-quality mechanical, electrical, and oilfield equipment sourced from trusted manufacturers. Our industrial equipment ensures maximum performance, reliability, and longevity in demanding industrial, oil & gas, and manufacturing environments.",
    imageSrcKey: "HOME_SERVICE_CARD_1",
  },
  {
    id: "card-service-2",
    title: "Premium Industrial Oils & Greases",
    description:
      "Delivering top-grade industrial lubricants, specialty fluids, and greases for oil & gas, marine, power generation, and heavy industry applications. Our fluid solutions enhance machinery performance, reduce wear, and extend operational life.",
    imageSrcKey: "HOME_SERVICE_CARD_2",
  },
  {
    id: "card-service-3",
    title: "Compressed Air & Nitrogen Systems",
    description:
      "Efficient compressed air systems, nitrogen generators, filtration units, and air treatment solutions designed to maintain consistent performance and operational reliability across industrial applications.",
    imageSrcKey: "HOME_SERVICE_CARD_3",
  },
  {
    id: "card-service-5",
    title: "End-to-End Industrial Procurement",
    description:
      "Seamless management of bulk orders, project-based supplies, and on-site deliveries. Our project supply services ensure timely, reliable, and coordinated fulfillment for industrial and oilfield projects.",
    imageSrcKey: "HOME_SERVICE_CARD_5",
  },
];

const BRAND_CARD_WIDTH_DESKTOP = 260;
const BRAND_CARD_WIDTH_MOBILE = 180;
const BRAND_CARD_GAP = 24;

export default function Home() {
  const [isAtTop, setIsAtTop] = useState(true);
  const [brands, setBrands] = useState([]);
  const [brandsLoading, setBrandsLoading] = useState(true);
  const [brandScrollIndex, setBrandScrollIndex] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const [shouldLoadBrands, setShouldLoadBrands] = useState(false);
  const brandsTriggerRef = useRef(null);
  const { seo } = useSeo("static", "home");

  useEffect(() => {
    const mq = typeof window !== "undefined" && window.matchMedia?.("(max-width: 639px)");
    const update = () => setIsMobile(!!mq?.matches);
    update();
    mq?.addEventListener?.("change", update);
    return () => mq?.removeEventListener?.("change", update);
  }, []);

  const brandCardWidth = isMobile ? BRAND_CARD_WIDTH_MOBILE : BRAND_CARD_WIDTH_DESKTOP;
  const brandScrollStep = brandCardWidth + BRAND_CARD_GAP;

  useEffect(() => {
    setBrandScrollIndex(0);
  }, [isMobile]);

  useEffect(() => {
    if (isMobile) return;
    if (brands.length <= 0) return;
    if (typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches) return;
    const timer = setInterval(() => {
      setBrandScrollIndex((prev) => (prev + 1) % brands.length);
    }, 2000);
    return () => clearInterval(timer);
  }, [brands.length, isMobile]);

  useEffect(() => {
    const marker = brandsTriggerRef.current;
    if (!marker || shouldLoadBrands) return undefined;
    if (!("IntersectionObserver" in window)) {
      setShouldLoadBrands(true);
      return undefined;
    }
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setShouldLoadBrands(true);
          io.disconnect();
        }
      },
      { rootMargin: "200px 0px" },
    );
    io.observe(marker);
    return () => io.disconnect();
  }, [shouldLoadBrands]);

  useEffect(() => {
    if (!shouldLoadBrands) return;
    let cancelled = false;
    setBrandsLoading(true);
    apiClient
      .get("/api/brands")
      .then((res) => {
        if (!cancelled) setBrands(res?.data?.items ?? []);
      })
      .catch(() => {
        if (!cancelled) setBrands([]);
      })
      .finally(() => {
        if (!cancelled) setBrandsLoading(false);
      });
    return () => { cancelled = true; };
  }, [shouldLoadBrands]);

  const handleBrochureDownloadClick = () => {
    toast({
      title: "Brochure unavailable",
      description: "The brochure is currently unavailable. Please contact us for assistance.",
    });
  };

  useEffect(() => {
    const handleScroll = () => setIsAtTop(window.scrollY <= 0);
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

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
      { threshold: 0.15, rootMargin: "0px 0px -10% 0px" },
    );

    elements.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [brands]);

  return (
    <PageLayout testId="page-home">
      <SeoHead
        seo={seo}
        fallbackTitle="Petrozen | Oil & Gas Equipment Supplier"
        fallbackDescription="Petrozen provides certified oil and gas equipment and industrial solutions across the UAE and GCC with a focus on quality, safety, and reliable delivery."
        fallbackKeywords="petrozen, oil and gas equipment, industrial solutions, uae, gcc"
        ogImage={HERO}
        preloadImage={HERO_TEST_1_AVIF}
        preloadImageSrcSet={HERO_SRCSET_AVIF}
        preloadImageSizes="100vw"
      />
      <section
        data-testid="section-hero"
        className="relative overflow-hidden h-screen h-[100svh]"
      >
        <picture className="absolute inset-0">
          <source srcSet={HERO_SRCSET_AVIF} sizes="100vw" type="image/avif" />
          <img
            src={HERO}
            srcSet={HERO_SRCSET}
            sizes="100vw"
            alt=""
            className="absolute inset-0 w-full h-full object-cover hero-media-in"
            loading="eager"
            fetchPriority="high"
            decoding="async"
            width={1920}
            height={1080}
          />
        </picture>
        <div className="absolute inset-0 bg-black/55" />

        <div className="absolute inset-0">
          <div className="container-pad py-20 sm:py-28">
            <div className="max-w-3xl hero-content-in">
              <img
                src={LOGO}
                alt="Petrozen"
                className={`h-20 w-auto sm:h-24 ${isAtTop ? "" : "invisible"}`}
                data-testid="hero-logo"
                loading="eager"
                decoding="async"
                width={640}
                height={220}
              />
              <div
                data-testid="text-hero-eyebrow"
                className="mt-4 text-xs font-semibold tracking-[0.22em] uppercase text-white/80"
              >
                Engineering • Industrial
              </div>
              <h1
                data-testid="text-hero-title"
                className="mt-4 text-5xl sm:text-7xl font-semibold tracking-tight text-white leading-[1.05]"
              >
                Igniting Success Worldwide Through Oil & Gas Innovation
              </h1>
              <p
                data-testid="text-hero-subtitle"
                className="mt-5 text-lg sm:text-xl text-white/85 leading-relaxed"
              >
                Petrozen provides certified oil and gas equipment and industrial solutions, fully aligned with international standards. With a focus on quality, safety, and inventory readiness, we support critical energy projects across the UAE and GCC.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section data-testid="section-about-preview" className="py-16 sm:py-20">
        <div className="container-pad reveal" data-reveal="left">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
            <div className="lg:col-span-5">
              <SectionTitle
                testId="title-about-preview"
                eyebrow="About"
                title="A partner built on an unwavering commitment to excellence"
                description="We enable successful project outcomes in the oil and gas sector by combining disciplined processes, coordinated efforts, and dependable execution, all guided by the specific expectations of our clients."
                descriptionClassName="text-sm sm:text-base"
                titleFont="sans"
                titleClassName="tracking-tight"
              />
              <div className="mt-7">
                <Button
                  as="link"
                  href="/about"
                  testId="button-about-more"
                  variant="primary"
                  className="transition-all duration-200 hover:scale-105"
                >
                  More on About
                </Button>
              </div>
            </div>

            <div className="lg:col-span-7">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="reveal transition-shadow duration-300 hover:shadow-xl rounded-2xl" data-reveal="up">
                  <ImageCard
                    testId="card-about-1"
                    title="Quality-driven"
                    description="ISO-aligned methods, consistent reporting, and audit-ready outputs."
                    imageSrc={IMAGES.INDUSTRIAL_MANUFACTURING}
                    imageAlt="Industrial engineers reviewing plans"
                    variant="overlay"
                    aspectRatio="5/6"
                  />
                </div>
                <div className="reveal transition-shadow duration-300 hover:shadow-xl rounded-2xl" data-reveal="up" style={{ transitionDelay: "100ms" }}>
                  <ImageCard
                    testId="card-about-2"
                    title="Safety-first"
                    description="Practical processes that support safe, efficient execution."
                    imageSrc={IMAGES.SAFETY}
                    imageAlt="Safety gear on an industrial site"
                    variant="overlay"
                    aspectRatio="5/6"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section data-testid="section-services-preview" className="py-16 sm:py-20 bg-secondary overflow-hidden">
        <div className="container-pad reveal" data-reveal="up">
          <SectionTitle
            testId="title-services-preview"
            eyebrow="Services"
            title="Core capabilities"
            // description="Integrated industrial solutions designed to support performance, reliability, and operational efficiency across multiple sectors."
            align="center"
          />
        </div>

        <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-4 px-4 justify-items-stretch max-w-[1600px] mx-auto items-stretch">
          {SERVICE_CARDS.map((card, idx) => (
            <div
              key={card.id}
              className="h-full flex reveal"
              data-reveal="up"
              style={{ transitionDelay: `${idx * 80}ms` }}
            >
              <ServiceCard
                vertical
                testId={card.id}
                title={card.title}
                description={card.description}
                imageSrc={IMAGES[card.imageSrcKey]}
                className="transition-shadow duration-300 hover:shadow-lg w-full h-full min-h-[320px] sm:min-h-[380px]"
              />
            </div>
          ))}
        </div>

        <div className="container-pad mt-10 flex justify-center">
          <Button as="link" href="/services" testId="button-services-more" className="transition-all duration-200 hover:scale-105">
            View all services
          </Button>
        </div>
      </section>

      <section
        data-testid="section-brochure"
        className="py-24 sm:py-32 bg-gradient-to-br from-[#002C92] to-[#059AFC]"
      >
        <div className="container-pad reveal" data-reveal="up">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            <div className="lg:col-span-5">
              <div className="text-xs font-semibold tracking-[0.2em] uppercase text-blue-200">
                Resources
              </div>
              <h2 className="mt-3 text-3xl sm:text-4xl font-semibold tracking-tight text-white">
                Company Brochure
              </h2>
              <p className="mt-3 text-base text-blue-100/90 leading-relaxed">
                Download our company brochure to learn more about Petrozen's capabilities,
                services, and commitment to quality across oil & gas and industrial sectors.
              </p>
            </div>
            <div className="lg:col-span-7 flex justify-center lg:justify-end">
              <div
                data-testid="card-brochure-preview"
                className="reveal relative w-full max-w-[280px] min-h-[320px] rounded-2xl bg-white overflow-hidden shadow-xl shadow-black/20 flex flex-col border border-black/5 transition-transform duration-300 hover:-translate-y-1"
                data-reveal="right"
              >
                <svg
                  className="absolute bottom-0 left-0 w-full h-full pointer-events-none"
                  viewBox="0 0 280 320"
                  preserveAspectRatio="xMinYMin slice"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <defs>
                    <linearGradient id="brochure-fill" x1="0%" y1="100%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#002C92" stopOpacity="0.06" />
                      <stop offset="100%" stopColor="#059AFC" stopOpacity="0.03" />
                    </linearGradient>
                  </defs>
                  <path
                    d="M0 320 L0 200 Q70 180 120 220 Q170 260 140 320 Z"
                    fill="url(#brochure-fill)"
                  />
                  <path
                    d="M140 320 C80 280 40 220 20 160 C0 100 30 50 0 20"
                    stroke="#002C92"
                    strokeWidth="1.75"
                    fill="none"
                    strokeLinecap="round"
                    opacity="0.2"
                  />
                  <path
                    d="M140 320 C95 288 55 232 35 172 C15 112 42 65 10 35"
                    stroke="#059AFC"
                    strokeWidth="1.35"
                    fill="none"
                    strokeLinecap="round"
                    opacity="0.18"
                  />
                  <path
                    d="M140 320 C108 293 68 240 48 180 C28 120 52 78 18 48"
                    stroke="#059AFC"
                    strokeWidth="1.1"
                    fill="none"
                    strokeLinecap="round"
                    opacity="0.12"
                  />
                </svg>
                <div className="relative z-10 p-8 pb-6 flex flex-col flex-1 items-center justify-center text-center">
                  <img
                    src={LOGO}
                    alt="Petrozen"
                    className="h-20 w-auto object-contain"
                    loading="lazy"
                    decoding="async"
                    width={640}
                    height={220}
                  />
                  <div className="mt-4 text-base font-semibold text-foreground">Petrozen Brochure</div>
                  <button
                    type="button"
                    onClick={handleBrochureDownloadClick}
                    data-testid="link-brochure-download"
                    className="mt-12 inline-flex items-center gap-2 text-sm font-medium text-primary transition-all duration-300 hover:text-primary/80 hover:gap-3"
                  >
                    <Download className="h-5 w-5" />
                    Download brochure
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div ref={brandsTriggerRef} className="h-px w-full" />
      {brands.length > 0 && (
        <section
          data-testid="section-brands"
          className="py-16 sm:py-20 overflow-hidden bg-gradient-to-b from-secondary/40 to-transparent"
        >
          <div className="container-pad reveal" data-reveal="up">
            <SectionTitle
              testId="title-brands"
              eyebrow="Partners"
              title="Trusted Brands We Work With"
              align="center"
            />
          </div>
          <div className="container-pad mt-10 overflow-hidden">
            <div
              className="flex gap-6 transition-transform duration-500 ease-out"
              style={{
                width: "max-content",
                transform: `translateX(-${brandScrollIndex * brandScrollStep}px)`,
              }}
            >
            {[...brands, ...brands].map((brand, idx) => (
                <div
                  key={`${brand._id}-${idx}`}
                  data-testid={`brand-${brand._id}`}
                  className="group flex flex-col items-center justify-center rounded-2xl border border-black/10 bg-white p-3 sm:p-4 min-h-[80px] flex-shrink-0 shadow-sm transition-all duration-300 hover:shadow-lg hover:border-primary/20 hover:-translate-y-1"
                  style={{ width: brandCardWidth }}
                >
                  <div className="relative w-full flex-1 flex items-center justify-center">
                    <img
                      src={toBrandImageUrl(brand.image)}
                      alt={brand.name}
                      className="h-36 sm:h-44 md:h-52 w-auto max-w-full object-contain object-center transition-all duration-300 group-hover:scale-[1.03]"
                      loading="lazy"
                      decoding="async"
                      width={420}
                      height={220}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      <section data-testid="section-why" className="py-16 sm:py-20 bg-secondary">
        <div className="container-pad reveal" data-reveal="zoom">
          <SectionTitle
            testId="title-why"
            eyebrow="Why choose us"
            title="The Backbone of Modern Machinery"
            align="center"
          />

          <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                title: "Performance Without Compromise",
                desc: "We operate with structured systems and operational clarity—ensuring safe, compliant, and efficient delivery across oil & gas environments.",
              },
              {
                title: "Driven by Precision. Delivered with Discipline.",
                desc: "We operate with structured systems and operational clarity—ensuring safe, compliant, and efficient delivery across oil & gas environments.",
              },
              {
                title: "Controlled Execution",
                desc: "Clearly defined workflows, documented checkpoints, and consistent quality standards at every stage.",
              },
              {
                title: "Operational Reliability",
                desc: "Practical solutions designed to perform in upstream, midstream, and downstream environments.",
              },
            ].map((x, idx) => (
            <div
              key={x.title}
              data-testid={`card-why-${idx}`}
              className="group reveal relative flex flex-col justify-center rounded-2xl border border-white/20 bg-gradient-to-br from-[#4CB506] to-[#76D40B] p-10 h-[320px] shadow-lg shadow-black/15 overflow-hidden transition-all duration-500 ease-out hover:shadow-xl hover:shadow-black/20 hover:-translate-y-1"
              data-reveal="up"
              style={{ transitionDelay: `${idx * 100}ms` }}
            >
              <h3 className="text-2xl font-semibold tracking-tight text-white transition-all duration-300 ease-out group-hover:opacity-0 group-hover:-translate-y-2">
                {x.title}
              </h3>
              <p className="absolute inset-0 p-10 flex items-center text-lg text-white/90 leading-relaxed overflow-y-auto opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-500 ease-out delay-75">
                {x.desc}
              </p>
            </div>
            ))}
          </div>
        </div>
      </section>

      <section data-testid="section-cta" className="py-16 sm:py-20">
        <div className="container-pad reveal" data-reveal="up">
          <div className="reveal rounded-3xl border border-white/10 bg-white/5 p-8 sm:p-12 shadow-[0_24px_70px_rgba(0,0,0,0.25)] transition-transform duration-300 hover:scale-[1.01]" data-reveal="up">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              <div className="lg:col-span-8">
                <h3 data-testid="text-cta-title" className="text-3xl sm:text-4xl font-semibold text-black">
                  Ready to ignite success?
                </h3>
                <p data-testid="text-cta-subtitle" className="mt-3 text-black/75 max-w-2xl">
                  Tell us about your project. We'll respond with a clear next step and a
                  proposed path to support.
                </p>
              </div>
              <div className="lg:col-span-4 flex lg:justify-end">
                <Button as="link" href="/contact" testId="button-cta" size="lg" className="transition-all duration-200 hover:scale-105 active:scale-100">
                  Request a consult
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </PageLayout>
  );
}
