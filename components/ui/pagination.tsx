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
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  ({ className, isActive, href, ...props }, _ref) => (
    <a
      href={href}
      className={cn(
        'flex h-9 w-9 items-center justify-center rounded-md text-sm font-medium transition-colors hover:bg-slate-100 dark:hover:bg-slate-800',
        isActive && 'bg-slate-900 text-white dark:bg-white dark:text-slate-900',
        className,
      )}
      {...props}
    >
      {props.children}
    </a>
  ),
);
PaginationLink.displayName = 'PaginationLink';

const PaginationPrevious = React.forwardRef<
  HTMLAnchorElement,
  React.ComponentPropsWithoutRef<typeof PaginationLink>
>(({ className, href, ...props }, ref) => (
  <div className='mr-2 hidden sm:block'>
    <PaginationLink
      ref={ref}
      href={href ?? ''}
      className={cn(
        'gap-1 pl-2.5 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100',
        className,
      )}
      {...props}
    >
      <span className='hidden sm:block'>Previous</span>
      <svg
        className='h-4 w-4 sm:hidden'
        fill='none'
        height='24'
        stroke='currentColor'
        strokeLinecap='round'
        strokeLinejoin='round'
        strokeWidth='2'
        viewBox='0 0 24 24'
      >
        <path d='m15 18-6-6 6-6' />
      </svg>
    </PaginationLink>
  </div>
));
PaginationPrevious.displayName = 'PaginationPrevious';

const PaginationNext = React.forwardRef<
  HTMLAnchorElement,
  React.ComponentPropsWithoutRef<typeof PaginationLink>
>(({ className, href, ...props }, ref) => (
  <div className='ml-2 hidden sm:block'>
    <PaginationLink
      ref={ref}
      href={href ?? ''}
      className={cn(
        'gap-1 pr-2.5 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100',
        className,
      )}
      {...props}
    >
      <span className='hidden sm:block'>Next</span>
      <svg
        className='h-4 w-4 sm:hidden'
        fill='none'
        height='24'
        stroke='currentColor'
        strokeLinecap='round'
        strokeLinejoin='round'
        strokeWidth='2'
        viewBox='0 0 24 24'
      >
        <path d='m9 18 6-6-6-6' />
      </svg>
    </PaginationLink>
  </div>
));
PaginationNext.displayName = 'PaginationNext';

const PaginationEllipsis = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLSpanElement>) => (
  <span
    className={cn(
      'flex h-9 w-9 items-center justify-center text-slate-600 dark:text-slate-400',
      className,
    )}
    {...props}
  >
    <span className='text-xl'>...</span>
    <span className='sr-only'>More pages</span>
  </span>
);
PaginationEllipsis.displayName = 'PaginationEllipsis';

type PaginationPageProps = {
  isActive?: boolean;
} & React.AnchorHTMLAttributes<HTMLAnchorElement>;

const PaginationPage = React.forwardRef<HTMLAnchorElement, PaginationPageProps>(
  ({ className, isActive, href, ...props }, ref) => (
    <PaginationLink
      ref={ref}
      href={href ?? ''}
      isActive={isActive}
      className={cn(
        isActive &&
          'bg-slate-900 text-white dark:bg-white dark:text-slate-900 pointer-events-none',
        className,
      )}
      {...props}
    />
  ),
);
PaginationPage.displayName = 'PaginationPage';

export {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPage,
  PaginationPrevious,
};
