## State Management (Zustand)

### Basic Setup

Store file (`src/store/store.ts`):

```ts
import { create } from "zustand"
import { persist, createJSONStorage } from "zustand/middleware"
import { immer } from "zustand/middleware/immer"

// Session Storage Example (Counter)
type CounterStore = {
  count: number
  inc: () => void
  dec: () => void
}

export const useCounterStore = create<CounterStore>()(
  persist(
    immer((set) => ({
      count: 0,
      inc: () => set((state) => { state.count += 1 }),
      dec: () => set((state) => { state.count -= 1 }),
    })),
    {
      name: "counter-storage",
      storage: createJSONStorage(() => sessionStorage),
    }
  ) as any
)

// Local Storage Example (User Data)
type UserStore = {
  name: string
  setName: (name: string) => void
}

export const useUserStore = create<UserStore>()(
  persist(
    immer((set) => ({
      name: "",
      setName: (name) => set((state) => { state.name = name }),
    })),
    {
      name: "user-storage",
      storage: createJSONStorage(() => localStorage),
    }
  ) as any
)
```

### Usage in Components

```tsx
import { useCounterStore, useUserStore } from "@/store/store"

export default function MyComponent() {
  const { count, inc, dec } = useCounterStore()
  const { name, setName } = useUserStore()

  return (
    <div>
      {/* Counter (session-based) */}
      <p>Count: {count}</p>
      <button onClick={inc}>Increment</button>
      <button onClick={dec}>Decrement</button>

      {/* Name (persisted to localStorage) */}
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Enter your name"
      />
      <p>Stored Name: {name}</p>
    </div>
  )
}
```

### Storage Strategy

| Use Case             | Storage        | Example       |
| -------------------- | -------------- | ------------- |
| Temporary UI state   | sessionStorage | Counter      |
| Persistent user data | localStorage   | User name    |

---