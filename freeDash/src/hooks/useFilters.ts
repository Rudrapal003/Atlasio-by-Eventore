import { useState, useCallback } from 'react';
import { haversineKm } from '@/lib/geo';
import type { CategoryId, Vendor, FilterState } from '@/types';

export type GeoCenter = { lat: number; lng: number } | null;

const INITIAL: FilterState = {
  query: '',
  selectedCats: [],
  priceTiers: [],
  minRating: 0,
  distKm: 50,
  showOnlyInPlan: false,
};

export function useFilters(center: GeoCenter) {
  const [filters, setFilters] = useState<FilterState>(INITIAL);

  const setQuery = useCallback((q: string) =>
    setFilters((f) => ({ ...f, query: q })), []);

  const toggleCat = useCallback((id: CategoryId) =>
    setFilters((f) => ({
      ...f,
      selectedCats: f.selectedCats.includes(id)
        ? f.selectedCats.filter((c) => c !== id)
        : [...f.selectedCats, id],
    })), []);

  const togglePriceTier = useCallback((t: number) =>
    setFilters((f) => ({
      ...f,
      priceTiers: f.priceTiers.includes(t)
        ? f.priceTiers.filter((x) => x !== t)
        : [...f.priceTiers, t],
    })), []);

  const setMinRating = useCallback((r: number) =>
    setFilters((f) => ({ ...f, minRating: r })), []);

  const setDistKm = useCallback((d: number) =>
    setFilters((f) => ({ ...f, distKm: d })), []);

  const toggleInPlanOnly = useCallback(() =>
    setFilters((f) => ({ ...f, showOnlyInPlan: !f.showOnlyInPlan })), []);

  const resetFilters = useCallback(() => setFilters(INITIAL), []);

  /** Returns true if vendor passes all active filters. */
  function matches(v: Vendor, isInPlan: (id: string) => boolean): boolean {
    if (filters.showOnlyInPlan && !isInPlan(v.id)) return false;

    if (filters.selectedCats.length > 0 && !filters.selectedCats.includes(v.cat as CategoryId))
      return false;

    if (filters.priceTiers.length > 0 && !filters.priceTiers.includes(v.price))
      return false;

    if (v.rating < filters.minRating) return false;

    if (filters.query) {
      const q = filters.query.toLowerCase();
      if (
        !v.name.toLowerCase().includes(q) &&
        !v.area.toLowerCase().includes(q) &&
        !v.brief.toLowerCase().includes(q)
      )
        return false;
    }

    // Only apply distance filter when we have a user center
    if (center !== null) {
      const km = haversineKm(center.lat, center.lng, v.lat, v.lng);
      if (km > filters.distKm) return false;
    }

    return true;
  }

  function filterList(vendors: Vendor[], isInPlan: (id: string) => boolean): Vendor[] {
    return vendors.filter((v) => matches(v, isInPlan));
  }

  return {
    filters,
    setQuery,
    toggleCat,
    togglePriceTier,
    setMinRating,
    setDistKm,
    toggleInPlanOnly,
    resetFilters,
    filterList,
  };
}
