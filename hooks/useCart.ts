// hooks/useCart.ts
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { CartItem } from "@/types";
import toast from "react-hot-toast";

interface CartStore {
  items: CartItem[];
  isOpen: boolean;
  addItem: (item: CartItem) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;
  totalItems: () => number;
  totalPrice: () => number;
}

export const useCart = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,

      addItem: (item) => {
        const items = get().items;
        const variantKey = item.variant ? JSON.stringify(item.variant) : "";
        const existingIndex = items.findIndex(
          (i) => i.productId === item.productId && JSON.stringify(i.variant || "") === variantKey
        );

        if (existingIndex >= 0) {
          const updated = [...items];
          updated[existingIndex].quantity += item.quantity;
          set({ items: updated });
        } else {
          set({ items: [...items, item] });
        }

        toast.success(`${item.name} ajouté au panier`);
        set({ isOpen: true });
      },

      removeItem: (id) => {
        set({ items: get().items.filter((i) => i.id !== id) });
        toast.success("Article retiré du panier");
      },

      updateQuantity: (id, quantity) => {
        if (quantity <= 0) {
          get().removeItem(id);
          return;
        }
        set({
          items: get().items.map((i) =>
            i.id === id ? { ...i, quantity } : i
          ),
        });
      },

      clearCart: () => set({ items: [] }),

      openCart: () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false }),
      toggleCart: () => set({ isOpen: !get().isOpen }),

      totalItems: () => get().items.reduce((sum, i) => sum + i.quantity, 0),
      totalPrice: () => get().items.reduce((sum, i) => sum + i.price * i.quantity, 0),
    }),
    {
      name: "cart-storage",
    }
  )
);
