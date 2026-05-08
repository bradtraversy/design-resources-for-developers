'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ImportResource, ImportResult } from '@/lib/types';

export function BulkImportForm() {
  const [jsonInput, setJsonInput] = useState('');
  const [isPending, setIsPending] = useState(false);
  const [result, setResult] = useState<ImportResult | null>(null);

  const handleImport = async () => {
    if (!jsonInput.trim()) {
      toast.error('Please enter JSON data');
      return;
    }

    setIsPending(true);
    setResult(null);

    try {
      const resources: ImportResource[] = JSON.parse(jsonInput);

      if (!Array.isArray(resources)) {
        throw new Error('Input must be a JSON array');
      }

      const response = await fetch('/api/bulk-import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resources }),
      });

      const data = await response.json();
      if (!data.success) {
        throw new Error(data.error || 'Failed to import resources');
      }

      setResult(data.data);

      if (data.data.success > 0) {
        toast.success(`Successfully imported ${data.data.success} resources`);
      }
      if (data.data.failed > 0) {
        toast.error(`${data.data.failed} resources failed to import`);
      }
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'Failed to parse JSON',
      );
    } finally {
      setIsPending(false);
    }
  };

  const handleCsvImport = async () => {
    if (!jsonInput.trim()) {
      toast.error('Please enter CSV data');
      return;
    }

    setIsPending(true);
    setResult(null);

    try {
      const lines = jsonInput.trim().split('\n');
      const headers = lines[0].split(',').map(h => h.trim());

      const resources: ImportResource[] = lines.slice(1).map(line => {
        const values = line.split(',').map(v => v.trim());
        const resource: ImportResource = {
          title: '',
          url: '',
          category: '',
        };

        headers.forEach((header, index) => {
          const value = values[index] || '';
          switch (header.toLowerCase()) {
            case 'title':
              resource.title = value;
              break;
            case 'url':
              resource.url = value;
              break;
            case 'description':
              resource.description = value;
              break;
            case 'icon':
              resource.icon = value;
              break;
            case 'category':
              resource.category = value;
              break;
          }
        });

        return resource;
      });

      const response = await fetch('/api/bulk-import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resources }),
      });

      const data = await response.json();
      if (!data.success) {
        throw new Error(data.error || 'Failed to import resources');
      }

      setResult(data.data);

      if (data.data.success > 0) {
        toast.success(`Successfully imported ${data.data.success} resources`);
      }
      if (data.data.failed > 0) {
        toast.error(`${data.data.failed} resources failed to import`);
      }
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'Failed to parse CSV',
      );
    } finally {
      setIsPending(false);
    }
  };

  return (
    <div className='space-y-4'>
      <div>
        <h3 className='mb-2 text-lg font-semibold'>Bulk Import Resources</h3>
        <p className='mb-4 text-sm text-gray-600'>
          Import resources from JSON or CSV format. JSON format:
          <code className='block bg-gray-100 p-2 rounded mt-1 text-xs'>
            [
            {`{ "title": "Resource Name", "url": "https://...", "category": "Design" }`}
            ]
          </code>
        </p>
      </div>

      <Textarea
        value={jsonInput}
        onChange={e => setJsonInput(e.target.value)}
        placeholder='Enter JSON array or CSV data...'
        rows={10}
        disabled={isPending}
      />

      <div className='flex gap-2'>
        <Button onClick={handleImport} disabled={isPending}>
          {isPending ? 'Importing...' : 'Import JSON'}
        </Button>
        <Button
          onClick={handleCsvImport}
          disabled={isPending}
          variant='outline'
        >
          Import CSV
        </Button>
      </div>

      {result && (
        <div className='mt-4 rounded border p-4'>
          <h4 className='font-semibold'>Import Results</h4>
          <p>Success: {result.success}</p>
          <p>Failed: {result.failed}</p>
          {result.errors.length > 0 && (
            <div className='mt-2'>
              <p className='font-medium text-red-600'>Errors:</p>
              <ul className='list-inside list-disc text-sm text-red-500'>
                {result.errors.map((error, index) => (
                  <li key={index}>{error}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
