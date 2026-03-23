import * as React from 'react';
import * as Icons from 'lucide-react';
import { cn } from '../utils';

interface SearchFieldProps extends Omit<React.ComponentProps<'input'>, 'type'> {
  wrapperClassName?: string;
  iconClassName?: string;
}

export function SearchField({
  className,
  wrapperClassName,
  iconClassName,
  ...props
}: SearchFieldProps) {
  return (
    <div className={cn('relative', wrapperClassName)}>
      <Icons.Search
        className={cn('absolute top-1/2 left-3 size-4 -translate-y-1/2 text-black/40', iconClassName)}
      />
      <input
        type="text"
        className={cn(
          'h-9 w-full rounded-xl border border-black/10 bg-transparent pr-4 pl-10 text-[#04090C] outline-none placeholder:text-black/40 focus-visible:ring-2 focus-visible:ring-[#29E68C]/40',
          className
        )}
        {...props}
      />
    </div>
  );
}
