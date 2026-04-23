'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import type { Link } from '@/lib/types';

interface AutocompleteProps {
  className?: string;
  placeholder?: string;
  onSearch?: (query: string) => void;
}

export function Autocomplete({
  className,
  placeholder = 'Search all resources...',
  onSearch,
}: AutocompleteProps) {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<
    (Link & { categorySlug?: string })[]
  >([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Debounced fetch of suggestions
  useEffect(() => {
    const abortController = new AbortController();

    const fetchSuggestions = async () => {
      if (!query || query.trim().length < 2) {
        setSuggestions([]);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);

      try {
        const response = await fetch(
          `/api/suggestions?q=${encodeURIComponent(query.trim())}`,
          { signal: abortController.signal },
        );

        if (response.ok) {
          const data = await response.json();
          setSuggestions(data.suggestions || []);
        } else {
          setSuggestions([]);
        }
      } catch (error) {
        if (error instanceof Error && error.name !== 'AbortError') {
          setSuggestions([]);
        }
      } finally {
        setIsLoading(false);
      }
    };

    const timeoutId = setTimeout(fetchSuggestions, 150);

    return () => {
      clearTimeout(timeoutId);
      abortController.abort();
    };
  }, [query]);

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (query.trim()) {
        setIsOpen(false);
        if (onSearch) {
          onSearch(query.trim());
        } else {
          router.push(`/search?q=${encodeURIComponent(query.trim())}`);
        }
      }
    },
    [query, onSearch, router],
  );

  const handleSuggestionClick = useCallback(
    (suggestion: Link & { categorySlug?: string }) => {
      setQuery(suggestion.title);
      setIsOpen(false);
      if (onSearch) {
        onSearch(suggestion.title);
      } else {
        // Use categorySlug if available, otherwise fall back to categoryId
        const path = suggestion.categorySlug
          ? `/${suggestion.categorySlug}`
          : `/${suggestion.categoryId}`;
        router.push(path);
      }
    },
    [router, onSearch],
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (!isOpen || suggestions.length === 0) return;

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setSelectedIndex(prev =>
            prev < suggestions.length - 1 ? prev + 1 : 0,
          );
          break;
        case 'ArrowUp':
          e.preventDefault();
          setSelectedIndex(prev =>
            prev > 0 ? prev - 1 : suggestions.length - 1,
          );
          break;
        case 'Enter':
          e.preventDefault();
          if (selectedIndex >= 0 && suggestions[selectedIndex]) {
            handleSuggestionClick(suggestions[selectedIndex]);
          } else if (query.trim()) {
            handleSubmit(e as unknown as React.FormEvent);
          }
          break;
        case 'Escape':
          e.preventDefault();
          setIsOpen(false);
          setSelectedIndex(-1);
          break;
        case 'Tab':
          if (selectedIndex >= 0 && suggestions[selectedIndex]) {
            e.preventDefault();
            setQuery(suggestions[selectedIndex].title);
            setSelectedIndex(-1);
          }
          break;
      }
    },
    [
      isOpen,
      suggestions,
      selectedIndex,
      query,
      handleSuggestionClick,
      handleSubmit,
    ],
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    setSelectedIndex(-1);
    setIsOpen(value.length >= 2);
  };

  const handleInputFocus = () => {
    if (query.length >= 2 && suggestions.length > 0) {
      setIsOpen(true);
    }
  };

  const handleClear = () => {
    setQuery('');
    setSuggestions([]);
    setSelectedIndex(-1);
    setIsOpen(false);
    inputRef.current?.focus();
  };

  return (
    <div ref={containerRef} className={cn('relative', className)}>
      <form onSubmit={handleSubmit} role='search'>
        <div className='relative flex items-center'>
          <Search
            className={cn(
              'absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 transition-colors z-10',
              query && 'text-slate-500',
            )}
          />
          <Input
            ref={inputRef}
            type='search'
            value={query}
            onChange={handleInputChange}
            onFocus={handleInputFocus}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            className='pl-10 pr-20'
            aria-label='Search all resources'
            aria-expanded={isOpen}
            aria-autocomplete='list'
            aria-controls='autocomplete-list'
            autoComplete='off'
            autoCorrect='off'
            autoCapitalize='off'
            spellCheck={false}
          />
          {/* Clear button or loading indicator */}
          <div className='absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1'>
            {isLoading ? (
              <Loader2 className='w-4 h-4 text-slate-400 animate-spin' />
            ) : query ? (
              <button
                type='button'
                onClick={handleClear}
                className='p-1 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors'
                aria-label='Clear search'
              >
                <span className='sr-only'>Clear</span>
                <svg
                  className='w-3 h-3 text-slate-400'
                  fill='none'
                  viewBox='0 0 24 24'
                  stroke='currentColor'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M6 18L18 6M6 6l12 12'
                  />
                </svg>
              </button>
            ) : null}
          </div>
        </div>
      </form>

      {/* Suggestions Dropdown */}
      {isOpen && suggestions.length > 0 && (
        <ul
          id='autocomplete-list'
          role='listbox'
          className='absolute z-50 w-full mt-1 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 shadow-lg max-h-80 overflow-y-auto'
        >
          {suggestions.map((suggestion, index) => (
            <li
              key={suggestion.id}
              role='option'
              aria-selected={index === selectedIndex}
              className={cn(
                'px-4 py-3 cursor-pointer transition-colors',
                'hover:bg-slate-100 dark:hover:bg-slate-800',
                index === selectedIndex &&
                  'bg-slate-100 dark:bg-slate-800 ring-inset ring-2 ring-slate-400 dark:ring-slate-600',
              )}
              onClick={() => handleSuggestionClick(suggestion)}
              onMouseEnter={() => setSelectedIndex(index)}
            >
              <div className='flex items-center gap-3'>
                <Search className='w-4 h-4 text-slate-400 shrink-0' />
                <div className='flex-1 min-w-0'>
                  <p className='text-sm font-medium text-slate-900 dark:text-slate-100 truncate'>
                    {suggestion.title}
                  </p>
                  {suggestion.description && (
                    <p className='text-xs text-slate-500 dark:text-slate-400 truncate'>
                      {suggestion.description}
                    </p>
                  )}
                </div>
                <kbd className='hidden sm:inline-flex items-center px-2 py-0.5 text-xs text-slate-400 bg-slate-100 dark:bg-slate-800 rounded'>
                  ↵
                </kbd>
              </div>
            </li>
          ))}
        </ul>
      )}

      {/* Empty state when no suggestions but query exists */}
      {isOpen &&
        query.length >= 2 &&
        !isLoading &&
        suggestions.length === 0 && (
          <div className='absolute z-50 w-full mt-1 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 shadow-lg p-4'>
            <p className='text-sm text-slate-500 dark:text-slate-400 text-center'>
              No results found for&quot;{query}&quot;
            </p>
          </div>
        )}
    </div>
  );
}
