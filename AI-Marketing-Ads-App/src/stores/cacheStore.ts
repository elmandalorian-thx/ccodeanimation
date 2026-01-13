import { create } from 'zustand';

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

interface CacheStore {
  cache: Map<string, CacheEntry<any>>;
  get: <T>(key: string) => T | null;
  set: <T>(key: string, data: T, ttl?: number) => void;
  invalidate: (key: string) => void;
  clear: () => void;
  clearExpired: () => void;
}

const DEFAULT_TTL = 5 * 60 * 1000; // 5 minutes

export const useCacheStore = create<CacheStore>((set, get) => ({
  cache: new Map(),

  get: <T,>(key: string): T | null => {
    const entry = get().cache.get(key);
    if (!entry) return null;

    const now = Date.now();
    if (now - entry.timestamp > entry.ttl) {
      // Expired, remove it
      get().invalidate(key);
      return null;
    }

    return entry.data as T;
  },

  set: <T,>(key: string, data: T, ttl: number = DEFAULT_TTL) => {
    set((state) => {
      const newCache = new Map(state.cache);
      newCache.set(key, {
        data,
        timestamp: Date.now(),
        ttl,
      });
      return { cache: newCache };
    });
  },

  invalidate: (key: string) => {
    set((state) => {
      const newCache = new Map(state.cache);
      newCache.delete(key);
      return { cache: newCache };
    });
  },

  clear: () => {
    set({ cache: new Map() });
  },

  clearExpired: () => {
    const now = Date.now();
    set((state) => {
      const newCache = new Map<string, CacheEntry<any>>();
      state.cache.forEach((entry, key) => {
        if (now - entry.timestamp <= entry.ttl) {
          newCache.set(key, entry);
        }
      });
      return { cache: newCache };
    });
  },
}));

// Auto-cleanup expired cache entries every minute
if (typeof window !== 'undefined') {
  setInterval(() => {
    useCacheStore.getState().clearExpired();
  }, 60 * 1000);
}
