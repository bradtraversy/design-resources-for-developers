'use client';

import { useState } from 'react';
import { ExternalLink, Copy, Check, Heart } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import type { Link as LinkType } from '@/lib/types';
import { useFavorites } from '@/lib/hooks/use-favorites';
import { ShareButtons } from '@/components/share-buttons';

type ViewMode = 'grid' | 'list';

interface LinkCardProps {
  link: LinkType;
  index?: number;
  showFavoriteButton?: boolean;
  view?: ViewMode;
}

export function LinkCard({
  link,
  index = 0,
  showFavoriteButton = true,
  view = 'grid',
}: LinkCardProps) {
  const [copied, setCopied] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
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
    setIsPreviewOpen(true);
  };

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    console.log('Toggle favorite for:', link.id, link.title);
    toggleFavorite(link);
  };

  const handleOpenResource = () => {
    setIsPreviewOpen(false);
    setTimeout(() => {
      window.open(link.url, '_blank', 'noopener,noreferrer');
    }, 100);
  };

  const isListView = view === 'list';

  return (
    <>
      <Card
        className={cn(
          'relative overflow-hidden transition-all duration-300',
          !isListView && 'hover:shadow-lg hover:-translate-y-1',
          isListView && 'hover:bg-slate-50 dark:hover:bg-slate-900',
          'border-slate-200 dark:border-slate-800',
          'hover:border-slate-300 dark:hover:border-slate-700',
          'cursor-pointer',
          isListView && 'py-3 px-4',
        )}
        style={{
          animationDelay: `${index * 50}ms`,
        }}
        onClick={handleCardClick}
      >
        <CardContent className={cn('p-4', isListView && 'py-2 px-0')}>
          <div
            className={cn(
              'flex items-start gap-3',
              isListView && 'items-center flex-1',
            )}
          >
            <div
              className={cn(
                'flex-1 min-w-0',
                isListView && 'flex items-center gap-4',
              )}
            >
              <div className={cn('flex-1', isListView && 'min-w-0')}>
                <h3
                  className={cn(
                    'font-semibold text-slate-900 dark:text-slate-100 truncate transition-colors hover:text-blue-600 dark:hover:text-blue-400',
                    isListView && 'text-sm',
                  )}
                >
                  {link.title}
                </h3>
                {!isListView && (
                  <p className='mt-1 text-sm text-slate-500 dark:text-slate-400 line-clamp-2'>
                    {link.description}
                  </p>
                )}
                {isListView && link.description && (
                  <p className='text-sm text-slate-500 dark:text-slate-400 truncate'>
                    {link.description}
                  </p>
                )}
                <p
                  className={cn(
                    'text-xs text-slate-400 dark:text-slate-500 truncate',
                    isListView && 'hidden',
                  )}
                >
                  {link.url.replace(/^https?:\/\//, '').replace(/\/$/, '')}
                </p>
              </div>
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

              {/* Share Button */}
              <ShareButtons
                url={link.url}
                title={link.title}
                description={link.description}
                size='icon'
                variant='ghost'
              />

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

      {/* Quick Preview Modal - rendered outside Card */}
      <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
        <DialogContent className='max-w-2xl max-h-[85vh] overflow-y-auto'>
          <DialogHeader>
            <DialogTitle className='text-xl'>{link.title}</DialogTitle>
            <DialogDescription className='text-sm mt-2'>
              {link.url.replace(/^https?:\/\//, '').replace(/\/$/, '')}
            </DialogDescription>
          </DialogHeader>
          <div className='space-y-4 mt-4'>
            {link.description && (
              <div>
                <h4 className='text-sm font-medium text-slate-500 dark:text-slate-400 mb-2'>
                  Description
                </h4>
                <p className='text-slate-900 dark:text-slate-100'>
                  {link.description}
                </p>
              </div>
            )}
            {link.icon && (
              <div>
                <h4 className='text-sm font-medium text-slate-500 dark:text-slate-400 mb-2'>
                  Icon
                </h4>
                <div className='text-2xl'>{link.icon}</div>
              </div>
            )}
            <div className='pt-4 border-t'>
              <Button onClick={handleOpenResource} className='w-full'>
                <ExternalLink className='w-4 h-4 mr-2' />
                Open Resource
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
