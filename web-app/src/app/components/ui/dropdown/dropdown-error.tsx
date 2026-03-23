import type { DropdownErrorProps } from './types';

export function DropdownError({ message }: DropdownErrorProps) {
  if (!message) return null;

  return (
    <span
      className="mt-1.5 text-xs font-['Outfit'] block"
      style={{ color: '#EF4444' }}
    >
      {message}
    </span>
  );
}
