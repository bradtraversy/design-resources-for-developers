'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { LayoutGrid, List } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

type ViewMode = 'grid' | 'list';

interface ViewToggleProps {
  className?: string;
}

export function ViewToggle({ className }: ViewToggleProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentView = (searchParams.get('view') as ViewMode) || 'grid';

  const handleViewChange = (view: ViewMode) => {
    const params = new URLSearchParams(searchParams.toString());
    if (view === 'grid') {
      params.delete('view');
    } else {
      params.set('view', view);
    }
    const newSearch = params.toString();
    router.push(`?${newSearch}`, { scroll: false });
  };

  return (
    <div
      className={cn(
        'flex items-center gap-1 p-1 rounded-lg bg-slate-100 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60',
        className,
      )}
      role='group'
      aria-label='View toggle'
    >
      <Button
        variant='ghost'
        size='sm'
        onClick={() => handleViewChange('grid')}
        className={cn(
          'gap-1.5 px-3 h-8',
          currentView === 'grid'
            ? 'bg-white dark:bg-slate-700/60 shadow-sm'
            : 'hover:bg-slate-200 dark:hover:bg-slate-700/40',
        )}
        aria-pressed={currentView === 'grid'}
        aria-label='Grid view'
      >
        <LayoutGrid className='w-4 h-4' />
        <span className='hidden sm:inline text-sm'>Grid</span>
      </Button>
      <Button
        variant='ghost'
        size='sm'
        onClick={() => handleViewChange('list')}
        className={cn(
          'gap-1.5 px-3 h-8',
          currentView === 'list'
            ? 'bg-white dark:bg-slate-700/60 shadow-sm'
            : 'hover:bg-slate-200 dark:hover:bg-slate-700/40',
        )}
        aria-pressed={currentView === 'list'}
        aria-label='List view'
      >
        <List className='w-4 h-4' />
        <span className='hidden sm:inline text-sm'>List</span>
      </Button>
    </div>
  );
}
