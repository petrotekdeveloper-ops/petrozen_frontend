import { useEffect, useMemo, useRef, useState } from "react";
import Button from "@/components/Button";
import { ArrowLeft, Pencil, Trash2, X } from "lucide-react";
import { apiClient } from "@/lib/apiClient";
import AdminShell from "@/components/admin/AdminShell";
import KeywordTagsInput from "@/components/admin/KeywordTagsInput";
import { IMAGES } from "@/lib/images";

export default function AdminCategories() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [items, setItems] = useState([]);
  const [seoByCategoryId, setSeoByCategoryId] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [metaTitle, setMetaTitle] = useState("");
  const [metaDescription, setMetaDescription] = useState("");
  const [metaKeywords, setMetaKeywords] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [sort, setSort] = useState("");
  const [active, setActive] = useState(true);
  const [status, setStatus] = useState({ type: "", message: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [editingId, setEditingId] = useState("");
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editMetaTitle, setEditMetaTitle] = useState("");
  const [editMetaDescription, setEditMetaDescription] = useState("");
  const [editMetaKeywords, setEditMetaKeywords] = useState("");
  const [editImageFile, setEditImageFile] = useState(null);
  const [editSort, setEditSort] = useState("");
  const [editActive, setEditActive] = useState(true);
  const [editStatus, setEditStatus] = useState({ type: "", message: "" });
  const [isUpdating, setIsUpdating] = useState(false);
  const [deletingId, setDeletingId] = useState("");
  const [imagePreview, setImagePreview] = useState(null);
  const [imageDropActive, setImageDropActive] = useState(false);
  const [editImagePreview, setEditImagePreview] = useState(null);
  const [editImageDropActive, setEditImageDropActive] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const [detailItem, setDetailItem] = useState(null);
  const [detailSubcategories, setDetailSubcategories] = useState([]);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState("");
  const fileInputRef = useRef(null);
  const editFileInputRef = useRef(null);

  const apiBase = import.meta.env.VITE_API_BASE_URL || "";
  const toPublicUrl = (maybePath) => {
    if (!maybePath) return "";
    if (/^https?:\/\//i.test(maybePath)) return maybePath;
    const base = String(apiBase).replace(/\/$/, "");
    const path = String(maybePath).startsWith("/") ? maybePath : `/${maybePath}`;
    return `${base}${path}`;
  };

  const fetchCategories = async () => {
    setLoadError("");
    setIsLoading(true);
    try {
      const [catRes, seoRes] = await Promise.all([
        apiClient.get("/api/categories"),
        apiClient.get("/api/admin/seo?pageType=category").catch(() => ({ data: { items: [] } })),
      ]);
      const cats = catRes?.data?.items ?? [];
      setItems(cats);
      const seoItems = seoRes?.data?.items ?? [];
      const map = {};
      seoItems.forEach((s) => { map[s.pageKey] = s; });
      setSeoByCategoryId(map);
    } catch (err) {
      setLoadError(err?.response?.data?.message || err?.message || "Failed to load categories.");
      setItems([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchCategoryDetail = async (id) => {
    if (!id) {
      setDetailItem(null);
      setDetailSubcategories([]);
      setDetailError("");
      return;
    }
    setDetailError("");
    setDetailLoading(true);
    try {
      const [catRes, seoRes, subRes] = await Promise.all([
        apiClient.get(`/api/categories/${id}`),
        apiClient.get(`/api/seo/category/${id}`).catch(() => ({ data: { item: null } })),
        apiClient.get("/api/subcategories", { params: { categoryId: id } }).catch(() => ({ data: { items: [] } })),
      ]);
      const cat = catRes?.data?.item ?? null;
      setDetailItem(cat);
      setDetailSubcategories(subRes?.data?.items ?? []);
      setEditSort(cat?.sort ?? "");
      const seo = seoRes?.data?.item;
      setEditMetaTitle(seo?.metaTitle ?? "");
      setEditMetaDescription(seo?.metaDescription ?? "");
      setEditMetaKeywords(seo?.metaKeywords ?? "");
    } catch (err) {
      setDetailError(err?.response?.data?.message || err?.message || "Failed to load category.");
      setDetailItem(null);
      setDetailSubcategories([]);
    } finally {
      setDetailLoading(false);
    }
  };

  useEffect(() => {
    if (selectedId) {
      fetchCategoryDetail(selectedId);
    } else {
      setDetailItem(null);
      setDetailSubcategories([]);
      setDetailError("");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedId]);

  const canSubmit = useMemo(() => {
    return title.trim().length > 0 && !isSubmitting;
  }, [title, isSubmitting]);

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setSort("");
    setMetaTitle("");
    setMetaDescription("");
    setMetaKeywords("");
    setImageFile(null);
    setImagePreview(null);
    setActive(true);
  };

  useEffect(() => {
    if (imageFile) {
      const url = URL.createObjectURL(imageFile);
      setImagePreview(url);
      return () => URL.revokeObjectURL(url);
    }
    setImagePreview(null);
  }, [imageFile]);

  useEffect(() => {
    if (editImageFile) {
      const url = URL.createObjectURL(editImageFile);
      setEditImagePreview(url);
      return () => URL.revokeObjectURL(url);
    }
    setEditImagePreview(null);
  }, [editImageFile]);

  const startEdit = (item) => {
    const id = item?._id || detailItem?._id || "";
    setEditingId(id);
    const src = item || detailItem;
    setEditTitle(src?.title || "");
    setEditDescription(src?.description || "");
    setEditSort(src?.sort ?? "");
    setEditImageFile(null);
    setEditActive(Boolean(src?.active));
    setEditStatus({ type: "", message: "" });
    const seo = seoByCategoryId[id];
    if (seo) {
      setEditMetaTitle(seo.metaTitle ?? "");
      setEditMetaDescription(seo.metaDescription ?? "");
      setEditMetaKeywords(seo.metaKeywords ?? "");
    }
  };

  const cancelEdit = () => {
    setEditingId("");
    setEditTitle("");
    setEditDescription("");
    setEditSort("");
    setEditMetaTitle("");
    setEditMetaDescription("");
    setEditMetaKeywords("");
    setEditImageFile(null);
    setEditImagePreview(null);
    setEditActive(true);
    setEditStatus({ type: "", message: "" });
  };

  const handleImageDrop = (e, setFile, isEdit) => {
    e.preventDefault();
    e.stopPropagation();
    if (isEdit) setEditImageDropActive(false);
    else setImageDropActive(false);
    const file = e.dataTransfer?.files?.[0];
    if (file?.type?.startsWith("image/")) setFile(file);
  };

  const handleImageDragOver = (e, isEdit) => {
    e.preventDefault();
    e.stopPropagation();
    if (isEdit) setEditImageDropActive(true);
    else setImageDropActive(true);
  };

  const handleImageDragLeave = (e, isEdit) => {
    e.preventDefault();
    e.stopPropagation();
    if (isEdit) setEditImageDropActive(false);
    else setImageDropActive(false);
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setStatus({ type: "", message: "" });
    setIsSubmitting(true);
    try {
      const fd = new FormData();
      fd.append("title", title.trim());
      if (description.trim()) fd.append("description", description.trim());
      if (sort.trim()) fd.append("sort", sort.trim());
      fd.append("active", String(active));
      if (imageFile) fd.append("image", imageFile);

      const catRes = await apiClient.post("/api/categories", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      const newCategory = catRes?.data?.item;

      if (newCategory && (metaTitle || metaDescription || metaKeywords)) {
        await apiClient.put("/api/admin/seo/upsert", {
          pageType: "category",
          pageKey: newCategory._id,
          metaTitle,
          metaDescription,
          metaKeywords,
        });
      }

      setStatus({ type: "success", message: "Category created successfully." });
      await fetchCategories();
      resetForm();
      setIsFormOpen(false);
    } catch (err) {
      const message =
        err?.response?.data?.message ||
        err?.message ||
        "Failed to create category.";
      setStatus({ type: "error", message });
    } finally {
      setIsSubmitting(false);
    }
  };

  const onUpdate = async (e) => {
    e.preventDefault();
    if (!editingId) return;

    setEditStatus({ type: "", message: "" });
    setIsUpdating(true);
    try {
      const fd = new FormData();
      fd.append("title", editTitle.trim());
      fd.append("description", editDescription.trim());
      fd.append("sort", (editSort || "").trim());
      fd.append("active", String(editActive));
      if (editImageFile) fd.append("image", editImageFile);

      await apiClient.put(`/api/categories/${editingId}`, fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      await apiClient.put("/api/admin/seo/upsert", {
        pageType: "category",
        pageKey: editingId,
        metaTitle: editMetaTitle,
        metaDescription: editMetaDescription,
        metaKeywords: editMetaKeywords,
      });

      setEditStatus({ type: "success", message: "Category updated successfully." });
      await fetchCategories();
      await fetchCategoryDetail(editingId);
      cancelEdit();
    } catch (err) {
      const message =
        err?.response?.data?.message ||
        err?.message ||
        "Failed to update category.";
      setEditStatus({ type: "error", message });
    } finally {
      setIsUpdating(false);
    }
  };

  const onDelete = async (id) => {
    const ok = window.confirm(
      "Delete this category? This will also delete its subcategories and products.",
    );
    if (!ok) return;

    setDeletingId(id);
    try {
      await apiClient.delete(`/api/categories/${id}`);
      await fetchCategories();
      if (editingId === id) cancelEdit();
      if (selectedId === id) setSelectedId(null);
    } catch (err) {
      const message =
        err?.response?.data?.message || err?.message || "Failed to delete category.";
      setStatus({ type: "error", message });
    } finally {
      setDeletingId("");
    }
  };

  return (
    <AdminShell
      testId="page-admin-categories"
      title="Categories"
      subtitle="Create and manage top-level categories for your product hierarchy."
      headerBare
      sectionBare
      actions={
        isFormOpen ? (
          <button
            type="button"
            data-testid="button-admin-category-add"
            aria-label="Close"
            onClick={() => {
              setStatus({ type: "", message: "" });
              setIsFormOpen(false);
              resetForm();
            }}
            className="p-1 text-muted-foreground hover:text-foreground rounded transition focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <X className="h-5 w-5" aria-hidden />
          </button>
        ) : editingId ? (
          <Button
            variant="ghost"
            data-testid="button-admin-category-cancel-edit"
            onClick={() => {
              setEditStatus({ type: "", message: "" });
              cancelEdit();
            }}
          >
            Cancel edit
          </Button>
        ) : selectedId ? (
          <Button
            variant="ghost"
            data-testid="button-admin-category-back"
            onClick={() => setSelectedId(null)}
          >
            <ArrowLeft className="h-4 w-4 mr-1.5" aria-hidden />
            Back to list
          </Button>
        ) : (
          <Button
            testId="button-admin-category-add"
            variant="primary"
            onClick={() => {
              setStatus({ type: "", message: "" });
              setIsFormOpen(true);
              cancelEdit();
              setSelectedId(null);
            }}
          >
            Add Category
          </Button>
        )
      }
    >
      {isFormOpen ? (
            <div className="mt-8 border-t border-border/60 pt-8">
              <form
                onSubmit={onSubmit}
                className="w-full"
              >
              <div className="grid gap-8 lg:grid-cols-2">
                <div className="space-y-4">
                  <h2 className="text-xl font-semibold">Create new category</h2>
                  <div>
                    <label className="text-sm font-medium text-foreground" htmlFor="category-title">
                      Title
                    </label>
                    <input
                      id="category-title"
                      data-testid="input-admin-category-title"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="mt-2 h-11 w-full rounded-xl border border-border/70 bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
                      placeholder="e.g. Valves"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium text-foreground" htmlFor="category-description">
                      Description (optional)
                    </label>
                    <textarea
                      id="category-description"
                      data-testid="input-admin-category-description"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      className="mt-2 min-h-[96px] w-full rounded-xl border border-border/70 bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
                      placeholder="Short description…"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium text-foreground" htmlFor="category-sort">
                      Sort order (optional)
                    </label>
                    <input
                      id="category-sort"
                      data-testid="input-admin-category-sort"
                      value={sort}
                      onChange={(e) => setSort(e.target.value)}
                      className="mt-2 h-11 w-full rounded-xl border border-border/70 bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
                      placeholder="e.g. 1, 2, 3 (lower = first)"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium text-foreground">Image (optional)</label>
                    <input
                      ref={fileInputRef}
                      id="category-image"
                      data-testid="input-admin-category-image"
                      type="file"
                      accept="image/*"
                      className="sr-only"
                      onChange={(e) => setImageFile(e.target.files?.[0] ?? null)}
                    />
                    <div
                      role="button"
                      tabIndex={0}
                      onClick={() => fileInputRef.current?.click()}
                      onKeyDown={(e) => e.key === "Enter" && fileInputRef.current?.click()}
                      onDragOver={(e) => handleImageDragOver(e, false)}
                      onDragLeave={(e) => handleImageDragLeave(e, false)}
                      onDrop={(e) => handleImageDrop(e, setImageFile, false)}
                      className={`mt-2 flex min-h-[120px] cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed transition-colors ${
                        imageDropActive
                          ? "border-primary bg-primary/5"
                          : "border-border/70 bg-muted/30 hover:border-primary/50 hover:bg-muted/50"
                      }`}
                    >
                      {imagePreview ? (
                        <div className="relative w-full p-2">
                          <img
                            src={imagePreview}
                            alt="Preview"
                            className="mx-auto max-h-24 rounded-lg object-contain"
                          />
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setImageFile(null);
                              fileInputRef.current && (fileInputRef.current.value = "");
                            }}
                            className="absolute right-3 top-3 flex h-7 w-7 items-center justify-center rounded-full bg-black/60 text-white transition hover:bg-black/80"
                            aria-label="Remove image"
                          >
                            ×
                          </button>
                        </div>
                      ) : (
                        <>
                          <svg
                            className="mb-2 h-10 w-10 text-muted-foreground"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            aria-hidden
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14"
                            />
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h14a2 2 0 012 2v14a2 2 0 01-2 2z"
                            />
                          </svg>
                          <span className="text-center text-sm font-medium text-foreground">
                            Drop image here or click to browse
                          </span>
                          <span className="mt-0.5 text-xs text-muted-foreground">
                            PNG, JPG, WebP up to 5MB
                          </span>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium text-foreground">Active</span>
                    <button
                      type="button"
                      role="switch"
                      aria-checked={active}
                      data-testid="input-admin-category-active"
                      onClick={() => setActive((s) => !s)}
                      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 ${
                        active ? "bg-primary" : "bg-muted"
                      }`}
                    >
                      <span
                        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition-transform ${
                          active ? "translate-x-5" : "translate-x-0.5"
                        }`}
                      />
                    </button>
                    <span className="text-sm text-muted-foreground">{active ? "On" : "Off"}</span>
                  </div>
                </div>

                <div className="space-y-3 lg:border-l lg:border-border/60 lg:pl-6">
                  <h3 className="text-lg font-semibold text-foreground">SEO Details</h3>
                  <div>
                    <label className="text-xs font-medium text-muted-foreground" htmlFor="category-meta-title">Meta Title</label>
                    <input
                      id="category-meta-title"
                      value={metaTitle}
                      onChange={(e) => setMetaTitle(e.target.value)}
                      className="mt-1 h-10 w-full rounded-lg border border-border/70 bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
                      placeholder="Page title for search engines"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-muted-foreground" htmlFor="category-meta-desc">Meta Description</label>
                    <textarea
                      id="category-meta-desc"
                      value={metaDescription}
                      onChange={(e) => setMetaDescription(e.target.value)}
                      className="mt-1 min-h-[100px] w-full rounded-lg border border-border/70 bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
                      placeholder="Short description for search results"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-muted-foreground" htmlFor="category-meta-keywords">Meta Keywords</label>
                    <KeywordTagsInput
                      id="category-meta-keywords"
                      value={metaKeywords}
                      onChange={setMetaKeywords}
                      placeholder="Type keyword or sentence and press Enter"
                    />
                  </div>
                </div>
              </div>

              {status.message ? (
                <div
                  data-testid="status-admin-category"
                  className={
                    status.type === "success"
                      ? "rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700"
                      : "rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
                  }
                >
                  {status.message}
                </div>
              ) : null}

              <div className="mt-5 flex items-center gap-3">
                <Button
                  testId="button-admin-category-submit"
                  type="submit"
                  disabled={!canSubmit}
                >
                  {isSubmitting ? "Saving…" : "Create Category"}
                </Button>
                <Button
                  variant="ghost"
                  testId="button-admin-category-cancel"
                  onClick={() => {
                    resetForm();
                    setStatus({ type: "", message: "" });
                    setIsFormOpen(false);
                  }}
                >
                  Cancel
                </Button>
              </div>
            </form>
            </div>
          ) : null}

          {selectedId && !editingId && !isFormOpen ? (
            <div className="mt-8 border-t border-border/60 pt-8">
              <div className="grid gap-8 lg:grid-cols-2">
                {detailLoading ? (
                  <div className="col-span-2 flex flex-col items-center justify-center py-16 text-muted-foreground">
                    <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                    <p className="mt-3 text-sm">Loading…</p>
                  </div>
                ) : detailError ? (
                  <div className="col-span-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                    {detailError}
                  </div>
                ) : detailItem ? (
                  <>
                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={toPublicUrl(detailItem.imageUrl) || IMAGES.LOGO}
                          alt=""
                          className="h-56 w-56 shrink-0 rounded-2xl object-contain"
                        />
                        <div>
                          <h2 className="text-xl font-semibold text-foreground">{detailItem.title}</h2>
                          <span
                            className={`mt-2 inline-block rounded-full px-3 py-0.5 text-xs font-medium ${
                              detailItem.active ? "bg-emerald-100 text-emerald-700" : "bg-muted text-muted-foreground"
                            }`}
                          >
                            {detailItem.active ? "Active" : "Inactive"}
                          </span>
                        </div>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Description</p>
                        <p className="mt-1 text-sm text-foreground">{detailItem.description || "No description."}</p>
                      </div>
                      {detailItem.sort ? (
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">Sort order</p>
                          <p className="mt-1 text-sm text-foreground">{detailItem.sort}</p>
                        </div>
                      ) : null}
                    </div>
                    <div className="space-y-3 lg:border-l lg:border-border/60 lg:pl-6">
                      <p className="text-sm font-medium text-muted-foreground">SEO</p>
                      {editMetaTitle || editMetaDescription || editMetaKeywords ? (
                        <div className="space-y-2 text-sm">
                          {editMetaTitle ? <div><span className="text-muted-foreground">Meta Title: </span><span className="text-foreground">{editMetaTitle}</span></div> : null}
                          {editMetaDescription ? <div><span className="text-muted-foreground">Meta Description: </span><span className="text-foreground">{editMetaDescription}</span></div> : null}
                          {editMetaKeywords ? <div><span className="text-muted-foreground">Meta Keywords: </span><span className="text-foreground">{editMetaKeywords}</span></div> : null}
                        </div>
                      ) : (
                        <p className="text-sm text-muted-foreground">No SEO data configured.</p>
                      )}
                    </div>
                  </>
                ) : null}
              </div>

              {detailItem && !detailLoading && !detailError ? (
                <div className="mt-6 flex items-center gap-3 border-t border-border/60 pt-6">
                  <Button
                    variant="primary"
                    size="sm"
                    data-testid="button-admin-category-edit"
                    onClick={() => startEdit(detailItem)}
                  >
                    <Pencil className="h-4 w-4 mr-1.5" aria-hidden />
                    Edit
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    data-testid="button-admin-category-delete"
                    disabled={deletingId === selectedId}
                    className="border-red-200/80 text-red-600 hover:bg-red-50"
                    onClick={() => onDelete(selectedId)}
                    aria-label={deletingId === selectedId ? "Deleting…" : "Delete category"}
                  >
                    <Trash2 className="h-4 w-4 mr-1.5" aria-hidden />
                    Delete
                  </Button>
                </div>
              ) : null}

              {detailItem && !detailLoading && !detailError && detailSubcategories.length > 0 ? (
                <div className="mt-8 border-t border-border/60 pt-6">
                  <h3 className="text-sm font-semibold text-foreground mb-3">Subcategories under this category</h3>
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                    {detailSubcategories.map((sub) => (
                      <div
                        key={sub._id}
                        className="flex flex-col items-center gap-2 rounded-xl border border-border/60 bg-muted/10 p-4"
                      >
                        <img
                          src={toPublicUrl(sub.imageUrl) || IMAGES.LOGO}
                          alt=""
                          className="h-32 w-32 shrink-0 rounded-lg object-contain"
                        />
                        <span className="w-full truncate text-center text-sm font-medium text-foreground">{sub.title}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : detailItem && !detailLoading && !detailError ? (
                <div className="mt-8 border-t border-border/60 pt-6">
                  <p className="text-sm text-muted-foreground">No subcategories under this category.</p>
                </div>
              ) : null}
            </div>
          ) : editingId && !isFormOpen ? (
            <div className="mt-8 border-t border-border/60 pt-8">
              <form onSubmit={onUpdate} className="w-full">
                <div className="grid gap-8 lg:grid-cols-2">
                  <div className="space-y-4">
                    <h2 className="text-xl font-semibold">Edit category</h2>
                    <div>
                      <label className="text-sm font-medium text-foreground" htmlFor="edit-category-title">
                        Title
                      </label>
                      <input
                        id="edit-category-title"
                        data-testid="input-admin-category-edit-title"
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        className="mt-2 h-11 w-full rounded-xl border border-border/70 bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
                        placeholder="e.g. Valves"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-foreground" htmlFor="edit-category-description">
                        Description (optional)
                      </label>
                      <textarea
                        id="edit-category-description"
                        data-testid="input-admin-category-edit-description"
                        value={editDescription}
                        onChange={(e) => setEditDescription(e.target.value)}
                        className="mt-2 min-h-[96px] w-full rounded-xl border border-border/70 bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
                        placeholder="Short description…"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-foreground" htmlFor="edit-category-sort">
                        Sort order (optional)
                      </label>
                      <input
                        id="edit-category-sort"
                        data-testid="input-admin-category-edit-sort"
                        value={editSort}
                        onChange={(e) => setEditSort(e.target.value)}
                        className="mt-2 h-11 w-full rounded-xl border border-border/70 bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
                        placeholder="e.g. 1, 2, 3 (lower = first)"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-foreground">Image (optional)</label>
                      <input
                        ref={editFileInputRef}
                        id="edit-category-image"
                        data-testid="input-admin-category-edit-image"
                        type="file"
                        accept="image/*"
                        className="sr-only"
                        onChange={(e) => setEditImageFile(e.target.files?.[0] ?? null)}
                      />
                      <div
                        role="button"
                        tabIndex={0}
                        onClick={() => editFileInputRef.current?.click()}
                        onKeyDown={(e) => e.key === "Enter" && editFileInputRef.current?.click()}
                        onDragOver={(e) => handleImageDragOver(e, true)}
                        onDragLeave={(e) => handleImageDragLeave(e, true)}
                        onDrop={(e) => handleImageDrop(e, setEditImageFile, true)}
                        className={`mt-2 flex min-h-[120px] cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed transition-colors ${
                          editImageDropActive
                            ? "border-primary bg-primary/5"
                            : "border-border/70 bg-muted/30 hover:border-primary/50 hover:bg-muted/50"
                        }`}
                      >
                        {editImagePreview || detailItem?.imageUrl ? (
                          <div className="relative w-full p-2">
                            <img
                              src={editImagePreview || toPublicUrl((items.find((i) => i._id === editingId) || detailItem)?.imageUrl)}
                              alt="Preview"
                              className="mx-auto max-h-24 rounded-lg object-contain"
                            />
                            {editImageFile && (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setEditImageFile(null);
                                  editFileInputRef.current && (editFileInputRef.current.value = "");
                                }}
                                className="absolute right-3 top-3 flex h-7 w-7 items-center justify-center rounded-full bg-black/60 text-white transition hover:bg-black/80"
                                aria-label="Remove image"
                              >
                                ×
                              </button>
                            )}
                          </div>
                        ) : (
                          <>
                            <svg
                              className="mb-2 h-10 w-10 text-muted-foreground"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                              aria-hidden
                            >
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h14a2 2 0 012 2v14a2 2 0 01-2 2z" />
                            </svg>
                            <span className="text-center text-sm font-medium text-foreground">
                              Drop image here or click to browse
                            </span>
                            <span className="mt-0.5 text-xs text-muted-foreground">
                              PNG, JPG, WebP up to 5MB
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-medium text-foreground">Active</span>
                      <button
                        type="button"
                        role="switch"
                        aria-checked={editActive}
                        data-testid="input-admin-category-edit-active"
                        onClick={() => setEditActive((s) => !s)}
                        className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 ${
                          editActive ? "bg-primary" : "bg-muted"
                        }`}
                      >
                        <span
                          className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition-transform ${
                            editActive ? "translate-x-5" : "translate-x-0.5"
                          }`}
                        />
                      </button>
                      <span className="text-sm text-muted-foreground">{editActive ? "On" : "Off"}</span>
                    </div>
                  </div>
                  <div className="space-y-3 lg:border-l lg:border-border/60 lg:pl-6">
                    <h3 className="text-lg font-semibold text-foreground">SEO Details</h3>
                    <div>
                      <label className="text-xs font-medium text-muted-foreground" htmlFor="edit-category-meta-title">Meta Title</label>
                      <input
                        id="edit-category-meta-title"
                        value={editMetaTitle}
                        onChange={(e) => setEditMetaTitle(e.target.value)}
                        className="mt-1 h-10 w-full rounded-lg border border-border/70 bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
                        placeholder="Page title for search engines"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-muted-foreground" htmlFor="edit-category-meta-desc">Meta Description</label>
                      <textarea
                        id="edit-category-meta-desc"
                        value={editMetaDescription}
                        onChange={(e) => setEditMetaDescription(e.target.value)}
                        className="mt-1 min-h-[100px] w-full rounded-lg border border-border/70 bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
                        placeholder="Short description for search results"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-muted-foreground" htmlFor="edit-category-meta-keywords">Meta Keywords</label>
                      <KeywordTagsInput
                        id="edit-category-meta-keywords"
                        value={editMetaKeywords}
                        onChange={setEditMetaKeywords}
                        placeholder="Type keyword or sentence and press Enter"
                      />
                    </div>
                  </div>
                </div>
                {editStatus.message ? (
                  <div
                    data-testid="status-admin-category-edit"
                    className={`mt-4 rounded-xl px-4 py-3 text-sm ${
                      editStatus.type === "success"
                        ? "border border-green-200 bg-green-50 text-green-700"
                        : "border border-red-200 bg-red-50 text-red-700"
                    }`}
                  >
                    {editStatus.message}
                  </div>
                ) : null}
                <div className="mt-5 flex items-center gap-3">
                  <Button type="submit" disabled={isUpdating || editTitle.trim().length === 0}>
                    {isUpdating ? "Saving…" : "Save changes"}
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={() => {
                      setEditStatus({ type: "", message: "" });
                      cancelEdit();
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    data-testid="button-admin-category-delete"
                    disabled={deletingId === editingId}
                    className="border-red-200/80 text-red-600 hover:bg-red-50"
                    onClick={() => onDelete(editingId)}
                    aria-label={deletingId === editingId ? "Deleting…" : "Delete category"}
                  >
                    <Trash2 className="h-4 w-4 mr-1.5" aria-hidden />
                    Delete
                  </Button>
                </div>
              </form>
            </div>
          ) : null}

          {!isFormOpen && !editingId && !selectedId ? (
          <div className="mt-8">
            <div className="mb-4 flex items-baseline justify-between border-b border-border/60 pb-3">
              <h2 className="text-lg font-semibold tracking-tight text-foreground">
                All categories
              </h2>
              <span className="text-sm text-muted-foreground">
                {isLoading ? "Loading…" : `${items.length} categor${items.length === 1 ? "y" : "ies"}`}
              </span>
            </div>

            {loadError ? (
              <div
                data-testid="status-admin-categories-load-error"
                className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
              >
                {loadError}
              </div>
            ) : null}

            {!isLoading && !loadError && items.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border/60 bg-muted/20 px-6 py-12 text-center">
                <p className="text-sm font-medium text-foreground">No categories yet</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Click “Add Category” to create your first one.
                </p>
              </div>
            ) : null}

            {!isLoading && !loadError && items.length > 0 ? (
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                {items.map((item) => (
                  <button
                    key={item._id}
                    type="button"
                    data-testid={`card-admin-category-${item._id}`}
                    onClick={() => {
                      setSelectedId(item._id);
                      setIsFormOpen(false);
                    }}
                    className="group flex flex-col items-center gap-3 rounded-xl border-2 border-border/60 bg-card p-4 text-left shadow-sm transition-all hover:shadow-lg hover:border-primary/40 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                  >
                    <img
                      src={toPublicUrl(item.imageUrl) || IMAGES.LOGO}
                      alt=""
                      className="h-44 w-44 shrink-0 rounded-xl object-contain transition-transform group-hover:scale-105"
                      loading="lazy"
                    />
                    <span className="w-full truncate text-center text-sm font-semibold text-foreground">
                      {item.title}
                    </span>
                    {(() => {
                    const s = seoByCategoryId[item._id];
                    if (!s || (!s.metaTitle && !s.metaDescription && !s.metaKeywords)) return null;
                    return (
                      <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-700">
                        SEO
                      </span>
                    );
                  })()}
                  </button>
                ))}
              </div>
            ) : null}
          </div>
          ) : null}
    </AdminShell>
  );
}

