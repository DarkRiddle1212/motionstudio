# Icon System Documentation

## Overview

The Icon system provides a standardized approach to icon sizing, alignment, and usage throughout the application. It ensures consistent visual hierarchy and proper accessibility.

## Icon Sizes

The system uses a standardized sizing scale:

- **xs**: 12px (0.75rem) - Small inline icons, error indicators
- **sm**: 16px (1rem) - Button icons, input icons
- **md**: 20px (1.25rem) - Default size, navigation icons
- **lg**: 24px (1.5rem) - Header icons, prominent actions
- **xl**: 32px (2rem) - Large displays, hero sections

## Components

### Base Icon Component

```tsx
import { Icon } from '@/components/Common';

<Icon size="md" className="text-brand-accent">
  <svg>...</svg>
</Icon>
```

### SvgIcon Component

```tsx
import { SvgIcon } from '@/components/Common';

<SvgIcon size="lg" viewBox="0 0 24 24">
  <path d="..." />
</SvgIcon>
```

### Pre-built Icons

```tsx
import { 
  ChevronRightIcon,
  ChevronDownIcon,
  CheckIcon,
  CloseIcon,
  AlertIcon,
  SearchIcon,
  PlayIcon,
  DownloadIcon,
  StarIcon
} from '@/components/Common';

<ChevronRightIcon size="sm" />
<CheckIcon size="md" className="text-green-500" />
<StarIcon size="lg" filled />
```

## Usage Patterns

### In Buttons

```tsx
// Icon with text
<Button className="btn-icon-left">
  <PlayIcon size="sm" />
  Play Video
</Button>

// Icon only
<Button className="btn-icon-only">
  <CloseIcon size="sm" />
</Button>
```

### In Inputs

```tsx
<Input 
  leftIcon={<SearchIcon size="sm" />}
  placeholder="Search..."
/>
```

### In Text

```tsx
<span className="icon-text-left">
  <CheckIcon size="xs" className="text-green-500" />
  Completed
</span>
```

## CSS Utilities

### Size Classes

```css
.icon-xs { width: 0.75rem; height: 0.75rem; }
.icon-sm { width: 1rem; height: 1rem; }
.icon-md { width: 1.25rem; height: 1.25rem; }
.icon-lg { width: 1.5rem; height: 1.5rem; }
.icon-xl { width: 2rem; height: 2rem; }
```

### Alignment Classes

```css
.icon-inline    /* Inline with text */
.icon-center    /* Centered in container */
.icon-text-left /* Icon + text, icon on left */
.icon-text-right /* Icon + text, icon on right */
```

### Button Classes

```css
.btn-icon-left  /* Button with icon on left */
.btn-icon-right /* Button with icon on right */
.btn-icon-only  /* Icon-only button */
```

### Status Classes

```css
.icon-success   /* Green color */
.icon-warning   /* Amber color */
.icon-error     /* Red color */
.icon-info      /* Accent color */
.icon-disabled  /* Disabled state */
.icon-loading   /* Spinning animation */
```

## Accessibility

All icons include proper accessibility attributes:

- `aria-hidden="true"` for decorative icons
- `aria-label` for meaningful icons
- `role` when appropriate
- Proper color contrast
- Focus indicators

## Migration Guide

### Before (Inconsistent)

```tsx
// Various sizes and inconsistent alignment
<svg className="w-4 h-4" />
<svg className="w-5 h-5" />
<svg className="w-6 h-6" />

// Manual positioning
<div className="absolute left-3 top-1/2 -translate-y-1/2">
  <svg className="w-5 h-5" />
</div>
```

### After (Standardized)

```tsx
// Consistent sizing
<SearchIcon size="sm" />
<CheckIcon size="md" />
<CloseIcon size="lg" />

// Automatic alignment
<Input leftIcon={<SearchIcon size="sm" />} />
```

## Best Practices

1. **Use semantic sizes**: Choose sizes based on context, not arbitrary pixel values
2. **Maintain consistency**: Use the same size for similar contexts
3. **Consider accessibility**: Always provide appropriate labels
4. **Optimize performance**: Use the pre-built icons when possible
5. **Test alignment**: Verify icons align properly with text and other elements

## Common Patterns

### Navigation Icons
```tsx
<ChevronRightIcon size="sm" className="text-brand-secondary-text" />
```

### Status Indicators
```tsx
<CheckIcon size="xs" className="icon-success" />
<AlertIcon size="xs" className="icon-error" />
```

### Interactive Elements
```tsx
<button className="btn-icon-only">
  <CloseIcon size="sm" />
</button>
```

### Form Elements
```tsx
<Input 
  leftIcon={<SearchIcon size="sm" />}
  rightIcon={<CheckIcon size="sm" className="icon-success" />}
/>
```