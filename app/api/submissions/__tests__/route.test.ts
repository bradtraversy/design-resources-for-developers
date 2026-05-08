import { NextRequest } from 'next/server';
import {
  createResourceSubmission,
  getResourceSubmissions,
  updateResourceSubmissionStatus,
  deleteResourceSubmission,
} from '@/lib/analytics';
import type { ResourceSubmission } from '@/lib/types';
import { getCurrentAdminEmail } from '@/lib/admin-auth';
import { POST, GET, PATCH, DELETE } from '../route';

// Mock the dependencies
jest.mock('@/lib/analytics');
jest.mock('@/lib/admin-auth');

const mockCreateResourceSubmission =
  createResourceSubmission as jest.MockedFunction<
    typeof createResourceSubmission
  >;
const mockGetResourceSubmissions =
  getResourceSubmissions as jest.MockedFunction<typeof getResourceSubmissions>;
const mockUpdateResourceSubmissionStatus =
  updateResourceSubmissionStatus as jest.MockedFunction<
    typeof updateResourceSubmissionStatus
  >;
const mockDeleteResourceSubmission =
  deleteResourceSubmission as jest.MockedFunction<
    typeof deleteResourceSubmission
  >;
const mockGetCurrentAdminEmail = getCurrentAdminEmail as jest.MockedFunction<
  typeof getCurrentAdminEmail
>;

describe('POST /api/submissions', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should create a new submission with valid data', async () => {
    const now = new Date();
    const mockSubmission = {
      id: '123',
      title: 'Test Resource',
      url: 'https://example.com',
      description: 'A test resource',
      status: 'PENDING' as const,
      createdAt: now,
      updatedAt: now,
    };
    mockCreateResourceSubmission.mockResolvedValue(mockSubmission);

    const request = new NextRequest('http://localhost:3000/api/submissions', {
      method: 'POST',
      body: JSON.stringify({
        title: 'Test Resource',
        url: 'https://example.com',
        description: 'A test resource',
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.data).toEqual({
      ...mockSubmission,
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
    });
    expect(mockCreateResourceSubmission).toHaveBeenCalledWith({
      title: 'Test Resource',
      url: 'https://example.com',
      description: 'A test resource',
      icon: undefined,
      category: undefined,
      submitter: undefined,
      email: undefined,
    });
  });

  it('should return 400 if title is missing', async () => {
    const request = new NextRequest('http://localhost:3000/api/submissions', {
      method: 'POST',
      body: JSON.stringify({
        url: 'https://example.com',
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe('Title and URL are required');
  });

  it('should return 400 if URL is missing', async () => {
    const request = new NextRequest('http://localhost:3000/api/submissions', {
      method: 'POST',
      body: JSON.stringify({
        title: 'Test Resource',
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe('Title and URL are required');
  });

  it('should return 500 if creation fails', async () => {
    mockCreateResourceSubmission.mockRejectedValue(new Error('Database error'));

    const request = new NextRequest('http://localhost:3000/api/submissions', {
      method: 'POST',
      body: JSON.stringify({
        title: 'Test Resource',
        url: 'https://example.com',
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.error).toBe('Database error');
  });
});

describe('GET /api/submissions', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return all submissions for admin', async () => {
    mockGetCurrentAdminEmail.mockResolvedValue('admin@example.com');
    const now = new Date();
    const mockSubmissions: ResourceSubmission[] = [
      {
        id: '1',
        title: 'Resource 1',
        url: 'https://example1.com',
        status: 'PENDING',
        createdAt: now,
        updatedAt: now,
      },
      {
        id: '2',
        title: 'Resource 2',
        url: 'https://example2.com',
        status: 'APPROVED',
        createdAt: now,
        updatedAt: now,
      },
    ];
    mockGetResourceSubmissions.mockResolvedValue(mockSubmissions);

    const request = new NextRequest('http://localhost:3000/api/submissions');
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.data).toEqual([
      {
        ...mockSubmissions[0],
        createdAt: now.toISOString(),
        updatedAt: now.toISOString(),
      },
      {
        ...mockSubmissions[1],
        createdAt: now.toISOString(),
        updatedAt: now.toISOString(),
      },
    ]);
  });

  it('should return submissions filtered by status', async () => {
    mockGetCurrentAdminEmail.mockResolvedValue('admin@example.com');
    const now = new Date();
    const mockSubmissions: ResourceSubmission[] = [
      {
        id: '1',
        title: 'Resource 1',
        url: 'https://example1.com',
        status: 'PENDING',
        createdAt: now,
        updatedAt: now,
      },
    ];
    mockGetResourceSubmissions.mockResolvedValue(mockSubmissions);

    const request = new NextRequest(
      'http://localhost:3000/api/submissions?status=PENDING',
    );
    await GET(request);

    expect(mockGetResourceSubmissions).toHaveBeenCalledWith('PENDING');
  });

  it('should return 401 if not admin', async () => {
    mockGetCurrentAdminEmail.mockResolvedValue(null);

    const request = new NextRequest('http://localhost:3000/api/submissions');
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.error).toBe('Unauthorized');
  });

  it('should return 500 on error', async () => {
    mockGetCurrentAdminEmail.mockResolvedValue('admin@example.com');
    mockGetResourceSubmissions.mockRejectedValue(new Error('Database error'));

    const request = new NextRequest('http://localhost:3000/api/submissions');
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.error).toBe('Database error');
  });
});

describe('PATCH /api/submissions', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should update submission status', async () => {
    mockGetCurrentAdminEmail.mockResolvedValue('admin@example.com');
    const now = new Date();
    const updatedSubmission: ResourceSubmission = {
      id: '123',
      title: 'Test Resource',
      url: 'https://example.com',
      status: 'APPROVED',
      createdAt: now,
      updatedAt: now,
    };
    mockUpdateResourceSubmissionStatus.mockResolvedValue(updatedSubmission);

    const request = new NextRequest('http://localhost:3000/api/submissions', {
      method: 'PATCH',
      body: JSON.stringify({
        id: '123',
        status: 'APPROVED',
      }),
    });

    const response = await PATCH(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.data).toEqual({
      ...updatedSubmission,
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
    });
    expect(mockUpdateResourceSubmissionStatus).toHaveBeenCalledWith(
      '123',
      'APPROVED',
    );
  });

  it('should return 400 if id or status is missing', async () => {
    mockGetCurrentAdminEmail.mockResolvedValue('admin@example.com');

    const request = new NextRequest('http://localhost:3000/api/submissions', {
      method: 'PATCH',
      body: JSON.stringify({
        status: 'APPROVED',
        // id missing
      }),
    });

    const response = await PATCH(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe('ID and status are required');
  });

  it('should return 404 if submission not found', async () => {
    mockGetCurrentAdminEmail.mockResolvedValue('admin@example.com');
    mockUpdateResourceSubmissionStatus.mockResolvedValue(null);

    const request = new NextRequest('http://localhost:3000/api/submissions', {
      method: 'PATCH',
      body: JSON.stringify({
        id: 'nonexistent',
        status: 'APPROVED',
      }),
    });

    const response = await PATCH(request);
    const data = await response.json();

    expect(response.status).toBe(404);
    expect(data.error).toBe('Submission not found');
  });

  it('should return 401 if not admin', async () => {
    mockGetCurrentAdminEmail.mockResolvedValue(null);

    const request = new NextRequest('http://localhost:3000/api/submissions', {
      method: 'PATCH',
      body: JSON.stringify({
        id: '123',
        status: 'APPROVED',
      }),
    });

    const response = await PATCH(request);
    expect(response.status).toBe(401);
  });
});

describe('DELETE /api/submissions', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should delete a submission', async () => {
    mockGetCurrentAdminEmail.mockResolvedValue('admin@example.com');
    mockDeleteResourceSubmission.mockResolvedValue(true);

    const request = new NextRequest(
      'http://localhost:3000/api/submissions?id=123',
      {
        method: 'DELETE',
      },
    );

    const response = await DELETE(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(mockDeleteResourceSubmission).toHaveBeenCalledWith('123');
  });

  it('should return 400 if id is missing', async () => {
    mockGetCurrentAdminEmail.mockResolvedValue('admin@example.com');

    const request = new NextRequest('http://localhost:3000/api/submissions', {
      method: 'DELETE',
    });

    const response = await DELETE(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe('ID is required');
  });

  it('should return 401 if not admin', async () => {
    mockGetCurrentAdminEmail.mockResolvedValue(null);

    const request = new NextRequest(
      'http://localhost:3000/api/submissions?id=123',
      {
        method: 'DELETE',
      },
    );

    const response = await DELETE(request);
    expect(response.status).toBe(401);
  });
});
