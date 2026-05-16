import { useState } from "react"
import {
  useDebounce,
  useToggle,
  useWindowSize,
  useOnlineStatus,
  useCopyToClipboard,
  useLocalStorage,
  usePrevious,
  useClearLocalStorage,
  useRemoveLocalStorageItem,
} from "@Hooks/index"
import { Button, Input } from "@Components/index"


export default function HookDemo() {
  // debounce
  const [input, setInput] = useState("")
  const debounced = useDebounce(input, 500)

  // toggle
  const [isOn, toggle] = useToggle()

  // window size
  const { width, height } = useWindowSize()

  // online status
  const isOnline = useOnlineStatus()

  // copy
  const { copied, copy } = useCopyToClipboard()

  // local storage
  const [name, setName] = useLocalStorage("name", "")

  // previous
  const prevInput = usePrevious(input)

  // localStorage utilities
  const { clearAll } = useClearLocalStorage()
  const { removeItem } = useRemoveLocalStorageItem()
  const [deleteKey, setDeleteKey] = useState("")

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Hook Testing Page</h1>

      {/* Debounce */}
      <div>
        <h2 className="font-semibold">useDebounce</h2>
        <Input 
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type to debounce..."
        />
        <p>Debounced: {debounced}</p>
      </div>

      {/* Previous */}
      <div>
        <h2 className="font-semibold">usePrevious</h2>
        <p>Current: {input}</p>
        <p>Previous: {prevInput}</p>
      </div>

      {/* Toggle */}
      <div>
        <h2 className="font-semibold">useToggle</h2>
        <Button onClick={toggle}>
          Toggle
        </Button>
        <p>{isOn ? "ON" : "OFF"}</p>
      </div>

      {/* Window Size */}
      <div>
        <h2 className="font-semibold">useWindowSize</h2>
        <p>{width} x {height}</p>
      </div>

      {/* Online Status */}
      <div>
        <h2 className="font-semibold">useOnlineStatus</h2>
        <p>{isOnline ? "Online ✅" : "Offline ❌"}</p>
      </div>

      {/* Local Storage */}
      <div>
        <h2 className="font-semibold">useLocalStorage</h2>
        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Enter your name..."
        />
        <p>Stored: {name}</p>
      </div>

      {/* Copy */}
      <div>
        <h2 className="font-semibold">useCopyToClipboard</h2>
        <Button onClick={() => copy("Hello World")}>
          Copy
        </Button>
        <p>{copied ? "Copied!" : ""}</p>
      </div>

      {/* Local Storage Utilities */}
      <div>
        <h2 className="font-semibold">Local Storage Utilities</h2>
        <Button onClick={clearAll}>
          Clear All
        </Button>
        <Input
          value={deleteKey}
          onChange={(e) => setDeleteKey(e.target.value)}
          placeholder="Enter key to delete..."
        />
        <Button onClick={() => removeItem(deleteKey)}>
          Remove Item
        </Button>
      </div>
    </div>
  )
}