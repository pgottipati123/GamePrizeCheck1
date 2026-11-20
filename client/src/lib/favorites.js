import { useCallback, useSyncExternalStore } from 'react';

// Favorites/Watchlist needs no account (Level 3 Specification), so saved
// product IDs live in this browser's localStorage. Product data itself is
// always loaded live from the API.
const KEY = 'gamepricecheck:favorites';
const listeners = new Set();
let cache;

function read() {
  if (cache) return cache;
  try {
    const parsed = JSON.parse(window.localStorage.getItem(KEY) ?? '[]');
    cache = Array.isArray(parsed) ? parsed.filter((id) => typeof id === 'string') : [];
  } catch {
    cache = [];
  }
  return cache;
}

function write(ids) {
  cache = ids;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(ids));
  } catch {
    // Storage can be unavailable (private mode); favorites then last for this visit only.
  }
  listeners.forEach((listener) => listener());
}

function subscribe(listener) {
  listeners.add(listener);
  const onStorage = (event) => {
    if (event.key === KEY) {
      cache = undefined;
      listener();
    }
  };
  window.addEventListener('storage', onStorage);
  return () => {
    listeners.delete(listener);
    window.removeEventListener('storage', onStorage);
  };
}

export function useFavorites() {
  const ids = useSyncExternalStore(subscribe, read, () => []);
  const isFavorite = useCallback((id) => ids.includes(id), [ids]);
  const add = useCallback((id) => !read().includes(id) && write([id, ...read()]), []);
  const remove = useCallback((id) => write(read().filter((saved) => saved !== id)), []);
  return { ids, isFavorite, add, remove };
}

export function resetFavorites() {
  cache = undefined;
  window.localStorage.removeItem(KEY);
}
