'use client';

import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ResourceSubmission } from '@/lib/types';

export function SubmissionsReview() {
  const [submissions, setSubmissions] = useState<ResourceSubmission[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSubmissions = async () => {
      try {
        const response = await fetch('/api/submissions?status=PENDING');
        const data = await response.json();
        if (data.success) {
          setSubmissions(data.data);
        }
      } catch {
        toast.error('Failed to fetch submissions');
      } finally {
        setLoading(false);
      }
    };
    fetchSubmissions();
  }, []);

  const handleStatusChange = async (
    id: string,
    status: 'APPROVED' | 'REJECTED',
  ) => {
    try {
      const response = await fetch('/api/submissions', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status }),
      });

      const data = await response.json();
      if (data.success) {
        toast.success(`Submission ${status.toLowerCase()}`);
        setSubmissions(submissions.filter(s => s.id !== id));
      } else {
        toast.error(data.error || 'Failed to update submission');
      }
    } catch {
      toast.error('Failed to update submission');
    }
  };

  if (loading) {
    return <div className='py-8 text-center'>Loading submissions...</div>;
  }

  if (submissions.length === 0) {
    return <p className='text-center text-gray-500'>No pending submissions</p>;
  }

  return (
    <div className='space-y-4'>
      <h3 className='text-lg font-semibold'>
        Pending Submissions ({submissions.length})
      </h3>

      {submissions.map(submission => (
        <Card key={submission.id}>
          <CardHeader>
            <CardTitle className='flex items-center justify-between'>
              <span>{submission.title}</span>
              <Badge variant='secondary'>{submission.status}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className='space-y-2'>
              <p>
                <span className='font-medium'>URL:</span>{' '}
                <a
                  href={submission.url}
                  target='_blank'
                  rel='noopener noreferrer'
                  className='text-blue-600 hover:underline'
                >
                  {submission.url}
                </a>
              </p>
              {submission.description && (
                <p>
                  <span className='font-medium'>Description:</span>{' '}
                  {submission.description}
                </p>
              )}
              {submission.category && (
                <p>
                  <span className='font-medium'>Category:</span>{' '}
                  {submission.category}
                </p>
              )}
              {submission.submitter && (
                <p>
                  <span className='font-medium'>Submitted by:</span>{' '}
                  {submission.submitter}
                </p>
              )}
              {submission.email && (
                <p>
                  <span className='font-medium'>Email:</span> {submission.email}
                </p>
              )}
              <div className='flex gap-2 pt-2'>
                <Button
                  size='sm'
                  onClick={() => handleStatusChange(submission.id, 'APPROVED')}
                >
                  Approve
                </Button>
                <Button
                  size='sm'
                  variant='destructive'
                  onClick={() => handleStatusChange(submission.id, 'REJECTED')}
                >
                  Reject
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
