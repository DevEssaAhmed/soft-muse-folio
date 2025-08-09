import React from 'react';
import { cn } from '@/lib/utils';
import { Button } from './button';

interface FloatingToolbarProps extends React.HTMLAttributes<HTMLDivElement> {
  position?: 'top' | 'bottom' | 'left' | 'right';
  variant?: 'default' | 'glass' | 'minimal';
}

const FloatingToolbar = React.forwardRef<HTMLDivElement, FloatingToolbarProps>(
  ({ className, position = 'top', variant = 'glass', children, ...props }, ref) => {
    const positions = {
      top: 'top-4 left-1/2 -translate-x-1/2',
      bottom: 'bottom-4 left-1/2 -translate-x-1/2',
      left: 'left-4 top-1/2 -translate-y-1/2 flex-col',
      right: 'right-4 top-1/2 -translate-y-1/2 flex-col'
    };

    const variants = {
      default: 'bg-card/80 backdrop-blur-md border border-border/50',
      glass: 'bg-white/10 dark:bg-black/20 backdrop-blur-xl border border-white/20 dark:border-white/10',
      minimal: 'bg-background/95 backdrop-blur-sm border border-border/30'
    };

    return (
      <div
        ref={ref}
        className={cn(
          'fixed z-50 flex items-center gap-2 px-4 py-2 rounded-full shadow-xl',
          positions[position],
          variants[variant],
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

FloatingToolbar.displayName = 'FloatingToolbar';

export { FloatingToolbar };