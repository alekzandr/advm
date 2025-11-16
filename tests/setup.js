// Test setup file for Vitest
import { beforeEach, afterEach, vi } from 'vitest';

// Setup DOM mocks
beforeEach(() => {
  // Mock console methods to reduce noise in tests
  global.console = {
    ...console,
    log: vi.fn(),
    debug: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    // Keep error for debugging
    error: console.error
  };

  // Mock localStorage
  const localStorageMock = {
    getItem: vi.fn(),
    setItem: vi.fn(),
    removeItem: vi.fn(),
    clear: vi.fn()
  };
  global.localStorage = localStorageMock;

  // Mock fetch
  global.fetch = vi.fn();
});

afterEach(() => {
  // Cleanup DOM
  document.body.innerHTML = '';
  document.head.innerHTML = '';
  
  // Clear all mocks
  vi.clearAllMocks();
});
