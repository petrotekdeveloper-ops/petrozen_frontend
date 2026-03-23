import { useEffect, useState } from "react";
import { apiClient } from "@/lib/apiClient";
import AdminShell from "@/components/admin/AdminShell";
import { Mail, MessageSquare, Building2, User, Phone, Bot, Clock3, Trash2, Tag, FileDown } from "lucide-react";

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

export default function AdminChatEnquiries() {
  const [items, setItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [selectedId, setSelectedId] = useState(null);
  const [deleteError, setDeleteError] = useState("");
  const [chatbotEnabled, setChatbotEnabled] = useState(true);
  const [settingsLoading, setSettingsLoading] = useState(true);

  const fetchSettings = async () => {
    setSettingsLoading(true);
    try {
      const res = await apiClient.get("/api/admin/chatbot-settings");
      setChatbotEnabled(res?.data?.enabled !== false);
    } catch {
      setChatbotEnabled(true);
    } finally {
      setSettingsLoading(false);
    }
  };

  const toggleChatbot = async () => {
    const next = !chatbotEnabled;
    try {
      await apiClient.patch("/api/admin/chatbot-settings", { enabled: next });
      setChatbotEnabled(next);
    } catch {
      // keep previous state
    }
  };

  const fetchEnquiries = async () => {
    setLoadError("");
    setIsLoading(true);
    try {
      const res = await apiClient.get("/api/admin/chat-enquiries");
      setItems(res?.data?.items ?? []);
      setSelectedId(null);
    } catch (err) {
      setLoadError(err?.response?.data?.message || err?.message || "Failed to load chatbot enquiries.");
      setItems([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchEnquiries();
    fetchSettings();
  }, []);

  const selected = items.find((i) => i._id === selectedId);

  const handleDeleteSelected = async () => {
    if (!selected) return;
    setDeleteError("");
    try {
      await apiClient.delete(`/api/admin/chat-enquiries/${selected._id}`);
      const next = items.filter((i) => i._id !== selected._id);
      setItems(next);
      setSelectedId(null);
    } catch (err) {
      setDeleteError(err?.response?.data?.message || err?.message || "Failed to delete chatbot enquiry.");
    }
  };

  const handleDownloadTranscript = async (item) => {
    try {
      const { generateTranscriptPdf } = await import("@/lib/generateTranscriptPdf");
      const name = item.name || item.flowData?.name || "enquiry";
      const safeName = String(name).replace(/[^a-zA-Z0-9-_]/g, "-").slice(0, 30);
      const datePart = item.createdAt
        ? new Date(item.createdAt).toISOString().slice(0, 10)
        : "";
      const filename = `petrozen-transcript-${safeName}-${datePart}.pdf`;
      await generateTranscriptPdf(item, filename);
    } catch (err) {
      console.error("Failed to generate transcript PDF", err);
    }
  };

  return (
    <AdminShell
      testId="page-admin-chat-enquiries"
      title="Chatbot Enquiries"
      subtitle="Each chatbot session is treated as one enquiry."
      sectionBare
    >
      <div className="mb-4 flex items-center gap-3 rounded-xl border border-border/70 bg-card px-4 py-3">
        <span className="text-sm font-medium text-foreground">Chatbot visible to users</span>
        <button
          type="button"
          role="switch"
          aria-checked={chatbotEnabled}
          disabled={settingsLoading}
          onClick={toggleChatbot}
          data-testid="toggle-chatbot-visible"
          className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:opacity-50 ${
            chatbotEnabled ? "bg-primary" : "bg-muted"
          }`}
        >
          <span
            className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow ring-0 transition-transform ${
              chatbotEnabled ? "translate-x-6" : "translate-x-1"
            }`}
          />
        </button>
        <span className="text-sm text-muted-foreground">{chatbotEnabled ? "On" : "Off"}</span>
      </div>

      {loadError ? (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{loadError}</div>
      ) : null}
      {!loadError && deleteError ? (
        <div className="mt-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-xs text-red-700">
          {deleteError}
        </div>
      ) : null}

      {!loadError && isLoading ? (
        <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          <p className="mt-3 text-sm">Loading chatbot enquiries...</p>
        </div>
      ) : null}

      {!loadError && !isLoading && items.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border/60 bg-muted/20 px-6 py-12 text-center">
          <p className="text-sm font-medium text-foreground">No chatbot enquiries yet</p>
          <p className="mt-1 text-sm text-muted-foreground">Chatbot sessions will appear here after phone capture.</p>
        </div>
      ) : null}

      {!loadError && !isLoading && items.length > 0 ? (
        <div className="flex flex-col gap-6 lg:flex-row lg:gap-8">
          <div className="min-w-0 flex-1 space-y-3">
            <h2 className="text-sm font-semibold text-muted-foreground">Chatbot enquiries ({items.length})</h2>
            <div className="space-y-2">
              {items.map((item) => (
                <div
                  key={item._id}
                  className={`flex w-full items-center gap-2 rounded-xl border p-4 transition-colors ${
                    selectedId === item._id
                      ? "border-primary bg-primary/5"
                      : "border-border/70 bg-card hover:border-primary/50 hover:bg-muted/30"
                  }`}
                >
                  <button
                    type="button"
                    data-testid={`chat-enquiry-row-${item._id}`}
                    onClick={() => setSelectedId(item._id)}
                    className="min-w-0 flex-1 text-left"
                  >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="truncate font-medium text-foreground">
                        {item.name || item.flowData?.name || item.sessionId}
                      </p>
                      <p className="mt-0.5 truncate text-xs text-muted-foreground">
                        {item.email || item.flowData?.email || item.phone || "—"}
                      </p>
                      <p className="mt-1 text-xs text-muted-foreground">{formatDate(item.createdAt)}</p>
                    </div>
                    <span
                      className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium ${
                        selectedId === item._id ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {(item.status || "in_progress").toUpperCase()}
                    </span>
                    {item.enquiryType === "service" ? (
                      <span className="shrink-0 rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-medium text-blue-800">
                        Service
                      </span>
                    ) : item.enquiryType === "quote" ? (
                      <span className="shrink-0 rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-medium text-amber-800">
                        Quote
                      </span>
                    ) : null}
                  </div>
                  {(item.message || item.flowData?.productTitle || item.serviceCategoryTitle) ? (
                    <p className="mt-2 line-clamp-2 text-xs text-muted-foreground">
                      {item.enquiryType === "service"
                        ? `Service: ${item.serviceCategoryTitle || "—"}`
                        : item.enquiryType === "quote"
                        ? "Quote request"
                        : item.message || `Product: ${item.flowData?.productTitle || "—"}`}
                    </p>
                  ) : null}
                  </button>
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); handleDownloadTranscript(item); }}
                    title="Download transcript (PDF)"
                    className="shrink-0 rounded-lg p-2 text-muted-foreground transition-colors hover:bg-primary/10 hover:text-primary"
                  >
                    <FileDown className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="lg:w-[400px] shrink-0">
            {selected ? (
              <div
                data-testid="chat-enquiry-detail"
                className="sticky top-6 rounded-2xl border border-border/70 bg-card p-6 shadow-sm"
              >
                <div className="mb-3 flex items-start justify-between gap-3">
                  <h3 className="text-lg font-semibold tracking-tight">Enquiry details</h3>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleDownloadTranscript(selected)}
                      title="Download chat transcript (PDF)"
                      data-testid="button-download-transcript"
                      className="inline-flex items-center gap-1.5 rounded-lg border border-primary/40 bg-primary/5 px-3 py-1.5 text-sm font-medium text-primary transition-colors hover:bg-primary/10"
                    >
                      <FileDown className="h-3.5 w-3.5" />
                      Transcript PDF
                    </button>
                    <button
                      type="button"
                      onClick={handleDeleteSelected}
                      title="Delete enquiry"
                      className="inline-flex h-8 w-8 items-center justify-center rounded-full text-red-600 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                <div className="mt-4 space-y-4">
                  <div className="flex items-start gap-3">
                    <Bot className="h-5 w-5 shrink-0 text-muted-foreground" />
                    <div>
                      <p className="text-xs font-medium text-muted-foreground">Session ID</p>
                      <p className="text-sm text-foreground break-all">{selected.sessionId}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Tag className="h-5 w-5 shrink-0 text-muted-foreground" />
                    <div>
                      <p className="text-xs font-medium text-muted-foreground">Enquiry type</p>
                      <p className="text-sm text-foreground capitalize">{selected.enquiryType || "product"}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Clock3 className="h-5 w-5 shrink-0 text-muted-foreground" />
                    <div>
                      <p className="text-xs font-medium text-muted-foreground">Status</p>
                      <p className="text-sm text-foreground">{selected.status || "in_progress"}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Phone className="h-5 w-5 shrink-0 text-muted-foreground" />
                    <div>
                      <p className="text-xs font-medium text-muted-foreground">Phone</p>
                      <p className="text-sm text-foreground">{selected.phone || "—"}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <User className="h-5 w-5 shrink-0 text-muted-foreground" />
                    <div>
                      <p className="text-xs font-medium text-muted-foreground">Name</p>
                      <p className="text-sm text-foreground">{selected.name || selected.flowData?.name || "—"}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Mail className="h-5 w-5 shrink-0 text-muted-foreground" />
                    <div>
                      <p className="text-xs font-medium text-muted-foreground">Email</p>
                      <p className="text-sm text-foreground">{selected.email || selected.flowData?.email || "—"}</p>
                    </div>
                  </div>
                  {(selected.company || selected.flowData?.company) ? (
                    <div className="flex items-start gap-3">
                      <Building2 className="h-5 w-5 shrink-0 text-muted-foreground" />
                      <div>
                        <p className="text-xs font-medium text-muted-foreground">Company</p>
                        <p className="text-sm text-foreground">{selected.company || selected.flowData?.company}</p>
                      </div>
                    </div>
                  ) : null}
                  {(selected.message || selected.flowData?.productTitle || selected.serviceCategoryTitle) ? (
                    <div className="flex items-start gap-3">
                      <MessageSquare className="h-5 w-5 shrink-0 text-muted-foreground" />
                      <div>
                        <p className="text-xs font-medium text-muted-foreground">
                          {selected.enquiryType === "service" ? "Service" : selected.enquiryType === "quote" ? "Quote" : "Message"}
                        </p>
                        <p className="mt-1 whitespace-pre-wrap text-sm text-foreground">
                          {selected.enquiryType === "service"
                            ? selected.serviceCategoryTitle || selected.message || "—"
                            : selected.enquiryType === "quote"
                            ? selected.message || "—"
                            : selected.message || `Product: ${selected.flowData?.productTitle || "—"}`}
                        </p>
                      </div>
                    </div>
                  ) : null}
                  <div className="flex items-start gap-3">
                    <Clock3 className="h-5 w-5 shrink-0 text-muted-foreground" />
                    <div>
                      <p className="text-xs font-medium text-muted-foreground">Current step</p>
                      <p className="text-sm text-foreground">{selected.currentStep || "—"}</p>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Updated {formatDate(selected.updatedAt)} · Created {formatDate(selected.createdAt)}
                  </p>
                </div>
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
