/* eslint-disable react-hooks/rules-of-hooks */
'use client';

import { useState, useEffect } from 'react';
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
  const [mounted, setMounted] = useState(false);
  const { isFavorite, toggleFavorite } = useFavorites();

  useEffect(() => {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    setMounted(true);
  }, []);

  // During SSR and initial hydration, render as not favorited to avoid mismatch
  const displayIsFavorited = mounted ? isFavorite(link.id) : false;

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
          'group relative overflow-hidden transition-all duration-500 ease-out',
          'border border-transparent bg-card',
          !isListView && [
            'hover:shadow-2xl hover:-translate-y-2',
            'hover:border-slate-200 dark:hover:border-slate-700',
          ],
          isListView && [
            'hover:bg-slate-50/50 dark:hover:bg-slate-900/50',
            'hover:border-slate-200 dark:hover:border-slate-700',
          ],
          'cursor-pointer',
        )}
        style={{
          animationDelay: `${index * 60}ms`,
        }}
        onClick={handleCardClick}
      >
        {/* Background gradient overlay */}
        <div
          className={cn(
            'absolute inset-0 opacity-0 group-hover:opacity-100',
            'transition-opacity duration-500',
            'bg-gradient-to-br from-cyan-500/5 via-transparent to-blue-600/5',
          )}
        />

        {/* Decorative corner accent */}
        <div
          className={cn(
            'absolute top-0 right-0 w-20 h-20 -translate-y-1/2 translate-x-1/2',
            'bg-gradient-to-bl from-cyan-400/20 to-transparent',
            'rounded-full blur-2xl',
            'opacity-0 group-hover:opacity-100',
            'transition-opacity duration-500',
          )}
        />

        <CardContent
          className={cn(
            'relative p-4 md:p-5',
            isListView ? 'py-3 md:py-4' : 'pt-5',
          )}
        >
          <div
            className={cn(
              'flex items-start gap-3 md:gap-4',
              isListView && 'items-center flex-1',
            )}
          >
            {/* Icon/Thumbnail */}
            {link.icon && (
              <div
                className={cn(
                  'flex-shrink-0 w-10 h-10 md:w-12 md:h-12',
                  'rounded-xl',
                  'bg-gradient-to-br from-slate-100 to-slate-200',
                  'dark:from-slate-800 dark:to-slate-900',
                  'flex items-center justify-center',
                  'text-2xl md:text-3xl',
                  'shadow-inner',
                  'group-hover:scale-110 transition-transform duration-300',
                )}
              >
                {link.icon}
              </div>
            )}

            <div
              className={cn(
                'flex-1 min-w-0',
                isListView && 'flex items-center gap-3 md:gap-4',
              )}
            >
              <div className={cn('flex-1', isListView && 'min-w-0')}>
                <h3
                  className={cn(
                    'font-display font-semibold text-slate-900 dark:text-slate-100',
                    'truncate transition-colors',
                    'group-hover:text-cyan-600 dark:group-hover:text-cyan-400',
                    isListView ? 'text-base md:text-lg' : 'text-lg md:text-xl',
                  )}
                >
                  {link.title}
                </h3>

                {!isListView && link.description && (
                  <p className='mt-2 text-sm text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed'>
                    {link.description}
                  </p>
                )}

                {isListView && link.description && (
                  <p className='hidden md:block text-sm text-slate-500 dark:text-slate-400 truncate'>
                    {link.description}
                  </p>
                )}

                {/* URL display */}
                <p
                  className={cn(
                    'text-xs text-slate-400 dark:text-slate-500 truncate mt-1',
                    'font-mono',
                    isListView && 'hidden md:block',
                  )}
                >
                  {link.url.replace(/^https?:\/\//, '').replace(/\/$/, '')}
                </p>
              </div>
            </div>

            {/* Action buttons */}
            <div className='flex items-center gap-1 flex-shrink-0'>
              {/* Favorite Button */}
              {showFavoriteButton && (
                <Button
                  variant='ghost'
                  size='icon'
                  onClick={handleFavoriteClick}
                  className={cn(
                    'w-9 h-9 rounded-lg',
                    'transition-all duration-300',
                    'hover:scale-110',
                    displayIsFavorited
                      ? [
                          'text-red-500',
                          'hover:text-red-600',
                          'hover:bg-red-50 dark:hover:bg-red-950/50',
                        ]
                      : [
                          'text-slate-400',
                          'hover:text-red-500',
                          'hover:bg-slate-100 dark:hover:bg-slate-800',
                        ],
                  )}
                  aria-label={
                    displayIsFavorited
                      ? 'Remove from favorites'
                      : 'Add to favorites'
                  }
                >
                  <Heart
                    className={cn(
                      'w-4 h-4 transition-transform duration-300',
                      displayIsFavorited && 'fill-current',
                    )}
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
                showTooltip={false}
                className='w-9 h-9 rounded-lg text-slate-400 hover:text-cyan-500 hover:bg-slate-100 dark:hover:bg-slate-800'
              />

              {/* Copy Button */}
              <Button
                variant='ghost'
                size='icon'
                onClick={handleCopy}
                className={cn(
                  'w-9 h-9 rounded-lg',
                  'bg-slate-100/50 dark:bg-slate-800/50',
                  'hover:bg-slate-200 dark:hover:bg-slate-700',
                  'transition-all duration-300 hover:scale-110',
                )}
                aria-label={copied ? 'Copied!' : 'Copy link'}
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

        {/* Hover shine effect */}
        <div
          className={cn(
            'absolute inset-0 overflow-hidden pointer-events-none',
            'after:absolute after:inset-0 after:-translate-x-full',
            'after:bg-gradient-to-r after:from-transparent',
            'after:via-white/10 after:to-transparent',
            'group-hover:after:translate-x-full',
            'after:transition-transform after:duration-700',
          )}
        />
      </Card>

      {/* Quick Preview Modal */}
      <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
        <DialogContent
          className={cn(
            'max-w-2xl max-h-[90vh] overflow-y-auto',
            'glass-strong',
            'border-slate-200 dark:border-slate-700',
          )}
        >
          <DialogHeader>
            <DialogTitle className='font-display text-2xl font-bold text-slate-900 dark:text-slate-100'>
              {link.title}
            </DialogTitle>
            <DialogDescription className='font-mono text-sm text-slate-500 dark:text-slate-400 mt-1'>
              {link.url.replace(/^https?:\/\//, '').replace(/\/$/, '')}
            </DialogDescription>
          </DialogHeader>

          <div className='space-y-6 mt-4'>
            {link.description && (
              <div>
                <h4 className='text-sm font-medium text-slate-500 dark:text-slate-400 mb-2 uppercase tracking-wider'>
                  Description
                </h4>
                <p className='text-slate-900 dark:text-slate-100 leading-relaxed'>
                  {link.description}
                </p>
              </div>
            )}

            {link.icon && (
              <div>
                <h4 className='text-sm font-medium text-slate-500 dark:text-slate-400 mb-2 uppercase tracking-wider'>
                  Preview
                </h4>
                <div className='text-4xl p-4 rounded-xl bg-slate-100 dark:bg-slate-800 w-fit'>
                  {link.icon}
                </div>
              </div>
            )}

            <div className='pt-4 border-t border-slate-200 dark:border-slate-700'>
              <div className='flex flex-col sm:flex-row gap-3'>
                <Button
                  onClick={handleOpenResource}
                  className='flex-1 bg-gradient-to-r from-cyan-500 to-blue-600 text-white hover:from-cyan-600 hover:to-blue-700 transition-all duration-300 hover:scale-105'
                >
                  <ExternalLink className='w-4 h-4 mr-2' />
                  Open Resource
                </Button>
                <ShareButtons
                  url={link.url}
                  title={link.title}
                  description={link.description}
                  variant='ghost'
                  className='flex-1'
                />
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
