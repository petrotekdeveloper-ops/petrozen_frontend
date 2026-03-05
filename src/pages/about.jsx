import { useEffect } from "react";
import PageLayout from "@/components/PageLayout";
import SectionTitle from "@/components/SectionTitle";
import { IMAGES } from "@/lib/images";

const HERO = IMAGES.ABOUT_HERO;

export default function About() {
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
      { threshold: 0.1, rootMargin: "0px 0px -5% 0px" },
    );

    elements.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  return (
    <PageLayout
      testId="page-about"
      title="About"
      subtitle="A disciplined partner for quality, compliance, and execution support."
      heroImage={HERO}
      heroTitleFont="sans"
    >
      <section data-testid="section-company-overview" className="py-16 sm:py-20">
        <div className="container-pad">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
            <div className="lg:col-span-7 reveal" data-reveal="left">
              <SectionTitle
                testId="title-overview"
                eyebrow="Company overview"
                title="Precision in Every Pipeline"
                description="Petrozen is a leading oil & gas equipment supplier in the UAE, supporting critical energy and infrastructure projects across the region. Since its establishment, the company has been focused on delivering certified oilfield equipment, mechanical systems, pumps, valves, and industrial supply solutions aligned with international engineering standards."
                titleFont="sans"
              />
            </div>
            <div className="lg:col-span-5 reveal" data-reveal="right">
              <img
                data-testid="img-about-overview"
                src={IMAGES.ABOUT_US}
                alt="Quality and precision at the core of what we do"
                className="w-full max-w-[90%] ml-0 lg:ml-auto rounded-2xl shadow-[0_18px_50px_rgba(0,0,0,0.10)] object-cover"
                loading="lazy"
              />
            </div>
          </div>
          <div className="mt-10 w-full max-w-none reveal" data-reveal="fade">
            <div className="space-y-4">
              <p className="text-base sm:text-lg text-muted-foreground leading-relaxed">
                Our operations are built on disciplined supply chain management, vendor qualification systems, and strict quality assurance processes. Through inventory readiness, coordinated logistics, and HSE-compliant practices, we ensure reliable oil & gas supply solutions for upstream, offshore, onshore, and refining operations across the UAE and wider GCC region.
              </p>
              <p className="text-base sm:text-lg text-muted-foreground leading-relaxed">
                As a growing oil & gas services company, Petrozen focuses on operational excellence, technical compliance, and long-term partnerships, supporting complex industrial environments where performance, safety, and documentation control are critical.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section data-testid="section-mission" className="relative py-16 sm:py-20 bg-secondary overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-25"
          style={{ backgroundImage: `url(${IMAGES.MISSION_VISION_ABOUT})` }}
          aria-hidden
        />
        <div className="container-pad relative z-10 reveal" data-reveal="zoom">
          <SectionTitle
            testId="title-mission"
            eyebrow="Mission & vision"
            title="Make quality visible"
            titleFont="sans"
            align="center"
          />
          <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="reveal rounded-2xl soft-border bg-card p-6 shadow-sm shadow-black/5" data-reveal="left" style={{ transitionDelay: "0ms" }}>
                  <div className="text-lg font-semibold">Mission</div>
                  <p className="mt-2 text-base text-muted-foreground leading-relaxed">
                  Our mission is to deliver high-quality oil and gas equipment and integrated engineering services that enhance operational efficiency, safety, and reliability across the UAE energy sector. We are committed to supporting upstream, midstream, and downstream oil and gas operations with technically advanced solutions and responsive industrial services. Through strict adherence to international standards, local regulatory compliance, and oilfield engineering best practices, we ensure excellence in every project we undertake. We build long-term partnerships by prioritizing integrity, performance, and customer satisfaction, contributing meaningfully to the UAE’s energy infrastructure development and industrial growth.
                  </p>
                </div>
                <div className="reveal rounded-2xl soft-border bg-card p-6 shadow-sm shadow-black/5" data-reveal="right" style={{ transitionDelay: "100ms" }}>
                  <div className="text-lg font-semibold">Vision</div>
                  <p className="mt-2 text-base text-muted-foreground leading-relaxed">
                  Our vision is to become the leading and most trusted oil and gas solutions provider in Abu Dhabi and the wider GCC energy market. We aspire to set industry benchmarks in quality, innovation, and operational excellence for the oilfield and industrial services sector. By continuously investing in advanced technology, skilled talent, and sustainable energy practices, we aim to deliver long-term value for our clients, partners, and stakeholders. We envision playing a strategic role in supporting national energy initiatives, future-ready energy infrastructure, and the UAE’s industrial growth. Our goal is to build a resilient and reliable organization recognized for leadership, innovation, and measurable impact in the global oil and gas industry.
                  </p>
                </div>
          </div>
        </div>
      </section>

      <section data-testid="section-values" className="py-16 sm:py-20">
        <div className="container-pad">
          <div className="reveal" data-reveal="fade">
            <SectionTitle
              testId="title-values"
              eyebrow="Core values"
              title="Principles we operate by"
              align="center"
              titleFont="sans"
            />
          </div>

          <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              {
                t: "Core Focus",
                d: "We are dedicated to continuous improvement and pursuing excellence across all aspects of our operations. By crafting effective business strategies, we adapt to the evolving needs of our customers, ensuring satisfaction and fostering loyalty. Supported by a robust distribution network, we deliver quality and reliability across the markets we serve.",
              },
              {
                t: "Customer Satisfaction",
                d: "At Petrozen, we prioritize our customers in every decision we make. By understanding their needs and delivering tailored solutions, we ensure a seamless experience and build long-term trust. Our commitment to quality, reliability, and responsive service guarantees that our customers' expectations are not just met, but exceeded.",
              },
              {
                t: "Innovation",
                d: "We embrace innovation to stay ahead in a rapidly evolving market. By adopting advanced technologies and creative approaches, we provide solutions that drive efficiency, reliability, and progress for our customers.",
              },
              {
                t: "Integrity",
                d: "We conduct our business with honesty, transparency, and accountability. Upholding the highest ethical standards ensures trust and fosters long-term relationships with our clients, partners, and stakeholders.",
              },
            ].map((x, i) => (
              <div
                key={x.t}
                data-testid={`card-value-${x.t.toLowerCase().replace(/\s+/g, "-")}`}
                data-reveal="zoom"
                className="reveal group relative h-[360px] rounded-2xl bg-gradient-to-br from-[#0036A4] to-[#0680F4] p-6 shadow-sm shadow-black/10 overflow-hidden transition-shadow duration-300 hover:shadow-md border border-white/10"
                style={{ transitionDelay: `${i * 80}ms` }}
              >
                <div className="absolute inset-0 flex items-center justify-center p-6 transition-all duration-300 group-hover:items-start group-hover:justify-start group-hover:pt-6">
                  <div className="text-lg font-semibold text-white text-center transition-all duration-300 group-hover:text-left">{x.t}</div>
                </div>
                <p className="absolute inset-x-0 bottom-0 top-14 p-6 pt-0 text-sm text-white/90 leading-relaxed opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                  {x.d}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </PageLayout>
  );
}
