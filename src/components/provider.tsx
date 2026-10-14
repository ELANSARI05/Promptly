'use client';
import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from 'react';
import { agents as catalog } from '@/lib/catalog';
import { initialWorkspace } from '@/lib/demo';
import { authConfigured, browserDb } from '@/lib/supabase';
import type { Agent, Workspace } from '@/lib/types';
import type { User } from '@supabase/supabase-js';
type Context = {
  workspace: Workspace;
  setWorkspace: React.Dispatch<React.SetStateAction<Workspace>>;
  agents: Agent[];
  user: User | null;
  ready: boolean;
  live: boolean;
  notify: (s: string) => void;
  api: <T>(path: string, body?: unknown) => Promise<T>;
  refresh: () => Promise<void>;
  signOut: () => Promise<void>;
};
const State = createContext<Context | null>(null);
const STORAGE = 'promptly.workspace.v1';
export function Provider({ children }: { children: ReactNode }) {
  const [demoWorkspace, setDemoWorkspace] = useState<Workspace>(initialWorkspace);
  const [liveWorkspace, setLiveWorkspace] = useState<Workspace>({
    name: 'My workspace',
    balance: 0,
    runs: [],
    transactions: [],
    favorites: [],
    agents: [],
  });
  const [user, setUser] = useState<User | null>(null);
  const [ready, setReady] = useState(false);
  const [toast, setToast] = useState('');
  const [loadedUser, setLoadedUser] = useState<string | null>(null);
  const workspace = user ? liveWorkspace : demoWorkspace;
  const setWorkspace = user ? setLiveWorkspace : setDemoWorkspace;
  const notify = useCallback((s: string) => setToast(s), []);
  const api = useCallback(async <T,>(path: string, body?: unknown): Promise<T> => {
    const {
      data: { session },
    } = await browserDb().auth.getSession();
    if (!session) throw new Error('Please sign in to continue.');
    const res = await fetch(path, {
      method: body === undefined ? 'GET' : 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${session.access_token}`,
      },
      ...(body === undefined ? {} : { body: JSON.stringify(body) }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'The request could not be completed.');
    return data;
  }, []);
  const refresh = useCallback(async () => {
    const data = await api<Workspace>('/api/workspace');
    setLiveWorkspace(data);
  }, [api]);
  useEffect(() => {
    let mounted = true;
    function loadDemo() {
      try {
        const stored = localStorage.getItem(STORAGE);
        if (stored) {
          const d = JSON.parse(stored);
          if (
            Array.isArray(d.runs) &&
            Array.isArray(d.transactions) &&
            Array.isArray(d.agents) &&
            Array.isArray(d.favorites) &&
            Number.isFinite(d.balance) &&
            typeof d.name === 'string'
          )
            setDemoWorkspace(d);
        }
      } catch {}
    }
    loadDemo();
    if (!authConfigured) {
      setReady(true);
      return;
    }
    const {
      data: { subscription },
    } = browserDb().auth.onAuthStateChange((_event, session) => {
      if (mounted) {
        setUser(session?.user ?? null);
        setReady(true);
      }
    });
    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);
  useEffect(() => {
    let active = true;
    if (user) {
      setLoadedUser(null);
      setLiveWorkspace({
        name: 'My workspace',
        balance: 0,
        runs: [],
        transactions: [],
        favorites: [],
        agents: [],
      });
      api<Workspace>('/api/workspace')
        .then((data) => {
          if (active) {
            setLiveWorkspace(data);
            setLoadedUser(user.id);
          }
        })
        .catch((e) => notify(e.message));
    } else {
      setLoadedUser(null);
    }
    return () => {
      active = false;
    };
  }, [user, api, notify]);
  useEffect(() => {
    if (ready) {
      try {
        localStorage.setItem(STORAGE, JSON.stringify(demoWorkspace));
      } catch {
        notify('Your browser could not save this workspace. Free some storage and try again.');
      }
    }
  }, [demoWorkspace, ready, notify]);
  useEffect(() => {
    if (toast) {
      const t = setTimeout(() => setToast(''), 5000);
      return () => clearTimeout(t);
    }
  }, [toast]);
  async function signOut() {
    await browserDb().auth.signOut();
    setLiveWorkspace({
      name: 'My workspace',
      balance: 0,
      runs: [],
      transactions: [],
      favorites: [],
      agents: [],
    });
    notify('Signed out. You are now in the demo workspace.');
  }
  return (
    <State.Provider
      value={{
        workspace,
        setWorkspace,
        agents: [...catalog, ...workspace.agents],
        user,
        ready: ready && (!user || loadedUser === user.id),
        live: !!user,
        notify,
        api,
        refresh,
        signOut,
      }}
    >
      {children}
      {toast && (
        <div className="toast" role="status">
          {toast}
          <button onClick={() => setToast('')} aria-label="Dismiss notification">
            ×
          </button>
        </div>
      )}
    </State.Provider>
  );
}
export function useWorkspace() {
  const v = useContext(State);
  if (!v) throw new Error('Missing workspace provider');
  return v;
}
