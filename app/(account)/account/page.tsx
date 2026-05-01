// app/(account)/account/page.tsx
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import Link from "next/link";
import { formatPrice, formatDate, ORDER_STATUS_LABELS, ORDER_STATUS_COLORS } from "@/lib/utils";
import { Package, User, Heart, MapPin } from "lucide-react";

export default async function AccountPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/auth/login");

  const orders = await prisma.order.findMany({
    where: { userId: (session.user as any).id },
    orderBy: { createdAt: "desc" },
    take: 5,
  });

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        <h1 className="text-3xl font-bold mb-2">Mon compte</h1>
        <p className="text-gray-500 mb-8">Bonjour, {session.user?.name || session.user?.email} 👋</p>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
          {[
            { icon: Package, label: "Commandes", value: orders.length, href: "/account?tab=orders" },
            { icon: Heart, label: "Favoris", value: "—", href: "/account?tab=wishlist" },
            { icon: MapPin, label: "Adresses", value: "—", href: "/account?tab=addresses" },
            { icon: User, label: "Profil", value: "—", href: "/account?tab=profile" },
          ].map((item) => (
            <Link key={item.label} href={item.href} className="card p-6 hover:shadow-md transition-shadow">
              <item.icon className="w-8 h-8 text-primary-600 mb-3" />
              <p className="text-2xl font-bold">{item.value}</p>
              <p className="text-gray-500 text-sm">{item.label}</p>
            </Link>
          ))}
        </div>

        <div className="card p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold">Dernières commandes</h2>
            <Link href="/account?tab=orders" className="text-primary-600 text-sm hover:underline">Voir tout</Link>
          </div>

          {orders.length === 0 ? (
            <div className="text-center py-12">
              <Package className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">Aucune commande pour l'instant</p>
              <Link href="/products" className="btn-primary inline-block mt-4">Découvrir les produits</Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-gray-500">
                    <th className="pb-3 font-medium">Commande</th>
                    <th className="pb-3 font-medium">Date</th>
                    <th className="pb-3 font-medium">Statut</th>
                    <th className="pb-3 font-medium text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {orders.map((order) => (
                    <tr key={order.id} className="hover:bg-gray-50">
                      <td className="py-3">
                        <Link href={`/account/orders/${order.id}`} className="font-medium text-primary-600 hover:underline">
                          #{order.id.slice(-8).toUpperCase()}
                        </Link>
                      </td>
                      <td className="py-3 text-gray-500">{formatDate(order.createdAt)}</td>
                      <td className="py-3">
                        <span className={`badge ${ORDER_STATUS_COLORS[order.status]} px-2.5 py-1`}>
                          {ORDER_STATUS_LABELS[order.status]}
                        </span>
                      </td>
                      <td className="py-3 text-right font-semibold">{formatPrice(order.total)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
