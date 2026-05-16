# UI Components

This folder contains the reusable UI primitives for the starter kit. Most projects will import them from `@Components/index`, so usage stays consistent and short.

## Import

```tsx
import { Button, Input } from "@Components/index"
```

If you prefer direct imports, you can also import from the specific component folder.

## Common Usage

### Button

```tsx
<Button>Save changes</Button>
<Button variant="outline">Cancel</Button>
<Button variant="destructive">Delete</Button>
```

### Input

```tsx
<Input placeholder="Enter your email" />
```

## Typography Component

The `Typography` component provides semantic HTML with predefined styles for consistent text hierarchy.

### Usage

```tsx
import { Typography } from "@Components/index"

export default function TypographyDemo() {
  return (
    <div className="space-y-4">
      {/* Headings */}
      <Typography variant="h1">Heading 1</Typography>
      <Typography variant="h2">Heading 2</Typography>
      <Typography variant="h3">Heading 3</Typography>
      <Typography variant="h4">Heading 4</Typography>
      <Typography variant="h5">Heading 5</Typography>
      <Typography variant="h6">Heading 6</Typography>

      {/* Default paragraph */}
      <Typography>
        This is a responsive paragraph with default styling.
      </Typography>

      {/* With custom styles */}
      <Typography variant="h1" className="text-red-500">
        Red Heading
      </Typography>

      {/* Size overrides */}
      <Typography 
        variant="h1" 
        className="text-sm"
      >
        Small Custom Heading
      </Typography>
    </div>
  )
}
```

## Notes

* Components are styled with Tailwind and design tokens from the theme.
* Many components are built with composition, so you can combine them as needed.
* Check `src/components/index.ts` for the full list of available exports.
