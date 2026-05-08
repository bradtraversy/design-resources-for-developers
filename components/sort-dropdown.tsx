'use client';

import { usePathname, useRouter } from 'next/navigation';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';

type SortOrder = 'newest' | 'popular' | 'az' | 'za';

interface SortDropdownProps {
  className?: string;
  defaultValue?: SortOrder;
}

export function SortDropdown({
  className,
  defaultValue = 'newest',
}: SortDropdownProps) {
  const router = useRouter();
  const pathname = usePathname();

  const handleSortChange = (value: string) => {
    const params = new URLSearchParams(window.location.search);
    if (value === 'newest') {
      params.delete('sort');
    } else {
      params.set('sort', value);
    }
    const newSearch = params.toString();
    const href = newSearch ? `${pathname}?${newSearch}` : pathname;
    router.push(href, { scroll: false });
  };

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <span className='text-sm text-slate-500 dark:text-slate-400 hidden sm:inline'>
        Sort by:
      </span>
      <Select defaultValue={defaultValue} onValueChange={handleSortChange}>
        <SelectTrigger className='w-[140px] h-9'>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value='newest'>Newest</SelectItem>
          <SelectItem value='popular'>Most Popular</SelectItem>
          <SelectItem value='az'>A-Z</SelectItem>
          <SelectItem value='za'>Z-A</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
