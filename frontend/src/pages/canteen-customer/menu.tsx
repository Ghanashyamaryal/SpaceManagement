import Loading from "@/components/common/Loading";
import PageHeader, { pageContainer } from "@/components/common/PageHeader";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { useCart } from "@/context/cartContext";
import { useMutation } from "@/hooks";
import { useFetch } from "@/hooks/queryFn";
import { Minus, Plus, ShoppingCart, Trash2, UtensilsCrossed } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
interface MenuItemDoc {
  _id: string;
  name: string;
  category: string;
  price: number;
  prepTimeMinutes: number;
  description?: string;
  imageUrl?: string;
  branch?: { _id: string; name: string } | string;
}

export default function CanteenBrowse() {
  const { data: menuData, isLoading, refetch } = useFetch({
    path: "/api/canteen/menu",
    queryKey: "browse-menu",
  });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const items: MenuItemDoc[] = (menuData as any)?.menuItems ?? [];

  const cart = useCart();
  const [isCheckingOut, setIsCheckingOut] = useState(false);

  const orderMutation = useMutation({
    method: "POST",
    onSuccess: () => {
      cart.clear();
      refetch();
      toast.success("Order placed — awaiting admin acceptance");
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    onError: (error: any) => {
      toast.error(error.message || "Failed to place order");
    },
  });

  const handleAdd = (item: MenuItemDoc) => {
    const branchId =
      typeof item.branch === "string" ? item.branch : item.branch?._id;
    cart.addItem({
      menuItemId: item._id,
      name: item.name,
      unitPrice: item.price,
      quantity: 1,
      imageUrl: item.imageUrl,
      branch: branchId,
    });
  };

  const handleCheckout = async () => {
    if (cart.items.length === 0) {
      toast.error("Your cart is empty");
      return;
    }
    setIsCheckingOut(true);
    try {
      await orderMutation.mutate({
        path: "/api/canteen/orders",
        data: {
          items: cart.items.map((l) => ({
            menuItemId: l.menuItemId,
            quantity: l.quantity,
          })),
        },
      });
    } finally {
      setIsCheckingOut(false);
    }
  };

  return (
    <div className={pageContainer + " p-6"}>
      <PageHeader
        title="Canteen"
        description="Browse menu and add items to your cart"
        icon={<UtensilsCrossed className="w-6 h-6" />}
        className="mb-1"
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
        <div className="lg:col-span-2">
          {isLoading ? (
            <Loading className="py-6" />
          ) : items.length === 0 ? (
            <p className="text-muted-foreground py-6">No items available.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {items.map((item) => (
                <Card key={item._id}>
                  <CardContent className="p-4 space-y-3">
                    {item.imageUrl && (
                      <img
                        src={item.imageUrl}
                        alt={item.name}
                        className="w-full h-40 object-cover rounded-md"
                      />
                    )}
                    <div>
                      <h3 className="font-bold text-lg">{item.name}</h3>
                      <p className="text-xs text-muted-foreground capitalize">
                        {item.category} · {item.prepTimeMinutes} min
                      </p>
                      {item.description && (
                        <p className="text-sm mt-1 text-muted-foreground">
                          {item.description}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-lg">₹{item.price}</span>
                      <Button size="sm" onClick={() => handleAdd(item)}>
                        <Plus className="h-4 w-4" /> Add
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        <Card className="h-fit sticky top-6">
          <CardContent className="p-4 space-y-3">
            <div className="flex items-center gap-2">
              <ShoppingCart className="h-5 w-5" />
              <h3 className="font-bold text-lg">Cart ({cart.count})</h3>
            </div>
            {cart.items.length === 0 ? (
              <p className="text-sm text-muted-foreground">Cart is empty.</p>
            ) : (
              <>
                <ul className="space-y-2 max-h-80 overflow-y-auto">
                  {cart.items.map((line) => (
                    <li
                      key={line.menuItemId}
                      className="flex items-center justify-between gap-2"
                    >
                      <div className="flex-1">
                        <div className="text-sm font-medium">{line.name}</div>
                        <div className="text-xs text-muted-foreground">
                          ₹{line.unitPrice} × {line.quantity}
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-7 w-7"
                          onClick={() =>
                            cart.updateQuantity(line.menuItemId, line.quantity - 1)
                          }
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        <span className="w-6 text-center text-sm">
                          {line.quantity}
                        </span>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-7 w-7"
                          onClick={() =>
                            cart.updateQuantity(line.menuItemId, line.quantity + 1)
                          }
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-7 w-7"
                          onClick={() => cart.removeItem(line.menuItemId)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </li>
                  ))}
                </ul>
                <div className="border-t pt-3 flex items-center justify-between">
                  <span className="text-sm">Total</span>
                  <span className="font-bold text-lg">₹{cart.total}</span>
                </div>
                <Button
                  className="w-full"
                  onClick={handleCheckout}
                  disabled={isCheckingOut || orderMutation.isLoading}
                >
                  {isCheckingOut || orderMutation.isLoading
                    ? "Placing order..."
                    : "Place Order"}
                </Button>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
