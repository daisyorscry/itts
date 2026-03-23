// Re-export types
export type {
  DropdownOptionType,
  DropdownContextValue,
  DropdownRootProps,
  DropdownTriggerProps,
  DropdownContentProps,
  DropdownOptionProps,
  DropdownLabelProps,
  DropdownErrorProps,
} from './types';

// Re-export components
export { DropdownRoot, DropdownTrigger, useDropdownContext } from './dropdown';
export { DropdownLabel } from './dropdown-label';
export { DropdownContent } from './dropdown-content';
export { DropdownOption } from './dropdown-option';
export { DropdownError } from './dropdown-error';

// Compound component namespace
import { DropdownRoot, DropdownTrigger } from './dropdown';
import { DropdownLabel } from './dropdown-label';
import { DropdownContent } from './dropdown-content';
import { DropdownOption } from './dropdown-option';
import { DropdownError } from './dropdown-error';

export const Dropdown = {
  Root: DropdownRoot,
  Label: DropdownLabel,
  Trigger: DropdownTrigger,
  Content: DropdownContent,
  Option: DropdownOption,
  Error: DropdownError,
};

// Default export
export { DropdownRoot as default };