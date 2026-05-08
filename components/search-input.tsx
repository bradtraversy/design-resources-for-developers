'use client';

import { useRouter } from 'next/navigation';
import { Autocomplete } from '@/components/autocomplete';

interface SearchInputProps {
  className?: string;
  placeholder?: string;
  categorySlug?: string;
}

export function SearchInput({
  className,
  placeholder = 'Search links...',
  categorySlug,
}: SearchInputProps) {
  const router = useRouter();

  const handleSearch = (query: string) => {
    if (query.trim()) {
      if (categorySlug) {
        router.push(
          `/${categorySlug}/search?q=${encodeURIComponent(query.trim())}`,
        );
      } else {
        router.push(`/search?q=${encodeURIComponent(query.trim())}`);
      }
    }
  };

  return (
    <Autocomplete
      placeholder={placeholder}
      onSearch={handleSearch}
      className={className}
      categorySlug={categorySlug}
    />
  );
}
