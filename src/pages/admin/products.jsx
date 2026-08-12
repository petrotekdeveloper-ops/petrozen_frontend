import { useEffect, useMemo, useRef, useState } from "react";
import Button from "@/components/Button";
import { ArrowLeft, ImagePlus, Pencil, Trash2, X } from "lucide-react";
import { apiClient } from "@/lib/apiClient";
import AdminShell from "@/components/admin/AdminShell";
import KeywordTagsInput from "@/components/admin/KeywordTagsInput";
import { IMAGES } from "@/lib/images";

const DEFAULT_VARIETY_KEYWORD = "grade";
const MAX_PRODUCT_IMAGES = 15;

function normalizeProductImages(item) {
  if (!item) return [];
  if (Array.isArray(item.images) && item.images.length) return item.images.filter(Boolean);
  if (item.imageUrl) return [item.imageUrl];
  return [];
}

function varietyKeywordFromProduct(src) {
  const k = String(src?.varietyKeyword || "").trim();
  if (k) return k;
  if (Array.isArray(src?.varieties) && src.varieties.length > 0) {
    return String(src.varieties[0]?.keyword || DEFAULT_VARIETY_KEYWORD).trim() || DEFAULT_VARIETY_KEYWORD;
  }
  return DEFAULT_VARIETY_KEYWORD;
}

function varietyValuesTextFromProduct(src) {
  if (Array.isArray(src?.varietyValues) && src.varietyValues.length > 0) {
    return src.varietyValues.map((s) => String(s || "").trim()).filter(Boolean).join("\n");
  }
  if (Array.isArray(src?.varieties) && src.varieties.length > 0) {
    return src.varieties.map((v) => String(v.grade || "").trim()).filter(Boolean).join("\n");
  }
  if (Array.isArray(src?.grades) && src.grades.length > 0) {
    return src.grades.map((g) => String(g || "").trim()).filter(Boolean).join("\n");
  }
  return "";
}

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
  const [imageFiles, setImageFiles] = useState([]);
  const [catalogFile, setCatalogFile] = useState(null);
  const [catalogPreview, setCatalogPreview] = useState(null);
  const [featuresText, setFeaturesText] = useState("");
  const [specificationsText, setSpecificationsText] = useState("");
  const [applicationsText, setApplicationsText] = useState("");
  const [varietyKeyword, setVarietyKeyword] = useState(DEFAULT_VARIETY_KEYWORD);
  const [varietyValuesText, setVarietyValuesText] = useState("");
  const [sort, setSort] = useState("");
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
  const [editKeptUrls, setEditKeptUrls] = useState([]);
  const [editNewFiles, setEditNewFiles] = useState([]);
  const [editCatalogFile, setEditCatalogFile] = useState(null);
  const [editCatalogPreview, setEditCatalogPreview] = useState(null);
  const [editFeaturesText, setEditFeaturesText] = useState("");
  const [editSpecificationsText, setEditSpecificationsText] = useState("");
  const [editApplicationsText, setEditApplicationsText] = useState("");
  const [editVarietyKeyword, setEditVarietyKeyword] = useState(DEFAULT_VARIETY_KEYWORD);
  const [editVarietyValuesText, setEditVarietyValuesText] = useState("");
  const [editSort, setEditSort] = useState("");
  const [editActive, setEditActive] = useState(true);
  const [editStatus, setEditStatus] = useState({ type: "", message: "" });
  const [isUpdating, setIsUpdating] = useState(false);
  const [deletingId, setDeletingId] = useState("");
  const [imageDropActive, setImageDropActive] = useState(false);
  const [catalogDropActive, setCatalogDropActive] = useState(false);
  const [editImageDropActive, setEditImageDropActive] = useState(false);
  const [editCatalogDropActive, setEditCatalogDropActive] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const [detailItem, setDetailItem] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState("");
  const fileInputRef = useRef(null);
  const editFileInputRef = useRef(null);
  const catalogFileInputRef = useRef(null);
  const editCatalogFileInputRef = useRef(null);

  const apiBase = import.meta.env.VITE_API_BASE_URL || "";
  const toPublicUrl = (maybePath) => {
    if (!maybePath) return "";
    if (/^https?:\/\//i.test(maybePath)) return maybePath;
    const base = String(apiBase).replace(/\/$/, "");
    const path = String(maybePath).startsWith("/") ? maybePath : `/${maybePath}`;
    return `${base}${path}`;
  };

  const parseTextList = (value) =>
    String(value || "")
      .split(/\r?\n/)
      .map((x) => x.trim())
      .filter(Boolean);

  const listToTextarea = (value) =>
    Array.isArray(value) ? value.filter(Boolean).join("\n") : "";

  const isImageType = (file) => Boolean(file?.type?.startsWith("image/"));
  const isPdfType = (file) => String(file?.type || "").toLowerCase() === "application/pdf";
  const isCatalogType = (file) => isImageType(file) || isPdfType(file);

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
    setSort("");
    setMetaTitle("");
    setMetaDescription("");
    setMetaKeywords("");
    setImageFiles([]);
    setCatalogFile(null);
    setCatalogPreview(null);
    setFeaturesText("");
    setSpecificationsText("");
    setApplicationsText("");
    setVarietyKeyword(DEFAULT_VARIETY_KEYWORD);
    setVarietyValuesText("");
    setActive(true);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const createImagePreviews = useMemo(() => {
    return imageFiles.map((f) => ({ file: f, url: URL.createObjectURL(f) }));
  }, [imageFiles]);

  useEffect(() => {
    return () => {
      createImagePreviews.forEach((p) => URL.revokeObjectURL(p.url));
    };
  }, [createImagePreviews]);

  const editNewPreviews = useMemo(() => {
    return editNewFiles.map((f) => ({ file: f, url: URL.createObjectURL(f) }));
  }, [editNewFiles]);

  useEffect(() => {
    return () => {
      editNewPreviews.forEach((p) => URL.revokeObjectURL(p.url));
    };
  }, [editNewPreviews]);

  useEffect(() => {
    if (catalogFile?.type?.startsWith("image/")) {
      const url = URL.createObjectURL(catalogFile);
      setCatalogPreview(url);
      return () => URL.revokeObjectURL(url);
    }
    setCatalogPreview(null);
  }, [catalogFile]);

  useEffect(() => {
    if (editCatalogFile?.type?.startsWith("image/")) {
      const url = URL.createObjectURL(editCatalogFile);
      setEditCatalogPreview(url);
      return () => URL.revokeObjectURL(url);
    }
    setEditCatalogPreview(null);
  }, [editCatalogFile]);

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
      const prod = prodRes?.data?.item ?? null;
      setDetailItem(prod);
      setEditSort(prod?.sort ?? "");
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
    const id = src?._id || "";
    const catId = src?.subCategory?.category?._id || "";
    const subId = src?.subCategory?._id || src?.subCategory || "";
    const brandId = src?.brand?._id || src?.brand || "";
    setEditingId(id);
    setEditCategoryId(catId);
    setEditSubCategoryId(subId);
    setEditBrandId(brandId);
    setEditTitle(src?.title || "");
    setEditDescription(src?.description || "");
    setEditFeaturesText(listToTextarea(src?.features));
    setEditSpecificationsText(listToTextarea(src?.specifications));
    setEditApplicationsText(listToTextarea(src?.applications));
    setEditVarietyKeyword(varietyKeywordFromProduct(src));
    setEditVarietyValuesText(varietyValuesTextFromProduct(src));
    setEditSort(src?.sort ?? "");
    setEditKeptUrls(normalizeProductImages(src));
    setEditNewFiles([]);
    setEditCatalogFile(null);
    setEditCatalogPreview(null);
    setEditActive(Boolean(src?.active));
    setEditStatus({ type: "", message: "" });
    const seo = seoByProductId[id];
    if (seo) {
      setEditMetaTitle(seo.metaTitle ?? "");
      setEditMetaDescription(seo.metaDescription ?? "");
      setEditMetaKeywords(seo.metaKeywords ?? "");
    }
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
    setEditFeaturesText("");
    setEditSpecificationsText("");
    setEditApplicationsText("");
    setEditVarietyKeyword(DEFAULT_VARIETY_KEYWORD);
    setEditVarietyValuesText("");
    setEditSort("");
    setEditMetaTitle("");
    setEditMetaDescription("");
    setEditMetaKeywords("");
    setEditKeptUrls([]);
    setEditNewFiles([]);
    setEditCatalogFile(null);
    setEditCatalogPreview(null);
    if (editFileInputRef.current) editFileInputRef.current.value = "";
    setEditActive(true);
    setEditStatus({ type: "", message: "" });
  };

  const appendProductImageFiles = (fileList, isEdit) => {
    const incoming = Array.from(fileList || []).filter((f) => isImageType(f));
    if (!incoming.length) return;
    if (isEdit) {
      setEditNewFiles((prev) => {
        const room = MAX_PRODUCT_IMAGES - editKeptUrls.length - prev.length;
        return [...prev, ...incoming.slice(0, Math.max(0, room))];
      });
    } else {
      setImageFiles((prev) => [...prev, ...incoming.slice(0, Math.max(0, MAX_PRODUCT_IMAGES - prev.length))]);
    }
  };

  const handleImageDrop = (e, isEdit) => {
    e.preventDefault();
    e.stopPropagation();
    if (isEdit) setEditImageDropActive(false);
    else setImageDropActive(false);
    appendProductImageFiles(e.dataTransfer?.files, isEdit);
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

  const handleCatalogDrop = (e, setFile, isEdit) => {
    e.preventDefault();
    e.stopPropagation();
    if (isEdit) setEditCatalogDropActive(false);
    else setCatalogDropActive(false);
    const file = e.dataTransfer?.files?.[0];
    if (isCatalogType(file)) setFile(file);
  };

  const handleCatalogDragOver = (e, isEdit) => {
    e.preventDefault();
    e.stopPropagation();
    if (isEdit) setEditCatalogDropActive(true);
    else setCatalogDropActive(true);
  };

  const handleCatalogDragLeave = (e, isEdit) => {
    e.preventDefault();
    e.stopPropagation();
    if (isEdit) setEditCatalogDropActive(false);
    else setCatalogDropActive(false);
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
      fd.append("features", JSON.stringify(parseTextList(featuresText)));
      fd.append("specifications", JSON.stringify(parseTextList(specificationsText)));
      fd.append("applications", JSON.stringify(parseTextList(applicationsText)));
      fd.append("varietyKeyword", (varietyKeyword || DEFAULT_VARIETY_KEYWORD).trim() || DEFAULT_VARIETY_KEYWORD);
      fd.append("varietyValues", JSON.stringify(parseTextList(varietyValuesText)));
      if (sort.trim()) fd.append("sort", sort.trim());
      fd.append("active", String(active));
      imageFiles.forEach((file) => fd.append("images", file));
      if (catalogFile) fd.append("catelog", catalogFile);

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
      fd.append("features", JSON.stringify(parseTextList(editFeaturesText)));
      fd.append("specifications", JSON.stringify(parseTextList(editSpecificationsText)));
      fd.append("applications", JSON.stringify(parseTextList(editApplicationsText)));
      fd.append("varietyKeyword", (editVarietyKeyword || DEFAULT_VARIETY_KEYWORD).trim() || DEFAULT_VARIETY_KEYWORD);
      fd.append("varietyValues", JSON.stringify(parseTextList(editVarietyValuesText)));
      fd.append("sort", (editSort || "").trim());
      fd.append("active", String(editActive));
      fd.append("existingImages", JSON.stringify(editKeptUrls));
      editNewFiles.forEach((file) => fd.append("images", file));
      if (editCatalogFile) fd.append("catelog", editCatalogFile);

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
      await fetchProductDetail(editingId);
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
      if (selectedId === id) setSelectedId(null);
    } catch (err) {
      const message =
        err?.response?.data?.message || err?.message || "Failed to delete product.";
      setStatus({ type: "error", message });
    } finally {
      setDeletingId("");
    }
  };

  const showDetail = selectedId && !editingId && !isFormOpen;

  return (
    <AdminShell
      testId="page-admin-products"
      title={showDetail ? "Product detail" : "Products"}
      subtitle={showDetail ? "" : "Create and manage products under a subcategory."}
      headerBare
      sectionBare
      actions={
        isFormOpen ? (
          <button
            type="button"
            data-testid="button-admin-product-add"
            aria-label="Close"
            onClick={() => { setStatus({ type: "", message: "" }); setIsFormOpen(false); resetForm(); }}
            className="p-1 text-muted-foreground hover:text-foreground rounded transition focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <X className="h-5 w-5" aria-hidden />
          </button>
        ) : editingId ? (
          <Button variant="ghost" data-testid="button-admin-product-cancel-edit" onClick={() => { setEditStatus({ type: "", message: "" }); cancelEdit(); }}>
            Cancel edit
          </Button>
        ) : selectedId ? (
          <Button variant="ghost" data-testid="button-admin-product-back" onClick={() => setSelectedId(null)}>
            <ArrowLeft className="h-4 w-4 mr-1.5" aria-hidden />
            Back to list
          </Button>
        ) : (
          <Button
            testId="button-admin-product-add"
            variant="primary"
            onClick={() => {
              setStatus({ type: "", message: "" });
              setIsFormOpen(true);
              cancelEdit();
              setSelectedId(null);
            }}
          >
            Add Product
          </Button>
        )
      }
    >

          {isFormOpen ? (
            <div className="mt-8 border-t border-border/60 pt-8">
              <form onSubmit={onSubmit} className="w-full">
              <div className="space-y-6">
                <h2 className="text-xl font-semibold">Create new product</h2>

                <section className="rounded-xl border border-border/60 bg-muted/10 p-4">
                  <h3 className="text-sm font-semibold text-foreground">Selection</h3>
                  <div className="mt-3 grid gap-4 sm:grid-cols-2">
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
                      <label className="text-sm font-medium text-foreground" htmlFor="product-sort">Sort order (optional)</label>
                      <input
                        id="product-sort"
                        data-testid="input-admin-product-sort"
                        value={sort}
                        onChange={(e) => setSort(e.target.value)}
                        className="mt-2 h-11 w-full rounded-xl border border-border/70 bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
                        placeholder="e.g. 1, 2, 3 (lower = first)"
                      />
                    </div>

                    <div className="flex items-center gap-3 sm:col-span-2">
                      <span className="text-sm font-medium text-foreground">Active</span>
                      <button type="button" role="switch" aria-checked={active} data-testid="input-admin-product-active" onClick={() => setActive((s) => !s)} className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 ${active ? "bg-primary" : "bg-muted"}`}>
                        <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition-transform ${active ? "translate-x-5" : "translate-x-0.5"}`} />
                      </button>
                      <span className="text-sm text-muted-foreground">{active ? "On" : "Off"}</span>
                    </div>
                  </div>
                </section>

                <section className="rounded-xl border border-border/60 bg-muted/10 p-4">
                  <h3 className="text-sm font-semibold text-foreground">Description and Details</h3>
                  <div className="mt-3 grid gap-4">
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

                    <div>
                      <label className="text-sm font-medium text-foreground" htmlFor="product-features">
                        Features (optional)
                      </label>
                      <textarea
                        id="product-features"
                        data-testid="input-admin-product-features"
                        value={featuresText}
                        onChange={(e) => setFeaturesText(e.target.value)}
                        className="mt-2 min-h-[96px] w-full rounded-xl border border-border/70 bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
                        placeholder={"One item per line"}
                      />
                    </div>

                    <div>
                      <label className="text-sm font-medium text-foreground" htmlFor="product-specifications">
                        Specifications (optional)
                      </label>
                      <textarea
                        id="product-specifications"
                        data-testid="input-admin-product-specifications"
                        value={specificationsText}
                        onChange={(e) => setSpecificationsText(e.target.value)}
                        className="mt-2 min-h-[96px] w-full rounded-xl border border-border/70 bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
                        placeholder={"One item per line"}
                      />
                    </div>

                    <div>
                      <label className="text-sm font-medium text-foreground" htmlFor="product-applications">
                        Applications (optional)
                      </label>
                      <textarea
                        id="product-applications"
                        data-testid="input-admin-product-applications"
                        value={applicationsText}
                        onChange={(e) => setApplicationsText(e.target.value)}
                        className="mt-2 min-h-[96px] w-full rounded-xl border border-border/70 bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
                        placeholder={"One item per line"}
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="text-sm font-medium text-foreground" htmlFor="product-variety-keyword">
                        Variety keyword (optional)
                      </label>
                      <p className="mt-1 text-xs text-muted-foreground">
                        One label for all options below (default &quot;{DEFAULT_VARIETY_KEYWORD}&quot;). Examples: grade, material, size.
                      </p>
                      <input
                        id="product-variety-keyword"
                        data-testid="input-admin-product-variety-keyword"
                        value={varietyKeyword}
                        onChange={(e) => setVarietyKeyword(e.target.value)}
                        className="mt-2 h-11 w-full rounded-xl border border-border/70 bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
                        placeholder={DEFAULT_VARIETY_KEYWORD}
                      />
                      <label className="mt-4 block text-sm font-medium text-foreground" htmlFor="product-variety-values">
                        Values (optional)
                      </label>
                      <textarea
                        id="product-variety-values"
                        data-testid="input-admin-product-variety-values"
                        value={varietyValuesText}
                        onChange={(e) => setVarietyValuesText(e.target.value)}
                        className="mt-2 min-h-[96px] w-full rounded-xl border border-border/70 bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
                        placeholder={"One value per line\ne.g. API 5L X52"}
                      />
                    </div>
                  </div>
                </section>

                <section className="rounded-xl border border-border/60 bg-muted/10 p-4">
                  <h3 className="text-sm font-semibold text-foreground">Uploads</h3>
                  <div className="mt-3 grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="text-sm font-medium text-foreground">Product images (optional, up to {MAX_PRODUCT_IMAGES})</label>
                      <input
                        ref={fileInputRef}
                        id="product-image"
                        data-testid="input-admin-product-image"
                        type="file"
                        accept="image/jpeg,image/png,image/jpg"
                        multiple
                        className="sr-only"
                        onChange={(e) => {
                          appendProductImageFiles(e.target.files, false);
                          e.target.value = "";
                        }}
                      />
                      <div
                        role="button"
                        tabIndex={0}
                        onClick={() => fileInputRef.current?.click()}
                        onKeyDown={(e) => e.key === "Enter" && fileInputRef.current?.click()}
                        onDragOver={(e) => handleImageDragOver(e, false)}
                        onDragLeave={(e) => handleImageDragLeave(e, false)}
                        onDrop={(e) => handleImageDrop(e, false)}
                        className={`mt-2 flex min-h-[100px] cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed transition-colors ${imageDropActive ? "border-primary bg-primary/5" : "border-border/70 bg-muted/30 hover:border-primary/50 hover:bg-muted/50"}`}
                      >
                        <ImagePlus className="mb-1 h-8 w-8 text-muted-foreground" aria-hidden />
                        <span className="text-center text-xs font-medium text-foreground">Drop images here or click to browse</span>
                        <span className="mt-0.5 text-xs text-muted-foreground">JPEG or PNG, up to 5MB each</span>
                      </div>
                      {createImagePreviews.length > 0 ? (
                        <ul className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-4">
                          {createImagePreviews.map((p, i) => (
                            <li key={`${p.url}-${i}`} className="relative aspect-square overflow-hidden rounded-lg border border-border/60 bg-muted/40">
                              <img src={p.url} alt="" className="h-full w-full object-cover" />
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setImageFiles((prev) => prev.filter((_, idx) => idx !== i));
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

                    <div>
                      <label className="text-sm font-medium text-foreground">Catalog (image/pdf, optional)</label>
                      <input
                        ref={catalogFileInputRef}
                        id="product-catelog"
                        data-testid="input-admin-product-catelog"
                        type="file"
                        accept="image/*,.pdf,application/pdf"
                        className="sr-only"
                        onChange={(e) => {
                          const next = e.target.files?.[0] ?? null;
                          if (!next || isCatalogType(next)) setCatalogFile(next);
                        }}
                      />
                      <div
                        role="button"
                        tabIndex={0}
                        onClick={() => catalogFileInputRef.current?.click()}
                        onKeyDown={(e) => e.key === "Enter" && catalogFileInputRef.current?.click()}
                        onDragOver={(e) => handleCatalogDragOver(e, false)}
                        onDragLeave={(e) => handleCatalogDragLeave(e, false)}
                        onDrop={(e) => handleCatalogDrop(e, setCatalogFile, false)}
                        className={`mt-2 flex min-h-[100px] cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed transition-colors ${catalogDropActive ? "border-primary bg-primary/5" : "border-border/70 bg-muted/30 hover:border-primary/50 hover:bg-muted/50"}`}
                      >
                        {catalogFile ? (
                          <div className="relative w-full p-3 text-center">
                            {catalogPreview ? (
                              <img src={catalogPreview} alt="Catalog preview" className="mx-auto max-h-20 rounded-lg object-contain" />
                            ) : (
                              <p className="text-sm font-medium text-foreground">{catalogFile.name}</p>
                            )}
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setCatalogFile(null);
                                if (catalogFileInputRef.current) catalogFileInputRef.current.value = "";
                              }}
                              className="absolute right-3 top-3 flex h-6 w-6 items-center justify-center rounded-full bg-black/60 text-sm text-white transition hover:bg-black/80"
                              aria-label="Remove catalog file"
                            >
                              ×
                            </button>
                          </div>
                        ) : (
                          <>
                            <span className="text-center text-sm font-medium text-foreground">Drop catalog file here or click to browse</span>
                            <span className="mt-0.5 text-xs text-muted-foreground">Images or PDF up to 5MB</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </section>

                <section className="rounded-xl border border-border/60 bg-muted/10 p-4">
                  <h3 className="text-sm font-semibold text-foreground">SEO Details</h3>
                  <div className="mt-3 space-y-3">
                    <div>
                      <label className="text-xs font-medium text-muted-foreground" htmlFor="product-meta-title">Meta Title</label>
                      <input id="product-meta-title" value={metaTitle} onChange={(e) => setMetaTitle(e.target.value)} className="mt-1 h-10 w-full rounded-lg border border-border/70 bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring" placeholder="Page title for search engines" />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-muted-foreground" htmlFor="product-meta-desc">Meta Description</label>
                      <textarea id="product-meta-desc" value={metaDescription} onChange={(e) => setMetaDescription(e.target.value)} className="mt-1 min-h-[100px] w-full rounded-lg border border-border/70 bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring" placeholder="Short description for search results" />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-muted-foreground" htmlFor="product-meta-keywords">Meta Keywords</label>
                      <KeywordTagsInput
                        id="product-meta-keywords"
                        value={metaKeywords}
                        onChange={setMetaKeywords}
                        placeholder="Type keyword or sentence and press Enter"
                      />
                    </div>
                  </div>
                </section>
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

              <div className="mt-5 flex items-center gap-3">
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

          {selectedId && !editingId && !isFormOpen ? (
            <div className="mt-8 border-t border-border/60 pt-8">
              {detailLoading ? (
                <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
                  <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                  <p className="mt-3 text-sm">Loading…</p>
                </div>
              ) : detailError ? (
                <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{detailError}</div>
              ) : detailItem ? (
                <div className="space-y-6">
                  {/* Product hero: highlighted image + title */}
                  <section className="rounded-2xl border border-border/60 bg-card p-6 shadow-sm overflow-hidden">
                    <div className="flex flex-col gap-6 sm:flex-row sm:items-start">
                      <div className="shrink-0 flex justify-center sm:justify-start">
                        {normalizeProductImages(detailItem).length > 1 ? (
                          <div className="grid max-w-md grid-cols-2 gap-2">
                            {normalizeProductImages(detailItem).map((url) => (
                              <div key={url} className="overflow-hidden rounded-xl border border-border/60 bg-muted/20">
                                <img src={toPublicUrl(url)} alt="" className="aspect-square h-32 w-full object-contain p-2 sm:h-36" loading="lazy" />
                              </div>
                            ))}
                          </div>
                        ) : (
                          <img
                            src={toPublicUrl(normalizeProductImages(detailItem)[0] || detailItem.imageUrl) || IMAGES.LOGO}
                            alt={detailItem.title || "Product"}
                            className="h-64 w-64 object-contain"
                          />
                        )}
                      </div>
                      <div className="min-w-0 flex-1 space-y-3">
                        <h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">{detailItem.title || "—"}</h2>
                        <p className="text-sm text-muted-foreground">
                          {detailItem.subCategory?.category?.title || "—"}
                          <span className="mx-1.5">/</span>
                          {detailItem.subCategory?.title || "—"}
                        </p>
                        {detailItem.brand?.name ? (
                          <p className="text-sm text-muted-foreground">Brand: <span className="font-medium text-foreground">{detailItem.brand.name}</span></p>
                        ) : null}
                        <div className="flex flex-wrap items-center gap-2">
                          <span className={`rounded-full px-3 py-1 text-xs font-medium ${detailItem.active ? "bg-emerald-100 text-emerald-700" : "bg-muted text-muted-foreground"}`}>{detailItem.active ? "Active" : "Inactive"}</span>
                          {detailItem.catelog ? (
                            <a href={toPublicUrl(detailItem.catelog)} target="_blank" rel="noreferrer" className="inline-flex items-center rounded-full bg-amber-100 px-3 py-1 text-xs font-medium text-amber-700 hover:bg-amber-200">
                              Catalog
                            </a>
                          ) : null}
                        </div>
                        {detailItem.sort ? <p className="text-sm text-muted-foreground">Sort: <span className="font-medium text-foreground">{detailItem.sort}</span></p> : null}
                        <div className="flex items-center gap-3 pt-2">
                          <Button variant="primary" size="sm" data-testid="button-admin-product-edit" onClick={() => startEdit(detailItem)}>
                            <Pencil className="h-4 w-4 mr-1.5" aria-hidden />
                            Edit
                          </Button>
                          <Button variant="secondary" size="sm" data-testid="button-admin-product-delete" disabled={deletingId === selectedId} className="border-red-200/80 text-red-600 hover:bg-red-50" onClick={() => onDelete(selectedId)}>
                            <Trash2 className="h-4 w-4 mr-1.5" aria-hidden />
                            Delete
                          </Button>
                        </div>
                      </div>
                    </div>
                  </section>

                  <section className="rounded-xl border border-border/60 bg-muted/10 p-4">
                    <h3 className="text-sm font-semibold text-foreground">Description and Details</h3>
                    <div className="mt-3 grid gap-4">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Description</p>
                        <p className="mt-1 text-sm text-foreground">{detailItem.description || "No description."}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Features</p>
                        {Array.isArray(detailItem.features) && detailItem.features.length > 0 ? (
                          <ul className="mt-1 list-disc space-y-1 pl-5 text-sm text-foreground">{detailItem.features.map((e, i) => <li key={i}>{e}</li>)}</ul>
                        ) : <p className="mt-1 text-sm text-muted-foreground">—</p>}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Specifications</p>
                        {Array.isArray(detailItem.specifications) && detailItem.specifications.length > 0 ? (
                          <ul className="mt-1 list-disc space-y-1 pl-5 text-sm text-foreground">{detailItem.specifications.map((e, i) => <li key={i}>{e}</li>)}</ul>
                        ) : <p className="mt-1 text-sm text-muted-foreground">—</p>}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Applications</p>
                        {Array.isArray(detailItem.applications) && detailItem.applications.length > 0 ? (
                          <ul className="mt-1 list-disc space-y-1 pl-5 text-sm text-foreground">{detailItem.applications.map((e, i) => <li key={i}>{e}</li>)}</ul>
                        ) : <p className="mt-1 text-sm text-muted-foreground">—</p>}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Varieties</p>
                        {Array.isArray(detailItem.varietyValues) && detailItem.varietyValues.length > 0 ? (
                          <div className="mt-2 space-y-2">
                            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                              {detailItem.varietyKeyword || DEFAULT_VARIETY_KEYWORD}
                            </p>
                            <ul className="list-disc space-y-1 pl-5 text-sm text-foreground">
                              {detailItem.varietyValues.map((val, i) => (
                                <li key={i}>{val}</li>
                              ))}
                            </ul>
                          </div>
                        ) : (
                          <p className="mt-1 text-sm text-muted-foreground">—</p>
                        )}
                      </div>
                    </div>
                  </section>

                  <section className="rounded-xl border border-border/60 bg-muted/10 p-4">
                    <h3 className="text-sm font-semibold text-foreground">SEO Details</h3>
                    <div className="mt-3 space-y-3">
                      {editMetaTitle || editMetaDescription || editMetaKeywords ? (
                        <>
                          {editMetaTitle ? <div><p className="text-xs font-medium text-muted-foreground">Meta Title</p><p className="mt-1 text-sm text-foreground">{editMetaTitle}</p></div> : null}
                          {editMetaDescription ? <div><p className="text-xs font-medium text-muted-foreground">Meta Description</p><p className="mt-1 text-sm text-foreground">{editMetaDescription}</p></div> : null}
                          {editMetaKeywords ? <div><p className="text-xs font-medium text-muted-foreground">Meta Keywords</p><p className="mt-1 text-sm text-foreground">{editMetaKeywords}</p></div> : null}
                        </>
                      ) : <p className="text-sm text-muted-foreground">No SEO data configured.</p>}
                    </div>
                  </section>
                </div>
              ) : null}
            </div>
          ) : editingId && !isFormOpen ? (
            <div className="mt-8 border-t border-border/60 pt-8">
              <form onSubmit={onUpdate} className="w-full">
                <div className="space-y-6">
                  <h2 className="text-xl font-semibold">Edit product</h2>
                  <section className="rounded-xl border border-border/60 bg-muted/10 p-4">
                    <h3 className="text-sm font-semibold text-foreground">Selection</h3>
                    <div className="mt-3 grid gap-4 sm:grid-cols-2">
                      <div>
                        <label className="text-sm font-medium text-foreground">Category</label>
                        <select data-testid="select-admin-product-edit-category" value={editCategoryId} onChange={(e) => { const n = e.target.value; setEditCategoryId(n); loadEditSubcategories(n, ""); }} className="mt-2 h-11 w-full rounded-xl border border-border/70 bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring">
                          <option value="">Select a category…</option>
                          {categories.map((c) => <option key={c._id} value={c._id}>{c.title}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-foreground">Subcategory</label>
                        <select data-testid="select-admin-product-edit-subcategory" value={editSubCategoryId} onChange={(e) => setEditSubCategoryId(e.target.value)} disabled={!editCategoryId} className="mt-2 h-11 w-full rounded-xl border border-border/70 bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring disabled:opacity-60">
                          <option value="">{editCategoryId ? "Select a subcategory…" : "Select category first…"}</option>
                          {editSubCategories.map((s) => <option key={s._id} value={s._id}>{s.title}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-foreground">Brand</label>
                        <select data-testid="select-admin-product-edit-brand" value={editBrandId} onChange={(e) => setEditBrandId(e.target.value)} className="mt-2 h-11 w-full rounded-xl border border-border/70 bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring">
                          <option value="">No brand</option>
                          {brands.map((b) => <option key={b._id} value={b._id}>{b.name}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-foreground">Title</label>
                        <input data-testid="input-admin-product-edit-title" value={editTitle} onChange={(e) => setEditTitle(e.target.value)} className="mt-2 h-11 w-full rounded-xl border border-border/70 bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring" />
                      </div>
                      <div>
                        <label className="text-sm font-medium text-foreground">Sort order</label>
                        <input data-testid="input-admin-product-edit-sort" value={editSort} onChange={(e) => setEditSort(e.target.value)} className="mt-2 h-11 w-full rounded-xl border border-border/70 bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring" placeholder="e.g. 1, 2, 3" />
                      </div>
                      <div className="flex items-center gap-3 sm:col-span-2">
                        <span className="text-sm font-medium text-foreground">Active</span>
                        <button type="button" role="switch" aria-checked={editActive} data-testid="input-admin-product-edit-active" onClick={() => setEditActive((s) => !s)} className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors focus:outline-none focus:ring-2 focus:ring-ring ${editActive ? "bg-primary" : "bg-muted"}`}>
                          <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition-transform ${editActive ? "translate-x-5" : "translate-x-0.5"}`} />
                        </button>
                        <span className="text-sm text-muted-foreground">{editActive ? "On" : "Off"}</span>
                      </div>
                    </div>
                  </section>
                  <section className="rounded-xl border border-border/60 bg-muted/10 p-4">
                    <h3 className="text-sm font-semibold text-foreground">Description and Details</h3>
                    <div className="mt-3 grid gap-4">
                      <div>
                        <label className="text-sm font-medium text-foreground">Description</label>
                        <textarea data-testid="input-admin-product-edit-description" value={editDescription} onChange={(e) => setEditDescription(e.target.value)} className="mt-2 min-h-[96px] w-full rounded-xl border border-border/70 bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring" />
                      </div>
                      <div>
                        <label className="text-sm font-medium text-foreground">Features</label>
                        <textarea data-testid="input-admin-product-edit-features" value={editFeaturesText} onChange={(e) => setEditFeaturesText(e.target.value)} className="mt-2 min-h-[96px] w-full rounded-xl border border-border/70 bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring" placeholder="One item per line" />
                      </div>
                      <div>
                        <label className="text-sm font-medium text-foreground">Specifications</label>
                        <textarea data-testid="input-admin-product-edit-specifications" value={editSpecificationsText} onChange={(e) => setEditSpecificationsText(e.target.value)} className="mt-2 min-h-[96px] w-full rounded-xl border border-border/70 bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring" placeholder="One item per line" />
                      </div>
                      <div>
                        <label className="text-sm font-medium text-foreground">Applications</label>
                        <textarea data-testid="input-admin-product-edit-applications" value={editApplicationsText} onChange={(e) => setEditApplicationsText(e.target.value)} className="mt-2 min-h-[96px] w-full rounded-xl border border-border/70 bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring" placeholder="One item per line" />
                      </div>
                      <div className="sm:col-span-2">
                        <label className="text-sm font-medium text-foreground" htmlFor="edit-product-variety-keyword">
                          Variety keyword (optional)
                        </label>
                        <p className="mt-1 text-xs text-muted-foreground">
                          One label for all values (default &quot;{DEFAULT_VARIETY_KEYWORD}&quot;).
                        </p>
                        <input
                          id="edit-product-variety-keyword"
                          data-testid="input-admin-product-edit-variety-keyword"
                          value={editVarietyKeyword}
                          onChange={(e) => setEditVarietyKeyword(e.target.value)}
                          className="mt-2 h-11 w-full rounded-xl border border-border/70 bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
                          placeholder={DEFAULT_VARIETY_KEYWORD}
                        />
                        <label className="mt-4 block text-sm font-medium text-foreground" htmlFor="edit-product-variety-values">
                          Values (optional)
                        </label>
                        <textarea
                          id="edit-product-variety-values"
                          data-testid="input-admin-product-edit-variety-values"
                          value={editVarietyValuesText}
                          onChange={(e) => setEditVarietyValuesText(e.target.value)}
                          className="mt-2 min-h-[96px] w-full rounded-xl border border-border/70 bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
                          placeholder="One value per line"
                        />
                      </div>
                    </div>
                  </section>
                  <section className="rounded-xl border border-border/60 bg-muted/10 p-4">
                    <h3 className="text-sm font-semibold text-foreground">Uploads</h3>
                    <div className="mt-3 grid gap-4 sm:grid-cols-2">
                      <div>
                        <label className="text-sm font-medium text-foreground">Product images</label>
                        <p className="mt-1 text-xs text-muted-foreground">Remove thumbnails to drop them from storage. Add more below (max {MAX_PRODUCT_IMAGES} total).</p>
                        {editKeptUrls.length || editNewPreviews.length ? (
                          <ul className="mt-2 grid grid-cols-3 gap-2 sm:grid-cols-4">
                            {editKeptUrls.map((url, i) => (
                              <li key={`kept-${url}-${i}`} className="relative aspect-square overflow-hidden rounded-lg border border-border/60">
                                <img src={toPublicUrl(url)} alt="" className="h-full w-full object-cover" />
                                <button
                                  type="button"
                                  onClick={() => setEditKeptUrls((prev) => prev.filter((_, idx) => idx !== i))}
                                  className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-black/60 text-sm text-white hover:bg-black/80"
                                  aria-label="Remove image"
                                >
                                  ×
                                </button>
                              </li>
                            ))}
                            {editNewPreviews.map((p, i) => (
                              <li key={`new-${i}-${p.url}`} className="relative aspect-square overflow-hidden rounded-lg border border-border/60">
                                <img src={p.url} alt="" className="h-full w-full object-cover" />
                                <button
                                  type="button"
                                  onClick={() => setEditNewFiles((prev) => prev.filter((_, idx) => idx !== i))}
                                  className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-black/60 text-sm text-white hover:bg-black/80"
                                  aria-label="Remove new image"
                                >
                                  ×
                                </button>
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <p className="mt-2 text-xs text-muted-foreground">No images yet. Add files below (optional).</p>
                        )}
                        <input
                          ref={editFileInputRef}
                          type="file"
                          accept="image/jpeg,image/png,image/jpg"
                          multiple
                          className="sr-only"
                          onChange={(e) => {
                            appendProductImageFiles(e.target.files, true);
                            e.target.value = "";
                          }}
                        />
                        <div
                          role="button"
                          tabIndex={0}
                          onClick={() => editFileInputRef.current?.click()}
                          onKeyDown={(e) => e.key === "Enter" && editFileInputRef.current?.click()}
                          onDragOver={(e) => handleImageDragOver(e, true)}
                          onDragLeave={(e) => handleImageDragLeave(e, true)}
                          onDrop={(e) => handleImageDrop(e, true)}
                          className={`mt-2 flex min-h-[88px] cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed transition-colors ${editImageDropActive ? "border-primary bg-primary/5" : "border-border/70 bg-muted/30 hover:border-primary/50 hover:bg-muted/50"}`}
                        >
                          <ImagePlus className="mb-1 h-7 w-7 text-muted-foreground" aria-hidden />
                          <span className="text-center text-xs font-medium text-foreground">Add more images</span>
                        </div>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-foreground">Catalog</label>
                        <input ref={editCatalogFileInputRef} type="file" accept="image/*,.pdf,application/pdf" className="sr-only" onChange={(e) => { const n = e.target.files?.[0] ?? null; if (!n || isCatalogType(n)) setEditCatalogFile(n); }} />
                        <div role="button" tabIndex={0} onClick={() => editCatalogFileInputRef.current?.click()} onKeyDown={(e) => e.key === "Enter" && editCatalogFileInputRef.current?.click()} onDragOver={(e) => handleCatalogDragOver(e, true)} onDragLeave={(e) => handleCatalogDragLeave(e, true)} onDrop={(e) => handleCatalogDrop(e, setEditCatalogFile, true)} className={`mt-2 flex min-h-[100px] cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed transition-colors ${editCatalogDropActive ? "border-primary bg-primary/5" : "border-border/70 bg-muted/30 hover:border-primary/50 hover:bg-muted/50"}`}>
                          {editCatalogFile || detailItem?.catelog ? (
                            <div className="relative w-full p-2 text-center">
                              {editCatalogPreview ? <img src={editCatalogPreview} alt="Catalog" className="mx-auto max-h-20 rounded-lg object-contain" /> : detailItem?.catelog && !editCatalogFile ? <a href={toPublicUrl(detailItem.catelog)} target="_blank" rel="noreferrer" onClick={(e) => e.stopPropagation()} className="text-xs font-medium text-primary hover:underline">Open current catalog</a> : <p className="text-xs font-medium">{editCatalogFile?.name || "Uploaded"}</p>}
                              {editCatalogFile && <button type="button" onClick={(e) => { e.stopPropagation(); setEditCatalogFile(null); editCatalogFileInputRef.current && (editCatalogFileInputRef.current.value = ""); }} className="absolute right-3 top-3 flex h-6 w-6 items-center justify-center rounded-full bg-black/60 text-sm text-white" aria-label="Remove">×</button>}
                            </div>
                          ) : <span className="text-sm font-medium text-foreground">Drop or click for catalog</span>}
                        </div>
                      </div>
                    </div>
                  </section>
                  <section className="rounded-xl border border-border/60 bg-muted/10 p-4">
                    <h3 className="text-sm font-semibold text-foreground">SEO Details</h3>
                    <div className="mt-3 space-y-3">
                      <div><label className="text-xs font-medium text-muted-foreground">Meta Title</label><input value={editMetaTitle} onChange={(e) => setEditMetaTitle(e.target.value)} className="mt-1 h-10 w-full rounded-lg border border-border/70 bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring" placeholder="Page title for search engines" /></div>
                      <div><label className="text-xs font-medium text-muted-foreground">Meta Description</label><textarea value={editMetaDescription} onChange={(e) => setEditMetaDescription(e.target.value)} className="mt-1 min-h-[100px] w-full rounded-lg border border-border/70 bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring" placeholder="Short description for search results" /></div>
                      <div><label className="text-xs font-medium text-muted-foreground">Meta Keywords</label><KeywordTagsInput id="edit-product-meta-keywords" value={editMetaKeywords} onChange={setEditMetaKeywords} placeholder="Type keyword or sentence and press Enter" /></div>
                    </div>
                  </section>
                </div>
                {editStatus.message ? <div data-testid="status-admin-product-edit" className={`mt-4 rounded-xl px-4 py-3 text-sm ${editStatus.type === "success" ? "border border-green-200 bg-green-50 text-green-700" : "border border-red-200 bg-red-50 text-red-700"}`}>{editStatus.message}</div> : null}
                <div className="mt-5 flex items-center gap-3">
                  <Button type="submit" disabled={isUpdating || !editSubCategoryId || editTitle.trim().length === 0}>{isUpdating ? "Saving…" : "Save changes"}</Button>
                  <Button variant="ghost" onClick={() => { setEditStatus({ type: "", message: "" }); cancelEdit(); }}>Cancel</Button>
                  <Button variant="secondary" size="sm" data-testid="button-admin-product-delete" disabled={deletingId === editingId} className="border-red-200/80 text-red-600 hover:bg-red-50" onClick={() => onDelete(editingId)}><Trash2 className="h-4 w-4 mr-1.5" aria-hidden />Delete</Button>
                </div>
              </form>
            </div>
          ) : null}

          {!isFormOpen && !editingId && !selectedId ? (
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
              <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                {items.map((item) => {
                  const pics = normalizeProductImages(item);
                  const thumb = pics[0];
                  return (
                  <button
                    key={item._id}
                    type="button"
                    data-testid={`card-admin-product-${item._id}`}
                    onClick={() => { setSelectedId(item._id); setIsFormOpen(false); }}
                    className="group relative flex flex-col items-center gap-3 rounded-xl border-2 border-border/60 bg-card p-4 text-left shadow-sm transition-all hover:shadow-lg hover:border-primary/40 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                  >
                    <img
                      src={toPublicUrl(thumb || item.imageUrl) || IMAGES.LOGO}
                      alt=""
                      className="h-44 w-44 shrink-0 rounded-xl object-contain transition-transform group-hover:scale-105"
                      loading="lazy"
                    />
                    {pics.length > 1 ? (
                      <span className="absolute right-5 top-5 rounded-md bg-black/55 px-1.5 py-0.5 text-[10px] font-medium text-white">{pics.length} photos</span>
                    ) : null}
                    <span className="w-full truncate text-center text-sm font-semibold text-foreground">{item.title}</span>
                    <div className="flex flex-wrap items-center justify-center gap-1">
                      {item.brand ? (
                        <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700">
                          {item.brand.name}
                        </span>
                      ) : null}
                      {(() => {
                    const s = seoByProductId[item._id];
                    if (!s || (!s.metaTitle && !s.metaDescription && !s.metaKeywords)) return null;
                    return (
                        <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-700">SEO</span>
                    );
                  })()}
                      {item.catelog ? (
                        <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700">Catalog</span>
                      ) : null}
                    </div>
                  </button>
                );
                })}
              </div>
            ) : null}
            </div>
          ) : null}
    </AdminShell>
  );
}

