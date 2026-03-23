import { createContext, useContext, useState, useEffect, useRef } from 'react';
import type { ReactNode } from 'react';
import { ChevronDown } from 'lucide-react';
import { Button } from '../button';
import type { DropdownRootProps, DropdownContextValue } from './types';

const DropdownContext = createContext<DropdownContextValue | null>(null);

export function useDropdownContext<T = string>() {
  const context = useContext(DropdownContext);
  if (!context) {
    throw new Error('Dropdown components must be used within Dropdown.Root');
  }
  return context as DropdownContextValue<T>;
}

export function DropdownRoot<T = string>({
  value,
  onChange,
  error,
  placeholder = 'Select an option',
  children,
  className = '',
}: DropdownRootProps<T>) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const contextValue: DropdownContextValue<T> = {
    isOpen,
    setIsOpen,
    value,
    onChange,
    error,
    placeholder,
  };

  return (
    <DropdownContext.Provider value={contextValue as DropdownContextValue}>
      <div ref={dropdownRef} className={`relative ${className}`}>
        {children}
      </div>
    </DropdownContext.Provider>
  );
}

// Trigger component
interface DropdownTriggerProps {
  displayValue?: string;
}

export function DropdownTrigger({ displayValue }: DropdownTriggerProps) {
  const { isOpen, setIsOpen, placeholder, error } = useDropdownContext();
  const hasError = !!error;

  return (
    <article className="relative block">
      <Button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        variant="outline"
        className="w-full rounded-xl pl-4 pr-12 py-3 font-['Outfit'] text-sm h-auto text-left justify-start hover:bg-transparent"
        style={{
          background: 'rgba(4, 9, 12, 0.04)',
          border: hasError ? '1px solid #EF4444' : '1px solid rgba(4, 9, 12, 0.1)',
          color: displayValue ? '#04090C' : 'rgba(4, 9, 12, 0.4)',
        }}
      >
        <span className="block truncate">
          {displayValue || placeholder}
        </span>
        <ChevronDown
          className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 transition-transform"
          style={{
            color: 'rgba(4, 9, 12, 0.4)',
            transform: isOpen ? 'translateY(-50%) rotate(180deg)' : 'translateY(-50%)',
          }}
        />
      </Button>
    </article>
  );
}