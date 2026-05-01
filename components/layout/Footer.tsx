// components/layout/Footer.tsx
import Link from "next/link";
import Image from "next/image";
import { Phone, Mail, MapPin } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-primary-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <Image
                src="/logo.png"
                alt="MonShop Logo"
                width={32}
                height={32}
                className="rounded"
              />
              <span className="font-bold text-lg">MonShop</span>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed">
              Votre destination pour la mode et l'artisanat africain authentique. Qualité, authenticité et livraison rapide.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold mb-4">Boutique</h3>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><Link href="/products" className="hover:text-white transition-colors">Tous les produits</Link></li>
              <li><Link href="/products?category=Vêtements" className="hover:text-white transition-colors">Vêtements</Link></li>
              <li><Link href="/products?category=Accessoires" className="hover:text-white transition-colors">Accessoires</Link></li>
              <li><Link href="/products?category=Bijoux" className="hover:text-white transition-colors">Bijoux</Link></li>
              <li><Link href="/products?featured=true" className="hover:text-white transition-colors">Nouveautés</Link></li>
            </ul>
          </div>

          {/* Account */}
          <div>
            <h3 className="font-semibold mb-4">Mon Compte</h3>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><Link href="/auth/login" className="hover:text-white transition-colors">Connexion</Link></li>
              <li><Link href="/auth/register" className="hover:text-white transition-colors">Inscription</Link></li>
              <li><Link href="/account" className="hover:text-white transition-colors">Mon espace</Link></li>
              <li><Link href="/account?tab=orders" className="hover:text-white transition-colors">Mes commandes</Link></li>
              <li><Link href="/cart" className="hover:text-white transition-colors">Mon panier</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-semibold mb-4">Contact</h3>
            <ul className="space-y-3 text-sm text-gray-400">
              <li className="flex items-center gap-2">
                <MapPin className="w-4 h-4 shrink-0" />
                <span>Dakar, Sénégal</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="w-4 h-4 shrink-0" />
                <a href="tel:+221770000000" className="hover:text-white transition-colors">+221777897742</a>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="w-4 h-4 shrink-0" />
                <a href="mailto:contact@monshop.sn" className="hover:text-white transition-colors">sergesenghor@esp.sn</a>
              </li>
            </ul>
            <div className="mt-4">
              <p className="text-xs text-gray-500 mb-2">Paiement sécurisé via</p>
              <div className="bg-white/10 rounded-lg px-3 py-2 text-sm font-semibold">
                Dexpay Africa
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-white/10 mt-10 pt-6 flex flex-col sm:flex-row justify-between items-center gap-4 text-sm text-gray-500">
          <p>© {new Date().getFullYear()} MonShop. Tous droits réservés.</p>
          <div className="flex gap-4">
            <Link href="/privacy" className="hover:text-white transition-colors">Confidentialité</Link>
            <Link href="/terms" className="hover:text-white transition-colors">CGV</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
