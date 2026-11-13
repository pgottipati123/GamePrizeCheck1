import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterEach, beforeEach, vi } from 'vitest';
import { fakeFetch } from './fakeApi.js';

beforeEach(() => vi.stubGlobal('fetch', vi.fn(fakeFetch)));
afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});
