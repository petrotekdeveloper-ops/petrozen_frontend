import { useEffect, useState } from "react";
import { apiClient } from "@/lib/apiClient";

export function useSeo(pageType, pageKey) {
  const normalizedPageType = String(pageType || "").trim();
  const normalizedPageKey = String(pageKey || "").trim();
  const [seo, setSeo] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!(normalizedPageType && normalizedPageKey)) {
      setSeo(null);
      setIsLoading(false);
      setError(null);
      return;
    }
    let cancelled = false;
    setIsLoading(true);
    setError(null);

    const run = async () => {
      try {
        const res = await apiClient.get(`/api/seo/${normalizedPageType}/${normalizedPageKey}`);
        if (!cancelled) setSeo(res?.data?.item ?? null);
      } catch (err) {
        if (cancelled) return;
        if (err?.response?.status === 404) {
          setSeo(null);
          setError(null);
        } else {
          setSeo(null);
          setError(err);
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };

    run();
    return () => {
      cancelled = true;
    };
  }, [normalizedPageKey, normalizedPageType]);

  return {
    seo,
    isLoading,
    error,
  };
}

