// Test setup file for Vitest
import { beforeEach, afterEach, vi } from 'vitest';

// Polyfill PointerEvent for jsdom (only if MouseEvent exists)
if (typeof MouseEvent !== 'undefined' && !global.PointerEvent) {
  global.PointerEvent = class PointerEvent extends MouseEvent {
    constructor(type, params = {}) {
      super(type, params);
      this.pointerId = params.pointerId || 0;
      this.width = params.width || 0;
      this.height = params.height || 0;
      this.pressure = params.pressure || 0;
      this.tangentialPressure = params.tangentialPressure || 0;
      this.tiltX = params.tiltX || 0;
      this.tiltY = params.tiltY || 0;
      this.twist = params.twist || 0;
      this.pointerType = params.pointerType || 'mouse';
      this.isPrimary = params.isPrimary || false;
    }
  };
}

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

  // Mock localStorage (only in browser-like environment)
  if (typeof window !== 'undefined') {
    const localStorageMock = {
      getItem: vi.fn(),
      setItem: vi.fn(),
      removeItem: vi.fn(),
      clear: vi.fn()
    };
    global.localStorage = localStorageMock;
  }

  // Mock fetch
  global.fetch = vi.fn();
});

afterEach(() => {
  // Cleanup DOM (only in jsdom environment)
  if (typeof document !== 'undefined') {
    document.body.innerHTML = '';
    document.head.innerHTML = '';
  }
  
  // Clear all mocks
  vi.clearAllMocks();
});
