// components/layout/Header.tsx
"use client";
import Link from "next/link";
import Image from "next/image";
import { useSession, signOut } from "next-auth/react";
import { ShoppingBag, Heart, User, Menu, X, Search } from "lucide-react";
import { useState } from "react";
import { useCart } from "@/hooks/useCart";
import { CartDrawer } from "@/components/cart/CartDrawer";

const NAV_LINKS = [
  { href: "/", label: "Accueil" },
  { href: "/products", label: "Catalogue" },
  { href: "/products?category=Vêtements", label: "Vêtements" },
  { href: "/products?category=Accessoires", label: "Accessoires" },
  { href: "/products?category=Bijoux", label: "Bijoux" },
];

export function Header() {
  const { data: session } = useSession();
  const { totalItems, toggleCart } = useCart();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const count = totalItems();

  return (
    <>
      <header className="sticky top-0 z-40 bg-white shadow-sm">
        {/* Top bar */}
        <div className="bg-primary-900 text-white text-center text-xs py-2 px-4">
          🎉 Livraison gratuite à Dakar pour toute commande supérieure à 50 000 FCFA !
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 flex-shrink-0">
              <Image
                src="/logo.png"
                alt="MonShop Logo"
                width={40}
                height={40}
                priority
                className="rounded-lg"
              />
              <span className="font-bold text-xl text-primary-900 hidden sm:inline">MonShop</span>
            </Link>

            {/* Desktop Nav */}
            <nav className="hidden md:flex items-center gap-6">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-sm font-medium text-gray-700 hover:text-primary-900 transition-colors"
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            {/* Actions */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setSearchOpen(!searchOpen)}
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <Search className="w-5 h-5" />
              </button>

              <Link href="/account" className="p-2 rounded-lg hover:bg-gray-100 transition-colors hidden sm:block">
                <User className="w-5 h-5" />
              </Link>

              <Link href="/account?tab=wishlist" className="p-2 rounded-lg hover:bg-gray-100 transition-colors hidden sm:block">
                <Heart className="w-5 h-5" />
              </Link>

              <button
                onClick={toggleCart}
                className="relative p-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <ShoppingBag className="w-5 h-5" />
                {count > 0 && (
                  <span className="absolute -top-1 -right-1 bg-accent-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                    {count > 9 ? "9+" : count}
                  </span>
                )}
              </button>

              {session ? (
                <div className="hidden sm:flex items-center gap-2">
                  <span className="text-sm text-gray-600">
                    {session.user?.name?.split(" ")[0]}
                  </span>
                  <button
                    onClick={() => signOut()}
                    className="text-sm text-gray-500 hover:text-red-600 transition-colors"
                  >
                    Déconnexion
                  </button>
                </div>
              ) : (
                <Link
                  href="/auth/login"
                  className="hidden sm:block btn-primary text-sm py-2 px-4"
                >
                  Connexion
                </Link>
              )}

              {/* Mobile menu button */}
              <button
                onClick={() => setMobileOpen(!mobileOpen)}
                className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Search bar */}
          {searchOpen && (
            <div className="pb-4">
              <form action="/products" method="get" className="flex gap-2">
                <input
                  type="text"
                  name="search"
                  placeholder="Rechercher un produit..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="input-field flex-1"
                  autoFocus
                />
                <button type="submit" className="btn-primary px-4">
                  <Search className="w-4 h-4" />
                </button>
              </form>
            </div>
          )}
        </div>

        {/* Mobile nav */}
        {mobileOpen && (
          <div className="md:hidden border-t bg-white px-4 py-4 space-y-2">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="block py-2 text-gray-700 hover:text-primary-900 font-medium"
                onClick={() => setMobileOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            <hr />
            {session ? (
              <>
                <Link href="/account" className="block py-2 text-gray-700" onClick={() => setMobileOpen(false)}>Mon compte</Link>
                <button onClick={() => signOut()} className="block py-2 text-red-600">Déconnexion</button>
              </>
            ) : (
              <Link href="/auth/login" className="block btn-primary text-center mt-2" onClick={() => setMobileOpen(false)}>
                Connexion
              </Link>
            )}
          </div>
        )}
      </header>

      <CartDrawer />
    </>
  );
}
