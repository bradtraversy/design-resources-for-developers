import { NextRequest, NextResponse } from 'next/server';
import {
  getPopularResources,
  getPopularCategories,
  getTrendData,
} from '@/lib/analytics';
import { getCurrentAdminEmail } from '@/lib/admin-auth';

export async function GET(request: NextRequest) {
  const adminEmail = await getCurrentAdminEmail();
  if (!adminEmail) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const type = searchParams.get('type') || 'popular';
  const timeRange = (searchParams.get('timeRange') || 'weekly') as
    | 'daily'
    | 'weekly'
    | 'monthly';

  try {
    switch (type) {
      case 'popular':
        const resources = await getPopularResources(10);
        return NextResponse.json({ success: true, data: resources });
      case 'categories':
        const categories = await getPopularCategories(10);
        return NextResponse.json({ success: true, data: categories });
      case 'trends':
        const trends = await getTrendData(timeRange);
        return NextResponse.json({ success: true, data: trends });
      default:
        return NextResponse.json(
          { error: 'Invalid type parameter' },
          { status: 400 },
        );
    }
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : 'Failed to fetch analytics',
      },
      { status: 500 },
    );
  }
}
