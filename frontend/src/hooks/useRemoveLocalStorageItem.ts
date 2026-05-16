export function useRemoveLocalStorageItem() {
  const removeItem = (key: string) => {
    try {
      localStorage.removeItem(key)
    } catch (error) {
      console.error("Error removing item:", error)
    }
  }

  return { removeItem }
}