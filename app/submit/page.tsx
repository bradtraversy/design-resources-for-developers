'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

export default function SubmitResourcePage() {
  const [isPending, setIsPending] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsPending(true);

    const formData = new FormData(e.currentTarget);
    const data = {
      title: formData.get('title') as string,
      url: formData.get('url') as string,
      description: formData.get('description') as string,
      icon: formData.get('icon') as string,
      category: formData.get('category') as string,
      submitter: formData.get('submitter') as string,
      email: formData.get('email') as string,
    };

    try {
      const response = await fetch('/api/submissions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (result.success) {
        toast.success(
          'Resource submitted successfully! It will be reviewed by an admin.',
        );
        (e.target as HTMLFormElement).reset();
      } else {
        toast.error(result.error || 'Failed to submit resource');
      }
    } catch {
      toast.error('An error occurred while submitting');
    } finally {
      setIsPending(false);
    }
  };

  return (
    <main className='mx-auto max-w-2xl p-6'>
      <h1 className='mb-6 text-3xl font-bold'>Submit a Resource</h1>
      <p className='mb-6 text-gray-600'>
        Know a great design resource? Share it with us! Fill out the form below
        and our admins will review it for inclusion in our directory.
      </p>

      <form onSubmit={handleSubmit} className='space-y-4'>
        <div>
          <Label htmlFor='title'>Title *</Label>
          <Input
            id='title'
            name='title'
            required
            placeholder='e.g., Figma Community'
            disabled={isPending}
          />
        </div>

        <div>
          <Label htmlFor='url'>URL *</Label>
          <Input
            id='url'
            name='url'
            type='url'
            required
            placeholder='https://example.com'
            disabled={isPending}
          />
        </div>

        <div>
          <Label htmlFor='description'>Description</Label>
          <Textarea
            id='description'
            name='description'
            placeholder='Brief description of the resource...'
            rows={3}
            disabled={isPending}
          />
        </div>

        <div>
          <Label htmlFor='category'>Category</Label>
          <Input
            id='category'
            name='category'
            placeholder='e.g., Design Tools, Inspiration'
            disabled={isPending}
          />
        </div>

        <div>
          <Label htmlFor='icon'>Icon (optional)</Label>
          <Input
            id='icon'
            name='icon'
            placeholder='Emoji or image URL'
            disabled={isPending}
          />
        </div>

        <div>
          <Label htmlFor='submitter'>Your Name (optional)</Label>
          <Input
            id='submitter'
            name='submitter'
            placeholder='John Doe'
            disabled={isPending}
          />
        </div>

        <div>
          <Label htmlFor='email'>Your Email (optional)</Label>
          <Input
            id='email'
            name='email'
            type='email'
            placeholder='john@example.com'
            disabled={isPending}
          />
        </div>

        <Button type='submit' disabled={isPending} className='w-full'>
          {isPending ? 'Submitting...' : 'Submit Resource'}
        </Button>
      </form>
    </main>
  );
}
