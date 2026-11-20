import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterEach, beforeEach, vi } from 'vitest';
import { fakeFetch, notificationRequests } from './fakeApi.js';
import { resetFavorites } from '../lib/favorites.js';

beforeEach(() => {
  resetFavorites();
  notificationRequests.length = 0;
  vi.stubGlobal('fetch', vi.fn(fakeFetch));
});
afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});
