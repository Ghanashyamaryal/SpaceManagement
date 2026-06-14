import { createContext, useCallback, useContext, useMemo, type ReactNode } from "react";
import { useLocalStorage } from "@/hooks/useLocalStorage";

export interface CartLine {
  menuItemId: string;
  name: string;
  unitPrice: number;
  quantity: number;
  imageUrl?: string;
  branch?: string;
}

interface CartContextValue {
  items: CartLine[];
  addItem: (line: CartLine) => void;
  updateQuantity: (menuItemId: string, quantity: number) => void;
  removeItem: (menuItemId: string) => void;
  clear: () => void;
  total: number;
  count: number;
}

const CartContext = createContext<CartContextValue | undefined>(undefined);

const EMPTY_CART: CartLine[] = [];

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useLocalStorage<CartLine[]>("canteen-cart", EMPTY_CART);

  const addItem = useCallback(
    (line: CartLine) => {
      setItems((prev) => {
        const existing = prev.find((l) => l.menuItemId === line.menuItemId);
        if (existing) {
          return prev.map((l) =>
            l.menuItemId === line.menuItemId
              ? { ...l, quantity: l.quantity + line.quantity }
              : l
          );
        }
        return [...prev, line];
      });
    },
    [setItems]
  );

  const updateQuantity = useCallback(
    (menuItemId: string, quantity: number) => {
      setItems((prev) =>
        prev
          .map((l) => (l.menuItemId === menuItemId ? { ...l, quantity } : l))
          .filter((l) => l.quantity > 0)
      );
    },
    [setItems]
  );

  const removeItem = useCallback(
    (menuItemId: string) => {
      setItems((prev) => prev.filter((l) => l.menuItemId !== menuItemId));
    },
    [setItems]
  );

  const clear = useCallback(() => {
    setItems([]);
  }, [setItems]);

  const total = useMemo(
    () => items.reduce((sum, l) => sum + l.unitPrice * l.quantity, 0),
    [items]
  );
  const count = useMemo(
    () => items.reduce((sum, l) => sum + l.quantity, 0),
    [items]
  );

  const value: CartContextValue = {
    items,
    addItem,
    updateQuantity,
    removeItem,
    clear,
    total,
    count,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside CartProvider");
  return ctx;
}
