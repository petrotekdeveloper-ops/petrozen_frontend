import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import PageLayout from "@/components/PageLayout";
import SectionTitle from "@/components/SectionTitle";
import ServiceCard from "@/components/ServiceCard";
import ImageCard from "@/components/ImageCard";
import Button from "@/components/Button";
import { IMAGES } from "@/lib/images";
import HERO_TEST_1 from "../assets/images/heroTest1.jpeg";

import { Download } from "lucide-react";

const fadeUp = { opacity: 0, y: 24 };
const fadeIn = { opacity: 1, y: 0 };
const stagger = { staggerChildren: 0.12, delayChildren: 0.15 };

const HERO = HERO_TEST_1;
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

export default function Home() {
  const [isAtTop, setIsAtTop] = useState(true);

  useEffect(() => {
    const handleScroll = () => setIsAtTop(window.scrollY <= 0);
    handleScroll();
    window.addEventListener("scroll", handleScroll);
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
  }, []);

  return (
    <PageLayout testId="page-home">
      <section
        data-testid="section-hero"
        className="relative overflow-hidden h-screen h-[100svh]"
      >
        <motion.img
          src={HERO}
          alt=""
          className="absolute inset-0 w-full h-full object-cover"
          loading="eager"
          initial={{ scale: 1.08 }}
          animate={{ scale: 1 }}
          transition={{ duration: 1.4, ease: [0.22, 0.61, 0.36, 1] }}
        />
        <div className="absolute inset-0 bg-black/55" />

        <div className="absolute inset-0">
          <div className="container-pad py-20 sm:py-28">
            <motion.div
              className="max-w-3xl"
              initial="hidden"
              animate="visible"
              variants={stagger}
            >
              <motion.img
                src={LOGO}
                alt="Petrozen"
                className={`h-20 w-auto sm:h-24 ${isAtTop ? "" : "invisible"}`}
                data-testid="hero-logo"
                variants={{ hidden: fadeUp, visible: { ...fadeIn, transition: { duration: 0.6 } } }}
              />
              <motion.div
                data-testid="text-hero-eyebrow"
                className="mt-4 text-xs font-semibold tracking-[0.22em] uppercase text-white/80"
                variants={{ hidden: fadeUp, visible: { ...fadeIn, transition: { duration: 0.6 } } }}
              >
                Engineering • Industrial
              </motion.div>
              <motion.h1
                data-testid="text-hero-title"
                className="mt-4 text-5xl sm:text-7xl font-semibold tracking-tight text-white leading-[1.05]"
                variants={{ hidden: { ...fadeUp, y: 32 }, visible: { ...fadeIn, y: 0, transition: { duration: 0.7 } } }}
              >
                Igniting Success Worldwide Through Oil & Gas Innovation
              </motion.h1>
              <motion.p
                data-testid="text-hero-subtitle"
                className="mt-5 text-lg sm:text-xl text-white/85 leading-relaxed"
                variants={{ hidden: fadeUp, visible: { ...fadeIn, transition: { duration: 0.6 } } }}
              >
                Petrozen provides certified oil and gas equipment and industrial solutions, fully aligned with international standards. With a focus on quality, safety, and inventory readiness, we support critical energy projects across the UAE and GCC.
              </motion.p>
            </motion.div>
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
                  variant="secondary"
                  className="transition-all duration-200 hover:scale-105"
                >
                  More on About
                </Button>
              </div>
            </div>

            <div className="lg:col-span-7">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{ duration: 0.5 }}
                  whileHover={{ y: -4 }}
                  className="transition-shadow duration-300 hover:shadow-xl rounded-2xl"
                >
                  <ImageCard
                    testId="card-about-1"
                    title="Quality-driven"
                    description="ISO-aligned methods, consistent reporting, and audit-ready outputs."
                    imageSrc={IMAGES.INDUSTRIAL_MANUFACTURING}
                    imageAlt="Industrial engineers reviewing plans"
                    variant="overlay"
                    aspectRatio="5/6"
                  />
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{ duration: 0.5, delay: 0.1 }}
                  whileHover={{ y: -4 }}
                  className="transition-shadow duration-300 hover:shadow-xl rounded-2xl"
                >
                  <ImageCard
                    testId="card-about-2"
                    title="Safety-first"
                    description="Practical processes that support safe, efficient execution."
                    imageSrc={IMAGES.SAFETY}
                    imageAlt="Safety gear on an industrial site"
                    variant="overlay"
                    aspectRatio="5/6"
                  />
                </motion.div>
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
            <motion.div
              key={card.id}
              className="h-full flex"
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-30px" }}
              transition={{ duration: 0.5, delay: idx * 0.08 }}
              whileHover={{ y: -6, transition: { duration: 0.25 } }}
            >
              <ServiceCard
                vertical
                testId={card.id}
                title={card.title}
                description={card.description}
                imageSrc={IMAGES[card.imageSrcKey]}
                className="transition-shadow duration-300 hover:shadow-lg w-full h-full min-h-[320px] sm:min-h-[380px]"
              />
            </motion.div>
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
              <motion.div
                data-testid="card-brochure-preview"
                className="relative w-full max-w-[280px] min-h-[320px] rounded-2xl bg-white overflow-hidden shadow-xl shadow-black/20 flex flex-col border border-black/5"
                initial={{ opacity: 0, x: 24 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                whileHover={{ y: -8, scale: 1.02 }}
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
                  />
                  <div className="mt-4 text-base font-semibold text-foreground">Petrozen Brochure</div>
                  <a
                    href="/brochure.pdf"
                    target="_blank"
                    rel="noopener noreferrer"
                    data-testid="link-brochure-download"
                    className="mt-12 inline-flex items-center gap-2 text-sm font-medium text-primary transition-all duration-300 hover:text-primary/80 hover:gap-3"
                  >
                    <Download className="h-5 w-5" />
                    Download brochure
                  </a>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

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
            <motion.div
              key={x.title}
              data-testid={`card-why-${idx}`}
              className="group relative flex flex-col justify-center rounded-2xl border border-white/20 bg-gradient-to-br from-[#4CB506] to-[#76D40B] p-10 h-[320px] shadow-lg shadow-black/15 overflow-hidden transition-all duration-500 ease-out hover:shadow-xl hover:shadow-black/20 hover:-translate-y-1"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
            >
              <h3 className="text-2xl font-semibold tracking-tight text-white transition-all duration-300 ease-out group-hover:opacity-0 group-hover:-translate-y-2">
                {x.title}
              </h3>
              <p className="absolute inset-0 p-10 flex items-center text-lg text-white/90 leading-relaxed overflow-y-auto opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-500 ease-out delay-75">
                {x.desc}
              </p>
            </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section data-testid="section-cta" className="py-16 sm:py-20">
        <div className="container-pad reveal" data-reveal="up">
          <motion.div
            className="rounded-3xl border border-white/10 bg-white/5 p-8 sm:p-12 shadow-[0_24px_70px_rgba(0,0,0,0.25)]"
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            whileHover={{ scale: 1.01, transition: { duration: 0.3 } }}
          >
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
          </motion.div>
        </div>
      </section>
    </PageLayout>
  );
}
