import { renderHook } from '@testing-library/react';
import { useScrollReveal } from '../use-scroll-reveal';

beforeEach(() => {
  // Create a mock DOM element for the ref
  const element = document.createElement('div');
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (global as any).element = element;

  const intersectionObserverMock = jest.fn(function () {
    return {
      observe: jest.fn(),
      unobserve: jest.fn(),
      disconnect: jest.fn(),
    };
  });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  global.IntersectionObserver = intersectionObserverMock as any;
});

afterEach(() => {
  // Clean up
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  delete (global as any).element;
});

describe('useScrollReveal', () => {
  it('should return false initially', () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const ref = { current: (global as any).element };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { result } = renderHook(() => useScrollReveal(ref as any));
    expect(result.current).toBe(false);
  });

  it('should create IntersectionObserver with default options', () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const ref = { current: (global as any).element };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    renderHook(() => useScrollReveal(ref as any));
    expect(global.IntersectionObserver).toHaveBeenCalledTimes(1);
    const callback = (global.IntersectionObserver as jest.Mock).mock
      .calls[0][0];
    expect(callback).toBeDefined();
    const options = (global.IntersectionObserver as jest.Mock).mock.calls[0][1];
    expect(options).toEqual({ threshold: 0.1, rootMargin: '0px' });
  });

  it('should use custom options when provided', () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const ref = { current: (global as any).element };
    renderHook(() =>
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      useScrollReveal(ref as any, {
        threshold: 0.5,
        rootMargin: '10px',
      }),
    );
    const options = (global.IntersectionObserver as jest.Mock).mock.calls[0][1];
    expect(options.threshold).toBe(0.5);
    expect(options.rootMargin).toBe('10px');
  });
});
