// Jest setup file
// This file runs before each test file

//Mock window.matchMedia if needed for components that use it
(globalThis as unknown as Record<string, unknown>).matchMedia = (
  query: string,
) => ({
  matches: false,
  media: query,
  onchange: null,
  addListener: () => {},
  removeListener: () => {},
  addEventListener: () => {},
  removeEventListener: () => {},
  dispatchEvent: () => true,
});

// Mock IntersectionObserver
(
  globalThis as unknown as Record<string, unknown>
).IntersectionObserver = class {
  observe() {}
  unobserve() {}
  disconnect() {}
};
