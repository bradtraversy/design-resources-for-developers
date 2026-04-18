'use client';

import { useState } from 'react';
import { ExternalLink, Copy, Check, Heart } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { Link as LinkType } from '@/lib/types';
import { useFavorites } from '@/lib/hooks/use-favorites';

interface LinkCardProps {
  link: LinkType;
  index?: number;
  showFavoriteButton?: boolean;
}

export function LinkCard({
  link,
  index = 0,
  showFavoriteButton = true,
}: LinkCardProps) {
  const [copied, setCopied] = useState(false);
  const { isFavorite, toggleFavorite } = useFavorites();
  const isFavorited = isFavorite(link.id);

  const handleCopy = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(link.url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleCardClick = () => {
    window.open(link.url, '_blank', 'noopener,noreferrer');
  };

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    console.log('Toggle favorite for:', link.id, link.title);
    toggleFavorite(link);
  };

  return (
    <Card
      className={cn(
        'relative overflow-hidden transition-all duration-300',
        'hover:shadow-lg hover:-translate-y-1',
        'border-slate-200 dark:border-slate-800',
        'hover:border-slate-300 dark:hover:border-slate-700',
        'cursor-pointer',
      )}
      style={{
        animationDelay: `${index * 50}ms`,
      }}
      onClick={handleCardClick}
    >
      <CardContent className='p-4'>
        <div className='flex items-start justify-between gap-3'>
          <div className='flex-1 min-w-0'>
            <h3 className='font-semibold text-slate-900 dark:text-slate-100 truncate transition-colors hover:text-blue-600 dark:hover:text-blue-400'>
              {link.title}
            </h3>
            <div className='relative mt-1 group/desc'>
              <p className='text-sm text-slate-500 dark:text-slate-400 line-clamp-2 group-hover/desc:opacity-0 transition-opacity duration-150'>
                {link.description}
              </p>
              <div className='absolute top-0 left-0 opacity-0 group-hover/desc:opacity-100 transition-opacity duration-150'>
                <Badge
                  variant='secondary'
                  className='whitespace-normal text-left font-normal text-sm'
                >
                  {link.description}
                </Badge>
              </div>
            </div>
            <p className='mt-2 text-xs text-slate-400 dark:text-slate-500 truncate'>
              {link.url.replace(/^https?:\/\//, '').replace(/\/$/, '')}
            </p>
          </div>

          <div className='flex items-center gap-1'>
            {/* Favorite Button - always visible */}
            {showFavoriteButton && (
              <Button
                variant='ghost'
                size='icon'
                onClick={handleFavoriteClick}
                className={cn(
                  'p-2 rounded-lg transition-colors flex-shrink-0',
                  isFavorited
                    ? 'text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950'
                    : 'text-slate-400 hover:text-red-500 hover:bg-slate-100 dark:hover:bg-slate-800',
                )}
                aria-label={
                  isFavorited ? 'Remove from favorites' : 'Add to favorites'
                }
                title={
                  isFavorited ? 'Remove from favorites' : 'Add to favorites'
                }
              >
                <Heart
                  className={cn('w-4 h-4', isFavorited && 'fill-current')}
                />
              </Button>
            )}

            <Button
              variant='ghost'
              size='icon'
              onClick={handleCopy}
              className='p-2 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors flex-shrink-0'
              aria-label={copied ? 'Copied!' : 'Copy link'}
              title={copied ? 'Copied!' : 'Copy link'}
            >
              {copied ? (
                <Check className='w-4 h-4 text-green-500' />
              ) : (
                <Copy className='w-4 h-4 text-slate-500' />
              )}
            </Button>

            <span
              className={cn(
                'p-2 rounded-lg bg-slate-100 dark:bg-slate-800 flex-shrink-0',
              )}
            >
              <ExternalLink className='w-4 h-4 text-slate-500' />
            </span>
          </div>
        </div>
      </CardContent>

      {/* Gradient overlay on hover */}
      <div
        className={cn(
          'absolute inset-0 bg-gradient-to-r from-transparent via-blue-500/5 to-transparent',
          'opacity-0 group-hover:opacity-100 transition-opacity duration-300',
          'pointer-events-none',
        )}
      />
    </Card>
  );
}
