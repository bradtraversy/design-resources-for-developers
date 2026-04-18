'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Search, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface SearchInputProps {
  className?: string;
  placeholder?: string;
}

export function SearchInput({
  className,
  placeholder = 'Search links...',
}: SearchInputProps) {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [isPending, startTransition] = useTransition();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      startTransition(() => {
        router.push(`?search=${encodeURIComponent(query.trim())}`);
      });
    }
  };

  const handleClear = () => {
    setQuery('');
    router.push('/');
  };

  return (
    <form
      onSubmit={handleSearch}
      className={cn('relative flex items-center gap-2', className)}
      role='search'
    >
      <div className='relative flex-1'>
        <Search
          className={cn(
            'absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 transition-colors',
            query && 'text-slate-500',
          )}
        />
        <Input
          type='search'
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder={placeholder}
          className='pl-10 pr-10'
          aria-label='Search links'
        />
        {query && (
          <button
            type='button'
            onClick={handleClear}
            className='absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors'
            aria-label='Clear search'
          >
            <X className='w-3 h-3 text-slate-400' />
          </button>
        )}
      </div>
      <Button
        type='submit'
        size='sm'
        disabled={!query.trim() || isPending}
        className='shrink-0'
      >
        {isPending ? 'Searching...' : 'Search'}
      </Button>
    </form>
  );
}
