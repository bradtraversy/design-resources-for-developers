import { NextRequest, NextResponse } from 'next/server';
import { getAutocompleteSuggestionsAction } from '@/app/actions';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q');
  const categorySlug = searchParams.get('category');

  if (!query || query.trim().length < 2) {
    return NextResponse.json({ suggestions: [] });
  }

  const result = await getAutocompleteSuggestionsAction(
    query.trim(),
    categorySlug || undefined,
  );

  if (!result.success) {
    return NextResponse.json(
      { error: result.error || 'Failed to get suggestions' },
      { status: 500 },
    );
  }

  return NextResponse.json({ suggestions: result.data || [] });
}
