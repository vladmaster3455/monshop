// app/(shop)/page.tsx
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Shield, Truck, RefreshCw, Star } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { ProductCard } from "@/components/product/ProductCard";

export const revalidate = 3600; // ISR 1h

async function getFeaturedProducts() {
  return prisma.product.findMany({
    where: { isActive: true, isFeatured: true },
    take: 8,
    orderBy: { createdAt: "desc" },
  });
}

async function getCategories() {
  const products = await prisma.product.findMany({
    where: { isActive: true },
    select: { category: true },
    distinct: ["category"],
  });
  return products.map((p) => p.category);
}

const FEATURES = [
  { icon: Truck, title: "Livraison rapide", desc: "Livraison partout au Sénégal" },
  { icon: Shield, title: "Paiement sécurisé", desc: "Via Dexpay Africa" },
  { icon: RefreshCw, title: "Retours gratuits", desc: "Sous 7 jours" },
  { icon: Star, title: "Qualité garantie", desc: "Artisanat authentique" },
];

export default async function HomePage() {
  const [featuredProducts, categories] = await Promise.all([
    getFeaturedProducts(),
    getCategories(),
  ]);

  return (
    <div>
      {/* Hero */}
      <section className="relative bg-primary-900 text-white overflow-hidden">
        <div className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32">
          <div className="max-w-2xl">
            <span className="badge bg-accent-500 text-white mb-4 inline-block px-3 py-1">
              Nouvelle collection disponible
            </span>
            <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
              Mode & Artisanat{" "}
              <span className="text-accent-400">Africain Authentique</span>
            </h1>
            <p className="text-lg md:text-xl text-gray-300 mb-8">
              Découvrez nos créations uniques, fabriquées avec passion par des artisans locaux. Wax, bazin, cuir et bien plus.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link href="/products" className="btn-accent text-lg px-8 py-4 inline-flex items-center gap-2">
                Découvrir la boutique
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link href="/products?featured=true" className="bg-white/10 hover:bg-white/20 text-white text-lg px-8 py-4 rounded-lg font-semibold transition-colors inline-block">
                Nouveautés
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="border-b bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {FEATURES.map((f) => (
              <div key={f.title} className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center shrink-0">
                  <f.icon className="w-5 h-5 text-primary-700" />
                </div>
                <div>
                  <p className="font-semibold text-sm">{f.title}</p>
                  <p className="text-xs text-gray-500">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h2 className="text-2xl font-bold mb-8">Parcourir par catégorie</h2>
        <div className="flex flex-wrap gap-3">
          {categories.map((cat) => (
            <Link
              key={cat}
              href={`/products?category=${encodeURIComponent(cat)}`}
              className="px-6 py-3 bg-gray-100 hover:bg-primary-900 hover:text-white rounded-full font-medium transition-colors"
            >
              {cat}
            </Link>
          ))}
        </div>
      </section>

      {/* Featured Products */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold">Produits en vedette</h2>
          <Link href="/products" className="text-primary-600 hover:text-primary-800 font-medium flex items-center gap-1">
            Voir tout <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {featuredProducts.map((product) => (
            <ProductCard key={product.id} product={product as any} />
          ))}
        </div>
      </section>

      {/* Promo Banner */}
      <section className="bg-gradient-to-r from-accent-500 to-accent-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center">
          <h2 className="text-3xl font-bold mb-3">Offre de bienvenue</h2>
          <p className="text-lg mb-2">Utilisez le code <strong>BIENVENUE10</strong> pour -10% sur votre première commande</p>
          <p className="text-white/80 text-sm mb-6">Offre valable jusqu'à la fin du mois</p>
          <Link href="/products" className="bg-white text-accent-600 font-bold px-8 py-3 rounded-lg hover:bg-gray-100 transition-colors inline-block">
            En profiter maintenant
          </Link>
        </div>
      </section>
    </div>
  );
}
