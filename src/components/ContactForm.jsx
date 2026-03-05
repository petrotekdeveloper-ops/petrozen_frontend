import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import Button from "@/components/Button";

const schema = z.object({
  name: z.string().min(2, "Please enter your name"),
  email: z.string().email("Please enter a valid email"),
  company: z.string().optional(),
  message: z.string().min(10, "Please enter a brief message"),
});

export default function ContactForm({ testId }) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      name: "",
      email: "",
      company: "",
      message: "",
    },
  });

  const onSubmit = async (_values) => {
    await new Promise((r) => setTimeout(r, 600));
    reset();
  };

  return (
    <form
      data-testid={testId}
      onSubmit={handleSubmit(onSubmit)}
      className="rounded-2xl soft-border bg-card p-6 sm:p-8 shadow-sm shadow-black/5"
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label
            htmlFor="name"
            className="text-sm font-medium text-foreground"
          >
            Name
          </label>
          <input
            data-testid="input-name"
            id="name"
            {...register("name")}
            className="mt-2 h-11 w-full rounded-xl border border-border/70 bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
            placeholder="Your full name"
            autoComplete="name"
          />
          {errors.name ? (
            <p data-testid="status-error-name" className="mt-2 text-xs text-red-600">
              {errors.name.message}
            </p>
          ) : null}
        </div>

        <div>
          <label
            htmlFor="email"
            className="text-sm font-medium text-foreground"
          >
            Email
          </label>
          <input
            data-testid="input-email"
            id="email"
            {...register("email")}
            className="mt-2 h-11 w-full rounded-xl border border-border/70 bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
            placeholder="name@company.com"
            autoComplete="email"
          />
          {errors.email ? (
            <p data-testid="status-error-email" className="mt-2 text-xs text-red-600">
              {errors.email.message}
            </p>
          ) : null}
        </div>
      </div>

      <div className="mt-4">
        <label
          htmlFor="company"
          className="text-sm font-medium text-foreground"
        >
          Company (optional)
        </label>
        <input
          data-testid="input-company"
          id="company"
          {...register("company")}
          className="mt-2 h-11 w-full rounded-xl border border-border/70 bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
          placeholder="Company name"
          autoComplete="organization"
        />
      </div>

      <div className="mt-4">
        <label
          htmlFor="message"
          className="text-sm font-medium text-foreground"
        >
          Message
        </label>
        <textarea
          data-testid="input-message"
          id="message"
          {...register("message")}
          className="mt-2 min-h-32 w-full resize-none rounded-xl border border-border/70 bg-background px-3 py-3 text-sm outline-none focus:ring-2 focus:ring-ring"
          placeholder="Tell us what you\u2019re building and how we can help."
        />
        {errors.message ? (
          <p
            data-testid="status-error-message"
            className="mt-2 text-xs text-red-600"
          >
            {errors.message.message}
          </p>
        ) : null}
      </div>

      <div className="mt-6 flex items-center gap-3">
        <Button
          testId="button-submit-contact"
          type="submit"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Sending\u2026" : "Send message"}
        </Button>
        <div data-testid="text-contact-note" className="text-xs text-muted-foreground">
          Frontend-only form (no backend submission).
        </div>
      </div>
    </form>
  );
}
