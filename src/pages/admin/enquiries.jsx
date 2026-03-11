import { useEffect, useState } from "react";
import { apiClient } from "@/lib/apiClient";
import AdminShell from "@/components/admin/AdminShell";
import { Mail, MessageSquare, Building2, User } from "lucide-react";

function formatDate(dateStr) {
  if (!dateStr) return "—";
  const d = new Date(dateStr);
  return d.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function AdminEnquiries() {
  const [items, setItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [selectedId, setSelectedId] = useState(null);

  const fetchEnquiries = async () => {
    setLoadError("");
    setIsLoading(true);
    try {
      const res = await apiClient.get("/api/admin/enquiries");
      setItems(res?.data?.items ?? []);
    } catch (err) {
      setLoadError(err?.response?.data?.message || err?.message || "Failed to load enquiries.");
      setItems([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchEnquiries();
  }, []);

  const selected = items.find((i) => i._id === selectedId);

  return (
    <AdminShell
      testId="page-admin-enquiries"
      title="Contact Enquiries"
      subtitle="View enquiries submitted through the contact form."
      sectionBare
    >
      {loadError ? (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{loadError}</div>
      ) : null}

      {!loadError && isLoading ? (
        <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          <p className="mt-3 text-sm">Loading enquiries…</p>
        </div>
      ) : null}

      {!loadError && !isLoading && items.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border/60 bg-muted/20 px-6 py-12 text-center">
          <p className="text-sm font-medium text-foreground">No enquiries yet</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Contact form submissions will appear here.
          </p>
        </div>
      ) : null}

      {!loadError && !isLoading && items.length > 0 ? (
        <div className="flex flex-col gap-6 lg:flex-row lg:gap-8">
          <div className="min-w-0 flex-1 space-y-3">
            <h2 className="text-sm font-semibold text-muted-foreground">All enquiries ({items.length})</h2>
            <div className="space-y-2">
              {items.map((item) => (
                <button
                  key={item._id}
                  type="button"
                  data-testid={`enquiry-row-${item._id}`}
                  onClick={() => setSelectedId(item._id)}
                  className={`w-full rounded-xl border p-4 text-left transition-colors ${
                    selectedId === item._id
                      ? "border-primary bg-primary/5"
                      : "border-border/70 bg-card hover:border-primary/50 hover:bg-muted/30"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="truncate font-medium text-foreground">{item.name}</p>
                      <p className="mt-0.5 truncate text-xs text-muted-foreground">{item.email}</p>
                      <p className="mt-1 text-xs text-muted-foreground">{formatDate(item.createdAt)}</p>
                    </div>
                    <span
                      className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium ${
                        selectedId === item._id ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {item.company ? "Company" : "Personal"}
                    </span>
                  </div>
                  {item.message ? (
                    <p className="mt-2 line-clamp-2 text-xs text-muted-foreground">{item.message}</p>
                  ) : null}
                </button>
              ))}
            </div>
          </div>

          <div className="lg:w-[400px] shrink-0">
            {selected ? (
              <div
                data-testid="enquiry-detail"
                className="sticky top-6 rounded-2xl border border-border/70 bg-card p-6 shadow-sm"
              >
                <h3 className="text-lg font-semibold tracking-tight">Enquiry details</h3>
                <div className="mt-4 space-y-4">
                  <div className="flex items-start gap-3">
                    <User className="h-5 w-5 shrink-0 text-muted-foreground" />
                    <div>
                      <p className="text-xs font-medium text-muted-foreground">Name</p>
                      <p className="text-sm text-foreground">{selected.name}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Mail className="h-5 w-5 shrink-0 text-muted-foreground" />
                    <div>
                      <p className="text-xs font-medium text-muted-foreground">Email</p>
                      <a
                        href={`mailto:${selected.email}`}
                        className="text-sm text-primary hover:underline"
                      >
                        {selected.email}
                      </a>
                    </div>
                  </div>
                  {selected.company ? (
                    <div className="flex items-start gap-3">
                      <Building2 className="h-5 w-5 shrink-0 text-muted-foreground" />
                      <div>
                        <p className="text-xs font-medium text-muted-foreground">Company</p>
                        <p className="text-sm text-foreground">{selected.company}</p>
                      </div>
                    </div>
                  ) : null}
                  <div className="flex items-start gap-3">
                    <MessageSquare className="h-5 w-5 shrink-0 text-muted-foreground" />
                    <div>
                      <p className="text-xs font-medium text-muted-foreground">Message</p>
                      <p className="mt-1 whitespace-pre-wrap text-sm text-foreground">{selected.message}</p>
                    </div>
                  </div>
                </div>
                <p className="mt-4 text-xs text-muted-foreground">Received {formatDate(selected.createdAt)}</p>
              </div>
            ) : (
              <div className="sticky top-6 flex flex-col items-center justify-center rounded-2xl border border-dashed border-border/60 bg-muted/20 px-6 py-12 text-center">
                <p className="text-sm text-muted-foreground">Select an enquiry to view details</p>
              </div>
            )}
          </div>
        </div>
      ) : null}
    </AdminShell>
  );
}
