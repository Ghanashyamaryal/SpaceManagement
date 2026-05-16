import { useCallback, useEffect, useState } from "react"

export function useLocalStorage<T>(key: string, initialValue: T) {
  const getStoredValue = useCallback(() => {
    try {
      const stored = localStorage.getItem(key)
      return stored ? JSON.parse(stored) : initialValue
    } catch {
      return initialValue
    }
  }, [key, initialValue])

  const [value, setValue] = useState<T>(getStoredValue)

  useEffect(() => {
    setValue(getStoredValue())
  }, [getStoredValue])

  const setStoredValue = (newValue: T | ((prev: T) => T)) => {
    const valueToStore =
      newValue instanceof Function ? newValue(value) : newValue

    setValue(valueToStore)
    localStorage.setItem(key, JSON.stringify(valueToStore))
  }

  return [value, setStoredValue] as const
}