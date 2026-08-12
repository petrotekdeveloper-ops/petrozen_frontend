import { useEffect, useState } from "react";
import { Link } from "wouter";
import { apiClient } from "@/lib/apiClient";
import AdminShell from "@/components/admin/AdminShell";
import { ArrowLeft, FolderTree, Layers, Package, HelpCircle } from "lucide-react";
import { toast } from "@/hooks/use-toast";

function Toggle({ checked, onChange, disabled }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={(e) => {
        e.stopPropagation();
        onChange();
      }}
      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:opacity-50 ${
        checked ? "bg-primary" : "bg-muted"
      }`}
    >
      <span
        className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow ring-0 transition-transform ${
          checked ? "translate-x-6" : "translate-x-1"
        }`}
      />
    </button>
  );
}

function Row({ title, icon: Icon, chatbotActive, onToggle, toggling, onSelect, onQuestions }) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-xl border border-border/70 bg-card px-4 py-3">
      <div
        className={`flex min-w-0 flex-1 items-center gap-2 ${onSelect ? "cursor-pointer" : ""}`}
        onClick={onSelect}
        onKeyDown={(e) => onSelect && (e.key === "Enter" || e.key === " ") && onSelect()}
        role={onSelect ? "button" : undefined}
        tabIndex={onSelect ? 0 : undefined}
      >
        {Icon ? <Icon className="h-4 w-4 shrink-0 text-muted-foreground" /> : null}
        <p className="font-medium text-foreground">{title}</p>
      </div>
      <div className="flex shrink-0 items-center gap-3">
        {onQuestions ? (
          <Link href={onQuestions}>
            <a
              onClick={(e) => e.stopPropagation()}
              className="flex items-center gap-1.5 rounded-lg px-2 py-1 text-xs font-medium text-primary hover:bg-primary/10"
            >
              <HelpCircle className="h-3.5 w-3.5" />
              Questions
            </a>
          </Link>
        ) : null}
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">Show in chatbot</span>
          <Toggle checked={chatbotActive !== false} onChange={onToggle} disabled={toggling} />
        </div>
      </div>
    </div>
  );
}

export default function AdminChatbotProducts() {
  const [view, setView] = useState("categories");
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedSubcategory, setSelectedSubcategory] = useState(null);
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [togglingId, setTogglingId] = useState(null);

  const fetchCategories = async () => {
    setIsLoading(true);
    setLoadError("");
    try {
      const res = await apiClient.get("/api/chat/admin/categories");
      setCategories(res?.data?.items ?? []);
    } catch (err) {
      setLoadError(err?.response?.data?.message || "Failed to load categories.");
      setCategories([]);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchSubcategories = async (categoryId) => {
    setIsLoading(true);
    setLoadError("");
    try {
      const res = await apiClient.get("/api/chat/admin/subcategories", {
        params: { categoryId },
      });
      setSubcategories(res?.data?.items ?? []);
    } catch (err) {
      setLoadError(err?.response?.data?.message || "Failed to load subcategories.");
      setSubcategories([]);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchProducts = async (subCategoryId) => {
    setIsLoading(true);
    setLoadError("");
    try {
      const res = await apiClient.get("/api/chat/admin/products", {
        params: { subCategoryId },
      });
      setProducts(res?.data?.items ?? []);
    } catch (err) {
      setLoadError(err?.response?.data?.message || "Failed to load products.");
      setProducts([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (view === "categories") fetchCategories();
    else if (view === "subcategories" && selectedCategory)
      fetchSubcategories(selectedCategory._id);
    else if (view === "products" && selectedSubcategory)
      fetchProducts(selectedSubcategory._id);
  }, [view, selectedCategory?._id, selectedSubcategory?._id]);

  const selectCategory = (cat) => {
    setSelectedCategory(cat);
    setView("subcategories");
  };

  const selectSubcategory = (sub) => {
    setSelectedSubcategory(sub);
    setView("products");
  };

  const goBackToCategories = () => {
    setView("categories");
    setSelectedCategory(null);
    setSelectedSubcategory(null);
  };

  const goBackToSubcategories = () => {
    setView("subcategories");
    setSelectedSubcategory(null);
  };

  const toggleCategory = async (item) => {
    const next = item.chatbotActive !== false ? false : true;
    setTogglingId(item._id);
    try {
      await apiClient.put(`/api/chat/admin/categories/${item._id}/chatbot-active`, {
        chatbotActive: next,
      });
      setCategories((prev) =>
        prev.map((c) => (c._id === item._id ? { ...c, chatbotActive: next } : c))
      );
      toast({ title: next ? "Enabled in chatbot" : "Disabled in chatbot" });
    } catch {
      toast({ title: "Failed to update", variant: "destructive" });
    } finally {
      setTogglingId(null);
    }
  };

  const toggleSubcategory = async (item) => {
    const next = item.chatbotActive !== false ? false : true;
    setTogglingId(item._id);
    try {
      await apiClient.put(`/api/chat/admin/subcategories/${item._id}/chatbot-active`, {
        chatbotActive: next,
      });
      setSubcategories((prev) =>
        prev.map((s) => (s._id === item._id ? { ...s, chatbotActive: next } : s))
      );
      toast({ title: next ? "Enabled in chatbot" : "Disabled in chatbot" });
    } catch {
      toast({ title: "Failed to update", variant: "destructive" });
    } finally {
      setTogglingId(null);
    }
  };

  const toggleProduct = async (item) => {
    const next = item.chatbotActive !== false ? false : true;
    setTogglingId(item._id);
    try {
      await apiClient.put(`/api/chat/admin/products/${item._id}/chatbot-active`, {
        chatbotActive: next,
      });
      setProducts((prev) =>
        prev.map((p) => (p._id === item._id ? { ...p, chatbotActive: next } : p))
      );
      toast({ title: next ? "Enabled in chatbot" : "Disabled in chatbot" });
    } catch {
      toast({ title: "Failed to update", variant: "destructive" });
    } finally {
      setTogglingId(null);
    }
  };

  return (
    <AdminShell
      testId="page-admin-chatbot-products"
      title="Chatbot Products"
      subtitle="Control which categories, subcategories, and products appear in the chatbot."
      sectionBare
    >
      {view !== "categories" ? (
        <button
          type="button"
          onClick={view === "products" ? goBackToSubcategories : goBackToCategories}
          className="mb-4 flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4 shrink-0" />
          Back to {view === "products" ? selectedCategory?.title : "categories"}
        </button>
      ) : null}

      {loadError ? (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {loadError}
        </div>
      ) : null}

      {!loadError && isLoading ? (
        <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          <p className="mt-3 text-sm">Loading...</p>
        </div>
      ) : null}

      {!loadError && !isLoading && view === "categories" ? (
        <div className="space-y-2">
          {categories.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border/60 bg-muted/20 px-6 py-12 text-center text-sm text-muted-foreground">
              No categories found
            </div>
          ) : (
            categories.map((item) => (
              <Row
                key={item._id}
                title={item.title}
                icon={FolderTree}
                chatbotActive={item.chatbotActive}
                onToggle={() => toggleCategory(item)}
                toggling={togglingId === item._id}
                onSelect={() => selectCategory(item)}
              />
            ))
          )}
        </div>
      ) : null}

      {!loadError && !isLoading && view === "subcategories" ? (
        <div className="space-y-2">
          {subcategories.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border/60 bg-muted/20 px-6 py-12 text-center text-sm text-muted-foreground">
              No subcategories in this category
            </div>
          ) : (
            subcategories.map((item) => (
              <Row
                key={item._id}
                title={item.title}
                icon={Layers}
                chatbotActive={item.chatbotActive}
                onToggle={() => toggleSubcategory(item)}
                toggling={togglingId === item._id}
                onSelect={() => selectSubcategory(item)}
              />
            ))
          )}
        </div>
      ) : null}

      {!loadError && !isLoading && view === "products" ? (
        <div className="space-y-2">
          {products.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border/60 bg-muted/20 px-6 py-12 text-center text-sm text-muted-foreground">
              No products in this subcategory
            </div>
          ) : (
            products.map((item) => (
              <Row
                key={item._id}
                title={item.title}
                icon={Package}
                chatbotActive={item.chatbotActive}
                onToggle={() => toggleProduct(item)}
                toggling={togglingId === item._id}
                onQuestions="/admin/chatbot-questions"
              />
            ))
          )}
        </div>
      ) : null}
    </AdminShell>
  );
}
