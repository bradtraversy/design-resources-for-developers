'use client';

import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const badgeVariants = cva(
  'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-slate-950 focus:ring-offset-2',
  {
    variants: {
      variant: {
        default:
          'border-transparent bg-slate-900 text-slate-50 dark:bg-slate-50 dark:text-slate-900',
        secondary:
          'border-transparent bg-slate-100 text-slate-900 dark:bg-slate-800 dark:text-slate-50',
        destructive:
          'border-transparent bg-red-500 text-slate-50 dark:bg-red-900 dark:text-slate-50',
        outline: 'text-slate-950 dark:text-slate-50',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
