// components/product/ProductCard.tsx
"use client";
import Link from "next/link";
import Image from "next/image";
import { Heart, ShoppingBag, Star } from "lucide-react";
import { Product } from "@/types";
import { formatPrice } from "@/lib/utils";
import { useCart } from "@/hooks/useCart";
import { useWishlist } from "@/hooks/useWishlist";

interface Props {
  product: Product;
}

export function ProductCard({ product }: Props) {
  const { addItem } = useCart();
  const { toggleItem, isInWishlist } = useWishlist();

  const image = Array.isArray(product.images) ? product.images[0] : "";
  const inWishlist = isInWishlist(product.id);
  const discount = product.comparePrice
    ? Math.round(((product.comparePrice - product.price) / product.comparePrice) * 100)
    : 0;

  function handleAddToCart(e: React.MouseEvent) {
    e.preventDefault();
    addItem({
      id: `${product.id}-${Date.now()}`,
      productId: product.id,
      name: product.name,
      price: product.price,
      image,
      quantity: 1,
      slug: product.slug,
    });
  }

  return (
    <div className="card group relative">
      {/* Image */}
      <Link href={`/products/${product.slug}`}>
        <div className="relative aspect-[3/4] overflow-hidden rounded-t-xl bg-gray-100">
          {image ? (
            <Image
              src={image}
              alt={product.name}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <ShoppingBag className="w-12 h-12 text-gray-300" />
            </div>
          )}

          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-1">
            {discount > 0 && (
              <span className="badge bg-red-500 text-white">-{discount}%</span>
            )}
            {product.isFeatured && (
              <span className="badge bg-accent-500 text-white">Vedette</span>
            )}
            {product.stock === 0 && (
              <span className="badge bg-gray-600 text-white">Rupture</span>
            )}
          </div>

          {/* Wishlist button */}
          <button
            onClick={(e) => {
              e.preventDefault();
              toggleItem(product.id, product.name);
            }}
            className="absolute top-3 right-3 p-2 bg-white rounded-full shadow-md hover:scale-110 transition-transform"
          >
            <Heart
              className={`w-4 h-4 ${inWishlist ? "fill-red-500 text-red-500" : "text-gray-400"}`}
            />
          </button>
        </div>
      </Link>

      {/* Info */}
      <div className="p-4">
        <p className="text-xs text-gray-500 mb-1">{product.category}</p>
        <Link href={`/products/${product.slug}`}>
          <h3 className="font-semibold text-gray-900 hover:text-primary-600 line-clamp-2 transition-colors">
            {product.name}
          </h3>
        </Link>

        {/* Rating placeholder */}
        <div className="flex items-center gap-1 mt-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <Star key={star} className="w-3 h-3 fill-amber-400 text-amber-400" />
          ))}
          <span className="text-xs text-gray-400 ml-1">(12)</span>
        </div>

        <div className="flex items-center justify-between mt-3">
          <div>
            <span className="font-bold text-primary-900 text-lg">{formatPrice(product.price)}</span>
            {product.comparePrice && (
              <span className="text-sm text-gray-400 line-through ml-2">
                {formatPrice(product.comparePrice)}
              </span>
            )}
          </div>

          <button
            onClick={handleAddToCart}
            disabled={product.stock === 0}
            className="p-2.5 bg-primary-900 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            title="Ajouter au panier"
          >
            <ShoppingBag className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

export function ProductCardSkeleton() {
  return (
    <div className="card">
      <div className="aspect-[3/4] skeleton rounded-t-xl" />
      <div className="p-4 space-y-2">
        <div className="h-3 skeleton w-16" />
        <div className="h-5 skeleton w-full" />
        <div className="h-4 skeleton w-24" />
        <div className="flex justify-between mt-3">
          <div className="h-6 skeleton w-24" />
          <div className="h-10 w-10 skeleton rounded-lg" />
        </div>
      </div>
    </div>
  );
}
