import { NextRequest } from 'next/server';
import { getAutocompleteSuggestionsAction } from '@/app/actions';
import type { Link } from '@/lib/types';
import { GET } from '../route';

// Mock the action
jest.mock('@/app/actions');

const mockGetAutocompleteSuggestionsAction =
  getAutocompleteSuggestionsAction as jest.MockedFunction<
    typeof getAutocompleteSuggestionsAction
  >;

describe('GET /api/suggestions', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return suggestions for a valid query', async () => {
    const mockSuggestions = [
      {
        id: '1',
        title: 'Google',
        url: 'https://google.com',
        description: 'Search engine',
      },
      {
        id: '2',
        title: 'GitHub',
        url: 'https://github.com',
        description: 'Code hosting',
      },
    ];
    mockGetAutocompleteSuggestionsAction.mockResolvedValue({
      success: true,
      data: mockSuggestions,
    } as { success: boolean; data: Link[] } | { success: false; error: string });

    const request = new NextRequest(
      'http://localhost:3000/api/suggestions?q=goo',
    );
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.suggestions).toEqual(mockSuggestions);
    expect(mockGetAutocompleteSuggestionsAction).toHaveBeenCalledWith(
      'goo',
      undefined,
    );
  });

  it('should return suggestions filtered by category', async () => {
    const mockSuggestions = [
      {
        id: '1',
        title: 'React',
        url: 'https://react.dev',
        description: 'React docs',
      },
    ];
    mockGetAutocompleteSuggestionsAction.mockResolvedValue({
      success: true,
      data: mockSuggestions,
    } as { success: boolean; data: Link[] } | { success: false; error: string });

    const request = new NextRequest(
      'http://localhost:3000/api/suggestions?q=react&category=frontend',
    );
    const response = await GET(request);
    const data = await response.json();

    expect(mockGetAutocompleteSuggestionsAction).toHaveBeenCalledWith(
      'react',
      'frontend',
    );
    expect(data.suggestions).toEqual(mockSuggestions);
  });

  it('should return empty suggestions for short query', async () => {
    const request = new NextRequest(
      'http://localhost:3000/api/suggestions?q=a',
    );
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.suggestions).toEqual([]);
    expect(mockGetAutocompleteSuggestionsAction).not.toHaveBeenCalled();
  });

  it('should return empty suggestions for empty query', async () => {
    const request = new NextRequest('http://localhost:3000/api/suggestions?q=');
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.suggestions).toEqual([]);
  });

  it('should return 500 if action fails', async () => {
    mockGetAutocompleteSuggestionsAction.mockResolvedValue({
      success: false,
      error: 'Database error',
    });

    const request = new NextRequest(
      'http://localhost:3000/api/suggestions?q=test',
    );
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.error).toBe('Database error');
  });
});
