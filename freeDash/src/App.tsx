import { useState, useEffect, useCallback } from 'react';
import vendorsJson from '@/data/vendors.json';
import type { Vendor, Plan, BudgetState, UserProfile, EventEntry, ExpenseEntry } from '@/types';
import { TopBar } from '@/components/TopBar';
import { LeftRail } from '@/components/LeftRail';
import { RightRail } from '@/components/RightRail';
import { MapCanvas } from '@/components/MapCanvas';
import { VendorSheet } from '@/components/VendorSheet';
import { PlannerPanel } from '@/components/PlannerPanel';
import { LocationPicker } from '@/components/LocationPicker';
import { useFilters } from '@/hooks/useFilters';
import type { GeoCenter } from '@/hooks/useFilters';
import { usePlan } from '@/hooks/usePlan';
import { useBudget } from '@/hooks/useBudget';
import styles from './App.module.css';

const VENDORS = vendorsJson as Vendor[];

const DEFAULT_PROFILE: UserProfile = {
  name: 'Eventore User',
  email: '',
  initial: 'E',
  tone: 'rose',
};

export default function App() {
  // ── Geo / location state ─────────────────────────────────
  const [geoCenter, setGeoCenter] = useState<GeoCenter>(null);
  const [cityName, setCityName] = useState('');
  const [showLocationPicker, setShowLocationPicker] = useState(false);

  // On mount: request geolocation automatically
  useEffect(() => {
    if (!navigator.geolocation) {
      setShowLocationPicker(true);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setGeoCenter({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setCityName('My Location');
      },
      () => {
        // Denied or error — show picker
        setShowLocationPicker(true);
      },
      { timeout: 6000, maximumAge: 120000 }
    );
  }, []);

  function handleLocationSelect(center: { lat: number; lng: number }, name: string) {
    setGeoCenter(center);
    setCityName(name);
    setShowLocationPicker(false);
  }

  function handleLocationSkip() {
    setShowLocationPicker(false);
    setCityName('All Areas');
  }

  // ── Core hooks ───────────────────────────────────────────
  const fl = useFilters(geoCenter);
  const plan = usePlan();
  const budget = useBudget();

  // ── UI state ─────────────────────────────────────────────
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
  const [plannerOpen, setPlannerOpen] = useState(false);

  // Profile / event (lightweight local state)
  const [profile] = useState<UserProfile>(DEFAULT_PROFILE);
  const [events] = useState<EventEntry[]>([]);
  const [expenses] = useState<ExpenseEntry[]>([]);

  // ── Derived lists ─────────────────────────────────────────
  const sponsoredFirst = [...VENDORS].sort((a, b) =>
    (b.sponsored ? 1 : 0) - (a.sponsored ? 1 : 0)
  );
  const sortedVendors = sponsoredFirst;
  const visibleVendors = fl.filterList(sortedVendors, plan.has);

  const selectedVendor = selectedId
    ? VENDORS.find((v) => v.id === selectedId) ?? null
    : null;

  const handleSelectVendor = useCallback((id: string) => {
    setSelectedId((prev) => (prev === id ? null : id));
  }, []);

  return (
    <div className={styles.shell}>
      {/* Location picker modal */}
      {showLocationPicker && (
        <LocationPicker
          vendors={VENDORS}
          onSelect={handleLocationSelect}
          onSkip={handleLocationSkip}
        />
      )}

      {/* Top bar */}
      <TopBar
        cityName={cityName}
        query={fl.filters.query}
        onFilter={() => setMobileFilterOpen(true)}
        onMenu={() => setMobileMenuOpen(true)}
        onLocationClick={() => setShowLocationPicker(true)}
        onChange={fl.setQuery}
      />

      <div className={styles.body}>
        {/* Left rail — search filters */}
        <LeftRail
          filters={fl.filters}
          mobileOpen={mobileMenuOpen}
          onCloseMobile={() => setMobileMenuOpen(false)}
          onTogglePriceTier={fl.togglePriceTier}
          onSetMinRating={fl.setMinRating}
          onSetDistKm={fl.setDistKm}
          onReset={fl.resetFilters}
          plannerOpen={plannerOpen}
          onTogglePlanner={() => setPlannerOpen((p) => !p)}
          profile={profile}
          planCount={plan.count}
          budget={budget.state}
        />

        {/* Map */}
        <main className={styles.main}>
          <MapCanvas
            vendors={visibleVendors}
            isInPlan={plan.has}
            selectedId={selectedId}
            onSelectVendor={handleSelectVendor}
            visibleCount={visibleVendors.length}
            center={geoCenter}
          />
        </main>

        {/* Right rail — category filters */}
        <RightRail
          vendors={visibleVendors}
          filters={fl.filters}
          matchedCount={visibleVendors.length}
          cityName={cityName}
          mobileOpen={mobileFilterOpen}
          onCloseMobile={() => setMobileFilterOpen(false)}
          onToggleCat={fl.toggleCat}
          onToggleInPlanOnly={fl.toggleInPlanOnly}
        />
      </div>

      {/* Vendor detail sheet */}
      {selectedVendor && (
        <VendorSheet
          vendor={selectedVendor}
          inPlan={plan.has(selectedVendor.id)}
          planEntry={plan.entry(selectedVendor.id)}
          onClose={() => setSelectedId(null)}
          onTogglePlan={() => plan.toggle(selectedVendor.id)}
          onStageChange={(s) => plan.setStage(selectedVendor.id, s)}
          onCheckChange={(k, v) => plan.setCheck(selectedVendor.id, k, v)}
          onNotesChange={(n) => plan.setNotes(selectedVendor.id, n)}
        />
      )}

      {/* Planner panel */}
      {plannerOpen && (
        <PlannerPanel
          vendors={VENDORS}
          plan={plan.all}
          budget={budget.state}
          events={events}
          expenses={expenses}
          onClose={() => setPlannerOpen(false)}
          onSelectVendor={handleSelectVendor}
          onRemoveVendor={(id) => plan.toggle(id)}
          onSetBudget={budget.setTotal}
        />
      )}
    </div>
  );
}
