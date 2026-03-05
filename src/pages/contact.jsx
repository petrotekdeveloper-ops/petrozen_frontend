import { Link } from "wouter";
import PageLayout from "@/components/PageLayout";
import SectionTitle from "@/components/SectionTitle";
import ContactForm from "@/components/ContactForm";
import { HERO_URLS } from "@/lib/images";

import { Mail, MapPin, ShieldCheck } from "lucide-react";

const HERO = HERO_URLS.CONTACT;

export default function Contact() {
  return (
    <PageLayout
      testId="page-contact"
      title="Contact Us"
      subtitle="Tell us what you're building. We'll respond with a clear next step."
      heroImage={HERO}
      heroTitleFont="sans"
    >
      <section data-testid="section-contact" className="py-16 sm:py-20">
        <div className="container-pad">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
            <div className="lg:col-span-5">
              <SectionTitle
                testId="title-contact"
                eyebrow="Get in touch"
                title="Let's discuss your project"
                titleFont="sans"
                titleClassName="tracking-tight"
              />

              <div className="mt-8 grid gap-4">
                {[
                  {
                    icon: MapPin,
                    label: "Address",
                    value: "Petrozen Equipment Trading LLC,\nOffice No: 02, 1st Floor,\nKhalifa Ahmad Al Mubarak Building,\nM 11, Plot: 46,\nMusaffah Industrial Area, Abu Dhabi, UAE",
                    testId: "text-contact-address",
                  },
                  {
                    icon: Mail,
                    label: "Email",
                    value: "info@petrozen.ae",
                    href: "mailto:info@petrozen.ae",
                    testId: "link-contact-email",
                  },
                ].map((x) => (
                  <div
                    key={x.label}
                    data-testid={`card-contact-${x.label.toLowerCase().replace(/\s+/g, "-")}`}
                    className="rounded-2xl soft-border bg-card p-6 shadow-sm shadow-black/5"
                  >
                    <div className="flex items-start gap-4">
                      <div className="mt-0.5 flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                        <x.icon className="h-5 w-5" />
                      </div>
                      <div>
                        <div className="text-sm font-semibold tracking-tight">{x.label}</div>
                        {x.href ? (
                          <a
                            data-testid={x.testId}
                            href={x.href}
                            className="mt-2 block whitespace-pre-line text-sm text-muted-foreground hover:text-foreground"
                          >
                            {x.value}
                          </a>
                        ) : (
                          <div
                            data-testid={x.testId}
                            className="mt-2 whitespace-pre-line text-sm text-muted-foreground"
                          >
                            {x.value}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-8 rounded-2xl overflow-hidden soft-border bg-card shadow-sm shadow-black/5">
                <iframe
                  data-testid="map-embed"
                  title="Office location"
                  className="h-64 w-full"
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  src="https://www.google.com/maps?q=Musaffah+Industrial+Area+Abu+Dhabi+UAE&output=embed"
                />
              </div>
            </div>

            <div className="lg:col-span-7">
              <ContactForm testId="form-contact" />
              <Link href="/privacy">
                <span
                  data-testid="link-contact-privacy"
                  className="mt-6 flex items-center gap-3 rounded-2xl border-2 border-dashed border-primary/30 bg-primary/5 p-6 cursor-pointer text-foreground/80 hover:text-primary hover:bg-primary/10 hover:border-primary/50 transition-colors"
                >
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/15 text-primary">
                    <ShieldCheck className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold tracking-tight flex items-center gap-2">
                    <span>Privacy</span>
                    <span className="w-px h-4 bg-current opacity-50" aria-hidden />
                    <span>Policy</span>
                  </div>
                    <div className="mt-0.5 text-sm opacity-80">How we collect, use and protect your information.</div>
                  </div>
                </span>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </PageLayout>
  );
}
