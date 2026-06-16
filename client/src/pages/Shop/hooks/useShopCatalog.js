import { useEffect, useState } from "react";
import { fetchPublishedProducts, mapStoreProduct } from "../services/shopApi.js";

const CATALOG_STORAGE_KEY = "eatoreum_shop_catalog_v1";

function readCatalogFromStorage() {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(CATALOG_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    const items = parsed?.items;
    return Array.isArray(items) ? items : [];
  } catch {
    return [];
  }
}

function writeCatalogToStorage(items) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(
      CATALOG_STORAGE_KEY,
      JSON.stringify({ items, savedAt: Date.now() })
    );
  } catch {
    /* quota / private mode */
  }
}

/**
 * Shop catalog: instant paint from localStorage when available, then background revalidation.
 * Redis speeds the API; this avoids a loading flash on repeat visits by hydrating synchronously.
 * Search / filters stay client-side (`useShopFilters`).
 */
export function useShopCatalog() {
  const [catalog, setCatalog] = useState(readCatalogFromStorage);
  const [loading, setLoading] = useState(() => readCatalogFromStorage().length === 0);
  const [fetchError, setFetchError] = useState("");

  useEffect(() => {
    let cancelled = false;
    const hadStaleCatalog = readCatalogFromStorage().length > 0;

    if (!hadStaleCatalog) {
      setLoading(true);
      setFetchError("");
    }

    (async () => {
      try {
        const data = await fetchPublishedProducts({
          page: 1,
          limit: 100,
        });
        if (cancelled) return;
        const mapped = (data.items ?? []).map(mapStoreProduct);
        setCatalog(mapped);
        writeCatalogToStorage(mapped);
        setFetchError("");
      } catch (err) {
        if (cancelled) return;
        if (!hadStaleCatalog) {
          setCatalog([]);
          setFetchError(
            err?.response?.data?.message ??
              err?.message ??
              "Could not load products. Is the API running?"
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  return { catalog, loading, fetchError };
}
