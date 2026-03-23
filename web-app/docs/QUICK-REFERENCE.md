# 🚀 ITTS Community - Quick Reference Card

## 📦 Import Pattern

```tsx
import {
  // Layout
  PageContainer, BackLink,
  
  // Form Structure
  FormHeader, FormFooter, FormField, FormGroup, FormRow,
  
  // Inputs (all support icons!)
  Input, Textarea, PasswordField, CheckboxField, DropdownSelector,
  
  // Utils
  Text, TextDivider, SocialButtons, FormError,
  
  // Base
  Button, Card, CardContent, Label,
} from '../components/ui';
```

---

## ⚡ Common Patterns

### Basic Form
```tsx
<FormField id="email" label="Email" error={errors.email?.message}>
  <Input
    {...register('email')}
    icon={<Mail />}
    hasError={!!errors.email}
  />
</FormField>
```

### Password Field
```tsx
<FormField id="password" label="Password" error={errors.password?.message}>
  <PasswordField
    {...register('password')}
    hasError={!!errors.password}
  />
</FormField>
```

### Textarea with Icon
```tsx
<FormField id="message" label="Message" error={errors.message?.message}>
  <Textarea
    {...register('message')}
    icon={<MessageSquare />}
    rows={4}
    hasError={!!errors.message}
  />
</FormField>
```

### Checkbox
```tsx
<CheckboxField
  {...register('agree')}
  id="agree"
  label="I agree to terms"
  error={errors.agree?.message}
/>
```

### Dropdown
```tsx
<DropdownSelector
  id="track"
  label="Select Track"
  options={TRACKS}
  value={selected}
  onChange={setSelected}
  icon={<Code />}
  error={errors.track?.message}
/>
```

### Two Column Grid
```tsx
<FormGroup columns={2}>
  <FormField label="First Name">
    <Input />
  </FormField>
  <FormField label="Last Name">
    <Input />
  </FormField>
</FormGroup>
```

### Horizontal Row
```tsx
<FormRow justify="between">
  <Label>Remember me</Label>
  <Button variant="link">Forgot?</Button>
</FormRow>
```

---

## 🎨 Color Tokens

```tsx
background: '#ECE9DE'     // Page background
card: '#F5F3EE'           // Card background
dark: '#04090C'           // Dark text/panels
accent: '#29E68C'         // Primary CTA
error: '#EF4444'          // Error state

textPrimary: '#04090C'
textSecondary: 'rgba(4, 9, 12, 0.6)'
textMuted: 'rgba(4, 9, 12, 0.4)'

border: 'rgba(4, 9, 12, 0.1)'
borderError: '#EF4444'
```

---

## 🔤 Typography

```tsx
// Fonts
heading: "font-['Sora']"
body: "font-['Outfit']"

// Text component
<Text variant="default">Normal</Text>
<Text variant="muted">Muted</Text>
<Text variant="bold">Bold</Text>
<Text variant="error">Error</Text>
<Text variant="success">Success</Text>

<Text size="xs">Extra small</Text>
<Text size="sm">Small (default)</Text>
<Text size="base">Base</Text>
<Text size="lg">Large</Text>
<Text size="xl">Extra large</Text>
```

---

## 📐 Layout

```tsx
// Page container
<PageContainer maxWidth="md">
  {/* content */}
</PageContainer>

// Max widths
maxWidth="sm"   // 384px
maxWidth="md"   // 448px
maxWidth="lg"   // 512px
maxWidth="xl"   // 576px
maxWidth="2xl"  // 672px
maxWidth="full" // 100%

// Form groups
columns={1}     // Single column
columns={2}     // 1 mobile, 2 desktop
columns={3}     // 1 mobile, 3 desktop
columns={4}     // 1 mobile, 2 tablet, 4 desktop
```

---

## 🎯 Common Props

### Input/Textarea
```tsx
icon?: ReactNode
iconPosition?: 'left' | 'right'  // default: 'left'
hasError?: boolean
```

### FormField
```tsx
id: string
label: string
error?: string
required?: boolean
```

### PasswordField
```tsx
hasError?: boolean
showIcon?: boolean  // default: true
```

### CheckboxField
```tsx
id: string
label: ReactNode
error?: string
```

### DropdownSelector
```tsx
id: string
label: string
options: DropdownOptionType[]
value?: T
onChange: (value: T) => void
error?: string
icon?: ReactNode
placeholder?: string
```

---

## 🧬 Atoms (Low-Level)

```tsx
// Import atoms untuk custom compositions
import {
  FieldLabel,
  FieldError,
  IconWrapper,
  InputWrapper,
} from '../components/ui/atoms';

// Example: Custom field
<InputWrapper>
  <IconWrapper icon={<Search />} position="left" />
  <IconWrapper icon={<Loader />} position="right" />
  <input />
</InputWrapper>
```

---

## ✅ Full Page Example

```tsx
import { useForm } from 'react-hook-form';
import { Mail, Lock } from 'lucide-react';
import {
  PageContainer, BackLink, Card, CardContent,
  FormHeader, FormField, Input, PasswordField,
  Button, TextDivider, SocialButtons, FormFooter, Text,
} from '../components/ui';

export function SignIn() {
  const { register, handleSubmit, formState: { errors } } = useForm();
  
  return (
    <PageContainer maxWidth="md">
      <BackLink to="/" label="Back to home" />
      
      <Card className="rounded-3xl shadow-lg border-0" style={{ background: '#F5F3EE' }}>
        <CardContent className="p-8">
          <FormHeader
            title="Welcome Back"
            subtitle="Sign in to continue"
          />
          
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <FormField id="email" label="Email" error={errors.email?.message}>
              <Input
                {...register('email')}
                type="email"
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
            
            <Button
              type="submit"
              className="w-full rounded-xl py-3"
              style={{ background: '#29E68C', color: '#04090C' }}
            >
              Sign In
            </Button>
          </form>
          
          <TextDivider text="OR CONTINUE WITH" />
          
          <SocialButtons
            onGoogleClick={handleGoogle}
            onGithubClick={handleGithub}
          />
          
          <FormFooter>
            <Text>
              Don't have an account?{' '}
              <Link to="/register">
                <Text variant="bold">Register</Text>
              </Link>
            </Text>
          </FormFooter>
        </CardContent>
      </Card>
    </PageContainer>
  );
}
```

---

## 🚫 Don'ts

```tsx
// ❌ Native HTML tags
<div className="field">
  <label>Email</label>
  <input />
</div>

// ❌ InputWithIcon (deleted!)
import { InputWithIcon } from '../components/ui';

// ❌ Inline styles (use tokens)
style={{ color: '#333' }}
style={{ background: 'gray' }}
```

---

## ✅ Do's

```tsx
// ✅ Use components
<FormField label="Email">
  <Input />
</FormField>

// ✅ Input with icon (merged!)
<Input icon={<Mail />} />

// ✅ Use design tokens
style={{ color: '#04090C' }}
style={{ background: '#29E68C' }}
```

---

## 📚 Documentation Links

- **User Guide**: `/docs/COMPONENTS.md`
- **Architecture**: `/docs/ATOMIC-COMPONENTS.md`
- **Summary**: `/docs/REFACTORING-SUMMARY.md`
- **Quick Reference**: This file

---

**Remember: If you write it twice, make it a component!** 🎯
