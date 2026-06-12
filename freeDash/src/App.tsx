import { useCallback, useMemo, useState } from 'react';
import vendorsJson from '@/data/vendors.json';
import type { Vendor } from '@/types';
import { TopBar } from '@/components/TopBar';
import { LeftRail } from '@/components/LeftRail';
import { RightRail } from '@/components/RightRail';
import { MapCanvas } from '@/components/MapCanvas';
import { VendorOverlay } from '@/components/VendorOverlay';
import { PlanDrawer } from '@/components/PlanDrawer';
import { SettingsDrawer, type SettingsTabId } from '@/components/SettingsDrawer';
import { usePlan } from '@/hooks/usePlan';
import { useFilters } from '@/hooks/useFilters';
import { useBudget } from '@/hooks/useBudget';
import { useProfile } from '@/hooks/useProfile';
import { useEvents } from '@/hooks/useEvents';
import { useBudgetCategories } from '@/hooks/useBudgetCategories';

/* =========================================================
   freeDash — map-first event-planning dashboard.
   Layout: full-viewport map underneath, all controls float on top.
   ========================================================= */

const VENDORS = vendorsJson as Vendor[];

type PanelMode = 'vendor' | 'plan' | null;

/** Maps a function-tool id to the settings tab it should open. */
const FUNCTION_TO_TAB: Record<string, SettingsTabId> = {
  'profile-settings': 'profile',
  'switch-event':     'events',
  'budget':           'budget',
  'timeline':         'events',
  'guests':           'events',
  'messages':         'profile',  // until messages screen lands
  'docs':             'about',
  'ai':               'about',
};

export default function App() {
  const plan = usePlan();
  const fl = useFilters();
  const { budget, setTotal, setSpent } = useBudget();
  const { profile, setName, setEmail, setTone, reset: resetProfile } = useProfile();
  const eventsApi = useEvents();
  const { alloc, setCategoryBudget, clear: clearAlloc } = useBudgetCategories();

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [panelMode, setPanelMode] = useState<PanelMode>(null);
  const [settingsTab, setSettingsTab] = useState<SettingsTabId | null>(null);

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

  const openSettings = useCallback((tab: SettingsTabId = 'profile') => {
    setSettingsTab(tab);
  }, []);

  const closeSettings = useCallback(() => setSettingsTab(null), []);

  const handleFunction = useCallback((fn: string) => {
    const tab = FUNCTION_TO_TAB[fn] ?? 'profile';
    openSettings(tab);
  }, [openSettings]);

  const resetAllData = useCallback(() => {
    /* Wipe every freeDash key. We only touch fd_* so the host page is safe. */
    try {
      const keys = Object.keys(localStorage).filter((k) => k.startsWith('fd_'));
      keys.forEach((k) => localStorage.removeItem(k));
    } catch {
      /* private mode — ignore */
    }
    /* Reset in-memory state too so the user sees defaults immediately. */
    resetProfile();
    clearAlloc();
    /* Hard reload picks up fresh defaults from every hook. */
    window.location.reload();
  }, [resetProfile, clearAlloc]);

  const vendorsBooked = plan.countsByStage.booked + plan.countsByStage.confirmed;
  const selectedVendor = selectedId
    ? VENDORS.find((v) => v.id === selectedId) ?? null
    : null;
  const activeEvent = eventsApi.activeEvent;

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
    