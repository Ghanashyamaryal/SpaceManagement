export function useClearLocalStorage() {
  const clearAll = () => {
    try {
      localStorage.clear()
    } catch (error) {
      console.error("Error clearing localStorage:", error)
    }
  }

  return { clearAll }
}