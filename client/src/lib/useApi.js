import { useCallback, useEffect, useState } from 'react';
import { apiGet } from './api.js';

/** Fetches `path` from the API and re-fetches whenever it changes. Pass null to skip. */
export function useApi(path) {
  const [state, setState] = useState({ path: null, data: null, error: null });
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    if (!path) return undefined;
    const controller = new AbortController();
    apiGet(path, { signal: controller.signal })
      .then((body) => setState({ path, data: body.data, error: null }))
      .catch((error) => {
        if (error.name !== 'AbortError') setState({ path, data: null, error });
      });
    return () => controller.abort();
  }, [path, attempt]);

  const retry = useCallback(() => {
    setState({ path: null, data: null, error: null });
    setAttempt((n) => n + 1);
  }, []);
  const current = state.path === path;
  return {
    data: current ? state.data : null,
    error: current ? state.error : null,
    loading: Boolean(path) && !current,
    retry,
  };
}

let categoriesRequest;

/** Categories rarely change, so they are fetched once per page load and shared. */
export function useCategories() {
  const [categories, setCategories] = useState([]);
  useEffect(() => {
    let active = true;
    categoriesRequest ??= apiGet('/categories').catch((error) => {
      categoriesRequest = undefined;
      throw error;
    });
    categoriesRequest.then((body) => active && setCategories(body.data)).catch(() => {});
    return () => {
      active = false;
    };
  }, []);
  return categories;
}

export function resetApiCache() {
  categoriesRequest = undefined;
}
