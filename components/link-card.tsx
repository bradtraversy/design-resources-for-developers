'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ExternalLink, Copy, Check } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import type { Link as LinkType } from '@/lib/types';

interface LinkCardProps {
  link: LinkType;
  index?: number;
}

export function LinkCard({ link, index = 0 }: LinkCardProps) {
  const [copied, setCopied] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(link.url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <Card
      className={cn(
        'group relative overflow-hidden transition-all duration-300',
        'hover:shadow-lg hover:-translate-y-1',
        'border-slate-200 dark:border-slate-800',
        'hover:border-slate-300 dark:hover:border-slate-700',
        'cursor-pointer',
      )}
      style={{
        animationDelay: `${index * 50}ms`,
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Link
        href={link.url}
        target='_blank'
        rel='noopener noreferrer'
        className='absolute inset-0 z-10'
        aria-label={`Visit ${link.title}`}
      />
      <CardContent className='p-4'>
        <div className='flex items-start justify-between gap-3'>
          <div className='flex-1 min-w-0'>
            <h3 className='font-semibold text-slate-900 dark:text-slate-100 truncate transition-colors group-hover:text-blue-600 dark:group-hover:text-blue-400'>
              {link.title}
            </h3>
            {link.description && (
              <p className='mt-1 text-sm text-slate-500 dark:text-slate-400 line-clamp-2'>
                {link.description}
              </p>
            )}
            <p className='mt-2 text-xs text-slate-400 dark:text-slate-500 truncate'>
              {link.url.replace(/^https?:\/\//, '').replace(/\/$/, '')}
            </p>
          </div>

          <div className='flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity'>
            <button
              onClick={handleCopy}
              className='p-2 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors'
              aria-label={copied ? 'Copied!' : 'Copy link'}
            >
              {copied ? (
                <Check className='w-4 h-4 text-green-500' />
              ) : (
                <Copy className='w-4 h-4 text-slate-500' />
              )}
            </button>
            <span
              className={cn(
                'p-2 rounded-lg bg-slate-100 dark:bg-slate-800 transition-transform',
                isHovered && 'translate-x-1',
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
