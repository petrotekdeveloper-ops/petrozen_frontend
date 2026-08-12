import { useEffect, useMemo, useRef, useState } from "react";
import Button from "@/components/Button";
import { Pencil, Trash2, ImagePlus } from "lucide-react";
import { apiClient } from "@/lib/apiClient";
import AdminShell from "@/components/admin/AdminShell";
import logo from "@/assets/logo.webp";

function normalizeBlogImages(item) {
  if (!item) return [];
  if (Array.isArray(item.images) && item.images.length) return item.images.filter(Boolean);
  return [];
}

export default function AdminBlogs() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [items, setItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [imageFiles, setImageFiles] = useState([]);
  const [status, setStatus] = useState({ type: "", message: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [selectedId, setSelectedId] = useState(null);
  const [detailItem, setDetailItem] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState("");

  const [editingId, setEditingId] = useState("");
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editKeptUrls, setEditKeptUrls] = useState([]);
  const [editNewFiles, setEditNewFiles] = useState([]);
  const [editStatus, setEditStatus] = useState({ type: "", message: "" });
  const [isUpdating, setIsUpdating] = useState(false);

  const [deletingId, setDeletingId] = useState("");
  const [imageDropActive, setImageDropActive] = useState(false);
  const [editDropActive, setEditDropActive] = useState(false);

  const fileInputRef = useRef(null);
  const editFileInputRef = useRef(null);

  const apiBase = import.meta.env.VITE_API_BASE_URL || "";
  const toPublicUrl = (maybePath) => {
    if (!maybePath) return "";
    if (/^blob:/i.test(maybePath)) return maybePath;
    if (/^https?:\/\//i.test(maybePath)) return maybePath;
    const base = String(apiBase).replace(/\/$/, "");
    const path = String(maybePath).startsWith("/") ? maybePath : `/${maybePath}`;
    return `${base}${path}`;
  };

  const fetchBlogs = async () => {
    setLoadError("");
    setIsLoading(true);
    try {
      const res = await apiClient.get("/api/blog");
      setItems(res?.data?.items ?? []);
    } catch (err) {
      setLoadError(err?.response?.data?.message || err?.message || "Failed to load blogs.");
      setItems([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBlogs();
  }, []);

  const fetchBlogDetail = async (id) => {
    if (!id) {
      setDetailItem(null);
      setDetailError("");
      return;
    }
    setDetailError("");
    setDetailLoading(true);
    try {
      const res = await apiClient.get(`/api/blog/${id}`);
      setDetailItem(res?.data?.item ?? null);
    } catch (err) {
      setDetailError(err?.response?.data?.message || err?.message || "Failed to load blog.");
      setDetailItem(null);
    } finally {
      setDetailLoading(false);
    }
  };

  useEffect(() => {
    if (selectedId) fetchBlogDetail(selectedId);
    else {
      setDetailItem(null);
      setDetailError("");
    }
  }, [selectedId]);

  const createPreviews = useMemo(() => {
    return imageFiles.map((f) => ({ file: f, url: URL.createObjectURL(f) }));
  }, [imageFiles]);

  useEffect(() => {
    return () => {
      createPreviews.forEach((p) => URL.revokeObjectURL(p.url));
    };
  }, [createPreviews]);

  const editNewPreviews = useMemo(() => {
    return editNewFiles.map((f) => ({ file: f, url: URL.createObjectURL(f) }));
  }, [editNewFiles]);

  useEffect(() => {
    return () => {
      editNewPreviews.forEach((p) => URL.revokeObjectURL(p.url));
    };
  }, [editNewPreviews]);

  const canSubmit = useMemo(() => {
    return title.trim().length > 0 && description.trim().length > 0 && !isSubmitting;
  }, [title, description, isSubmitting]);

  const sortedItems = useMemo(() => {
    return [...items].sort((a, b) => {
      const da = new Date(a.createdAt || 0).getTime();
      const db = new Date(b.createdAt || 0).getTime();
      return db - da;
    });
  }, [items]);

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setImageFiles([]);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const startEdit = (item) => {
    const src = item || detailItem;
    setEditingId(src?._id || "");
    setEditTitle(src?.title || "");
    setEditDescription(src?.description || "");
    setEditKeptUrls(normalizeBlogImages(src));
    setEditNewFiles([]);
    setEditStatus({ type: "", message: "" });
    if (editFileInputRef.current) editFileInputRef.current.value = "";
  };

  const cancelEdit = () => {
    setEditingId("");
    setEditTitle("");
    setEditDescription("");
    setEditKeptUrls([]);
    setEditNewFiles([]);
    setEditStatus({ type: "", message: "" });
    if (editFileInputRef.current) editFileInputRef.current.value = "";
  };

  const closeDetail = () => {
    setSelectedId(null);
    cancelEdit();
  };

  const appendImageFiles = (fileList, isEdit) => {
    const incoming = Array.from(fileList || []).filter((f) => f?.type?.startsWith("image/"));
    if (!incoming.length) return;
    const max = 15;
    if (isEdit) {
      setEditNewFiles((prev) => {
        const room = max - editKeptUrls.length - prev.length;
        return [...prev, ...incoming.slice(0, Math.max(0, room))];
      });
    } else {
      setImageFiles((prev) => [...prev, ...incoming.slice(0, Math.max(0, max - prev.length))]);
    }
  };

  const handleImageDrop = (e, isEdit) => {
    e.preventDefault();
    e.stopPropagation();
    if (isEdit) setEditDropActive(false);
    else setImageDropActive(false);
    appendImageFiles(e.dataTransfer?.files, isEdit);
  };

  const handleImageDragOver = (e, isEdit) => {
    e.preventDefault();
    e.stopPropagation();
    if (isEdit) setEditDropActive(true);
    else setImageDropActive(true);
  };

  const handleImageDragLeave = (e, isEdit) => {
    e.preventDefault();
    e.stopPropagation();
    if (isEdit) setEditDropActive(false);
    else setImageDropActive(false);
  };

  const revokeList = (urls) => {
    urls.forEach((u) => {
      if (typeof u === "string" && u.startsWith("blob:")) URL.revokeObjectURL(u);
    });
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setStatus({ type: "", message: "" });
    setIsSubmitting(true);

    const filesSnapshot = [...imageFiles];
    const titleSnap = title.trim();
    const descSnap = description.trim();

    const tempId = `optimistic-${Date.now()}`;
    const optimisticUrls = filesSnapshot.map((f) => URL.createObjectURL(f));
    const optimisticItem = {
      _id: tempId,
      _optimistic: true,
      title: titleSnap,
      description: descSnap,
      images: optimisticUrls,
      createdAt: new Date().toISOString(),
    };

    setItems((prev) => [optimisticItem, ...prev]);
    resetForm();
    setIsFormOpen(false);

    try {
      const fd = new FormData();
      fd.append("title", titleSnap);
      fd.append("description", descSnap);
      filesSnapshot.forEach((file) => fd.append("images", file));

      const res = await apiClient.post("/api/blog", fd);
      revokeList(optimisticUrls);
      const saved = res?.data?.item;
      setItems((prev) => prev.map((it) => (it._id === tempId ? saved : it)));
      setStatus({ type: "success", message: "Blog published." });
    } catch (err) {
      revokeList(optimisticUrls);
      setItems((prev) => prev.filter((it) => it._id !== tempId));
      const message = err?.response?.data?.message || err?.message || "Failed to create blog.";
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
      fd.append("existingImages", JSON.stringify(editKeptUrls));
      editNewFiles.forEach((file) => fd.append("images", file));

      await apiClient.put(`/api/blog/${editingId}`, fd);

      setEditStatus({ type: "success", message: "Blog updated." });
      await fetchBlogs();
      if (selectedId === editingId) fetchBlogDetail(editingId);
      cancelEdit();
    } catch (err) {
      const message = err?.response?.data?.message || err?.message || "Failed to update blog.";
      setEditStatus({ type: "error", message });
    } finally {
      setIsUpdating(false);
    }
  };

  const onDelete = async (id) => {
    const ok = window.confirm("Delete this blog post?");
    if (!ok) return;

    setDeletingId(id);
    try {
      await apiClient.delete(`/api/blog/${id}`);
      await fetchBlogs();
      if (editingId === id) cancelEdit();
      if (selectedId === id) closeDetail();
    } catch (err) {
      const message = err?.response?.data?.message || err?.message || "Failed to delete blog.";
      setStatus({ type: "error", message });
    } finally {
      setDeletingId("");
    }
  };

  const removeCreateImageAt = (index) => {
    setImageFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const removeEditKeptAt = (index) => {
    setEditKeptUrls((prev) => prev.filter((_, i) => i !== index));
  };

  const removeEditNewAt = (index) => {
    setEditNewFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const renderMultiImageDropzone = ({
    isEdit,
    previews,
    onPickFiles,
    dropActive,
    emptyHint,
  }) => (
    <div>
      <label className="text-sm font-medium text-foreground">{isEdit ? "Add more images" : "Images (optional)"}</label>
      <input
        ref={isEdit ? editFileInputRef : fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/jpg"
        multiple
        className="sr-only"
        onChange={(e) => {
          appendImageFiles(e.target.files, isEdit);
          e.target.value = "";
        }}
      />
      <div
        role="button"
        tabIndex={0}
        onClick={() => (isEdit ? editFileInputRef : fileInputRef).current?.click()}
        onKeyDown={(e) => e.key === "Enter" && (isEdit ? editFileInputRef : fileInputRef).current?.click()}
        onDragOver={(e) => handleImageDragOver(e, isEdit)}
        onDragLeave={(e) => handleImageDragLeave(e, isEdit)}
        onDrop={(e) => handleImageDrop(e, isEdit)}
        className={`mt-2 flex min-h-[100px] cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed transition-colors ${
          dropActive ? "border-primary bg-primary/5" : "border-border/70 bg-muted/30 hover:border-primary/50 hover:bg-muted/50"
        }`}
      >
        <ImagePlus className="mb-1 h-8 w-8 text-muted-foreground" aria-hidden />
        <span className="text-center text-xs font-medium text-foreground">{emptyHint}</span>
        <span className="mt-0.5 text-xs text-muted-foreground">JPEG or PNG, up to 5MB each</span>
      </div>
      {previews.length > 0 ? (
        <ul className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-4">
          {previews.map((p, i) => (
            <li key={`${p.url}-${i}`} className="relative aspect-square overflow-hidden rounded-lg border border-border/60 bg-muted/40">
              <img src={p.url} alt="" className="h-full w-full object-cover" />
              <button
                type="button"
                onClick={(ev) => {
                  ev.stopPropagation();
                  onPickFiles(i);
                }}
                className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-black/60 text-sm text-white hover:bg-black/80"
                aria-label="Remove image"
              >
                ×
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );

  return (
    <AdminShell
      testId="page-admin-blogs"
      title="Blogs"
      subtitle="Create posts; images are optional and stored on DigitalOcean Spaces when added."
      headerBare
      sectionBare
      actions={
        <Button
          testId="button-admin-blog-add"
          variant={isFormOpen ? "secondary" : "primary"}
          onClick={() => {
            setStatus({ type: "", message: "" });
            setIsFormOpen((s) => !s);
          }}
        >
          {isFormOpen ? "Close" : "New blog post"}
        </Button>
      }
    >
      {status.message ? (
        <div
          className={
            status.type === "success"
              ? "mb-4 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700"
              : "mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
          }
        >
          {status.message}
        </div>
      ) : null}

      {isFormOpen ? (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/40 p-6 py-8">
          <form
            onSubmit={onSubmit}
            className="relative z-[60] mx-auto grid w-full max-w-2xl gap-4 rounded-2xl border-2 border-blue-500 bg-card p-4 shadow-xl sm:p-5"
          >
            <div className="flex items-center gap-3">
              <img
                src={logo}
                alt=""
                loading="eager"
                decoding="async"
                width={96}
                height={96}
                className="h-8 w-8 shrink-0 object-contain"
                aria-hidden
              />
              <h2 className="text-lg font-semibold">New blog post</h2>
            </div>
            <div>
              <label className="text-sm font-medium text-foreground" htmlFor="blog-title">
                Title
              </label>
              <input
                id="blog-title"
                data-testid="input-admin-blog-title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="mt-2 h-11 w-full rounded-xl border border-border/70 bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
                placeholder="Post title"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground" htmlFor="blog-description">
                Description
              </label>
              <textarea
                id="blog-description"
                data-testid="input-admin-blog-description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={5}
                className="mt-2 w-full rounded-xl border border-border/70 bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
                placeholder="Full post content"
              />
            </div>
            {renderMultiImageDropzone({
              isEdit: false,
              previews: createPreviews,
              onPickFiles: removeCreateImageAt,
              dropActive: imageDropActive,
              emptyHint: "Drop images here or click to browse",
            })}
            <div className="mt-1 flex items-center gap-3">
              <Button testId="button-admin-blog-submit" type="submit" disabled={!canSubmit}>
                {isSubmitting ? "Publishing…" : "Publish"}
              </Button>
              <Button
                variant="ghost"
                testId="button-admin-blog-cancel"
                type="button"
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

      <div className="mt-8">
        <div className="mb-4 flex items-baseline justify-between border-b border-border/60 pb-3">
          <h2 className="text-lg font-semibold tracking-tight text-foreground">All posts</h2>
          <span className="text-sm text-muted-foreground">
            {isLoading ? "Loading…" : `${items.length} post${items.length === 1 ? "" : "s"}`}
          </span>
        </div>

        {loadError ? (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{loadError}</div>
        ) : null}

        {!isLoading && !loadError && items.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border/60 bg-muted/20 px-6 py-12 text-center">
            <p className="text-sm font-medium text-foreground">No blog posts yet</p>
            <p className="mt-1 text-sm text-muted-foreground">Click &quot;New blog post&quot; to create one.</p>
          </div>
        ) : null}

        {!isLoading && !loadError && items.length > 0 ? (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {sortedItems.map((item) => {
              const imgs = normalizeBlogImages(item);
              const thumb = imgs[0];
              return (
                <button
                  key={item._id}
                  type="button"
                  data-testid={`card-admin-blog-${item._id}`}
                  onClick={() => setSelectedId(item._id)}
                  className={`group flex flex-col overflow-hidden rounded-2xl border-2 bg-card text-left shadow-sm transition-all hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 ${
                    selectedId === item._id ? "border-primary shadow-lg ring-2 ring-primary/20" : "border-border/60 hover:border-primary/40"
                  }`}
                >
                  <div className="relative aspect-[16/10] w-full overflow-hidden bg-muted">
                    {thumb ? (
                      <img
                        src={toPublicUrl(thumb)}
                        alt=""
                        className={`h-full w-full object-cover transition-transform group-hover:scale-[1.02] ${item._optimistic ? "opacity-80" : ""}`}
                        loading="lazy"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-muted-foreground">
                        <ImagePlus className="h-12 w-12 opacity-40" />
                      </div>
                    )}
                    {item._optimistic ? (
                      <span className="absolute bottom-2 right-2 rounded-md bg-primary/90 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-primary-foreground">
                        Publishing…
                      </span>
                    ) : null}
                    {imgs.length > 1 ? (
                      <span className="absolute bottom-2 left-2 rounded-md bg-black/55 px-2 py-0.5 text-xs text-white">{imgs.length} photos</span>
                    ) : null}
                  </div>
                  <div className="p-4">
                    <h3 className="line-clamp-2 font-semibold text-foreground">{item.title}</h3>
                    <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{item.description}</p>
                  </div>
                </button>
              );
            })}
          </div>
        ) : null}
      </div>

      {selectedId ? (
        <div
          className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/50 p-4 py-8 backdrop-blur-sm"
          onClick={closeDetail}
          role="dialog"
          aria-modal="true"
        >
          <div
            className="relative z-[60] w-full max-w-lg rounded-2xl border-2 border-blue-500 bg-card shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={closeDetail}
              className="absolute right-3 top-3 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-muted/80 text-muted-foreground transition hover:bg-muted"
              aria-label="Close"
            >
              ×
            </button>

            {detailLoading ? (
              <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                <p className="mt-3 text-sm">Loading…</p>
              </div>
            ) : detailError ? (
              <div className="p-6">
                <p className="text-sm text-red-600">{detailError}</p>
                <Button variant="ghost" className="mt-4" onClick={closeDetail}>
                  Close
                </Button>
              </div>
            ) : editingId === selectedId ? (
              <form onSubmit={onUpdate} className="max-h-[90vh] overflow-y-auto p-6 pt-12">
                <div className="grid gap-3">
                  <div>
                    <label className="text-xs font-medium text-muted-foreground" htmlFor="edit-blog-title">
                      Title
                    </label>
                    <input
                      id="edit-blog-title"
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      className="mt-2 h-11 w-full rounded-xl border border-border/70 bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-muted-foreground" htmlFor="edit-blog-description">
                      Description
                    </label>
                    <textarea
                      id="edit-blog-description"
                      value={editDescription}
                      onChange={(e) => setEditDescription(e.target.value)}
                      rows={5}
                      className="mt-2 w-full rounded-xl border border-border/70 bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
                    />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-muted-foreground">Current images</p>
                    {editKeptUrls.length || editNewPreviews.length ? (
                      <ul className="mt-2 grid grid-cols-3 gap-2">
                        {editKeptUrls.map((url, i) => (
                          <li key={url} className="relative aspect-square overflow-hidden rounded-lg border border-border/60">
                            <img src={toPublicUrl(url)} alt="" className="h-full w-full object-cover" />
                            <button
                              type="button"
                              onClick={() => removeEditKeptAt(i)}
                              className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-black/60 text-sm text-white hover:bg-black/80"
                              aria-label="Remove image"
                            >
                              ×
                            </button>
                          </li>
                        ))}
                        {editNewPreviews.map((p, i) => (
                          <li key={p.url} className="relative aspect-square overflow-hidden rounded-lg border border-border/60">
                            <img src={p.url} alt="" className="h-full w-full object-cover" />
                            <button
                              type="button"
                              onClick={() => removeEditNewAt(i)}
                              className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-black/60 text-sm text-white hover:bg-black/80"
                              aria-label="Remove new image"
                            >
                              ×
                            </button>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="mt-2 text-xs text-muted-foreground">Add at least one image below.</p>
                    )}
                  </div>
                  {renderMultiImageDropzone({
                    isEdit: true,
                    previews: editNewPreviews,
                    onPickFiles: removeEditNewAt,
                    dropActive: editDropActive,
                    emptyHint: "Add more (stored on upload)",
                  })}
                </div>
                {editStatus.message ? (
                  <div
                    className={`mt-3 rounded-xl px-4 py-3 text-sm ${
                      editStatus.type === "success"
                        ? "border border-green-200 bg-green-50 text-green-700"
                        : "border border-red-200 bg-red-50 text-red-700"
                    }`}
                  >
                    {editStatus.message}
                  </div>
                ) : null}
                <div className="mt-4 flex gap-3">
                  <Button
                    type="submit"
                    disabled={isUpdating || editTitle.trim().length === 0 || editDescription.trim().length === 0}
                  >
                    {isUpdating ? "Saving…" : "Save changes"}
                  </Button>
                  <Button variant="ghost" type="button" onClick={cancelEdit}>
                    Cancel
                  </Button>
                </div>
              </form>
            ) : detailItem ? (
              <div className="max-h-[90vh] overflow-y-auto p-6 pt-12">
                <div className="space-y-3">
                  {normalizeBlogImages(detailItem).length ? (
                    <div className="grid grid-cols-2 gap-2">
                      {normalizeBlogImages(detailItem).map((url) => (
                        <div key={url} className="overflow-hidden rounded-xl border border-border/60 bg-muted/30">
                          <img src={toPublicUrl(url)} alt="" className="aspect-video w-full object-cover" loading="lazy" />
                        </div>
                      ))}
                    </div>
                  ) : null}
                  <h3 className="text-xl font-semibold text-foreground">{detailItem.title}</h3>
                  <p className="whitespace-pre-wrap text-sm text-muted-foreground">{detailItem.description}</p>
                </div>
                <div className="mt-6 flex gap-2 border-t border-border/60 pt-4">
                  <Button
                    variant="secondary"
                    size="sm"
                    className="h-10 w-10 rounded-full p-0"
                    aria-label="Edit blog"
                    onClick={() => startEdit()}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    disabled={deletingId === selectedId}
                    className="h-10 w-10 rounded-full border-red-200/80 p-0 text-red-600 hover:bg-red-50"
                    aria-label={deletingId === selectedId ? "Deleting…" : "Delete blog"}
                    onClick={() => onDelete(selectedId)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      ) : null}
    </AdminShell>
  );
}
