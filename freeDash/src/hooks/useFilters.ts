import { useCallback, useMemo, useState } from 'react';
import type { FilterState, Vendor, CategoryId } from '@/types';
import { catById } from '@/data/categories';
import { haversineKm, VANCOUVER_CENTER } from '@/lib/geo';

/* =========================================================
   useFilters — search + filter state and the filtered vendor list.
   Centralizes the predicate so the map, list, and counters all
   agree on what "matches".
   ========================================================= */

const INITIAL: FilterState = {
  query: '',
  selectedCats: [],
  priceTiers: [],
  minRating: 0,
  distKm: 25,
  showOnlyInPlan: false,
};

export interface UseFiltersApi {
  filters: FilterState;
  setQuery: (q: string) => void;
  toggleCat: (id: CategoryId) => void;
  togglePriceTier: (t: number) => void;
  setMinRating: (n: number) => void;
  setDistKm: (n: number) => void;
  setShowOnlyInPlan: (b: boolean) => void;
  reset: () => void;
  matches: (v: Vendor, isInPlan: boolean) => boolean;
  filterList: (vendors: Vendor[], isInPlan: (id: string) => boolean) => Vendor[];
}

export function useFilters(): UseFiltersApi {
  const [filters, setFilters] = useState<FilterState>(INITIAL);

  const setQuery       = useCallback((q: string)   => setFilters((f) => ({ ...f, query: q })), []);
  const setMinRating   = useCallback((n: number)   => setFilters((f) => ({ ...f, minRating: n })), []);
  const setDistKm      = useCallback((n: number)   => setFilters((f) => ({ ...f, distKm: n })), []);
  const setShowOnlyInPlan = useCallback((b: boolean) => setFilters((f) => ({ ...f, showOnlyInPlan: b })), []);
  const reset          = useCallback(()            => setFilters(INITIAL), []);

  const toggleCat = useCallback((id: CategoryId) => {
    setFilters((f) => {
      const present = f.selectedCats.includes(id);
      return {
        ...f,
        selectedCats: present
          ? f.selectedCats.filter((x) => x !== id)
          : [...f.selectedCats, id],
      };
    });
  }, []);

  const togglePriceTier = useCallback((t: number) => {
    setFilters((f) => {
      const present = f.priceTiers.includes(t);
      return {
        ...f,
        priceTiers: present
          ? f.priceTiers.filter((x) => x !== t)
          : [...f.priceTiers, t],
      };
    });
  }, []);

  const matches = useCallback((v: Vendor, isInPlan: boolean) => {
    if (filters.showOnlyInPlan && !isInPlan) return false;
    if (filters.query) {
      const q = filters.query.toLowerCase();
      const catLabel = catById(v.cat).label.toLowerCase();
      if (!(v.name.toLowerCase().includes(q)
         || v.area.toLowerCase().includes(q)
         || catLabel.includes(q))) return false;
    }
    if (filters.selectedCats.length && !filters.selectedCats.includes(v.cat)) return false;
    if (filters.priceTiers.length && !filters.priceTiers.includes(v.price)) return false;
    if (v.rating < filters.minRating) return false;
    const km = haversineKm(VANCOUVER_CENTER.lat, VANCOUVER_CENTER.lng, v.lat, v.lng);
    if (km > filters.distKm) return false;
    return true;
  }, [filters]);

  const filterList = useCallback(
    (vendors: Vendor[], isInPlan: (id: string) => boolean) =>
      vendors.filter((v) => matches(v, isInPlan(v.id))),
    [matches],
  );

  /* Memoize a stable handler bundle */
  return useMemo(() => ({
    filters,
    setQuery, toggleCat, togglePriceTier, setMinRating, setDistKm, setShowOnlyInPlan, reset,
    matches, filterList,
  }), [filters, setQuery, toggleCat, togglePriceTier, setMinRating, setDistKm, setShowOnlyInPlan, reset, matches, filterList]);
}
