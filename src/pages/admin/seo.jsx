import { useEffect, useState } from "react";
import Button from "@/components/Button";
import { apiClient } from "@/lib/apiClient";
import AdminShell from "@/components/admin/AdminShell";

const PAGE_TYPE_LABELS = { static: "Static", category: "Category", subcategory: "Subcategory", product: "Product" };

function formatPageKey(key) {
  if (!key) return "";
  return String(key).charAt(0).toUpperCase() + String(key).slice(1).toLowerCase();
}

export default function AdminSeo() {
  const [items, setItems] = useState([]);
  const [context, setContext] = useState({ categories: [], subcategories: [], products: [] });
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editMetaTitle, setEditMetaTitle] = useState("");
  const [editMetaDescription, setEditMetaDescription] = useState("");
  const [editMetaKeywords, setEditMetaKeywords] = useState("");
  const [editStatus, setEditStatus] = useState({ type: "", message: "" });
  const [isSaving, setIsSaving] = useState(false);
  const [addFormOpen, setAddFormOpen] = useState(false);
  const [addType, setAddType] = useState("category");
  const [addKey, setAddKey] = useState("");
  const [addMetaTitle, setAddMetaTitle] = useState("");
  const [addMetaDescription, setAddMetaDescription] = useState("");
  const [addMetaKeywords, setAddMetaKeywords] = useState("");
  const [addStatus, setAddStatus] = useState({ type: "", message: "" });
  const [isAdding, setIsAdding] = useState(false);

  const getPageLabel = (item) => {
    if (item.pageType === "static") return formatPageKey(item.pageKey);
    if (item.pageType === "category") {
      const c = context.categories.find((x) => x._id === item.pageKey);
      return c?.title ?? item.pageKey;
    }
    if (item.pageType === "subcategory") {
      const s = context.subcategories.find((x) => x._id === item.pageKey);
      return s?.title ?? item.pageKey;
    }
    if (item.pageType === "product") {
      const p = context.products.find((x) => x._id === item.pageKey);
      return p?.title ?? item.pageKey;
    }
    return item.pageKey;
  };

  const fetchSeo = async () => {
    setLoadError("");
    setIsLoading(true);
    try {
      const [seoRes, ctxRes] = await Promise.all([
        apiClient.get("/api/admin/seo"),
        apiClient.get("/api/admin/seo/context"),
      ]);
      setItems(seoRes?.data?.items ?? []);
      setContext(ctxRes?.data ?? { categories: [], subcategories: [], products: [] });
    } catch (err) {
      setLoadError(err?.response?.data?.message || err?.message || "Failed to load SEO.");
      setItems([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSeo();
  }, []);

  const startEdit = (item) => {
    setEditingId(item._id);
    setEditMetaTitle(item.metaTitle || "");
    setEditMetaDescription(item.metaDescription || "");
    setEditMetaKeywords(item.metaKeywords || "");
    setEditStatus({ type: "", message: "" });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditMetaTitle("");
    setEditMetaDescription("");
    setEditMetaKeywords("");
    setEditStatus({ type: "", message: "" });
  };

  const getAddOptions = () => {
    if (addType === "static") return [];
    if (addType === "category") return context.categories.filter((c) => !items.some((i) => i.pageType === "category" && i.pageKey === c._id));
    if (addType === "subcategory") return context.subcategories.filter((s) => !items.some((i) => i.pageType === "subcategory" && i.pageKey === s._id));
    if (addType === "product") return context.products.filter((p) => !items.some((i) => i.pageType === "product" && i.pageKey === p._id));
    return [];
  };

  const onAdd = async (e) => {
    e.preventDefault();
    const key = addType === "static" ? addKey.trim().toLowerCase().replace(/\s+/g, "-") : addKey.trim();
    if (!key) return;

    setIsAdding(true);
    setAddStatus({ type: "", message: "" });
    try {
      await apiClient.post("/api/admin/seo", {
        pageType: addType,
        pageKey: key,
        metaTitle: addMetaTitle,
        metaDescription: addMetaDescription,
        metaKeywords: addMetaKeywords,
      });
      setAddStatus({ type: "success", message: "SEO entry created." });
      await fetchSeo();
      setAddFormOpen(false);
      setAddKey("");
      setAddMetaTitle("");
      setAddMetaDescription("");
      setAddMetaKeywords("");
    } catch (err) {
      setAddStatus({ type: "error", message: err?.response?.data?.message || err?.message || "Failed to create." });
    } finally {
      setIsAdding(false);
    }
  };

  const onSave = async (e) => {
    e.preventDefault();
    if (!editingId) return;

    setIsSaving(true);
    setEditStatus({ type: "", message: "" });
    try {
      await apiClient.put(`/api/admin/seo/${editingId}`, {
        metaTitle: editMetaTitle,
        metaDescription: editMetaDescription,
        metaKeywords: editMetaKeywords,
      });
      setEditStatus({ type: "success", message: "SEO updated." });
      await fetchSeo();
      cancelEdit();
    } catch (err) {
      setEditStatus({ type: "error", message: err?.response?.data?.message || err?.message || "Failed to save." });
    } finally {
      setIsSaving(false);
    }
  };

  const grouped = {
    static: items.filter((i) => i.pageType === "static"),
    category: items.filter((i) => i.pageType === "category"),
    subcategory: items.filter((i) => i.pageType === "subcategory"),
    product: items.filter((i) => i.pageType === "product"),
  };

  return (
    <AdminShell
      testId="page-admin-seo"
      title="SEO Management"
      subtitle="Manage meta title, description, and keywords for each page."
      headerBare
      sectionBare
      actions={
        <Button
          variant="primary"
          onClick={() => {
            setAddFormOpen(true);
            setAddType("static");
            setAddStatus({ type: "", message: "" });
            setAddKey("");
            setAddMetaTitle("");
            setAddMetaDescription("");
            setAddMetaKeywords("");
          }}
          disabled={isLoading}
        >
          Add SEO
        </Button>
      }
    >
      {loadError ? (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{loadError}</div>
      ) : null}

      {!loadError && isLoading ? (
        <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          <p className="mt-3 text-sm">Loading SEO…</p>
        </div>
      ) : null}

      {!loadError && !isLoading && items.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border/60 bg-muted/20 px-6 py-12 text-center">
          <p className="text-sm font-medium text-foreground">No SEO entries yet</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Click &quot;Add SEO&quot; to create entries for static pages, categories, subcategories, or products.
          </p>
          <Button
            variant="primary"
            className="mt-4"
            onClick={() => {
              setAddFormOpen(true);
              setAddType("static");
              setAddKey("");
              setAddMetaTitle("");
              setAddMetaDescription("");
              setAddMetaKeywords("");
            }}
          >
            Add SEO
          </Button>
        </div>
      ) : null}

      {!loadError && !isLoading && items.length > 0 ? (
        <div className="space-y-8">
          {editStatus.message ? (
            <div
              className={`rounded-xl border px-4 py-3 text-sm ${
                editStatus.type === "success" ? "border-green-200 bg-green-50 text-green-700" : "border-red-200 bg-red-50 text-red-700"
              }`}
            >
              {editStatus.message}
            </div>
          ) : null}

          {(["static", "category", "subcategory", "product"]).map((type) => {
            const list = grouped[type];
            if (!list || list.length === 0) return null;

            return (
              <div key={type}>
                <h2 className="mb-3 text-base font-semibold text-foreground">
                  {PAGE_TYPE_LABELS[type]}
                </h2>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {list.map((item) => (
                    <div
                      key={item._id}
                      className="rounded-xl border border-border/70 bg-card p-4 shadow-sm"
                    >
                      <div className="text-sm font-medium text-foreground">
                        {getPageLabel(item)}
                      </div>
                      <div className="mt-2 truncate text-xs text-muted-foreground">
                        {item.metaTitle || "—"} | {item.metaDescription ? `${item.metaDescription.slice(0, 40)}…` : "—"}
                      </div>
                      <Button
                        variant="secondary"
                        size="sm"
                        className="mt-3"
                        onClick={() => startEdit(item)}
                      >
                        Edit
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      ) : null}

      {/* Edit modal */}
      {/* Add SEO modal */}
      {addFormOpen ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/50 p-4"
          role="dialog"
          aria-modal="true"
        >
          <form
            onSubmit={onAdd}
            className="relative z-[60] w-full max-w-lg rounded-2xl border-2 border-primary bg-card p-6 shadow-xl"
          >
            <h3 className="text-lg font-semibold">Add SEO</h3>
            <div className="mt-4 space-y-4">
              <div>
                <label className="text-sm font-medium text-foreground">Page type</label>
                <select
                  value={addType}
                  onChange={(e) => { setAddType(e.target.value); setAddKey(""); }}
                  className="mt-2 h-11 w-full rounded-xl border border-border/70 bg-background px-3 text-sm"
                >
                  <option value="static">Static page</option>
                  <option value="category">Category</option>
                  <option value="subcategory">Subcategory</option>
                  <option value="product">Product</option>
                </select>
              </div>
              {addType === "static" ? (
                <div>
                  <label className="text-sm font-medium text-foreground">Page key</label>
                  <input
                    type="text"
                    value={addKey}
                    onChange={(e) => setAddKey(e.target.value)}
                    placeholder="e.g. home, about, careers, terms"
                    className="mt-2 h-11 w-full rounded-xl border border-border/70 bg-background px-3 text-sm"
                    required
                  />
                  <p className="mt-1 text-xs text-muted-foreground">
                    Use lowercase, no spaces. Must match the route (e.g. /careers → careers).
                  </p>
                </div>
              ) : (
                <div>
                  <label className="text-sm font-medium text-foreground">Select {addType}</label>
                  <select
                    value={addKey}
                    onChange={(e) => setAddKey(e.target.value)}
                    required
                    className="mt-2 h-11 w-full rounded-xl border border-border/70 bg-background px-3 text-sm"
                  >
                    <option value="">Choose one…</option>
                    {getAddOptions().map((o) => (
                      <option key={o._id} value={o._id}>{o.title}</option>
                    ))}
                  </select>
                  {getAddOptions().length === 0 ? (
                    <p className="mt-1 text-xs text-muted-foreground">All {addType}s already have SEO.</p>
                  ) : null}
                </div>
              )}
              <div>
                <label className="text-sm font-medium text-foreground">Meta Title</label>
                <input
                  value={addMetaTitle}
                  onChange={(e) => setAddMetaTitle(e.target.value)}
                  className="mt-2 h-11 w-full rounded-xl border border-border/70 bg-background px-3 text-sm"
                  placeholder="Optional"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground">Meta Description</label>
                <textarea
                  value={addMetaDescription}
                  onChange={(e) => setAddMetaDescription(e.target.value)}
                  className="mt-2 min-h-[60px] w-full rounded-xl border border-border/70 bg-background px-3 py-2 text-sm"
                  placeholder="Optional"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground">Meta Keywords</label>
                <input
                  value={addMetaKeywords}
                  onChange={(e) => setAddMetaKeywords(e.target.value)}
                  className="mt-2 h-11 w-full rounded-xl border border-border/70 bg-background px-3 text-sm"
                  placeholder="Optional"
                />
              </div>
            </div>
            {addStatus.message ? (
              <div className={`mt-3 rounded-xl px-4 py-2 text-sm ${addStatus.type === "success" ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}>
                {addStatus.message}
              </div>
            ) : null}
            <div className="mt-6 flex gap-3">
              <Button type="submit" disabled={isAdding || !(addType === "static" ? addKey.trim() : addKey)}>
                {isAdding ? "Creating…" : "Create"}
              </Button>
              <Button variant="ghost" type="button" onClick={() => setAddFormOpen(false)}>
                Cancel
              </Button>
            </div>
          </form>
        </div>
      ) : null}

      {editingId ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/50 p-4"
          role="dialog"
          aria-modal="true"
        >
          <form
            onSubmit={onSave}
            className="relative z-[60] w-full max-w-lg rounded-2xl border-2 border-primary bg-card p-6 shadow-xl"
          >
            <h3 className="text-lg font-semibold">Edit SEO</h3>
            <div className="mt-4 space-y-4">
              <div>
                <label className="text-sm font-medium text-foreground" htmlFor="seo-meta-title">
                  Meta Title
                </label>
                <input
                  id="seo-meta-title"
                  value={editMetaTitle}
                  onChange={(e) => setEditMetaTitle(e.target.value)}
                  className="mt-2 h-11 w-full rounded-xl border border-border/70 bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
                  placeholder="Page title for search engines"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground" htmlFor="seo-meta-desc">
                  Meta Description
                </label>
                <textarea
                  id="seo-meta-desc"
                  value={editMetaDescription}
                  onChange={(e) => setEditMetaDescription(e.target.value)}
                  className="mt-2 min-h-[80px] w-full rounded-xl border border-border/70 bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
                  placeholder="Short description for search results"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground" htmlFor="seo-meta-keywords">
                  Meta Keywords
                </label>
                <input
                  id="seo-meta-keywords"
                  value={editMetaKeywords}
                  onChange={(e) => setEditMetaKeywords(e.target.value)}
                  className="mt-2 h-11 w-full rounded-xl border border-border/70 bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
                  placeholder="keyword1, keyword2, keyword3"
                />
              </div>
            </div>
            <div className="mt-6 flex gap-3">
              <Button type="submit" disabled={isSaving}>
                {isSaving ? "Saving…" : "Save"}
              </Button>
              <Button variant="ghost" type="button" onClick={cancelEdit}>
                Cancel
              </Button>
            </div>
          </form>
        </div>
      ) : null}
    </AdminShell>
  );
}
