## Custom Hooks

### useDebounce
Delays value updates by a specified duration.

```tsx
const debounced = useDebounce(searchInput, 500)
// Use 'debounced' when making API calls to avoid excessive requests
```

### useToggle
Simple boolean state toggler.

```tsx
const [isOn, toggle] = useToggle()
// Returns: [current state, toggle function]
```

### useWindowSize
Track window dimensions in real-time.

```tsx
const { width, height } = useWindowSize()
// Automatically updates on window resize
```

### useOnlineStatus
Detect network connectivity.

```tsx
const isOnline = useOnlineStatus()
// Returns true if connected, false if offline
```

### useLocalStorage
Persist and sync state with localStorage.

```tsx
const [name, setName] = useLocalStorage("name", "")
// Automatically syncs with localStorage key "name"
```

### usePrevious
Track the previous value of a state.

```tsx
const prevValue = usePrevious(currentValue)
// Returns the value from the previous render
```

### useCopyToClipboard
Copy text to clipboard with feedback.

```tsx
const { copied, copy } = useCopyToClipboard()
copy("Text to copy")
// 'copied' is true for ~2 seconds after copying
```

### useClearLocalStorage
Clear all localStorage items.

```tsx
const { clearAll } = useClearLocalStorage()
clearAll()
// Removes all localStorage entries
```

### useRemoveLocalStorageItem
Remove a specific localStorage item.

```tsx
const { removeItem } = useRemoveLocalStorageItem()
removeItem("keyName")
// Removes the specific key from localStorage
```

### useFetch
Fetch data from an API with loading and error states.

```tsx
const { data, loading, error } = useFetch("https://api.example.com/data")
// Automatically handles loading and error states
```

### useInterval
Run code at fixed intervals.

```tsx
useInterval(() => {
  // This runs every second
}, 1000)
```

### useMobile
Detect if viewport is mobile size.

```tsx
const isMobile = useMobile()
// Returns true if width <= 768px
```

---
