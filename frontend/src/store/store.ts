import { create } from "zustand"
import { persist, createJSONStorage } from "zustand/middleware"
import { immer } from "zustand/middleware/immer"

// SESSION STORE (count)
type CounterStore = {
  count: number
  inc: () => void
  dec: () => void
}

export const useCounterStore = create<CounterStore>()(
  persist(
    immer((set) => ({
      count: 1,

      inc: () =>
        set((state: CounterStore) => {
          state.count += 1
        }),

      dec: () =>
        set((state: CounterStore) => {
          state.count -= 1
        }),
    })),
    {
      name: "counter-session",
      storage: createJSONStorage(() => sessionStorage),
    }
  ) as any
)


// LOCAL STORE (name)
type UserStore = {
  name: string
  setName: (name: string) => void
}

export const useUserStore = create<UserStore>()(
  persist(
    (set) => ({
      name: "",

      setName: (name: string) => set({ name }),
    }),
    {
      name: "user-local",
      storage: createJSONStorage(() => localStorage),
    }
  ) as any
)