'use client';

import { cn } from '@/lib/utils';

export function StatusIndicator({ status }: { status: 'online' | 'offline' }) {
  return (
    <div className="flex items-center gap-2">
      <div
        className={cn(
          'h-2.5 w-2.5 rounded-full ring-2 ring-offset-2 ring-offset-background',
          status === 'online'
            ? 'bg-green-500 ring-green-500/30'
            : 'bg-muted-foreground ring-muted-foreground/30'
        )}
      />
      <span className="capitalize text-sm text-muted-foreground">{status}</span>
    </div>
  );
}
