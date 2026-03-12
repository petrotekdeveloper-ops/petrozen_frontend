import { useEffect, useMemo, useRef, useState } from "react";
import Button from "@/components/Button";
import { Pencil, Trash2 } from "lucide-react";
import { apiClient } from "@/lib/apiClient";
import AdminShell from "@/components/admin/AdminShell";
import logo from "@/assets/logo.png";

export default function AdminProducts() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [categories, setCategories] = useState([]);
  const [formSubCategories, setFormSubCategories] = useState([]);
  const [listSubCategories, setListSubCategories] = useState([]);
  const [formCategoryId, setFormCategoryId] = useState("");
  const [formSubCategoryId, setFormSubCategoryId] = useState("");
  const [formBrandId, setFormBrandId] = useState("");
  const [listCategoryId, setListCategoryId] = useState("");
  const [listSubCategoryId, setListSubCategoryId] = useState("");
  const [items, setItems] = useState([]);
  const [brands, setBrands] = useState([]);
  const [seoByProductId, setSeoByProductId] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [metaTitle, setMetaTitle] = useState("");
  const [metaDescription, setMetaDescription] = useState("");
  const [metaKeywords, setMetaKeywords] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [active, setActive] = useState(true);
  const [status, setStatus] = useState({ type: "", message: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [editingId, setEditingId] = useState("");
  const [editCategoryId, setEditCategoryId] = useState("");
  const [editSubCategories, setEditSubCategories] = useState([]);
  const [editSubCategoryId, setEditSubCategoryId] = useState("");
  const [editBrandId, setEditBrandId] = useState("");
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editMetaTitle, setEditMetaTitle] = useState("");
  const [editMetaDescription, setEditMetaDescription] = useState("");
  const [editMetaKeywords, setEditMetaKeywords] = useState("");
  const [editImageFile, setEditImageFile] = useState(null);
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

  useEffect(() => {
    let mounted = true;
    apiClient
      .get("/api/categories")
      .then((res) => {
        if (!mounted) return;
        setCategories(res?.data?.items ?? []);
      })
      .catch(() => {
        if (!mounted) return;
        setCategories([]);
      });
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    let mounted = true;
    apiClient
      .get("/api/brands")
      .then((res) => {
        if (!mounted) return;
        setBrands(res?.data?.items ?? []);
      })
      .catch(() => {
        if (!mounted) return;
        setBrands([]);
      });
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    let mounted = true;
    if (!formCategoryId) {
      setFormSubCategories([]);
      setFormSubCategoryId("");
      return;
    }

    apiClient
      .get("/api/subcategories", { params: { categoryId: formCategoryId } })
      .then((res) => {
        if (!mounted) return;
        setFormSubCategories(res?.data?.items ?? []);
      })
      .catch(() => {
        if (!mounted) return;
        setFormSubCategories([]);
      });

    return () => {
      mounted = false;
    };
  }, [formCategoryId]);

  useEffect(() => {
    let mounted = true;
    if (!listCategoryId) {
      setListSubCategories([]);
      setListSubCategoryId("");
      return;
    }

    apiClient
      .get("/api/subcategories", { params: { categoryId: listCategoryId } })
      .then((res) => {
        if (!mounted) return;
        setListSubCategories(res?.data?.items ?? []);
      })
      .catch(() => {
        if (!mounted) return;
        setListSubCategories([]);
      });

    return () => {
      mounted = false;
    };
  }, [listCategoryId]);

  const fetchProducts = async (maybeSubCategoryId) => {
    setLoadError("");
    setIsLoading(true);
    try {
      const [prodRes, seoRes] = await Promise.all([
        apiClient.get("/api/products", {
          params: maybeSubCategoryId ? { subCategoryId: maybeSubCategoryId } : undefined,
        }),
        apiClient.get("/api/admin/seo?pageType=product").catch(() => ({ data: { items: [] } })),
      ]);
      const prods = prodRes?.data?.items ?? [];
      setItems(prods);
      const seoItems = seoRes?.data?.items ?? [];
      const map = {};
      seoItems.forEach((s) => { map[s.pageKey] = s; });
      setSeoByProductId(map);
    } catch (err) {
      setLoadError(err?.response?.data?.message || err?.message || "Failed to load products.");
      setItems([]);
      setSeoByProductId({});
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts(listSubCategoryId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [listSubCategoryId]);

  const canSubmit = useMemo(() => {
    return formSubCategoryId && title.trim().length > 0 && !isSubmitting;
  }, [formSubCategoryId, title, isSubmitting]);

  const resetForm = () => {
    setFormCategoryId("");
    setFormSubCategoryId("");
    setFormBrandId("");
    setTitle("");
    setDescription("");
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

  const fetchProductDetail = async (id) => {
    if (!id) {
      setDetailItem(null);
      setDetailError("");
      return;
    }
    setDetailError("");
    setDetailLoading(true);
    try {
      const [prodRes, seoRes] = await Promise.all([
        apiClient.get(`/api/products/${id}`),
        apiClient.get(`/api/seo/product/${id}`).catch(() => ({ data: { item: null } })),
      ]);
      setDetailItem(prodRes?.data?.item ?? null);
      const seo = seoRes?.data?.item;
      setEditMetaTitle(seo?.metaTitle ?? "");
      setEditMetaDescription(seo?.metaDescription ?? "");
      setEditMetaKeywords(seo?.metaKeywords ?? "");
    } catch (err) {
      setDetailError(err?.response?.data?.message || err?.message || "Failed to load product.");
      setDetailItem(null);
    } finally {
      setDetailLoading(false);
    }
  };

  useEffect(() => {
    if (selectedId) fetchProductDetail(selectedId);
    else {
      setDetailItem(null);
      setDetailError("");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedId]);

  const loadEditSubcategories = async (categoryId, desiredSubCategoryId) => {
    if (!categoryId) {
      setEditSubCategories([]);
      setEditSubCategoryId("");
      return;
    }
    try {
      const res = await apiClient.get("/api/subcategories", {
        params: { categoryId },
      });
      const subcats = res?.data?.items ?? [];
      setEditSubCategories(subcats);
      if (desiredSubCategoryId) setEditSubCategoryId(desiredSubCategoryId);
      else setEditSubCategoryId("");
    } catch (_) {
      setEditSubCategories([]);
      setEditSubCategoryId("");
    }
  };

  const startEdit = (item) => {
    const src = item || detailItem;
    const catId = src?.subCategory?.category?._id || "";
    const subId = src?.subCategory?._id || src?.subCategory || "";
    const brandId = src?.brand?._id || src?.brand || "";
    setEditingId(src?._id || "");
    setEditCategoryId(catId);
    setEditSubCategoryId(subId);
    setEditBrandId(brandId);
    setEditTitle(src?.title || "");
    setEditDescription(src?.description || "");
    setEditImageFile(null);
    setEditActive(Boolean(src?.active));
    setEditStatus({ type: "", message: "" });
    loadEditSubcategories(catId, subId);
  };

  const cancelEdit = () => {
    setEditingId("");
    setEditCategoryId("");
    setEditSubCategories([]);
    setEditSubCategoryId("");
    setEditBrandId("");
    setEditTitle("");
    setEditDescription("");
    setEditMetaTitle("");
    setEditMetaDescription("");
    setEditMetaKeywords("");
    setEditImageFile(null);
    setEditImagePreview(null);
    setEditActive(true);
    setEditStatus({ type: "", message: "" });
  };

  const closeDetail = () => {
    setSelectedId(null);
    cancelEdit();
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
      fd.append("subCategoryId", formSubCategoryId);
      if (formBrandId) fd.append("brandId", formBrandId);
      fd.append("title", title.trim());
      if (description.trim()) fd.append("description", description.trim());
      fd.append("active", String(active));
      if (imageFile) fd.append("image", imageFile);

      const prodRes = await apiClient.post("/api/products", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      const newProd = prodRes?.data?.item;

      if (newProd && (metaTitle || metaDescription || metaKeywords)) {
        await apiClient.put("/api/admin/seo/upsert", {
          pageType: "product",
          pageKey: newProd._id,
          metaTitle,
          metaDescription,
          metaKeywords,
        });
      }

      setStatus({ type: "success", message: "Product created successfully." });
      await fetchProducts(listSubCategoryId);
      resetForm();
      setIsFormOpen(false);
    } catch (err) {
      const message =
        err?.response?.data?.message || err?.message || "Failed to create product.";
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
      fd.append("subCategoryId", editSubCategoryId);
      fd.append("brandId", editBrandId || "");
      fd.append("title", editTitle.trim());
      fd.append("description", editDescription.trim());
      fd.append("active", String(editActive));
      if (editImageFile) fd.append("image", editImageFile);

      await apiClient.put(`/api/products/${editingId}`, fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      await apiClient.put("/api/admin/seo/upsert", {
        pageType: "product",
        pageKey: editingId,
        metaTitle: editMetaTitle,
        metaDescription: editMetaDescription,
        metaKeywords: editMetaKeywords,
      });

      setEditStatus({ type: "success", message: "Product updated successfully." });
      await fetchProducts(listSubCategoryId);
      if (selectedId === editingId) fetchProductDetail(editingId);
      cancelEdit();
    } catch (err) {
      const message =
        err?.response?.data?.message || err?.message || "Failed to update product.";
      setEditStatus({ type: "error", message });
    } finally {
      setIsUpdating(false);
    }
  };

  const onDelete = async (id) => {
    const ok = window.confirm("Delete this product?");
    if (!ok) return;

    setDeletingId(id);
    try {
      await apiClient.delete(`/api/products/${id}`);
      await fetchProducts(listSubCategoryId);
      if (editingId === id) cancelEdit();
      if (selectedId === id) closeDetail();
    } catch (err) {
      const message =
        err?.response?.data?.message || err?.message || "Failed to delete product.";
      setStatus({ type: "error", message });
    } finally {
      setDeletingId("");
    }
  };

  return (
    <AdminShell
      testId="page-admin-products"
      title="Products"
      subtitle="Create and manage products under a subcategory."
      headerBare
      sectionBare
      actions={
        <Button
            testId="button-admin-product-add"
            variant={isFormOpen ? "secondary" : "primary"}
            onClick={() => {
              setStatus({ type: "", message: "" });
              setIsFormOpen((s) => !s);
            }}
          >
            {isFormOpen ? "Close" : "Add Product"}
          </Button>
      }
    >

          {isFormOpen ? (
            <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/50 backdrop-blur-sm p-6 py-8">
              <form
                onSubmit={onSubmit}
                className="relative z-[60] mx-auto grid w-full max-w-2xl gap-4 rounded-2xl border-2 border-blue-500 bg-card p-4 shadow-xl sm:p-5"
                onClick={(e) => e.stopPropagation()}
              >
              <div className="flex items-center gap-3">
                <img src={logo} alt="" className="h-8 w-8 shrink-0 object-contain" aria-hidden />
                <h2 className="text-lg font-semibold">Create new product</h2>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="text-sm font-medium text-foreground" htmlFor="product-category">
                    Category
                  </label>
                  <select
                    id="product-category"
                    data-testid="select-admin-product-category"
                    value={formCategoryId}
                    onChange={(e) => setFormCategoryId(e.target.value)}
                    className="mt-2 h-11 w-full rounded-xl border border-border/70 bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
                  >
                    <option value="">Select a category…</option>
                    {categories.map((c) => (
                      <option key={c._id} value={c._id}>
                        {c.title}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-sm font-medium text-foreground" htmlFor="product-subcategory">
                    Subcategory
                  </label>
                  <select
                    id="product-subcategory"
                    data-testid="select-admin-product-subcategory"
                    value={formSubCategoryId}
                    onChange={(e) => setFormSubCategoryId(e.target.value)}
                    disabled={!formCategoryId}
                    className="mt-2 h-11 w-full rounded-xl border border-border/70 bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring disabled:opacity-60"
                  >
                    <option value="">
                      {formCategoryId ? "Select a subcategory…" : "Select category first…"}
                    </option>
                    {formSubCategories.map((s) => (
                      <option key={s._id} value={s._id}>
                        {s.title}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-sm font-medium text-foreground" htmlFor="product-brand">
                    Brand (optional)
                  </label>
                  <select
                    id="product-brand"
                    data-testid="select-admin-product-brand"
                    value={formBrandId}
                    onChange={(e) => setFormBrandId(e.target.value)}
                    className="mt-2 h-11 w-full rounded-xl border border-border/70 bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
                  >
                    <option value="">No brand</option>
                    {brands.map((b) => (
                      <option key={b._id} value={b._id}>
                        {b.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-foreground" htmlFor="product-title">
                  Title
                </label>
                <input
                  id="product-title"
                  data-testid="input-admin-product-title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="mt-2 h-11 w-full rounded-xl border border-border/70 bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
                  placeholder="e.g. API 6D Gate Valve"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-foreground" htmlFor="product-description">
                  Description (optional)
                </label>
                <textarea
                  id="product-description"
                  data-testid="input-admin-product-description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="mt-2 min-h-[96px] w-full rounded-xl border border-border/70 bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
                  placeholder="Short description…"
                />
              </div>

              <div className="rounded-xl border border-border/60 bg-muted/20 p-4">
                <p className="mb-3 text-sm font-medium text-foreground">SEO (optional)</p>
                <div className="space-y-3">
                  <div>
                    <label className="text-xs font-medium text-muted-foreground" htmlFor="product-meta-title">Meta Title</label>
                    <input id="product-meta-title" value={metaTitle} onChange={(e) => setMetaTitle(e.target.value)} className="mt-1 h-10 w-full rounded-lg border border-border/70 bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring" placeholder="Page title for search engines" />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-muted-foreground" htmlFor="product-meta-desc">Meta Description</label>
                    <textarea id="product-meta-desc" value={metaDescription} onChange={(e) => setMetaDescription(e.target.value)} className="mt-1 min-h-[60px] w-full rounded-lg border border-border/70 bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring" placeholder="Short description for search results" />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-muted-foreground" htmlFor="product-meta-keywords">Meta Keywords</label>
                    <input id="product-meta-keywords" value={metaKeywords} onChange={(e) => setMetaKeywords(e.target.value)} className="mt-1 h-10 w-full rounded-lg border border-border/70 bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring" placeholder="keyword1, keyword2, keyword3" />
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-foreground">Image (optional)</label>
                  <input ref={fileInputRef} id="product-image" data-testid="input-admin-product-image" type="file" accept="image/*" className="sr-only" onChange={(e) => setImageFile(e.target.files?.[0] ?? null)} />
                  <div role="button" tabIndex={0} onClick={() => fileInputRef.current?.click()} onKeyDown={(e) => e.key === "Enter" && fileInputRef.current?.click()} onDragOver={(e) => handleImageDragOver(e, false)} onDragLeave={(e) => handleImageDragLeave(e, false)} onDrop={(e) => handleImageDrop(e, setImageFile, false)} className={`mt-2 flex min-h-[120px] cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed transition-colors ${imageDropActive ? "border-primary bg-primary/5" : "border-border/70 bg-muted/30 hover:border-primary/50 hover:bg-muted/50"}`}>
                    {imagePreview ? (
                      <div className="relative w-full p-2">
                        <img src={imagePreview} alt="Preview" className="mx-auto max-h-24 rounded-lg object-contain" />
                        <button type="button" onClick={(e) => { e.stopPropagation(); setImageFile(null); fileInputRef.current && (fileInputRef.current.value = ""); }} className="absolute right-3 top-3 flex h-7 w-7 items-center justify-center rounded-full bg-black/60 text-white transition hover:bg-black/80" aria-label="Remove image">×</button>
                      </div>
                    ) : (
                      <>
                        <svg className="mb-2 h-10 w-10 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h14a2 2 0 012 2v14a2 2 0 01-2 2z" /></svg>
                        <span className="text-center text-sm font-medium text-foreground">Drop image here or click to browse</span>
                        <span className="mt-0.5 text-xs text-muted-foreground">PNG, JPG, WebP up to 5MB</span>
                      </>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium text-foreground">Active</span>
                  <button type="button" role="switch" aria-checked={active} data-testid="input-admin-product-active" onClick={() => setActive((s) => !s)} className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 ${active ? "bg-primary" : "bg-muted"}`}>
                    <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition-transform ${active ? "translate-x-5" : "translate-x-0.5"}`} />
                  </button>
                  <span className="text-sm text-muted-foreground">{active ? "On" : "Off"}</span>
                </div>
              </div>

              {status.message ? (
                <div
                  data-testid="status-admin-product"
                  className={
                    status.type === "success"
                      ? "rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700"
                      : "rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
                  }
                >
                  {status.message}
                </div>
              ) : null}

              <div className="mt-1 flex items-center gap-3">
                <Button
                  testId="button-admin-product-submit"
                  type="submit"
                  disabled={!canSubmit}
                >
                  {isSubmitting ? "Saving…" : "Create Product"}
                </Button>
                <Button variant="ghost" testId="button-admin-product-cancel" onClick={() => { resetForm(); setStatus({ type: "", message: "" }); setIsFormOpen(false); }}>
                  Cancel
                </Button>
              </div>
            </form>
            </div>
          ) : null}

          <div className="mt-8">
            <div className="mb-4 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div className="flex items-baseline justify-between border-b border-border/60 pb-3 sm:border-0 sm:pb-0">
                <h2 className="text-lg font-semibold tracking-tight text-foreground">All products</h2>
                <span className="text-sm text-muted-foreground sm:ml-3">{isLoading ? "Loading…" : `${items.length} product${items.length === 1 ? "" : "s"}`}</span>
              </div>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 lg:items-end">
                <div>
                  <label className="text-xs font-medium text-muted-foreground" htmlFor="filter-product-category">
                    Filter category
                  </label>
                  <select
                    id="filter-product-category"
                    data-testid="select-admin-product-filter-category"
                    value={listCategoryId}
                    onChange={(e) => setListCategoryId(e.target.value)}
                    className="mt-2 h-11 w-full rounded-xl border border-border/70 bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
                  >
                    <option value="">All categories</option>
                    {categories.map((c) => (
                      <option key={c._id} value={c._id}>
                        {c.title}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-medium text-muted-foreground" htmlFor="filter-product-subcategory">
                    Filter subcategory
                  </label>
                  <select
                    id="filter-product-subcategory"
                    data-testid="select-admin-product-filter-subcategory"
                    value={listSubCategoryId}
                    onChange={(e) => setListSubCategoryId(e.target.value)}
                    disabled={!listCategoryId}
                    className="mt-2 h-11 w-full rounded-xl border border-border/70 bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring disabled:opacity-60"
                  >
                    <option value="">
                      {listCategoryId ? "All subcategories" : "Select category first…"}
                    </option>
                    {listSubCategories.map((s) => (
                      <option key={s._id} value={s._id}>
                        {s.title}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="lg:justify-self-end" />
              </div>
            </div>

            {loadError ? (
              <div data-testid="status-admin-products-load-error" className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {loadError}
              </div>
            ) : null}

            {!isLoading && !loadError && items.length === 0 ? (
              <div className="mt-4 flex flex-col items-center justify-center rounded-lg border border-dashed border-border/60 bg-muted/20 px-6 py-12 text-center">
                <p className="text-sm font-medium text-foreground">No products found</p>
                <p className="mt-1 text-sm text-muted-foreground">Select a subcategory or create one.</p>
              </div>
            ) : null}

            {!isLoading && !loadError && items.length > 0 ? (
              <div className="mt-4 grid grid-cols-2 gap-5 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                {items.map((item) => (
                  <button
                    key={item._id}
                    type="button"
                    data-testid={`card-admin-product-${item._id}`}
                    onClick={() => setSelectedId(item._id)}
                    className={`group flex flex-col items-center gap-4 rounded-2xl border-2 bg-card p-6 text-left shadow-sm transition-all hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 ${
                      selectedId === item._id ? "border-primary shadow-lg ring-2 ring-primary/20" : "border-border/60 hover:border-primary/40"
                    }`}
                  >
                    <div className="flex h-40 w-40 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-muted shadow-inner">
                      {item.imageUrl ? (
                        <img src={toPublicUrl(item.imageUrl)} alt="" className="h-full w-full object-contain p-2 transition-transform group-hover:scale-105" loading="lazy" />
                      ) : (
                        <svg className="h-20 w-20 text-muted-foreground/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14" />
                        </svg>
                      )}
                    </div>
                    <span className="w-full truncate text-center text-base font-semibold text-foreground">{item.title}</span>
                    <div className="flex flex-wrap items-center justify-center gap-1">
                      {item.brand ? (
                        <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700">
                          {item.brand.name}
                        </span>
                      ) : null}
                      {seoByProductId[item._id] ? (
                        <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-700">SEO</span>
                      ) : null}
                    </div>
                  </button>
                ))}
              </div>
            ) : null}
          </div>

          {selectedId ? (
            <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/50 backdrop-blur-sm p-4 py-8" onClick={closeDetail} role="dialog" aria-modal="true">
              <div className="relative z-[60] w-full max-w-lg rounded-2xl border-2 border-blue-500 bg-card shadow-2xl" onClick={(e) => e.stopPropagation()}>
                <button type="button" onClick={closeDetail} className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-muted/80 text-muted-foreground transition hover:bg-muted" aria-label="Close">×</button>
                {detailLoading ? (
                  <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
                    <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                    <p className="mt-3 text-sm">Loading…</p>
                  </div>
                ) : detailError ? (
                  <div className="p-6">
                    <p className="text-sm text-red-600">{detailError}</p>
                    <Button variant="ghost" className="mt-4" onClick={closeDetail}>Close</Button>
                  </div>
                ) : editingId === selectedId ? (
                  <form onSubmit={onUpdate} className="p-6 pt-12">
                    <div className="grid gap-3">
                      <div className="grid gap-3 sm:grid-cols-2">
                        <div>
                          <label className="text-xs font-medium text-muted-foreground">Category</label>
                            <select
                              data-testid="select-admin-product-edit-category"
                              value={editCategoryId}
                              onChange={(e) => {
                                const next = e.target.value;
                                setEditCategoryId(next);
                                loadEditSubcategories(next, "");
                              }}
                              className="mt-2 h-11 w-full rounded-xl border border-border/70 bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
                            >
                              <option value="">Select a category…</option>
                              {categories.map((c) => (
                                <option key={c._id} value={c._id}>
                                  {c.title}
                                </option>
                              ))}
                            </select>
                          </div>

                          <div>
                            <label className="text-xs font-medium text-muted-foreground">Subcategory</label>
                            <select
                              data-testid="select-admin-product-edit-subcategory"
                              value={editSubCategoryId}
                              onChange={(e) => setEditSubCategoryId(e.target.value)}
                              disabled={!editCategoryId}
                              className="mt-2 h-11 w-full rounded-xl border border-border/70 bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring disabled:opacity-60"
                            >
                              <option value="">
                                {editCategoryId ? "Select a subcategory…" : "Select category first…"}
                              </option>
                              {editSubCategories.map((s) => (
                                <option key={s._id} value={s._id}>
                                  {s.title}
                                </option>
                              ))}
                            </select>
                        </div>

                        <div>
                          <label className="text-xs font-medium text-muted-foreground">Brand</label>
                          <select
                            data-testid="select-admin-product-edit-brand"
                            value={editBrandId}
                            onChange={(e) => setEditBrandId(e.target.value)}
                            className="mt-2 h-11 w-full rounded-xl border border-border/70 bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
                          >
                            <option value="">No brand</option>
                            {brands.map((b) => (
                              <option key={b._id} value={b._id}>
                                {b.name}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>

                        <div>
                          <label className="text-xs font-medium text-muted-foreground">Title</label>
                          <input
                            data-testid="input-admin-product-edit-title"
                            value={editTitle}
                            onChange={(e) => setEditTitle(e.target.value)}
                            className="mt-2 h-11 w-full rounded-xl border border-border/70 bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
                          />
                        </div>

                        <div>
                          <label className="text-xs font-medium text-muted-foreground">Description</label>
                          <textarea
                            data-testid="input-admin-product-edit-description"
                            value={editDescription}
                            onChange={(e) => setEditDescription(e.target.value)}
                            className="mt-2 min-h-[84px] w-full rounded-xl border border-border/70 bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
                          />
                        </div>

                        <div className="rounded-xl border border-border/60 bg-muted/20 p-3">
                          <p className="mb-2 text-xs font-medium text-muted-foreground">SEO (optional)</p>
                          <div className="space-y-2">
                            <div>
                              <label className="text-xs text-muted-foreground">Meta Title</label>
                              <input value={editMetaTitle} onChange={(e) => setEditMetaTitle(e.target.value)} className="mt-1 h-9 w-full rounded-lg border border-border/70 bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring" placeholder="Meta title" />
                            </div>
                            <div>
                              <label className="text-xs text-muted-foreground">Meta Description</label>
                              <textarea value={editMetaDescription} onChange={(e) => setEditMetaDescription(e.target.value)} className="mt-1 min-h-[56px] w-full rounded-lg border border-border/70 bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring" placeholder="Meta description" />
                            </div>
                            <div>
                              <label className="text-xs text-muted-foreground">Meta Keywords</label>
                              <input value={editMetaKeywords} onChange={(e) => setEditMetaKeywords(e.target.value)} className="mt-1 h-9 w-full rounded-lg border border-border/70 bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring" placeholder="keyword1, keyword2" />
                            </div>
                          </div>
                        </div>

                        <div className="space-y-3">
                          <div>
                            <label className="text-xs font-medium text-muted-foreground">Replace image (optional)</label>
                            <input ref={editFileInputRef} type="file" accept="image/*" className="sr-only" onChange={(e) => setEditImageFile(e.target.files?.[0] ?? null)} />
                            <div role="button" tabIndex={0} onClick={() => editFileInputRef.current?.click()} onKeyDown={(e) => e.key === "Enter" && editFileInputRef.current?.click()} onDragOver={(e) => handleImageDragOver(e, true)} onDragLeave={(e) => handleImageDragLeave(e, true)} onDrop={(e) => handleImageDrop(e, setEditImageFile, true)} className={`mt-2 flex min-h-[100px] cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed transition-colors ${editImageDropActive ? "border-primary bg-primary/5" : "border-border/70 bg-muted/30 hover:border-primary/50 hover:bg-muted/50"}`}>
                              {editImagePreview || detailItem?.imageUrl ? (
                                <div className="relative w-full p-2">
                                  <img src={editImagePreview || toPublicUrl(detailItem?.imageUrl)} alt="Preview" className="mx-auto max-h-20 rounded-lg object-contain" />
                                  {editImageFile && (
                                    <button type="button" onClick={(e) => { e.stopPropagation(); setEditImageFile(null); editFileInputRef.current && (editFileInputRef.current.value = ""); }} className="absolute right-3 top-3 flex h-6 w-6 items-center justify-center rounded-full bg-black/60 text-sm text-white transition hover:bg-black/80" aria-label="Remove selected image">×</button>
                                  )}
                                </div>
                              ) : (
                                <>
                                  <svg className="mb-1 h-8 w-8 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h14a2 2 0 012 2v14a2 2 0 01-2 2z" /></svg>
                                  <span className="text-center text-xs font-medium text-foreground">Drop or click to replace</span>
                                </>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="text-sm font-medium text-foreground">Active</span>
                            <button type="button" role="switch" aria-checked={editActive} data-testid="input-admin-product-edit-active" onClick={() => setEditActive((s) => !s)} className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 ${editActive ? "bg-primary" : "bg-muted"}`}>
                              <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition-transform ${editActive ? "translate-x-5" : "translate-x-0.5"}`} />
                            </button>
                            <span className="text-sm text-muted-foreground">{editActive ? "On" : "Off"}</span>
                          </div>
                        </div>
                      </div>

                        {editStatus.message ? (
                          <div data-testid="status-admin-product-edit" className={`mt-3 rounded-xl px-4 py-3 text-sm ${editStatus.type === "success" ? "border border-green-200 bg-green-50 text-green-700" : "border border-red-200 bg-red-50 text-red-700"}`}>
                            {editStatus.message}
                          </div>
                        ) : null}
                        <div className="mt-4 flex gap-3">
                          <Button type="submit" disabled={isUpdating || !editSubCategoryId || editTitle.trim().length === 0}>{isUpdating ? "Saving…" : "Save changes"}</Button>
                          <Button variant="ghost" onClick={cancelEdit}>Cancel</Button>
                        </div>
                      </form>
                ) : detailItem ? (
                  <div className="p-6 pt-12">
                    <div className="flex flex-col items-center">
                      <div className="flex h-32 w-32 items-center justify-center overflow-hidden rounded-2xl bg-muted">
                        {detailItem.imageUrl ? (
                          <img src={toPublicUrl(detailItem.imageUrl)} alt="" className="h-full w-full object-contain p-2" />
                        ) : (
                          <svg className="h-14 w-14 text-muted-foreground/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14" />
                          </svg>
                        )}
                      </div>
                      <h3 className="mt-4 text-xl font-semibold text-foreground">{detailItem.title}</h3>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {detailItem.subCategory?.category?.title || "—"} / {detailItem.subCategory?.title || "—"}
                      </p>
                      {detailItem.brand ? (
                        <p className="mt-1 text-sm text-muted-foreground">
                          Brand: <span className="font-medium text-foreground">{detailItem.brand.name}</span>
                        </p>
                      ) : null}
                      <span className={`mt-2 rounded-full px-3 py-0.5 text-xs font-medium ${detailItem.active ? "bg-emerald-100 text-emerald-700" : "bg-muted text-muted-foreground"}`}>
                        {detailItem.active ? "Active" : "Inactive"}
                      </span>
                    </div>
                    <div className="mt-6">
                      <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Description</p>
                      <p className="mt-2 text-sm text-foreground">{detailItem.description || "No description."}</p>
                    </div>
                    {(editMetaTitle || editMetaDescription || editMetaKeywords) ? (
                      <div className="mt-6 rounded-xl border border-border/60 bg-muted/20 p-4">
                        <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">SEO</p>
                        <div className="mt-2 space-y-2 text-sm">
                          {editMetaTitle ? <div><span className="text-muted-foreground">Meta Title: </span><span className="text-foreground">{editMetaTitle}</span></div> : null}
                          {editMetaDescription ? <div><span className="text-muted-foreground">Meta Description: </span><span className="text-foreground">{editMetaDescription}</span></div> : null}
                          {editMetaKeywords ? <div><span className="text-muted-foreground">Meta Keywords: </span><span className="text-foreground">{editMetaKeywords}</span></div> : null}
                        </div>
                      </div>
                    ) : null}
                    <div className="mt-6 flex gap-2 border-t border-border/60 pt-4">
                      <Button variant="secondary" size="sm" data-testid="button-admin-product-edit" onClick={() => startEdit()} className="h-10 w-10 rounded-full p-0" aria-label="Edit product">
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="secondary" size="sm" data-testid="button-admin-product-delete" disabled={deletingId === selectedId} className="h-10 w-10 rounded-full p-0 border-red-200/80 text-red-600 hover:bg-red-50" onClick={() => onDelete(selectedId)} aria-label={deletingId === selectedId ? "Deleting…" : "Delete product"}>
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

