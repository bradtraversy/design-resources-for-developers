import React from 'react';
import {
  render,
  screen,
  fireEvent,
  waitFor,
  act,
} from '@testing-library/react';
import { Autocomplete } from '../autocomplete';
import type { Link } from '@/lib/types';

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
  }),
  useSearchParams: () => new URLSearchParams(),
}));

const mockSuggestions: (Link & { categorySlug?: string })[] = [
  {
    id: '1',
    title: 'Google',
    url: 'https://google.com',
    description: 'Search engine',
    categoryId: '1',
    createdAt: new Date(),
    updatedAt: new Date(),
    clicks: 0,
    isFeatured: false,
  },
  {
    id: '2',
    title: 'GitHub',
    url: 'https://github.com',
    description: 'Code hosting',
    categoryId: '1',
    createdAt: new Date(),
    updatedAt: new Date(),
    clicks: 0,
    isFeatured: false,
  },
];

describe('Autocomplete', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    global.fetch = jest.fn();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('should render search input', () => {
    render(<Autocomplete />);
    expect(screen.getByTestId('search-input')).toBeInTheDocument();
  });

  it('should show suggestions when typing valid query', async () => {
    // Set up mock before rendering
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ suggestions: mockSuggestions }),
    });

    render(<Autocomplete />);

    const input = screen.getByTestId('search-input');
    fireEvent.change(input, { target: { value: 'goo' } });

    // Advance timers to trigger the debounced fetch
    await act(async () => {
      jest.advanceTimersByTime(150);
    });

    // Wait for the suggestions to appear
    await waitFor(() => {
      expect(screen.getByText('Google')).toBeInTheDocument();
      expect(screen.getByText('GitHub')).toBeInTheDocument();
    });
  });

  it('should not fetch suggestions for short queries', async () => {
    render(<Autocomplete />);

    const input = screen.getByTestId('search-input');
    await act(async () => {
      fireEvent.change(input, { target: { value: 'a' } });
    });

    await waitFor(
      () => {
        expect(global.fetch).not.toHaveBeenCalled();
      },
      { timeout: 300 },
    );
  });

  it('should show empty state when no results', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ suggestions: [] }),
    });

    render(<Autocomplete />);

    const input = screen.getByTestId('search-input');
    await act(async () => {
      fireEvent.change(input, { target: { value: 'xyznonexistent' } });
    });

    await waitFor(
      () => {
        expect(screen.getByText(/no results found/i)).toBeInTheDocument();
      },
      { timeout: 300 },
    );
  });

  it('should clear input when clear button clicked', async () => {
    render(<Autocomplete />);

    const input = screen.getByTestId('search-input');
    await act(async () => {
      fireEvent.change(input, { target: { value: 'test' } });
    });

    await waitFor(() => {
      expect(
        screen.getByRole('button', { name: /clear/i }),
      ).toBeInTheDocument();
    });

    const clearButton = screen.getByRole('button', { name: /clear/i });
    fireEvent.click(clearButton);

    expect(input).toHaveValue('');
  });

  it('should handle keyboard navigation', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ suggestions: mockSuggestions }),
    });

    render(<Autocomplete />);

    const input = screen.getByTestId('search-input');
    await act(async () => {
      fireEvent.change(input, { target: { value: 'goo' } });
    });

    await waitFor(() => {
      expect(screen.getByText('Google')).toBeInTheDocument();
    });

    await act(async () => {
      fireEvent.keyDown(input, { key: 'ArrowDown' });
    });

    await act(async () => {
      fireEvent.keyDown(input, { key: 'Enter' });
    });
  });

  it('should close suggestions on Escape', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ suggestions: mockSuggestions }),
    });

    render(<Autocomplete />);

    const input = screen.getByTestId('search-input');
    await act(async () => {
      fireEvent.change(input, { target: { value: 'goo' } });
    });

    await waitFor(() => {
      expect(screen.getByText('Google')).toBeInTheDocument();
    });

    await act(async () => {
      fireEvent.keyDown(input, { key: 'Escape' });
    });

    expect(screen.queryByText('Google')).not.toBeInTheDocument();
  });
});
