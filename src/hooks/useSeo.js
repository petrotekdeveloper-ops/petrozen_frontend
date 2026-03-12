import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/apiClient";

export function useSeo(pageType, pageKey) {
  const normalizedPageType = String(pageType || "").trim();
  const normalizedPageKey = String(pageKey || "").trim();

  const query = useQuery({
    queryKey: ["seo", normalizedPageType, normalizedPageKey],
    enabled: Boolean(normalizedPageType && normalizedPageKey),
    staleTime: 5 * 60 * 1000,
    queryFn: async () => {
      try {
        const res = await apiClient.get(`/api/seo/${normalizedPageType}/${normalizedPageKey}`);
        return res?.data?.item ?? null;
      } catch (err) {
        if (err?.response?.status === 404) {
          return null;
        }
        throw err;
      }
    },
  });

  return {
    seo: query.data ?? null,
    isLoading: query.isLoading,
    error: query.error,
  };
}

