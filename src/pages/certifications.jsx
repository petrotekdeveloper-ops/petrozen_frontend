import PageLayout from "@/components/PageLayout";
import SectionTitle from "@/components/SectionTitle";
import { IMAGES } from "@/lib/images";

const HERO = IMAGES.INDUSTRY_REFINERY;

export default function Certifications() {
  return (
    <PageLayout
      testId="page-certifications"
      title="Certifications"
      subtitle="Policy-aligned systems for quality, safety, and compliance."
      heroImage={HERO}
    >
      <section data-testid="section-cert-logos" className="py-16 sm:py-20">
        <div className="container-pad">
          <SectionTitle
            testId="title-certifications"
            eyebrow="Certifications"
            title="Aligned standards"
            description="In this prototype, certifications are represented as aligned policies and example logos."
          />

          <div className="mt-10 grid grid-cols-2 sm:grid-cols-4 gap-4">
            {["ISO 9001", "ISO 14001", "ISO 45001", "API Q1"].map((label) => (
              <div
                key={label}
                data-testid={`logo-${label.replace(/\s+/g, "-")}`}
                className="rounded-2xl soft-border bg-card p-6 text-center shadow-sm shadow-black/5"
              >
                <div className="text-2xl font-semibold serif">{label.split(" ")[0]}</div>
                <div className="mt-1 text-sm font-medium">{label}</div>
                <div className="mt-2 text-xs text-muted-foreground">Certification logo</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section data-testid="section-quality-policy" className="py-16 sm:py-20 bg-secondary">
        <div className="container-pad">
          <SectionTitle
            testId="title-policy"
            eyebrow="Quality policy"
            title="Consistency, evidence, improvement"
            description="We maintain disciplined procedures that support traceability, client confidence, and continuous improvement."
          />

          <div className="mt-8 rounded-2xl soft-border bg-card p-6 sm:p-8 shadow-sm shadow-black/5">
            <ul className="grid gap-3 text-sm text-muted-foreground leading-relaxed">
              {[
                "Maintain clear acceptance criteria and documented checkpoints.",
                "Provide audit-ready evidence and consistent closeout packages.",
                "Promote a safety-first mindset in all environments.",
                "Continuously improve templates, registers, and delivery methods.",
              ].map((t, i) => (
                <li key={t} data-testid={`text-policy-${i}`} className="flex gap-3">
                  <span className="mt-1 h-2 w-2 rounded-full bg-primary" />
                  <span>{t}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section data-testid="section-compliance" className="py-16 sm:py-20">
        <div className="container-pad">
          <SectionTitle
            testId="title-compliance"
            eyebrow="Compliance"
            title="Statements and commitments"
            description="Clear commitments designed to support regulatory and client expectations."
          />

          <div className="mt-10 grid grid-cols-1 lg:grid-cols-3 gap-4">
            {[
              {
                t: "Safety",
                d: "We prioritize safe execution and provide field-ready processes that reinforce compliance.",
              },
              {
                t: "Traceability",
                d: "Records are designed for transparent review and audit readiness across phases.",
              },
              {
                t: "Confidentiality",
                d: "Documentation and data handling align to client expectations and project requirements.",
              },
            ].map((x, idx) => (
              <div
                key={x.t}
                data-testid={`card-compliance-${idx}`}
                className="rounded-2xl soft-border bg-card p-6 shadow-sm shadow-black/5"
              >
                <div className="text-lg font-semibold serif">{x.t}</div>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{x.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </PageLayout>
  );
}
