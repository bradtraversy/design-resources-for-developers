'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface AdminSearchInputProps {
  className?: string;
  placeholder?: string;
  onSearch: (query: string) => void;
}

export function AdminSearchInput({
  placeholder = 'Search categories and links...',
  onSearch,
}: AdminSearchInputProps) {
  const [query, setQuery] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(query);
  };

  return (
    <form onSubmit={handleSubmit} className='relative flex w-full'>
      <Input
        type='search'
        value={query}
        onChange={e => setQuery(e.target.value)}
        placeholder={placeholder}
        className='flex-1 h-10 pl-10 pr-4'
      />
      <Button type='submit' className='ml-2 h-10 px-4'>
        Search
      </Button>
    </form>
  );
}
