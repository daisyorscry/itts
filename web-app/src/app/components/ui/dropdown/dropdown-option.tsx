import { Check } from 'lucide-react';
import { Button } from '../button';
import { useDropdownContext } from './dropdown';
import type { DropdownOptionProps } from './types';

export function DropdownOption<T = string>({
  value,
  name,
  description,
  icon,
  color,
}: DropdownOptionProps<T>) {
  const { value: selectedValue, onChange, setIsOpen } = useDropdownContext<T>();
  const isSelected = selectedValue === value;

  return (
    <Button
      type="button"
      onClick={() => {
        onChange(value);
        setIsOpen(false);
      }}
      variant="ghost"
      className="w-full px-4 py-3 flex items-center gap-3 h-auto text-left justify-start relative group hover:bg-transparent"
      style={{
        background: isSelected ? 'rgba(4, 9, 12, 0.04)' : 'transparent',
      }}
    >
      <span
        className="absolute left-0 top-0 bottom-0 w-1 opacity-0 group-hover:opacity-100 transition-opacity"
        style={{ background: color || '#29E68C' }}
      />
      <article className="flex-1 group-hover:translate-x-1 transition-transform">
        {icon && (
          <span className="inline-block mr-2 w-5 h-5" style={{ color }}>
            {icon}
          </span>
        )}
        <span
          className="font-['Outfit'] font-medium text-sm block"
          style={{ color: '#04090C' }}
        >
          {name}
        </span>
        {description && (
          <span
            className="font-['Outfit'] text-xs block"
            style={{ color: 'rgba(4, 9, 12, 0.5)' }}
          >
            {description}
          </span>
        )}
      </article>
      {isSelected && <Check className="w-4 h-4 flex-shrink-0" style={{ color: '#29E68C' }} />}
      <span className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
    </Button>
  );
}
