import PageLayout from "@/components/PageLayout";
import Button from "@/components/Button";

export default function NotFound() {
  return (
    <PageLayout testId="page-not-found" title="Page not found" subtitle="We couldn\u2019t find that page.">
      <section data-testid="section-not-found" className="py-16 sm:py-20">
        <div className="container-pad">
          <div className="rounded-2xl soft-border bg-card p-8 shadow-sm shadow-black/5">
            <div data-testid="text-not-found" className="text-sm text-muted-foreground">
              Check the URL, or return to the homepage.
            </div>
            <div className="mt-6 flex flex-col sm:flex-row gap-3">
              <Button as="link" href="/" testId="button-not-found-home">
                Go to Home
              </Button>
              <Button as="link" href="/contact" testId="button-not-found-contact" variant="secondary">
                Contact
              </Button>
            </div>
          </div>
        </div>
      </section>
    </PageLayout>
  );
}
