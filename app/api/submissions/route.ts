import { NextRequest, NextResponse } from 'next/server';
import {
  createResourceSubmission,
  getResourceSubmissions,
  updateResourceSubmissionStatus,
  deleteResourceSubmission,
} from '@/lib/analytics';
import { getCurrentAdminEmail } from '@/lib/admin-auth';

// Create a new resource submission (public endpoint)
export async function POST(request: NextRequest) {
  try {
    const data = await request.json();

    // Validate required fields
    if (!data.title || !data.url) {
      return NextResponse.json(
        { error: 'Title and URL are required' },
        { status: 400 },
      );
    }

    const submission = await createResourceSubmission({
      title: data.title,
      url: data.url,
      description: data.description,
      icon: data.icon,
      category: data.category,
      submitter: data.submitter,
      email: data.email,
    });

    return NextResponse.json(
      { success: true, data: submission },
      { status: 200 },
    );
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : 'Failed to create submission',
      },
      { status: 500 },
    );
  }
}

// Get all submissions (admin only)
export async function GET(request: NextRequest) {
  const adminEmail = await getCurrentAdminEmail();
  if (!adminEmail) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const status = searchParams.get('status') as
    | 'PENDING'
    | 'APPROVED'
    | 'REJECTED'
    | undefined;

  try {
    const submissions = await getResourceSubmissions(status);
    return NextResponse.json(
      { success: true, data: submissions },
      { status: 200 },
    );
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : 'Failed to fetch submissions',
      },
      { status: 500 },
    );
  }
}

// Update submission status (admin only)
export async function PATCH(request: NextRequest) {
  const adminEmail = await getCurrentAdminEmail();
  if (!adminEmail) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const data = await request.json();

    if (!data.id || !data.status) {
      return NextResponse.json(
        { error: 'ID and status are required' },
        { status: 400 },
      );
    }

    const submission = await updateResourceSubmissionStatus(
      data.id,
      data.status,
    );

    if (!submission) {
      return NextResponse.json(
        { error: 'Submission not found' },
        { status: 404 },
      );
    }

    return NextResponse.json(
      { success: true, data: submission },
      { status: 200 },
    );
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : 'Failed to update submission',
      },
      { status: 500 },
    );
  }
}

// Delete submission (admin only)
export async function DELETE(request: NextRequest) {
  const adminEmail = await getCurrentAdminEmail();
  if (!adminEmail) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  if (!id) {
    return NextResponse.json({ error: 'ID is required' }, { status: 400 });
  }

  try {
    await deleteResourceSubmission(id);
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : 'Failed to delete submission',
      },
      { status: 500 },
    );
  }
}
