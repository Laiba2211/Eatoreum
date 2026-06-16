import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { fetchStoreCategories } from "../services/shopApi.js";

export const shopSortOptions = [
  { value: "featured", label: "Featured" },
  { value: "price-asc", label: "Price: Low → High" },
  { value: "price-desc", label: "Price: High → Low" },
  { value: "name", label: "Name A → Z" },
  { value: "rating", label: "Top rated" },
];

/** URL-driven filters + client-side category, price band, and sort on `catalog`. */
export function useShopFilters(catalog) {
  const [searchParams, setSearchParams] = useSearchParams();
  const [shopCategories, setShopCategories] = useState([]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await fetchStoreCategories();
        if (cancelled) return;
        setShopCategories(Array.isArray(data.items) ? data.items : []);
      } catch {
        if (!cancelled) setShopCategories([]);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const q = (searchParams.get("q") ?? "").trim();
  const categoryId = searchParams.get("category") ?? "";
  const sortRaw = searchParams.get("sort") ?? "featured";
  const sort = shopSortOptions.some((o) => o.value === sortRaw) ? sortRaw : "featured";

  const minParam = searchParams.get("min");
  const maxParam = searchParams.get("max");

  const priceBounds = useMemo(() => {
    if (!catalog.length) return { min: 0, max: 10000 };
    const prices = catalog.map((p) => p.price);
    const min = Math.min(...prices);
    const max = Math.max(...prices);
    if (min === max) {
      const pad = Math.max(1, Math.round(min * 0.05) || 1);
      return { min: Math.max(0, min - pad), max: max + pad };
    }
    return { min, max };
  }, [catalog]);

  const { minPrice, maxPrice } = useMemo(() => {
    const rawMin = minParam != null && minParam !== "" ? Number(minParam) : priceBounds.min;
    const rawMax = maxParam != null && maxParam !== "" ? Number(maxParam) : priceBounds.max;
    let minP = Number.isFinite(rawMin) ? Math.round(rawMin) : priceBounds.min;
    let maxP = Number.isFinite(rawMax) ? Math.round(rawMax) : priceBounds.max;
    minP = Math.min(Math.max(minP, priceBounds.min), priceBounds.max);
    maxP = Math.min(Math.max(maxP, priceBounds.min), priceBounds.max);
    if (minP > maxP) {
      return { minPrice: maxP, maxPrice: minP };
    }
    return { minPrice: minP, maxPrice: maxP };
  }, [minParam, maxParam, priceBounds.min, priceBounds.max]);

  function mergeParams(updates) {
    const next = new URLSearchParams(searchParams);
    for (const [key, val] of Object.entries(updates)) {
      if (val === undefined || val === null || val === "") next.delete(key);
      else next.set(key, String(val));
    }
    setSearchParams(next, { replace: true });
  }

  function clearFilters() {
    const next = new URLSearchParams();
    if (q) next.set("q", q);
    setSearchParams(next, { replace: true });
  }

  const displayedCards = useMemo(() => {
    const ql = q.toLowerCase();
    let list = catalog.filter((p) => {
      if (categoryId && p.categoryId !== categoryId) return false;
      if (p.price < minPrice || p.price > maxPrice) return false;
      if (!ql) return true;
      const catName = (p.categoryLabel || p.categoryId || "").toLowerCase();
      return (
        p.name.toLowerCase().includes(ql) ||
        p.description.toLowerCase().includes(ql) ||
        catName.includes(ql)
      );
    });

    const arr = [...list];
    switch (sort) {
      case "price-asc":
        arr.sort((a, b) => a.price - b.price);
        break;
      case "price-desc":
        arr.sort((a, b) => b.price - a.price);
        break;
      case "name":
        arr.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case "rating":
        arr.sort((a, b) => {
          const dr = (b.rating ?? 0) - (a.rating ?? 0);
          if (dr !== 0) return dr;
          return a.name.localeCompare(b.name);
        });
        break;
      case "featured":
      default:
        arr.sort((a, b) => {
          if (a.featured !== b.featured) return a.featured ? -1 : 1;
          const dc = (b.createdAt ?? 0) - (a.createdAt ?? 0);
          if (dc !== 0) return dc;
          return a.name.localeCompare(b.name);
        });
        break;
    }
    return arr;
  }, [catalog, q, categoryId, sort, minPrice, maxPrice]);

  const hasActiveFilters =
    Boolean(categoryId) ||
    sort !== "featured" ||
    searchParams.has("min") ||
    searchParams.has("max");

  return {
    q,
    categoryId,
    sort,
    minPrice,
    maxPrice,
    priceBounds,
    mergeParams,
    clearFilters,
    displayedCards,
    hasActiveFilters,
    shopCategories,
  };
}
