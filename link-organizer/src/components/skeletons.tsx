import { cn } from '@/lib/utils';

function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'animate-pulse rounded-md bg-slate-200 dark:bg-slate-800',
        className,
      )}
      {...props}
    />
  );
}

function CardSkeleton() {
  return (
    <div className='rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 p-4'>
      <div className='flex items-start justify-between gap-3'>
        <div className='flex-1 space-y-2'>
          <Skeleton className='h-5 w-3/4' />
          <Skeleton className='h-4 w-full' />
          <Skeleton className='h-3 w-1/2' />
        </div>
        <Skeleton className='h-8 w-8 rounded-lg' />
      </div>
    </div>
  );
}

function NavSkeleton() {
  return (
    <div className='flex flex-wrap gap-2 justify-center'>
      {[...Array(5)].map((_, i) => (
        <Skeleton key={i} className='h-10 w-24 rounded-full' />
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
        <Skeleton className='h-10 w-96' />
        <Skeleton className='h-10 w-64' />
      </div>
      <LinkGridSkeleton />
    </div>
  );
}

export { Skeleton, CardSkeleton, NavSkeleton, LinkGridSkeleton, PageSkeleton };
