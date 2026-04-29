// components/product/ProductDetail.tsx
"use client";
import { useState } from "react";
import Image from "next/image";
import { ShoppingBag, Heart, Star, Check, AlertTriangle, ZoomIn } from "lucide-react";
import { Product, Review } from "@/types";
import { formatPrice } from "@/lib/utils";
import { useCart } from "@/hooks/useCart";
import { useWishlist } from "@/hooks/useWishlist";

interface Props {
  product: Product & { reviews: Review[] };
}

export function ProductDetail({ product }: Props) {
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedVariants, setSelectedVariants] = useState<Record<string, string>>({});
  const [quantity, setQuantity] = useState(1);
  const [zoomed, setZoomed] = useState(false);

  const { addItem } = useCart();
  const { toggleItem, isInWishlist } = useWishlist();

  const images = Array.isArray(product.images) ? product.images : [];
  const variants = Array.isArray(product.variants) ? product.variants : [];
  const inWishlist = isInWishlist(product.id);

  const avgRating = product.reviews.length
    ? product.reviews.reduce((s, r) => s + r.rating, 0) / product.reviews.length
    : 0;

  const discount = product.comparePrice
    ? Math.round(((product.comparePrice - product.price) / product.comparePrice) * 100)
    : 0;

  function handleAddToCart() {
    addItem({
      id: `${product.id}-${JSON.stringify(selectedVariants)}-${Date.now()}`,
      productId: product.id,
      name: product.name,
      price: product.price,
      image: images[0] || "",
      quantity,
      variant: Object.keys(selectedVariants).length ? selectedVariants : undefined,
      slug: product.slug,
    });
  }

  const allVariantsSelected = variants.every((v: any) => selectedVariants[v.name]);
  const canAddToCart = product.stock > 0 && (variants.length === 0 || allVariantsSelected);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
      {/* Images */}
      <div className="space-y-4">
        <div
          className="relative aspect-square rounded-2xl overflow-hidden bg-gray-100 cursor-zoom-in"
          onClick={() => setZoomed(!zoomed)}
        >
          {images[selectedImage] && (
            <Image
              src={images[selectedImage]}
              alt={product.name}
              fill
              className={`object-cover transition-transform duration-300 ${zoomed ? "scale-150" : "scale-100"}`}
              sizes="(max-width: 1024px) 100vw, 50vw"
              priority
            />
          )}
          <div className="absolute top-4 right-4 bg-white/80 p-2 rounded-lg">
            <ZoomIn className="w-4 h-4 text-gray-600" />
          </div>
          {discount > 0 && (
            <div className="absolute top-4 left-4 bg-red-500 text-white badge px-3 py-1 text-sm">
              -{discount}%
            </div>
          )}
        </div>

        {images.length > 1 && (
          <div className="flex gap-3 overflow-x-auto pb-2">
            {images.map((img, i) => (
              <button
                key={i}
                onClick={() => setSelectedImage(i)}
                className={`relative w-20 h-20 rounded-lg overflow-hidden shrink-0 border-2 transition-all ${
                  i === selectedImage ? "border-primary-600" : "border-transparent"
                }`}
              >
                <Image src={img} alt={`${product.name} ${i + 1}`} fill className="object-cover" />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Info */}
      <div>
        <p className="text-sm text-gray-500 mb-2">{product.category}</p>
        <h1 className="text-3xl font-bold mb-3">{product.name}</h1>

        {/* Rating */}
        {product.reviews.length > 0 && (
          <div className="flex items-center gap-2 mb-4">
            <div className="flex">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`w-4 h-4 ${star <= Math.round(avgRating) ? "fill-amber-400 text-amber-400" : "text-gray-300"}`}
                />
              ))}
            </div>
            <span className="text-sm text-gray-600">{avgRating.toFixed(1)} ({product.reviews.length} avis)</span>
          </div>
        )}

        {/* Price */}
        <div className="flex items-center gap-3 mb-6">
          <span className="text-3xl font-bold text-primary-900">{formatPrice(product.price)}</span>
          {product.comparePrice && (
            <span className="text-xl text-gray-400 line-through">{formatPrice(product.comparePrice)}</span>
          )}
          {discount > 0 && (
            <span className="badge bg-red-100 text-red-700">Économisez {discount}%</span>
          )}
        </div>

        <p className="text-gray-600 leading-relaxed mb-6">{product.description}</p>

        {/* Stock */}
        <div className={`flex items-center gap-2 mb-6 ${product.stock > 0 ? "text-green-600" : "text-red-500"}`}>
          {product.stock > 0 ? (
            <>
              <Check className="w-4 h-4" />
              <span className="text-sm font-medium">
                {product.stock > 5 ? "En stock" : `Plus que ${product.stock} en stock !`}
              </span>
            </>
          ) : (
            <>
              <AlertTriangle className="w-4 h-4" />
              <span className="text-sm font-medium">Rupture de stock</span>
            </>
          )}
        </div>

        {/* Variants */}
        {variants.map((variant: any) => (
          <div key={variant.name} className="mb-4">
            <p className="text-sm font-semibold mb-2">
              {variant.name}
              {selectedVariants[variant.name] && (
                <span className="font-normal text-gray-500 ml-2">: {selectedVariants[variant.name]}</span>
              )}
            </p>
            <div className="flex flex-wrap gap-2">
              {variant.options.map((opt: string) => (
                <button
                  key={opt}
                  onClick={() => setSelectedVariants((prev) => ({ ...prev, [variant.name]: opt }))}
                  className={`px-4 py-2 rounded-lg border-2 text-sm font-medium transition-all ${
                    selectedVariants[variant.name] === opt
                      ? "border-primary-900 bg-primary-900 text-white"
                      : "border-gray-200 hover:border-primary-400"
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>
        ))}

        {/* Quantity */}
        <div className="mb-6">
          <p className="text-sm font-semibold mb-2">Quantité</p>
          <div className="flex items-center gap-3 bg-gray-100 rounded-lg p-1 w-fit">
            <button
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              className="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-white transition-colors font-bold"
            >
              −
            </button>
            <span className="w-10 text-center font-semibold">{quantity}</span>
            <button
              onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
              className="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-white transition-colors font-bold"
            >
              +
            </button>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={handleAddToCart}
            disabled={!canAddToCart}
            className="btn-primary flex-1 flex items-center justify-center gap-2 text-base"
          >
            <ShoppingBag className="w-5 h-5" />
            {product.stock === 0 ? "Rupture de stock" : "Ajouter au panier"}
          </button>
          <button
            onClick={() => toggleItem(product.id, product.name)}
            className={`p-4 rounded-lg border-2 transition-all ${
              inWishlist ? "border-red-300 bg-red-50" : "border-gray-200 hover:border-red-300"
            }`}
          >
            <Heart className={`w-5 h-5 ${inWishlist ? "fill-red-500 text-red-500" : "text-gray-400"}`} />
          </button>
        </div>

        {/* Tags */}
        {product.tags.length > 0 && (
          <div className="mt-6 flex flex-wrap gap-2">
            {product.tags.map((tag) => (
              <span key={tag} className="badge bg-gray-100 text-gray-600 px-3 py-1">#{tag}</span>
            ))}
          </div>
        )}

        {/* Reviews */}
        {product.reviews.length > 0 && (
          <div className="mt-8 border-t pt-8">
            <h3 className="font-bold text-lg mb-4">Avis clients ({product.reviews.length})</h3>
            <div className="space-y-4">
              {product.reviews.slice(0, 3).map((review) => (
                <div key={review.id} className="bg-gray-50 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium">{review.user?.name || "Client"}</span>
                    <div className="flex">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`w-3.5 h-3.5 ${star <= review.rating ? "fill-amber-400 text-amber-400" : "text-gray-300"}`}
                        />
                      ))}
                    </div>
                  </div>
                  {review.comment && <p className="text-gray-600 text-sm">{review.comment}</p>}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
