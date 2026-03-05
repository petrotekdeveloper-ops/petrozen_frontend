import { useMemo, useState } from "react";
import { useLocation } from "wouter";
import Button from "@/components/Button";
import { apiClient } from "@/lib/apiClient";
import { setAdminToken } from "@/lib/adminAuth";
import { IMAGES } from "@/lib/images";

export default function AdminLogin() {
  const [, setLocation] = useLocation();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const canSubmit = useMemo(() => {
    return username.trim().length > 0 && password.trim().length > 0 && !isSubmitting;
  }, [username, password, isSubmitting]);

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);
    try {
      const res = await apiClient.post("/api/admin/login", { username, password });
      const token = res?.data?.token;
      if (!token) {
        throw new Error("Missing token in response");
      }

      setAdminToken(token);
      setLocation("/admin/categories");
    } catch (err) {
      const message =
        err?.response?.data?.message ||
        err?.message ||
        "Login failed. Please try again.";
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      data-testid="page-admin-login"
      className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center py-10 sm:py-14 px-4 sm:px-6 lg:px-8"
    >
      <div className="w-full max-w-6xl flex flex-col items-center justify-center">
        <div className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 mb-8">
          <img
            src={IMAGES.LOGO}
            alt="Petrozen"
            className="h-28 sm:h-32 w-auto"
            data-testid="admin-login-logo"
          />
          <div className="flex flex-col items-center sm:items-start text-center sm:text-left">
            <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight">
              PETROZEN
            </h2>
            <div
              className="mt-1.5 text-sm font-semibold tracking-[0.22em] uppercase text-muted-foreground"
              data-testid="admin-login-tagline"
            >
              Ignite Success, Fuel Progress
            </div>
          </div>
        </div>
        <div className="mx-auto w-full max-w-lg">
          <div className="rounded-2xl border border-border/80 bg-card p-8 sm:p-10 shadow-lg shadow-black/10">
            <div className="flex flex-col items-center text-center mb-8">
              <h1 className="text-2xl font-semibold tracking-tight">
                Admin Login
              </h1>
            </div>

            <form onSubmit={onSubmit} className="grid gap-5">
              <div>
                <label
                  htmlFor="username"
                  className="text-base font-medium text-foreground"
                >
                  Username
                </label>
                <input
                  data-testid="input-admin-username"
                  id="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="mt-2 h-12 w-full rounded-xl border border-border/70 bg-background px-4 text-base outline-none focus:ring-2 focus:ring-ring"
                  placeholder="admin username"
                  autoComplete="username"
                />
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="text-base font-medium text-foreground"
                >
                  Password
                </label>
                <input
                  data-testid="input-admin-password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  type="password"
                  className="mt-2 h-12 w-full rounded-xl border border-border/70 bg-background px-4 text-base outline-none focus:ring-2 focus:ring-ring"
                  placeholder="admin password"
                  autoComplete="current-password"
                />
              </div>

              {error ? (
                <div
                  data-testid="status-admin-login-error"
                  className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-base text-red-700"
                >
                  {error}
                </div>
              ) : null}

              <div className="mt-4 flex items-center gap-3">
                <Button
                  testId="button-admin-login"
                  type="submit"
                  size="lg"
                  disabled={!canSubmit}
                >
                  {isSubmitting ? "Signing in…" : "Sign in"}
                </Button>
                
              </div>

              {!import.meta.env.VITE_API_BASE_URL ? (
                <p className="text-xs text-red-600">
                  Missing `VITE_API_BASE_URL` env var.
                </p>
              ) : null}
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

