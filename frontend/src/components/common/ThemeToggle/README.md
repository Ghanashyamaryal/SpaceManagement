## Theming System

### Using the Theme Toggle

The starter kit includes Light, Dark, and System theme modes with a ready-to-use toggle component.

```tsx
import { ThemeToggle } from "@Components/common/ThemeToggle"

export default function Header() {
  return (
    <div className="flex justify-end p-4 border-b border-border">
      <ThemeToggle />
    </div>
  )
}
```

### Using Theme Colors

Tailwind is configured with CSS variables for easy theming. Use the predefined colors:

```tsx
export default function ThemedCard() {
  return (
    <div className="bg-background text-foreground transition-colors">
      
      {/* Header with border */}
      <div className="flex justify-between p-4 border-b border-border">
        <h1 className="text-primary">My App</h1>
        <ThemeToggle />
      </div>

      {/* Content with card styling */}
      <div className="p-6">
        <div className="bg-card text-card-foreground border border-border p-6 rounded-lg">
          <p className="text-muted-foreground">
            This card is fully themed with CSS variables
          </p>
        </div>
      </div>
    </div>
  )
}
```

### Available Theme Colors

* `background` - Page background
* `foreground` - Default text color
* `card` - Card background
* `card-foreground` - Card text
* `primary` - Primary brand color
* `muted-foreground` - Secondary text
* `border` - Border color

---