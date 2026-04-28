import * as React from 'react';
import { cn } from '@/lib/utils';

const Pagination = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('flex flex-row items-center justify-center gap-1', className)}
    {...props}
  />
));
Pagination.displayName = 'Pagination';

const PaginationContent = React.forwardRef<
  HTMLUListElement,
  React.HTMLAttributes<HTMLUListElement>
>(({ className, ...props }, ref) => (
  <ul
    ref={ref}
    className={cn('flex flex-row items-center gap-1', className)}
    {...props}
  />
));
PaginationContent.displayName = 'PaginationContent';

const PaginationItem = React.forwardRef<
  HTMLLIElement,
  React.HTMLAttributes<HTMLLIElement>
>(({ className, ...props }, ref) => (
  <li ref={ref} className={cn('', className)} {...props} />
));
PaginationItem.displayName = 'PaginationItem';

type PaginationLinkProps = {
  isActive?: boolean;
} & React.AnchorHTMLAttributes<HTMLAnchorElement>;

const PaginationLink = React.forwardRef<HTMLAnchorElement, PaginationLinkProps>(
  ({ className, isActive, href, ...props }, ref) => (
    <a
      ref={ref}
      href={href ?? ''}
      className={cn(
        'flex h-9 w-9 items-center justify-center rounded-lg text-sm font-medium transition-all duration-200',
        'bg-slate-100/50 dark:bg-slate-800/50 hover:bg-slate-200 dark:hover:bg-slate-700',
        'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100',
        'border border-slate-200/50 dark:border-slate-700/50',
        'hover:scale-105',
        isActive && [
          'bg-gradient-to-r from-cyan-500 to-blue-600 text-white',
          'border-transparent shadow-lg shadow-cyan-500/25',
          'scale-105',
        ],
        className,
      )}
      {...props}
    >
      {props.children}
    </a>
  ),
);
PaginationLink.displayName = 'PaginationLink';

const PaginationEllipsis = React.forwardRef<
  HTMLSpanElement,
  React.HTMLAttributes<HTMLSpanElement>
>(({ className, ...props }, ref) => (
  <span
    ref={ref}
    className={cn(
      'flex h-9 w-9 items-center justify-center text-sm font-medium text-slate-400 dark:text-slate-500',
      className,
    )}
    {...props}
  >
    <svg
      className='h-4 w-4'
      fill='none'
      stroke='currentColor'
      viewBox='0 0 24 24'
    >
      <path
        strokeLinecap='round'
        strokeLinejoin='round'
        strokeWidth={2}
        d='M6.75 15.75L3 12m0 0l3.75-3.75M3 12h18'
      />
    </svg>
  </span>
));
PaginationEllipsis.displayName = 'PaginationEllipsis';

const PaginationPrevious = React.forwardRef<
  HTMLAnchorElement,
  React.ComponentPropsWithoutRef<typeof PaginationLink>
>(({ className, href, ...props }, ref) => (
  <a
    ref={ref}
    href={href ?? ''}
    className={cn(
      'inline-flex h-9 w-9 items-center justify-center rounded-lg text-sm font-medium transition-all duration-200',
      'bg-slate-100/50 dark:bg-slate-800/50 hover:bg-slate-200 dark:hover:bg-slate-700',
      'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100',
      'border border-slate-200/50 dark:border-slate-700/50',
      'hover:scale-105',
      className,
    )}
    {...props}
  >
    <svg
      className='h-4 w-4'
      fill='none'
      stroke='currentColor'
      viewBox='0 0 24 24'
    >
      <path
        strokeLinecap='round'
        strokeLinejoin='round'
        strokeWidth={2}
        d='m15 18-6-6 6-6'
      />
    </svg>
    <span className='sr-only'>Previous</span>
  </a>
));
PaginationPrevious.displayName = 'PaginationPrevious';

const PaginationNext = React.forwardRef<
  HTMLAnchorElement,
  React.ComponentPropsWithoutRef<typeof PaginationLink>
>(({ className, href, ...props }, ref) => (
  <a
    ref={ref}
    href={href ?? ''}
    className={cn(
      'inline-flex h-9 w-9 items-center justify-center rounded-lg text-sm font-medium transition-all duration-200',
      'bg-slate-100/50 dark:bg-slate-800/50 hover:bg-slate-200 dark:hover:bg-slate-700',
      'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100',
      'border border-slate-200/50 dark:border-slate-700/50',
      'hover:scale-105',
      className,
    )}
    {...props}
  >
    <svg
      className='h-4 w-4'
      fill='none'
      stroke='currentColor'
      viewBox='0 0 24 24'
    >
      <path
        strokeLinecap='round'
        strokeLinejoin='round'
        strokeWidth={2}
        d='m9 18 6-6-6-6'
      />
    </svg>
    <span className='sr-only'>Next</span>
  </a>
));
PaginationNext.displayName = 'PaginationNext';

export {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationEllipsis,
  PaginationPrevious,
  PaginationNext,
};
