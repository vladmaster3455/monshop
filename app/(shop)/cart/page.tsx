// app/(shop)/cart/page.tsx
"use client";
import Link from "next/link";
import Image from "next/image";
import { Trash2, Minus, Plus, ShoppingBag, ArrowRight } from "lucide-react";
import { useCart } from "@/hooks/useCart";
import { formatPrice } from "@/lib/utils";

export default function CartPage() {
  const { items, removeItem, updateQuantity, totalPrice, clearCart } = useCart();

  if (items.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-24 text-center">
        <ShoppingBag className="w-20 h-20 text-gray-300 mx-auto mb-6" />
        <h1 className="text-2xl font-bold mb-3">Votre panier est vide</h1>
        <p className="text-gray-500 mb-8">Découvrez nos produits et ajoutez-les à votre panier !</p>
        <Link href="/products" className="btn-primary inline-block">
          Découvrir le catalogue
        </Link>
      </div>
    );
  }

  const subtotal = totalPrice();

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold mb-8">Mon panier ({items.length} article{items.length > 1 ? "s" : ""})</h1>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Items */}
        <div className="lg:col-span-2 space-y-4">
          {items.map((item) => (
            <div key={item.id} className="card p-4 flex gap-4">
              <div className="relative w-24 h-24 rounded-xl overflow-hidden shrink-0 bg-gray-100">
                {item.image && (
                  <Image src={item.image} alt={item.name} fill className="object-cover" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <Link href={`/products/${item.slug}`} className="font-semibold hover:text-primary-600 line-clamp-2">
                  {item.name}
                </Link>
                {item.variant && (
                  <p className="text-sm text-gray-500 mt-0.5">
                    {Object.entries(item.variant).map(([k, v]) => `${k}: ${v}`).join(" | ")}
                  </p>
                )}
                <p className="text-primary-900 font-bold mt-1">{formatPrice(item.price)}</p>

                <div className="flex items-center justify-between mt-3">
                  <div className="flex items-center gap-2 border rounded-lg overflow-hidden">
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      className="px-3 py-2 hover:bg-gray-100 transition-colors"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="px-3 py-2 font-medium w-12 text-center">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      className="px-3 py-2 hover:bg-gray-100 transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="font-bold">{formatPrice(item.price * item.quantity)}</span>
                    <button
                      onClick={() => removeItem(item.id)}
                      className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}

          <button
            onClick={clearCart}
            className="text-red-500 hover:text-red-700 text-sm font-medium hover:underline"
          >
            Vider le panier
          </button>
        </div>

        {/* Summary */}
        <div className="lg:col-span-1">
          <div className="card p-6 sticky top-24">
            <h2 className="font-bold text-lg mb-4">Résumé</h2>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Sous-total</span>
                <span className="font-medium">{formatPrice(subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Livraison</span>
                <span className="text-gray-500">Calculée au checkout</span>
              </div>
            </div>
            <div className="border-t mt-4 pt-4 flex justify-between font-bold text-lg">
              <span>Total estimé</span>
              <span className="text-primary-900">{formatPrice(subtotal)}</span>
            </div>
            <Link href="/checkout" className="btn-primary w-full text-center block mt-6 flex items-center justify-center gap-2">
              Passer commande
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link href="/products" className="text-center block mt-3 text-sm text-gray-500 hover:text-primary-600">
              Continuer mes achats
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
