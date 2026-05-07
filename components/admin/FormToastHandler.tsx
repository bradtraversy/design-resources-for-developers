'use client';

import { useTransition } from 'react';
import { toast } from 'sonner';

interface FormToastHandlerProps {
  action: (formData: FormData) => Promise<{ success: boolean; error?: string }>;
  children: React.ReactNode;
  onSuccess?: () => void;
  successMessage?: string;
  className?: string;
}

export function FormToastHandler({
  action,
  children,
  onSuccess,
  successMessage,
  className,
}: FormToastHandlerProps) {
  const [isPending, startTransition] = useTransition();

  const handleSubmit = async (formData: FormData) => {
    startTransition(async () => {
      const result = await action(formData);
      if (result.success) {
        toast.success(successMessage || 'Operation completed successfully');
        onSuccess?.();
      } else {
        toast.error(result.error || 'Operation failed');
      }
    });
  };

  const formClassName = isPending
    ? 'pointer-events-none opacity-60'
    : className || '';

  return (
    <form action={handleSubmit} className={formClassName}>
      {children}
    </form>
  );
}
