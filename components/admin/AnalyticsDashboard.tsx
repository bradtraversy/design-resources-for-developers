'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  PopularResource,
  PopularCategory,
  TrendData,
  TimeRange,
} from '@/lib/types';

async function fetchAnalytics(type: string, timeRange?: TimeRange) {
  const params = new URLSearchParams({ type });
  if (timeRange) params.set('timeRange', timeRange);

  const response = await fetch(`/api/analytics?${params.toString()}`);
  if (!response.ok) {
    throw new Error('Failed to fetch analytics');
  }
  const data = await response.json();
  if (!data.success) {
    throw new Error(data.error || 'Failed to fetch analytics');
  }
  return data.data;
}

export function AnalyticsDashboard() {
  const [popularResources, setPopularResources] = useState<PopularResource[]>(
    [],
  );
  const [popularCategories, setPopularCategories] = useState<PopularCategory[]>(
    [],
  );
  const [trendData, setTrendData] = useState<TrendData[]>([]);
  const [timeRange, setTimeRange] = useState<TimeRange>('weekly');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [resources, categories, trends] = await Promise.all([
          fetchAnalytics('popular'),
          fetchAnalytics('categories'),
          fetchAnalytics('trends', timeRange),
        ]);
        setPopularResources(resources);
        setPopularCategories(categories);
        setTrendData(trends);
      } catch (error) {
        console.error('Failed to fetch analytics:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [timeRange]);

  if (loading) {
    return <div className='py-8 text-center'>Loading analytics...</div>;
  }

  return (
    <div className='space-y-6'>
      <div className='flex items-center justify-between'>
        <h2 className='text-2xl font-bold'>Analytics Dashboard</h2>
        <div className='flex gap-2'>
          {(['daily', 'weekly', 'monthly'] as TimeRange[]).map(range => (
            <Button
              key={range}
              variant={timeRange === range ? 'default' : 'outline'}
              size='sm'
              onClick={() => setTimeRange(range)}
            >
              {range.charAt(0).toUpperCase() + range.slice(1)}
            </Button>
          ))}
        </div>
      </div>

      <div className='grid gap-6 md:grid-cols-2'>
        <Card>
          <CardHeader>
            <CardTitle>Most Popular Resources</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className='space-y-2'>
              {popularResources.map((resource, index) => (
                <li
                  key={resource.id}
                  className='flex items-center justify-between'
                >
                  <div>
                    <span className='font-medium'>
                      {index + 1}. {resource.title}
                    </span>
                    <span className='text-sm text-gray-500'>
                      {' '}
                      ({resource.categoryName})
                    </span>
                  </div>
                  <span className='text-sm font-semibold'>
                    {resource.clicks} clicks
                  </span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Most Popular Categories</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className='space-y-2'>
              {popularCategories.map((category, index) => (
                <li
                  key={category.id}
                  className='flex items-center justify-between'
                >
                  <div>
                    <span className='font-medium'>
                      {index + 1}. {category.name}
                    </span>
                    <span className='text-sm text-gray-500'>
                      {' '}
                      ({category.linkCount} resources)
                    </span>
                  </div>
                  <span className='text-sm font-semibold'>
                    {category.totalClicks} clicks
                  </span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Trends ({timeRange})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className='h-64'>
            {trendData.length > 0 ? (
              <div className='flex h-full items-end justify-between gap-2'>
                {trendData.map((data, index) => {
                  const maxClicks = Math.max(...trendData.map(d => d.clicks));
                  const height =
                    maxClicks > 0 ? (data.clicks / maxClicks) * 100 : 0;
                  return (
                    <div key={index} className='flex flex-col items-center'>
                      <div className='flex flex-col items-center gap-1'>
                        <div
                          className='w-8 bg-blue-500 rounded-t'
                          style={{ height: `${height}%` }}
                          title={`${data.clicks} clicks, ${data.submissions} submissions`}
                        />
                        <div
                          className='w-8 bg-green-500 rounded-t'
                          style={{
                            height:
                              maxClicks > 0
                                ? (data.submissions / maxClicks) * 100 * 0.5
                                : 0,
                          }}
                          title={`${data.submissions} submissions`}
                        />
                      </div>
                      <span className='text-xs mt-1'>{data.date.slice(5)}</span>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className='text-center text-gray-500'>No data available</p>
            )}
          </div>
          <div className='mt-4 flex justify-center gap-4 text-sm'>
            <div className='flex items-center gap-2'>
              <div className='w-4 h-4 bg-blue-500 rounded'></div>
              <span>Clicks</span>
            </div>
            <div className='flex items-center gap-2'>
              <div className='w-4 h-4 bg-green-500 rounded'></div>
              <span>Submissions</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
