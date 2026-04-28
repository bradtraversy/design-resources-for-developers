import { cn } from '@/lib/utils';

function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'animate-pulse rounded-lg bg-slate-200/50 dark:bg-slate-800/50',
        'border border-slate-200/50 dark:border-slate-700/50',
        className,
      )}
      {...props}
    />
  );
}

function CardSkeleton() {
  return (
    <div className='rounded-2xl border border-slate-200/50 dark:border-slate-800/50 bg-white/50 dark:bg-slate-900/50 p-4 md:p-5 backdrop-blur-sm'>
      <div className='flex items-start gap-3 md:gap-4'>
        <Skeleton className='w-10 h-10 md:w-12 md:h-12 rounded-xl flex-shrink-0' />
        <div className='flex-1 min-w-0 space-y-2'>
          <Skeleton className='h-5 w-3/4 rounded-lg' />
          <Skeleton className='h-3 w-full rounded-lg' />
          <Skeleton className='h-3 w-1/3 rounded-lg' />
        </div>
        <div className='flex gap-1 flex-shrink-0'>
          <Skeleton className='w-9 h-9 rounded-lg' />
          <Skeleton className='w-9 h-9 rounded-lg' />
          <Skeleton className='w-9 h-9 rounded-lg' />
        </div>
      </div>
    </div>
  );
}

function NavSkeleton() {
  return (
    <div className='flex flex-wrap gap-2 justify-center'>
      {[...Array(5)].map((_, i) => (
        <Skeleton
          key={i}
          className='h-11 w-28 rounded-full animate-pulse'
          style={{ animationDelay: `${i * 100}ms` }}
        />
      ))}
    </div>
  );
}

function LinkGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
      {[...Array(count)].map((_, i) => (
        <CardSkeleton key={i} />
      ))}
    </div>
  );
}

function PageSkeleton() {
  return (
    <div className='space-y-8'>
      <NavSkeleton />
      <div className='space-y-4'>
        <Skeleton className='h-12 w-96 rounded-xl mx-auto' />
        <Skeleton className='h-5 w-64 rounded-lg mx-auto' />
      </div>
      <LinkGridSkeleton />
    </div>
  );
}

export { Skeleton, CardSkeleton, NavSkeleton, LinkGridSkeleton, PageSkeleton };
