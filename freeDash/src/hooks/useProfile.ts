import { useCallback, useEffect, useState } from 'react';
import type { UserProfile, AvatarTone } from '@/types';

/* =========================================================
   useProfile — localStorage-backed profile state.
   When auth lands later this will sync to fd_users.
   ========================================================= */

const KEY = 'fd_profile_v1';

const DEFAULT: UserProfile = {
  name: 'Guest Planner',
  email: '',
  initial: 'GP',
  tone: 'gold',
};

function load(): UserProfile {
  if (typeof window === 'undefined') return DEFAULT;
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? { ...DEFAULT, ...JSON.parse(raw) } : DEFAULT;
  } catch {
    return DEFAULT;
  }
}

function deriveInitial(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 0 || !parts[0]) return '?';
  if (parts.length === 1) return parts[0][0]!.toUpperCase();
  return (parts[0][0]! + parts[parts.length - 1]![0]!).toUpperCase();
}

export function useProfile() {
  const [profile, setProfile] = useState<UserProfile>(() => load());

  useEffect(() => {
    try { localStorage.setItem(KEY, JSON.stringify(profile)); } catch { /* quota */ }
  }, [profile]);

  const setName = useCallback((name: string) => {
    setProfile((p) => ({ ...p, name, initial: deriveInitial(name) }));
  }, []);

  const setEmail = useCallback((email: string) => {
    setProfile((p) => ({ ...p, email }));
  }, []);

  const setTone = useCallback((tone: AvatarTone) => {
    setProfile((p) => ({ ...p, tone }));
  }, []);

  const reset = useCallback(() => setProfile(DEFAULT), []);

  return { profile, setName, setEmail, setTone, reset };
}
