// Jest setup file
// This file runs before each test file

import React from 'react';

// Import jest-dom matchers
import '@testing-library/jest-dom';

// Mock window.matchMedia if needed for components that use it
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

// Polyfill TextEncoder and TextDecoder (needed for next/cache and other APIs)
if (typeof globalThis.TextEncoder === 'undefined') {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { TextEncoder, TextDecoder } = require('util');
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  globalThis.TextEncoder = TextEncoder as any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  globalThis.TextDecoder = TextDecoder as any;
}

// Polyfill ReadableStream (needed by undici)
if (typeof globalThis.ReadableStream === 'undefined') {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { ReadableStream } = require('stream/web');
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  globalThis.ReadableStream = ReadableStream as any;
}

// Polyfill MessagePort (needed by undici)
if (typeof globalThis.MessagePort === 'undefined') {
  // @ts-expect-error - minimal polyfill for testing
  globalThis.MessagePort = class MessagePort {
    static readonly START = 0;
    static readonly CONNECTING = 1;
    static readonly OPEN = 1;
    static readonly CLOSING = 2;
    static readonly CLOSED = 3;

    onmessage: ((event: MessageEvent) => void) | null = null;
    onmessageerror: ((event: Event) => void) | null = null;

    constructor() {}

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    postMessage(_message: unknown, _transfer?: unknown): void {}
    close(): void {}

    addEventListener(
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      _type: string,
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      _listener: EventListenerOrEventListenerObject | null,
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      _options?: AddEventListenerOptions | boolean | undefined,
    ): void {}

    removeEventListener(
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      _type: string,
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      _listener: EventListenerOrEventListenerObject | null,
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      _options?: EventListenerOptions | boolean | undefined,
    ): void {}
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    dispatchEvent(_event: Event): boolean {
      return false;
    }
    get readyState(): number {
      return 3; // CLOSED
    }
  };
}

// Polyfill Request, Response, Headers (needed for next/server)
if (typeof globalThis.Request === 'undefined') {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { Request, Response, Headers } = require('undici');
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  globalThis.Request = Request as any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  globalThis.Response = Response as any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  globalThis.Headers = Headers as any;
}

// Mock next/image
jest.mock('next/image', () => ({
  __esModule: true,
  default: (props: Record<string, unknown>) =>
    React.createElement('img', props),
}));
