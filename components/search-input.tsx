'use client';

import { useRouter } from 'next/navigation';
import { Autocomplete } from '@/components/autocomplete';

interface SearchInputProps {
  className?: string;
  placeholder?: string;
}

export function SearchInput({
  className,
  placeholder = 'Search links...',
}: SearchInputProps) {
  const router = useRouter();

  const handleSearch = (query: string) => {
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query.trim())}`);
    }
  };

  return (
    <Autocomplete
      placeholder={placeholder}
      onSearch={handleSearch}
      className={className}
    />
  );
}
