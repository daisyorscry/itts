import type { ReactNode } from 'react';

// Option type
export interface DropdownOptionType<T = string> {
  id: T;
  name: string;
  description?: string;
  icon?: ReactNode;
  color?: string;
}

// Context type
export interface DropdownContextValue<T = string> {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  value?: T;
  onChange: (value: T) => void;
  error?: string;
  placeholder?: string;
}

// Component props
export interface DropdownRootProps<T = string> {
  value?: T;
  onChange: (value: T) => void;
  error?: string;
  placeholder?: string;
  children: ReactNode;
  className?: string;
}

export interface DropdownTriggerProps {
  displayValue?: string;
  icon?: ReactNode;
}

export interface DropdownContentProps {
  children: ReactNode;
}

export interface DropdownOptionProps<T = string> {
  value: T;
  name: string;
  description?: string;
  icon?: ReactNode;
  color?: string;
}

export interface DropdownLabelProps {
  htmlFor?: string;
  children: ReactNode;
}

export interface DropdownErrorProps {
  message?: string;
}
