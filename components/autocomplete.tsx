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
          {/* Search Icon */}
          <Search
            className={cn(
              'absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors z-10',
              query ? 'text-cyan-500' : 'text-slate-400',
            )}
          />

          {/* Input Field - Glass Card Style */}
          <Input
            ref={inputRef}
            type='search'
            value={query}
            onChange={handleInputChange}
            onFocus={handleInputFocus}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            className={cn(
              'pl-11 pr-12 h-11 md:h-12',
              'bg-slate-50/50 dark:bg-slate-800/50',
              'border-slate-200/50 dark:border-slate-700/50',
              'focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/20',
              'hover:border-slate-300/50 dark:hover:border-slate-600/50',
              'text-slate-900 dark:text-slate-100',
              'placeholder:text-slate-400 dark:placeholder:text-slate-500',
              'rounded-xl transition-all duration-300',
              'shadow-sm hover:shadow-md',
            )}
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
              <Loader2 className='w-4 h-4 text-cyan-500 animate-spin' />
            ) : query ? (
              <button
                type='button'
                onClick={handleClear}
                className='p-1.5 rounded-lg bg-slate-100 dark:bg-slate-700/50 hover:bg-slate-200 dark:hover:bg-slate-600/50 transition-all duration-200 group'
                aria-label='Clear search'
              >
                <span className='sr-only'>Clear</span>
                <svg
                  className='w-3.5 h-3.5 text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300 transition-colors'
                  fill='none'
                  viewBox='0 0 24 24'
                  stroke='currentColor'
                  strokeWidth={2.5}
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    d='M6 18L18 6M6 6l12 12'
                  />
                </svg>
              </button>
            ) : null}
          </div>
        </div>
      </form>

      {/* Suggestions Dropdown - Glass Card */}
      {isOpen && suggestions.length > 0 && (
        <ul
          id='autocomplete-list'
          role='listbox'
          className={cn(
            'absolute z-50 w-full mt-2 rounded-xl',
            'bg-white/90 dark:bg-slate-900/90',
            'backdrop-blur-xl backdrop-saturate-150',
            'border border-slate-200/50 dark:border-slate-700/50',
            'shadow-2xl shadow-black/10 dark:shadow-black/30',
            'max-h-96 overflow-y-auto',
            'animate-fade-in',
          )}
        >
          {suggestions.map((suggestion, index) => (
            <li
              key={suggestion.id}
              role='option'
              aria-selected={index === selectedIndex}
              className={cn(
                'px-4 py-3 cursor-pointer transition-all duration-150',
                'flex items-center gap-3',
                'border-b border-slate-100/50 dark:border-slate-800/50 last:border-b-0',
                index === suggestions.length - 1 ? 'rounded-b-xl' : '',
                index === 0 ? 'rounded-t-xl' : '',
                'hover:bg-slate-100/50 dark:hover:bg-slate-800/50',
                index === selectedIndex && [
                  'bg-cyan-500/10 dark:bg-cyan-500/15',
                  'border-l-2 border-cyan-500/50',
                ],
              )}
              onClick={() => handleSuggestionClick(suggestion)}
              onMouseEnter={() => setSelectedIndex(index)}
            >
              {/* Icon */}
              <div className='w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center flex-shrink-0'>
                {suggestion.icon ? (
                  <span className='text-lg'>{suggestion.icon}</span>
                ) : (
                  <Search className='w-4 h-4 text-slate-400' />
                )}
              </div>

              {/* Content */}
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

              {/* Keyboard hint */}
              {index === selectedIndex && (
                <kbd className='hidden sm:inline-flex items-center px-2 py-0.5 text-[10px] text-cyan-600 dark:text-cyan-400 bg-cyan-100 dark:bg-cyan-900/30 rounded font-mono font-medium'>
                  Enter
                </kbd>
              )}
            </li>
          ))}
        </ul>
      )}

      {/* Empty state when no suggestions but query exists */}
      {isOpen &&
        query.length >= 2 &&
        !isLoading &&
        suggestions.length === 0 && (
          <div
            className={cn(
              'absolute z-50 w-full mt-2 rounded-xl',
              'bg-white/90 dark:bg-slate-900/90',
              'backdrop-blur-xl backdrop-saturate-150',
              'border border-slate-200/50 dark:border-slate-700/50',
              'shadow-2xl shadow-black/10 dark:shadow-black/30',
              'p-4 animate-fade-in',
            )}
          >
            <div className='flex flex-col items-center justify-center py-6'>
              <div className='w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-3'>
                <Search className='w-5 h-5 text-slate-400' />
              </div>
              <p className='text-sm text-slate-500 dark:text-slate-400 text-center'>
                No results found for{' '}
                <span className='font-medium text-slate-700 dark:text-slate-300'>
                  "{query}"
                </span>
              </p>
            </div>
          </div>
        )}
    </div>
  );
}
