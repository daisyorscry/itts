# ITTS Community - Atomic Component Architecture

## 🎯 Philosophy

**Atomic Design** → **Small, Reusable Pieces** → **Easy Maintenance** → **Clean Code**

Semua components dipecah jadi **atomic pieces** yang super kecil dan fokus. Setiap piece cuma punya **1 responsibility**.

---

## 📦 Component Hierarchy

```
Atoms (Smallest)
  ↓
Molecules (Combinations)
  ↓
Organisms (Complex UI)
  ↓
Pages (Full Views)
```

---

## ⚛️ Atoms (Building Blocks)

Located in `/src/app/components/ui/atoms/`

### 1. **FieldLabel**
Label untuk form field dengan required indicator.

```tsx
import { FieldLabel } from '../components/ui/atoms';

<FieldLabel htmlFor="email" required>
  Email Address
</FieldLabel>
```

**Props:**
- `htmlFor`: string (id dari input)
- `children`: ReactNode (label text)
- `required?`: boolean (show red asterisk)
- `className?`: string

**Styling:**
- Font: Outfit, 14px, medium
- Color: `#04090C`
- Required asterisk: `#EF4444`

---

### 2. **FieldError**
Error message display.

```tsx
import { FieldError } from '../components/ui/atoms';

<FieldError message="This field is required" />
<FieldError message={errors.email?.message} />
```

**Props:**
- `message?`: string | ReactNode
- `className?`: string

**Styling:**
- Font: Outfit, 12px
- Color: `#EF4444`
- Margin top: 6px

---

### 3. **IconWrapper**
Positioning wrapper untuk icons di input fields.

```tsx
import { IconWrapper } from '../components/ui/atoms';
import { Mail } from 'lucide-react';

<IconWrapper icon={<Mail />} position="left" />
<IconWrapper icon={<Search />} position="right" vertical="top" />
```

**Props:**
- `icon`: ReactNode
- `position?`: `'left' | 'right'` (default: `'left'`)
- `vertical?`: `'center' | 'top'` (default: `'center'`)
- `className?`: string

**Behavior:**
- Left: `left-4`
- Right: `right-4`
- Center: `top-1/2 -translate-y-1/2`
- Top: `top-4`
- Color: `rgba(4, 9, 12, 0.4)`
- Pointer events: none (non-interactive)

---

### 4. **InputWrapper**
Relative positioning wrapper untuk input + icon composition.

```tsx
import { InputWrapper } from '../components/ui/atoms';

<InputWrapper>
  <IconWrapper icon={<Mail />} />
  <input />
</InputWrapper>
```

**Props:**
- `children`: ReactNode
- `className?`: string

**Purpose:**
- Creates relative positioning context
- Allows absolute positioning of icons
- Wraps input + icon(s)

---

### 5. **DropdownOption**
Single option di dropdown list.

```tsx
import { DropdownOption } from '../components/ui/atoms';

<DropdownOption
  id="react"
  name="React"
  description="UI Library"
  icon={<Icon />}
  color="#61DAFB"
  isSelected={true}
  onClick={() => handleSelect('react')}
/>
```

**Props:**
- `id`: string
- `name`: string
- `description?`: string
- `icon?`: ReactNode
- `color?`: string (accent color)
- `isSelected`: boolean
- `onClick`: () => void

**Features:**
- Hover animation (translate-x)
- Selected indicator (checkmark)
- Color accent bar on left
- Hover background overlay

---

### 6. **DropdownTrigger**
Button trigger untuk dropdown.

```tsx
import { DropdownTrigger } from '../components/ui/atoms';

<DropdownTrigger
  value="React"
  placeholder="Select framework"
  isOpen={false}
  hasError={false}
  icon={<Code />}
  onClick={() => setOpen(true)}
/>
```

**Props:**
- `value?`: string (selected value text)
- `placeholder`: string
- `isOpen`: boolean
- `hasError?`: boolean
- `icon?`: ReactNode
- `onClick`: () => void

**Behavior:**
- Chevron rotates when open
- Error border when hasError
- Icon on left, chevron on right

---

## 🧬 Molecules (Combinations)

Located in `/src/app/components/ui/`

### **Input** (Atomic Input)
Merge dari Input + Icon support.

```tsx
import { Input } from '../components/ui';

// Simple input
<Input type="email" placeholder="Email" />

// With icon
<Input
  type="email"
  icon={<Mail />}
  iconPosition="left"
  hasError={!!errors.email}
/>
```

**Props:**
- All standard `<input>` props
- `icon?`: ReactNode
- `iconPosition?`: `'left' | 'right'` (default: `'left'`)
- `hasError?`: boolean

**How it works:**
```tsx
// Internally uses atoms:
<InputWrapper>
  <IconWrapper icon={icon} position={iconPosition} />
  <input />
</InputWrapper>
```

---

### **Textarea** (Atomic Textarea)
Textarea dengan icon support.

```tsx
import { Textarea } from '../components/ui';

<Textarea
  icon={<MessageSquare />}
  rows={4}
  hasError={!!errors.message}
/>
```

**Props:**
- All standard `<textarea>` props
- `icon?`: ReactNode
- `iconPosition?`: `'left' | 'right'`
- `hasError?`: boolean

**Icon positioning:**
- Icon vertical: `'top'` (not center) untuk textarea

---

### **FormField**
Complete form field dengan label + input + error.

```tsx
import { FormField, Input } from '../components/ui';

<FormField
  id="email"
  label="Email Address"
  error={errors.email?.message}
  required
>
  <Input icon={<Mail />} hasError={!!errors.email} />
</FormField>
```

**Props:**
- `id`: string
- `label`: string
- `error?`: string
- `children`: ReactNode
- `required?`: boolean
- `className?`: string

**Composition:**
```tsx
<fieldset>
  <FieldLabel /> {/* atom */}
  {children}       {/* input component */}
  <FieldError />   {/* atom */}
</fieldset>
```

---

### **PasswordField**
Password input dengan toggle visibility.

```tsx
import { PasswordField } from '../components/ui';

<PasswordField
  placeholder="Password"
  hasError={!!errors.password}
  showIcon={true}
/>
```

**Props:**
- All Input props except `type` and `icon`
- `hasError?`: boolean
- `showIcon?`: boolean (show lock icon)

**Composition:**
```tsx
<InputWrapper>
  <IconWrapper icon={<Lock />} /> {/* if showIcon */}
  <Input type={showPassword ? 'text' : 'password'} />
  <Button> {/* toggle button */}
    <Eye /> or <EyeOff />
  </Button>
</InputWrapper>
```

---

### **CheckboxField**
Checkbox dengan label dan error.

```tsx
import { CheckboxField } from '../components/ui';

<CheckboxField
  id="agree"
  label="I agree to terms"
  error={errors.agree?.message}
/>
```

**Composition:**
```tsx
<fieldset>
  <Label>
    <input type="checkbox" />
    <span>{label}</span>
  </Label>
  <FieldError /> {/* atom */}
</fieldset>
```

---

### **DropdownSelector**
Complete dropdown selector.

```tsx
import { DropdownSelector } from '../components/ui';

<DropdownSelector
  id="framework"
  label="Framework"
  options={OPTIONS}
  value={selected}
  onChange={setSelected}
  icon={<Code />}
/>
```

**Composition:**
```tsx
<fieldset>
  <FieldLabel /> {/* atom */}
  <DropdownTrigger /> {/* atom */}
  {isOpen && (
    <motion.nav>
      {options.map(option => (
        <DropdownOption /> {/* atom */}
      ))}
    </motion.nav>
  )}
  <FieldError /> {/* atom */}
</fieldset>
```

---

## 🏗️ Benefits of Atomic Design

### 1. **Easy Maintenance**
```tsx
// Change label style once → affects all fields
// Edit: /atoms/field-label.tsx
// Result: All FormFields update automatically
```

### 2. **Consistent Behavior**
```tsx
// All icons use same wrapper → consistent positioning
<Input icon={<Mail />} />
<Textarea icon={<MessageSquare />} />
<DropdownSelector icon={<Code />} />
// All use IconWrapper → same spacing, color, behavior
```

### 3. **Flexible Composition**
```tsx
// Can compose atoms directly for custom components
import { InputWrapper, IconWrapper } from '../components/ui/atoms';

<InputWrapper>
  <IconWrapper icon={<Search />} position="left" />
  <IconWrapper icon={<Loader />} position="right" />
  <input />
</InputWrapper>
```

### 4. **Small Bundle Size**
```tsx
// No duplicated code - atoms are shared
// InputWithIcon deleted → merged into Input
// Single implementation → smaller bundle
```

### 5. **Type Safety**
```tsx
// Each atom has clear TypeScript interface
// Props are validated at compile time
// Better autocomplete in IDE
```

---

## 🔄 Migration Guide

### Before (InputWithIcon)
```tsx
import { InputWithIcon } from '../components/ui';

<InputWithIcon
  icon={<Mail />}
  iconPosition="left"
  hasError={!!errors.email}
/>
```

### After (Input with icon)
```tsx
import { Input } from '../components/ui';

<Input
  icon={<Mail />}
  iconPosition="left"
  hasError={!!errors.email}
/>
```

**Changes:**
- ✅ `InputWithIcon` → `Input` (merged)
- ✅ Same props, same behavior
- ✅ Can still use `<Input />` without icon
- ✅ Smaller API, easier to remember

---

## 📝 Creating New Atomic Components

### 1. Identify Single Responsibility
```tsx
// ❌ Bad - multiple responsibilities
function FormFieldWithInputAndError() {
  return (
    <>
      <label />
      <input />
      <span className="error" />
    </>
  );
}

// ✅ Good - single responsibility per atom
function FieldLabel() { ... }
function FieldError() { ... }

// Then compose:
<FormField>
  <FieldLabel />
  <Input />
  <FieldError />
</FormField>
```

### 2. Make it Generic
```tsx
// ❌ Bad - too specific
function EmailFieldLabel() {
  return <label>Email</label>;
}

// ✅ Good - generic and reusable
function FieldLabel({ children, htmlFor }) {
  return <label htmlFor={htmlFor}>{children}</label>;
}
```

### 3. Keep it Small
```tsx
// Atom should be < 50 lines
// If > 50 lines → break into smaller atoms
// Or it's a molecule, not an atom
```

### 4. Single File, Single Export
```tsx
// /atoms/my-atom.tsx
export function MyAtom() { ... }

// /atoms/index.ts
export { MyAtom } from './my-atom';
```

---

## 🎨 Styling Consistency

### Atoms Use Design Tokens
```tsx
// ✅ Good - use tokens
style={{ color: '#04090C' }}
style={{ color: 'rgba(4, 9, 12, 0.4)' }}
style={{ background: '#29E68C' }}

// ❌ Bad - random colors
style={{ color: '#333' }}
style={{ color: 'gray' }}
```

### Atoms Use Tailwind Utilities
```tsx
// ✅ Good
className="w-5 h-5 absolute left-4"

// ❌ Bad - inline styles for layout
style={{ width: '20px', position: 'absolute' }}
```

### Atoms Are Customizable
```tsx
// All atoms accept className prop
<FieldLabel className="text-lg font-bold" />
<IconWrapper className="opacity-50" />
```

---

## 🚀 Best Practices

### 1. Import Molecules, Not Atoms (Usually)
```tsx
// ✅ Good - use molecules in pages
import { Input, FormField } from '../components/ui';

// ⚠️ Okay - use atoms for custom compositions
import { InputWrapper, IconWrapper } from '../components/ui/atoms';

// ❌ Bad - don't use atoms in pages unnecessarily
import { FieldLabel, FieldError } from '../components/ui/atoms';
// Instead use FormField which already composes them
```

### 2. Compose, Don't Modify
```tsx
// ✅ Good - compose atoms into new molecules
function CustomField() {
  return (
    <InputWrapper>
      <FieldLabel />
      <Input />
      <FieldError />
    </InputWrapper>
  );
}

// ❌ Bad - modify atoms directly
function CustomFieldLabel() {
  return <FieldLabel className="custom" />; // Just use FieldLabel with className
}
```

### 3. Keep Atoms Pure
```tsx
// ✅ Good - atoms are pure, stateless
export function FieldLabel({ children }) {
  return <label>{children}</label>;
}

// ❌ Bad - atoms shouldn't have state/effects
export function FieldLabel({ children }) {
  const [hover, setHover] = useState(false);
  useEffect(() => { ... });
  return <label>{children}</label>;
}
```

---

## 📊 Component Hierarchy Example

```
Page: Register.tsx
  ↓
Organism: FormField
  ↓
Molecules: Input, PasswordField, DropdownSelector
  ↓
Atoms: FieldLabel, IconWrapper, InputWrapper, FieldError
```

**Code:**
```tsx
// Page
<FormField> {/* Organism */}
  <Input icon={<Mail />} /> {/* Molecule */}
    // Internally:
    <InputWrapper> {/* Atom */}
      <IconWrapper /> {/* Atom */}
      <input />
    </InputWrapper>
  <FieldError /> {/* Atom - rendered by FormField */}
</FormField>
```

---

## ✅ Summary

### What Changed:
1. **InputWithIcon** → Merged into **Input**
2. Created **6 atomic components** (FieldLabel, FieldError, IconWrapper, etc.)
3. All molecules now **compose atoms** internally
4. Easier maintenance: **Change 1 atom → Update everywhere**

### Structure:
```
/ui/
  /atoms/           ← Smallest pieces (6 atoms)
    - field-label
    - field-error
    - icon-wrapper
    - input-wrapper
    - dropdown-option
    - dropdown-trigger
  - input.tsx       ← Uses atoms
  - textarea.tsx    ← Uses atoms
  - form-field.tsx  ← Uses atoms
  - password-field  ← Uses atoms
  - dropdown-selector ← Uses atoms
```

### Import Pattern:
```tsx
// For pages (use molecules)
import { Input, FormField, PasswordField } from '../components/ui';

// For custom components (use atoms)
import { InputWrapper, IconWrapper } from '../components/ui/atoms';
```

**Philosophy: Small Pieces → Easy to Maintain → Clean Code** 🎯
