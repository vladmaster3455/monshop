// hooks/useWishlist.ts
import { create } from "zustand";
import { persist } from "zustand/middleware";
import toast from "react-hot-toast";

interface WishlistStore {
  items: string[]; // productIds
  toggleItem: (productId: string, productName: string) => void;
  isInWishlist: (productId: string) => boolean;
  clear: () => void;
}

export const useWishlist = create<WishlistStore>()(
  persist(
    (set, get) => ({
      items: [],

      toggleItem: (productId, productName) => {
        const items = get().items;
        if (items.includes(productId)) {
          set({ items: items.filter((id) => id !== productId) });
          toast.success(`${productName} retiré des favoris`);
        } else {
          set({ items: [...items, productId] });
          toast.success(`${productName} ajouté aux favoris`);
        }
      },

      isInWishlist: (productId) => get().items.includes(productId),

      clear: () => set({ items: [] }),
    }),
    {
      name: "wishlist-storage",
    }
  )
);
