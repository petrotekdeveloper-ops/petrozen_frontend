import { useEffect } from "react";
import PageLayout from "@/components/PageLayout";
import SectionTitle from "@/components/SectionTitle";
import Button from "@/components/Button";
import { IMAGES } from "@/lib/images";

import {
  AlertCircle,
  Clock,
  FileCheck,
  FileText,
  PackageCheck,
  Wrench,
} from "lucide-react";

const HERO = IMAGES.SERVICES_HERO;

export default function Services() {
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
  }, []);

  return (
    <PageLayout
      testId="page-services"
      title="Services"
      subtitle="Focused capabilities to support quality, compliance, and delivery."
      heroImage={HERO}
      heroTitleFont="sans"
    >
      <section data-testid="section-service-cards" className="py-16 sm:py-20">
        <div className="container-pad reveal" data-reveal="up">
          <SectionTitle
            testId="title-services"
            eyebrow="What we do"
            title="Leading Industrial Service Provider in the UAE "
            className="max-w-none w-full"
            description={
              <>
                <p>
                  At Petrozen, we provide comprehensive Service & Maintenance solutions designed to
                  support critical industrial operations across Abu Dhabi and the wider GCC region. Our
                  expertise extends beyond supplying high-performance industrial lubricants we ensure
                  that rotating equipment and essential machinery operate with maximum efficiency,
                  reliability, and safety.
                </p>
                <p className="mt-4">
                  Our service approach focuses on preventive care, technical precision, and rapid
                  response, helping clients minimize downtime and extend equipment life in demanding oil
                  & gas and industrial environments.
                </p>
              </>
            }
            titleFont="sans"
          />
        </div>
      </section>

      <section data-testid="section-service-categories" className="py-16 sm:py-20 bg-secondary">
        <div className="mx-auto w-full max-w-[90rem] px-3 sm:px-4 lg:px-5">
          <div className="reveal" data-reveal="fade">
            <SectionTitle
              testId="title-service-categories"
              eyebrow="Service categories"
              title="Categories of services we provide"
              align="center"
              titleFont="sans"
            />
          </div>

          <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 sm:gap-10 lg:gap-12 items-stretch">
            {[
              {
                id: "air-compressor",
                title: "Air Compressor Services",
                image: IMAGES.AIR_COMP_SERVICE,
                description:
                  "One of the leading air compressor service specialists in the UAE and Sharjah, committed to quality and reliability. From routine maintenance to emergency breakdown support, our technical team ensures optimal compressor performance, energy efficiency, and operational reliability.",
                testId: "card-service-air-compressor",
                buttonTestId: "button-enquiry-air-compressor",
              },
              {
                id: "vacuum-pump",
                title: "Vacuum Pump Services",
                image: IMAGES.VACUUM_PUMP_SERVICE,
                description:
                  "Looking for reliable vacuum pump services in Dubai? You've come to the right place. Our experienced technical team delivers professional maintenance, troubleshooting, and repair solutions for vacuum pumps across various industries.",
                testId: "card-service-vacuum-pump",
                buttonTestId: "button-enquiry-vacuum-pump",
              },
              {
                id: "cnc",
                title: "CNC Services",
                image: IMAGES.CNC_SERVICE,
                description:
                  "Our preventive maintenance programs are structured to reduce unexpected breakdowns and improve equipment lifecycle. Through scheduled inspections, performance monitoring, and technical evaluation, we help clients maintain uninterrupted operations while lowering long-term maintenance costs.",
                testId: "card-service-cnc",
                buttonTestId: "button-enquiry-cnc",
              },
            ].map((card, cardIdx) => (
              <div
                key={card.id}
                className="min-w-0 w-full reveal"
                data-reveal={cardIdx % 2 === 0 ? "left" : "right"}
                style={{ transitionDelay: `${cardIdx * 120}ms` }}
              >
                <div
                  data-testid={card.testId}
                  className="group relative w-full rounded-2xl overflow-hidden shadow-sm shadow-black/5 h-[260px] sm:h-[280px] lg:h-[300px] transition-all duration-300 hover:shadow-xl hover:shadow-black/10 hover:-translate-y-1"
                >
                  <img
                    src={card.image}
                    alt=""
                    className="absolute inset-0 z-0 h-full w-full object-cover transition-all duration-300 group-hover:scale-105 group-hover:blur-sm"
                  />
                  <div
                    className="absolute inset-0 z-10 bg-gradient-to-t from-black/85 via-black/30 to-transparent"
                    aria-hidden
                  />
                  <div className="absolute inset-0 z-20 flex flex-col justify-end gap-3 p-6">
                    <div>
                      <h3 className="text-2xl sm:text-3xl font-semibold text-white transition-transform duration-300 ease-out group-hover:-translate-y-4">
                        {card.title}
                      </h3>
                      <p className="text-sm text-white/90 leading-relaxed max-h-0 overflow-hidden opacity-0 transition-[max-height,opacity] duration-300 ease-out group-hover:max-h-[10rem] group-hover:opacity-100 mt-1">
                        {card.description}
                      </p>
                    </div>
                    <div className="w-full flex justify-end">
                      <Button
                        as="link"
                        href="/contact"
                        testId={card.buttonTestId}
                        className="w-fit bg-[#064CCA] text-white hover:bg-[#053a9e] shadow-sm transition-all duration-200 group-hover:scale-105"
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
      </section>

      <section data-testid="section-service-teams" className="py-16 sm:py-20 ">
        <div className="container-pad reveal" data-reveal="up">
          <SectionTitle
            testId="title-service-teams"
            eyebrow="Field expertise & support"
            title="Our Service Engineers & Support Team"
            className="max-w-none w-full"
            description={
              <>
                <p>
                  Our skilled and certified service engineers operate across Abu Dhabi and the UAE,
                  delivering reliable maintenance and technical support for all major rotary screw
                  compressor brands. With strong field experience, our team ensures early fault
                  detection, efficient troubleshooting, and professional servicing to minimize
                  downtime.
                </p>
                <p className="mt-4">
                  We maintain ready stock of essential service kits and fast-moving spare parts to
                  support routine maintenance and emergency breakdowns. Using digital reporting
                  systems, our engineers provide quick documentation, transparent communication,
                  and responsive aftermarket support to ensure smooth and uninterrupted operations.
                </p>
                <p className="mt-4">
                  Our dedicated service support team ensures seamless coordination from planning to
                  aftermarket assistance. Backed by strong in-house technical expertise, we provide
                  prompt and efficient responses to customer requirements across all major compressor
                  brands.
                </p>
                <p className="mt-4">
                  Using advanced monitoring tools and a structured service database, we schedule
                  maintenance at predefined intervals based on equipment type, usage, and operating
                  conditions. Our tailored maintenance approach helps maximize equipment reliability,
                  performance, and operational continuity.
                </p>
              </>
            }
            titleFont="sans"
          />
        </div>
      </section>

      

      <section data-testid="section-process" className="py-16 sm:py-20 bg-secondary">
        <div className="container-pad">
          <div className="reveal" data-reveal="fade">
            <SectionTitle
              testId="title-process"
              eyebrow="How it works"
              title="A Simple, Guaranteed Process"
              align="center"
              titleFont="sans"
            />
          </div>

          <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { t: "Routine & preventive maintenance", i: Wrench },
              { t: "Emergency breakdown assistance", i: AlertCircle },
              { t: "24/7 technical response support", i: Clock },
              { t: "Annual Maintenance Contracts (AMC)", i: FileCheck },
              {
                t: "Fixed-term maintenance contracts for rotary screw compressors",
                i: FileText,
              },
              { t: "Genuine and OEM-equivalent spare parts supply", i: PackageCheck },
            ].map((x, idx) => {
              const isBlue = idx % 2 === 0;
              const background = isBlue
                ? "linear-gradient(to bottom right, #064CCA, #068FFC)"
                : "linear-gradient(to bottom right, #239012, #57C50D)";
              return (
                <div
                  key={x.t}
                  data-testid={`card-process-${x.t.toLowerCase().replace(/\s+/g, "-").replace(/[&()]/g, "")}`}
                  data-reveal="up"
                  className="reveal group rounded-2xl border-0 p-6 sm:p-8 shadow-lg text-center text-white transition-all duration-300 hover:scale-[1.02] hover:shadow-xl hover:shadow-black/15"
                  style={{
                    background,
                    transitionDelay: `${idx * 80}ms`,
                  }}
                >
                  <div className="flex flex-col items-center gap-4">
                    <x.i className="h-10 w-10 shrink-0 text-white transition-transform duration-300 group-hover:scale-110" />
                    <div className="text-lg font-semibold">{x.t}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </PageLayout>
  );
}
