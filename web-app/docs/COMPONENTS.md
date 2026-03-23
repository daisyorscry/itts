# ITTS Community - Reusable Components Guide

## 🎯 Philosophy

**Atomic Design** → **Small Reusable Pieces** → **Easy Maintenance** → **Clean Code**

Semua components di `/src/app/components/ui/` dipecah jadi **atomic pieces** yang super modular dan gampang di-maintain.

---

## 📦 Quick Start

### Single Import
```tsx
import {
  // Layout
  PageContainer, BackLink,
  
  // Form
  FormHeader, FormFooter, FormField, FormGroup, FormRow,
  
  // Inputs (all support icons!)
  Input, Textarea, PasswordField, CheckboxField, DropdownSelector,
  
  // Utils
  Text, TextDivider, SocialButtons,
  
  // Base
  Button, Card, CardContent, Label,
} from '../components/ui';
```

---

## 🧩 Core Components

### Layout

**`<PageContainer>`** - Page wrapper dengan centering & animation
```tsx
<PageContainer maxWidth="md">
  <BackLink />
  <Card>...</Card>
</PageContainer>
```

**`<BackLink>`** - Back navigation link
```tsx
<BackLink to="/" label="Back to home" />
```

---

### Form Structure

**`<FormHeader>`** - Title + subtitle
```tsx
<FormHeader
  title="Welcome"
  subtitle="Sign in to continue"
  align="center"
/>
```

**`<FormFooter>`** - Footer links
```tsx
<FormFooter>
  <Text>Don't have an account? <Link>Register</Link></Text>
</FormFooter>
```

**`<FormField>`** - Field wrapper (label + error)
```tsx
<FormField id="email" label="Email" error={errors.email?.message}>
  <Input icon={<Mail />} />
</FormField>
```

**`<FormGroup>`** - Responsive grid
```tsx
<FormGroup columns={2}>
  <FormField>...</FormField>
  <FormField>...</FormField>
</FormGroup>
```

**`<FormRow>`** - Flex row
```tsx
<FormRow justify="between" gap="md">
  <Label>Remember me</Label>
  <Button>Forgot?</Button>
</FormRow>
```

---

### Inputs

**`<Input>`** - Input dengan optional icon (MERGED!)
```tsx
// Simple input
<Input type="email" placeholder="Email" />

// With icon (left)
<Input
  type="email"
  icon={<Mail />}
  hasError={!!errors.email}
/>

// With icon (right)
<Input
  icon={<Search />}
  iconPosition="right"
/>
```

**`<Textarea>`** - Textarea dengan optional icon
```tsx
<Textarea
  icon={<MessageSquare />}
  rows={4}
  hasError={!!errors.message}
/>
```

**`<PasswordField>`** - Password dengan toggle
```tsx
<PasswordField
  placeholder="Password"
  hasError={!!errors.password}
  showIcon={true}
/>
```

**`<CheckboxField>`** - Checkbox dengan label
```tsx
<CheckboxField
  id="agree"
  label="I agree to terms"
  error={errors.agree?.message}
/>
```

**`<DropdownSelector>`** - Custom dropdown
```tsx
const OPTIONS = [
  { id: 'react', name: 'React', description: 'UI Library', color: '#61DAFB' }
];

<DropdownSelector
  id="framework"
  label="Select Framework"
  options={OPTIONS}
  value={selected}
  onChange={setSelected}
  icon={<Code />}
/>
```

---

### Utilities

**`<Text>`** - Styled text
```tsx
<Text variant="default">Normal</Text>
<Text variant="muted">Muted</Text>
<Text variant="bold">Bold</Text>
<Text variant="error">Error</Text>
<Text variant="success">Success</Text>

<Text size="xs">Small</Text>
<Text size="xl">Large</Text>
```

**`<TextDivider>`** - Divider dengan text
```tsx
<TextDivider text="OR CONTINUE WITH" />
```

**`<SocialButtons>`** - Social logins
```tsx
<SocialButtons
  onGoogleClick={handleGoogle}
  onGithubClick={handleGithub}
  isGithubLoading={loading}
/>
```

**`<FormError>`** - Error display
```tsx
<FormError message={errors.field?.message} />
```

---

## ✅ Complete Example

```tsx
import { useForm } from 'react-hook-form';
import { Mail } from 'lucide-react';
import {
  PageContainer, BackLink, Card, CardContent,
  FormHeader, FormField, Input, PasswordField,
  Button, TextDivider, SocialButtons, FormFooter, Text,
} from '../components/ui';

export function SignIn() {
  const { register, handleSubmit, formState: { errors } } = useForm();
  
  return (
    <PageContainer maxWidth="md">
      <BackLink />
      
      <Card className="rounded-3xl border-0">
        <CardContent className="p-8">
          <FormHeader title="Welcome" subtitle="Sign in" />
          
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <FormField id="email" label="Email" error={errors.email?.message}>
              <Input
                {...register('email')}
                icon={<Mail />}
                hasError={!!errors.email}
              />
            </FormField>
            
            <FormField id="password" label="Password" error={errors.password?.message}>
              <PasswordField
                {...register('password')}
                hasError={!!errors.password}
              />
            </FormField>
            
            <Button type="submit" className="w-full">Sign In</Button>
          </form>
          
          <TextDivider text="OR" />
          <SocialButtons onGithubClick={handleGithub} />
          
          <FormFooter>
            <Text>No account? <Text variant="bold">Register</Text></Text>
          </FormFooter>
        </CardContent>
      </Card>
    </PageContainer>
  );
}
```

---

## 🎨 Design System

### Colors
```tsx
background: '#ECE9DE'
card: '#F5F3EE'
dark: '#04090C'
accent: '#29E68C'
error: '#EF4444'
```

### Fonts
```tsx
heading: "font-['Sora']"
body: "font-['Outfit']"
```

### Common Props Pattern
```tsx
// Semua components support:
className?: string  // Custom Tailwind classes

// Input components support:
hasError?: boolean  // Error state styling

// Layout components support:
align?: 'left' | 'center' | 'right'
justify?: 'start' | 'center' | 'end' | 'between'
```

---

## 🚫 Rules

### ❌ JANGAN
```tsx
// Native HTML untuk UI
<div className="field">
  <label>Email</label>
  <input />
  {error && <span>{error}</span>}
</div>

// Repetitive patterns
<input style={{ background: '...' }} />
<input style={{ background: '...' }} />
```

### ✅ GUNAKAN
```tsx
// Reusable components
<FormField label="Email" error={error}>
  <InputWithIcon icon={<Mail />} hasError={!!error} />
</FormField>
```

---

## 🔄 Creating Components

**If you write it twice, make it a component!**

1. Identify pattern yang repeated
2. Extract ke component di `/ui/`
3. Add to `/ui/index.ts`
4. Use in pages

**Example:**
```tsx
// 1. Create component
export function MyButton({ label, variant }: MyButtonProps) {
  return <button className={...}>{label}</button>;
}

// 2. Export
// /ui/index.ts
export { MyButton } from './my-button';

// 3. Use
import { MyButton } from '../components/ui';
<MyButton label="Click" variant="primary" />
```

---

**Principle: Zero Native Tags → Full Components → Clean Code** 🎯