// app/(shop)/products/page.tsx
import { Suspense } from "react";
import { prisma } from "@/lib/prisma";
import { ProductCard, ProductCardSkeleton } from "@/components/product/ProductCard";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Catalogue Produits",
  description: "Découvrez notre sélection de mode et d'artisanat africain",
};

interface Props {
  searchParams: {
    category?: string;
    search?: string;
    sort?: string;
    minPrice?: string;
    maxPrice?: string;
    page?: string;
    featured?: string;
  };
}

const PAGE_SIZE = 12;

async function ProductsGrid({ searchParams }: Props) {
  const page = Number(searchParams.page) || 1;
  const skip = (page - 1) * PAGE_SIZE;

  const where: any = { isActive: true };
  if (searchParams.category) where.category = searchParams.category;
  if (searchParams.featured === "true") where.isFeatured = true;
  if (searchParams.search) {
    where.OR = [
      { name: { contains: searchParams.search, mode: "insensitive" } },
      { description: { contains: searchParams.search, mode: "insensitive" } },
      { tags: { has: searchParams.search } },
    ];
  }
  if (searchParams.minPrice || searchParams.maxPrice) {
    where.price = {};
    if (searchParams.minPrice) where.price.gte = Number(searchParams.minPrice);
    if (searchParams.maxPrice) where.price.lte = Number(searchParams.maxPrice);
  }

  let orderBy: any = { createdAt: "desc" };
  switch (searchParams.sort) {
    case "price_asc": orderBy = { price: "asc" }; break;
    case "price_desc": orderBy = { price: "desc" }; break;
    case "name_asc": orderBy = { name: "asc" }; break;
    case "featured": orderBy = { isFeatured: "desc" }; break;
  }

  const [products, total] = await Promise.all([
    prisma.product.findMany({ where, orderBy, skip, take: PAGE_SIZE }),
    prisma.product.count({ where }),
  ]);

  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <div>
      <p className="text-sm text-gray-500 mb-6">{total} produit{total > 1 ? "s" : ""} trouvé{total > 1 ? "s" : ""}</p>
      <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
        {products.map((product) => (
          <ProductCard key={product.id} product={product as any} />
        ))}
      </div>

      {products.length === 0 && (
        <div className="text-center py-20">
          <p className="text-2xl mb-2">😕</p>
          <p className="text-gray-600 font-medium">Aucun produit trouvé</p>
          <p className="text-gray-400 text-sm mt-1">Essayez d'autres filtres</p>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-12">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <a
              key={p}
              href={`?${new URLSearchParams({ ...searchParams, page: String(p) })}`}
              className={`w-10 h-10 flex items-center justify-center rounded-lg font-medium transition-colors ${
                p === page ? "bg-primary-900 text-white" : "bg-gray-100 hover:bg-gray-200"
              }`}
            >
              {p}
            </a>
          ))}
        </div>
      )}
    </div>
  );
}

export default function ProductsPage({ searchParams }: Props) {
  const categories = ["Vêtements", "Accessoires", "Bijoux", "Tissus", "Chaussures", "Beauté"];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold mb-2">Catalogue</h1>
      <p className="text-gray-500 mb-8">Mode et artisanat africain authentique</p>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar Filters */}
        <aside className="lg:w-64 shrink-0">
          <div className="bg-white rounded-xl p-6 shadow-sm space-y-6">
            <div>
              <h3 className="font-semibold mb-3">Catégories</h3>
              <div className="space-y-2">
                <a
                  href="/products"
                  className={`block text-sm px-3 py-2 rounded-lg transition-colors ${!searchParams.category ? "bg-primary-900 text-white" : "hover:bg-gray-100"}`}
                >
                  Toutes
                </a>
                {categories.map((cat) => (
                  <a
                    key={cat}
                    href={`/products?category=${encodeURIComponent(cat)}`}
                    className={`block text-sm px-3 py-2 rounded-lg transition-colors ${searchParams.category === cat ? "bg-primary-900 text-white" : "hover:bg-gray-100"}`}
                  >
                    {cat}
                  </a>
                ))}
              </div>
            </div>

            <div>
              <h3 className="font-semibold mb-3">Prix (FCFA)</h3>
              <form method="get" className="space-y-2">
                {searchParams.category && (
                  <input type="hidden" name="category" value={searchParams.category} />
                )}
                <input
                  type="number"
                  name="minPrice"
                  placeholder="Min"
                  defaultValue={searchParams.minPrice}
                  className="input-field text-sm py-2"
                />
                <input
                  type="number"
                  name="maxPrice"
                  placeholder="Max"
                  defaultValue={searchParams.maxPrice}
                  className="input-field text-sm py-2"
                />
                <button type="submit" className="btn-primary w-full text-sm py-2">
                  Appliquer
                </button>
              </form>
            </div>

            <div>
              <h3 className="font-semibold mb-3">Trier par</h3>
              <div className="space-y-1">
                {[
                  { value: "", label: "Nouveautés" },
                  { value: "price_asc", label: "Prix croissant" },
                  { value: "price_desc", label: "Prix décroissant" },
                  { value: "featured", label: "En vedette" },
                ].map((opt) => (
                  <a
                    key={opt.value}
                    href={`?${new URLSearchParams({ ...searchParams, sort: opt.value })}`}
                    className={`block text-sm px-3 py-2 rounded-lg transition-colors ${searchParams.sort === opt.value || (!searchParams.sort && !opt.value) ? "bg-primary-900 text-white" : "hover:bg-gray-100"}`}
                  >
                    {opt.label}
                  </a>
                ))}
              </div>
            </div>
          </div>
        </aside>

        {/* Products */}
        <div className="flex-1">
          {searchParams.search && (
            <div className="mb-4 flex items-center gap-2">
              <span className="text-gray-600">Recherche :</span>
              <span className="font-semibold">"{searchParams.search}"</span>
              <a href="/products" className="text-red-500 text-sm hover:underline">✕ Effacer</a>
            </div>
          )}
          <Suspense fallback={
            <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <ProductCardSkeleton key={i} />
              ))}
            </div>
          }>
            <ProductsGrid searchParams={searchParams} />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
