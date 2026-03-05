import PageLayout from "@/components/PageLayout";
import SectionTitle from "@/components/SectionTitle";
import { HERO_URLS } from "@/lib/images";

const HERO = HERO_URLS.PRIVACY;

export default function Privacy() {
  return (
    <PageLayout
      testId="page-privacy"
      title="Privacy Policy & Terms"
      subtitle="A clear, minimal text layout for policies and terms."
      heroImage={HERO}
    >
      <section data-testid="section-privacy" className="py-16 sm:py-20">
        <div className="container-pad">
          <SectionTitle
            testId="title-privacy"
            eyebrow="Legal"
            title="Privacy Policy"
            description="This sample policy is provided for layout purposes only and is not legal advice."
          />

          <div className="mt-10">
            <h3>Information we collect</h3>
            <p>
              We may collect information you provide through forms on this website, such as
              your name, email address, company, and message content. This prototype does
              not submit data to a backend.
            </p>

            <h3>How we use information</h3>
            <p>
              If implemented with a backend, information would be used to respond to
              inquiries, improve services, and maintain the security of our operations.
            </p>

            <h3>Data retention</h3>
            <p>
              In a production implementation, retention periods would be defined based on
              business requirements and applicable regulations.
            </p>

            <h3>Terms</h3>
            <p>
              By using this website, you agree to use it responsibly and not to misuse
              content, forms, or branding. This prototype is provided for demonstration.
            </p>

            <h3>Contact</h3>
            <p>
              For questions, contact <strong>hello@apexindustrial.example</strong>.
            </p>
          </div>

          <div className="mt-10">
            Last updated: February 4, 2026
          </div>
        </div>
      </section>
    </PageLayout>
  );
}
