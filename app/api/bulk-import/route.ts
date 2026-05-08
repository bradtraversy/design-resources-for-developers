import { NextRequest, NextResponse } from 'next/server';
import { bulkImportResources } from '@/lib/analytics';
import { getCurrentAdminEmail } from '@/lib/admin-auth';

export async function POST(request: NextRequest) {
  const adminEmail = await getCurrentAdminEmail();
  if (!adminEmail) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const data = await request.json();

    if (!data.resources || !Array.isArray(data.resources)) {
      return NextResponse.json(
        { error: 'Resources array is required' },
        { status: 400 },
      );
    }

    const result = await bulkImportResources(data.resources);

    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : 'Failed to import resources',
      },
      { status: 500 },
    );
  }
}
