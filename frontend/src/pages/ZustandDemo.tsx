import { useCounterStore, useUserStore } from "@/store/store"

export default function ZustandDemo() {
  const { count, inc, dec } = useCounterStore()
  const { name, setName } = useUserStore()

  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-6">

      {/* Counter (session) */}
      <div className="text-center">
        <p className="text-xl">Count: {count}</p>
        <div className="flex gap-4 mt-2">
          <button onClick={inc} className="px-4 py-2 bg-black text-white rounded">+</button>
          <button onClick={dec} className="px-4 py-2 bg-gray-300 rounded">-</button>
        </div>
      </div>

      {/* Name (local) */}
      <div className="text-center">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Enter your name"
          className="border px-3 py-2 rounded"
        />
        <p className="mt-2">Stored Name: {name}</p>
      </div>

    </div>
  )
}