import { Label } from '../label';
import type { DropdownLabelProps } from './types';

export function DropdownLabel({ htmlFor, children }: DropdownLabelProps) {
  return (
    <Label
      htmlFor={htmlFor}
      className="block font-['Outfit'] text-sm font-medium mb-2"
      style={{ color: '#04090C' }}
    >
      {children}
    </Label>
  );
}
