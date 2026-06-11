import { useCallback, useMemo, useState } from 'react';
import vendorsJson from '@/data/vendors.json';
import type { Vendor, UserProfile, ActiveEvent } from '@/types';
import { TopBar } from '@/components/TopBar';
import { LeftRail } from '@/components/LeftRail';
import { RightRail } from '@/components/RightRail';
import { MapCanvas } from '@/components/MapCanvas';
import { VendorOverlay } from '@/components/VendorOverlay';
import { PlanDrawer } from '@/components/PlanDrawer';
import { usePlan } from '@/hooks/usePlan';
import { useFilters } from '@/hooks/useFilters';
import { useBudget } from '@/hooks/useBudget';

/* =========================================================
   freeDash — map-first event-planning dashboard.
   Layout: full-viewport map underneath, all controls float on top.
   ========================================================= */

const VENDORS = vendorsJson as Vendor[];

const DEFAULT_PROFILE: UserProfile = {
  name: 'Rudra',
  initial: 'R',
  eventCount: 2,
};

const DEFAULT_EVENT: ActiveEvent = {
  title: 'Maya & Sam — Wedding',
  date: '2026-09-14',
  guestCount: 110,
  locationLabel: 'Stanley Park',
};

type PanelMode = 'vendor' | 'plan' | null;

export default function App() {
  const plan = usePlan();
  const fl = useFilters();
  const { budget, setTotal } = useBudget();

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [panelMode, setPanelMode] = useState<PanelMode>(null);

  /* Sort: sponsored first within their category, then by rating desc */
  const sortedVendors = useMemo(() => {
    return [...VENDORS].sort((a, b) => {
      if (a.sponsored !== b.sponsored) return a.sponsored ? -1 : 1;
      return b.rating - a.rating;
    });
  }, []);

  const visibleVendors = useMemo(
    () => fl.filterList(sortedVendors, plan.has),
    [fl, sortedVendors, plan.has],
  );

  const visibleCount = visibleVendors.length;

  const selectVendor = useCallback((id: string) => {
    setSelectedId(id);
    setPanelMode('vendor');
  }, []);

  const togglePlanDrawer = useCallback(() => {
    setPanelMode((m) => (m === 'plan' ? null : 'plan'));
  }, []);

  const closePanel = useCallback(() => {
    setPanelMode(null);
    setSelectedId(null);
  }, []);

  const handleFunction = useCallback((fn: string) => {
    /* TODO: wire each function into its real surface in v1.1 */
    alert(`"${fn}" — wiring up in v1.1.\nThis will open the ${fn.replace('-', ' ')} view.`);
  }, []);

  const vendorsBooked = plan.countsByStage.booked + plan.countsByStage.confirmed;
  const selectedVendor = selectedId
    ? VENDORS.find((v) => v.id === selectedId) ?? null
    : null;

  return (
    <>
      <MapCanvas
        vendors={visibleVendors}
        isInPlan={plan.has}
        selectedId={selectedId}
        onSelectVendor={selectVendor}
        visibleCount={visibleCount}
      />

      <TopBar
        query={fl.filters.query}
        onQuery={fl.setQuery}
        planCount={plan.count}
        onTogglePlan={togglePlanDrawer}
        budget={budget}
        plan={plan.plan}
        vendors={VENDORS}
        onBudgetTotal={setTotal}
        userInitial={DEFAULT_PROFILE.initial}
      />

      <LeftRail
        profile={DEFAULT_PROFILE}
        activeEvent={DEFAULT_EVENT}
        vendorsInPlan={plan.count}
        vendorsBooked={vendorsBooked}
        filters={fl.filters}
        onDistKm={fl.setDistKm}
        onMinRating={fl.setMinRating}
        onTogglePriceTier={fl.togglePriceTier}
        onResetFilters={fl.reset}
        onFunction={handleFunction}
      />

      <RightRail
        vendors={VENDORS}
        filters={fl.filters}
        matchedCount={visibleCount}
        onToggleCat={fl.toggleCat}
        onToggleInPlanOnly={() => fl.setShowOnlyInPlan(!fl.filters.showOnlyInPlan)}
      />

      {panelMode === 'vendor' && selectedVendor ? (
        <VendorOverlay
          vendor={selectedVendor}
          inPlan={plan.has(selectedVendor.id)}
          onClose={closePanel}
          onTogglePlan={() => plan.toggle(selectedVendor.id)}
        />
      ) : null}

      {panelMode === 'plan' ? (
        <PlanDrawer
          plan={plan.plan}
          vendors={VENDORS}
          onClose={closePanel}
          onRemove={plan.remove}
          onToggleCheck={plan.toggleCheck}
          onNotes={plan.setNotes}
          countsByStage={plan.countsByStage}
        />
      ) : null}
    </>
  );
}
