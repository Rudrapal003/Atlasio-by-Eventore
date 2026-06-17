import { useCallback, useEffect, useMemo, useState } from 'react';
import type { EventEntry } from '@/types';

/* =========================================================
   useEvents — multi-event support, localStorage-backed.
   Active event is the one displayed in the left-rail card.
   ========================================================= */

const KEY_EVENTS = 'fd_events_v1';
const KEY_ACTIVE = 'fd_active_event_v1';

const DEFAULT_EVENTS: EventEntry[] = [];

function loadEvents(): EventEntry[] {
  if (typeof window === 'undefined') return DEFAULT_EVENTS;
  try {
    const raw = localStorage.getItem(KEY_EVENTS);
    if (!raw) return DEFAULT_EVENTS;
    const list = JSON.parse(raw) as EventEntry[];
    return Array.isArray(list) && list.length > 0 ? list : DEFAULT_EVENTS;
  } catch {
    return DEFAULT_EVENTS;
  }
}

function loadActiveId(events: EventEntry[]): string {
  if (typeof window === 'undefined') return events[0]?.id ?? '';
  try {
    const raw = localStorage.getItem(KEY_ACTIVE);
    if (raw && events.some((e) => e.id === raw)) return raw;
  } catch { /* ignore */ }
  return events[0]?.id ?? '';
}

function newId(): string {
  return 'evt_' + Math.random().toString(36).slice(2, 10);
}

export function useEvents() {
  const [events, setEvents] = useState<EventEntry[]>(() => loadEvents());
  const [activeId, setActiveId] = useState<string>(() => loadActiveId(loadEvents()));

  useEffect(() => {
    try { localStorage.setItem(KEY_EVENTS, JSON.stringify(events)); } catch { /* quota */ }
  }, [events]);

  useEffect(() => {
    try { localStorage.setItem(KEY_ACTIVE, activeId); } catch { /* quota */ }
  }, [activeId]);

  const activeEvent = useMemo(
    () => events.find((e) => e.id === activeId) ?? events[0],
    [events, activeId],
  );

  const createEvent = useCallback(() => {
    const e: EventEntry = {
      id: newId(),
      title: 'New Event',
      date: new Date().toISOString().slice(0, 10),
      guestCount: 50,
      locationLabel: 'TBD',
      notes: '',
      createdAt: new Date().toISOString(),
    };
    setEvents((prev) => [...prev, e]);
    setActiveId(e.id);
    return e.id;
  }, []);

  const updateEvent = useCallback((id: string, patch: Partial<EventEntry>) => {
    setEvents((prev) => prev.map((e) => (e.id === id ? { ...e, ...patch } : e)));
  }, []);

  const deleteEvent = useCallback((id: string) => {
    setEvents((prev) => {
      const next = prev.filter((e) => e.id !== id);
      if (next.length === 0) return DEFAULT_EVENTS;
      return next;
    });
    setActiveId((cur) => {
      if (cur !== id) return cur;
      const remaining = events.filter((e) => e.id !== id);
      return remaining[0]?.id ?? '';
    });
  }, [events]);

  const setActive = useCallback((id: string) => {
    if (events.some((e) => e.id === id)) setActiveId(id);
  }, [events]);

  return {
    events, activeEvent, activeId,
    createEvent, updateEvent, deleteEvent, setActive,
  };
}
