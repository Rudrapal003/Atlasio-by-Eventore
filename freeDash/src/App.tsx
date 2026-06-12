import { useCallback, useMemo, useState } from 'react';
import vendorsJson from '@/data/vendors.json';
import type { Vendor } from '@/types';
import { TopBar } from '@/components/TopBar';
import { LeftRail } from '@/components/LeftRail';
import { RightRail } from '@/components/RightRail';
import { MapCanvas } from '@/components/MapCanvas';
import { VendorOverlay } from '@/components/VendorOverlay';
import { PlanDrawer } from '@/components/PlanDrawer';
import { MessagesDrawer } from '@/components/MessagesDrawer';
import { SettingsDrawer, type SettingsTabId } from '@/components/SettingsDrawer';
import { usePlan } from '@/hooks/usePlan';
import { useFilters } from '@/hooks/useFilters';
import { useBudget } from '@/hooks/useBudget';
import { useProfile } from '@/hooks/useProfile';
import { useEvents } from '@/hooks/useEvents';
import { useBudgetCategories } from '@/hooks/useBudgetCategories';

/* =========================================================
   atlasio — map-first event-planning dashboard, by Eventore.
   Layout: full-viewport map underneath, all controls float on top.
   ========================================================= */

const VENDORS = vendorsJson as Vendor[];

type PanelMode = 'vendor' | 'plan' | 'messages' | null;

/** Real messages backend is in v1.1; until then this stays 0 and the
 *  Messages tile badge is hidden. */
const UNREAD_MESSAGES = 0;

/** Maps a function-tool id to the settings tab it should open.
 *  'messages' is handled separately (it opens MessagesDrawer, not Settings). */
const FUNCTION_TO_TAB: Record<string, SettingsTabId> = {
  'profile-settings': 'profile',
  'switch-event':     'events',
  'budget':           'budget',
  'timeline':         'events',
  'guests':           'events',
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
    if (fn === 'messages') {
      setPanelMode('messages');
      return;
    }
    const tab = FUNCTION_TO_TAB[fn] ?? 'profile';
    openSettings(tab);
  }, [openSettings]);

  const resetAllData = useCallback(() => {
    /* Wipe every atlasio key. We only touch fd_* so the host page is safe. */
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
        budget={budget}
        plan={plan.plan}
        vendors={VENDORS}
        onBudgetTotal={setTotal}
        userInitial={profile.initial}
        userTone={profile.tone}
        onAvatarClick={() => openSettings('profile')}
      />

      <LeftRail
        profile={profile}
        activeEvent={activeEvent}
        eventCount={eventsApi.events.length}
        vendorsInPlan={plan.count}
        vendorsBooked={vendorsBooked}
        unreadMessages={UNREAD_MESSAGES}
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

      {panelMode === 'messages' ? (
        <MessagesDrawer
          onClose={closePanel}
          unreadCount={UNREAD_MESSAGES}
          totalCount={0}
          bookedCount={vendorsBooked}
        />
      ) : null}

      {settingsTab ? (
        <SettingsDrawer
          key={settingsTab}
          initialTab={settingsTab}
          profile={profile}
          events={eventsApi.events}
          activeEventId={eventsApi.activeId}
          budget={budget}
          alloc={alloc}
          onClose={closeSettings}
          onSetName={setName}
          onSetEmail={setEmail}
          onSetTone={setTone}
          onCreateEvent={eventsApi.createEvent}
          onUpdateEvent={eventsApi.updateEvent}
          onDeleteEvent={eventsApi.deleteEvent}
          onSetActiveEvent={eventsApi.setActive}
          onSetBudgetTotal={setTotal}
          onSetBudgetSpent={setSpent}
          onSetCategoryBudget={setCategoryBudget}
          onResetData={resetAllData}
        />
      ) : null}
    </>
  );
}
