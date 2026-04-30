// app/admin/page.tsx
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { Header } from "@/components/layout/Header";
import Link from "next/link";
import { formatPrice, formatDate, ORDER_STATUS_LABELS, ORDER_STATUS_COLORS } from "@/lib/utils";
import { Package, ShoppingBag, Users, TrendingUp, Plus, Eye } from "lucide-react";

export default async function AdminPage() {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== "ADMIN") redirect("/");

  const [productsCount, ordersCount, usersCount, recentOrders, revenue] = await Promise.all([
    prisma.product.count({ where: { isActive: true } }),
    prisma.order.count(),
    prisma.user.count(),
    prisma.order.findMany({
      orderBy: { createdAt: "desc" },
      take: 10,
      include: { user: { select: { name: true, email: true } } },
    }),
    prisma.order.aggregate({
      _sum: { total: true },
      where: { paymentStatus: "SUCCESS" },
    }),
  ]);

  const stats = [
    { icon: Package, label: "Produits actifs", value: productsCount, color: "bg-blue-50 text-blue-600" },
    { icon: ShoppingBag, label: "Commandes totales", value: ordersCount, color: "bg-purple-50 text-purple-600" },
    { icon: Users, label: "Clients", value: usersCount, color: "bg-green-50 text-green-600" },
    { icon: TrendingUp, label: "CA total", value: formatPrice(revenue._sum.total || 0), color: "bg-amber-50 text-amber-600" },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">Dashboard Admin</h1>
            <p className="text-gray-500 mt-1">Vue d'ensemble de la boutique</p>
          </div>
          <Link href="/admin/products/new" className="btn-primary flex items-center gap-2">
            <Plus className="w-4 h-4" /> Nouveau produit
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {stats.map((s) => (
            <div key={s.label} className="card p-6">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-3 ${s.color}`}>
                <s.icon className="w-5 h-5" />
              </div>
              <p className="text-2xl font-bold">{s.value}</p>
              <p className="text-gray-500 text-sm mt-1">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Quick Links */}
        <div className="grid sm:grid-cols-3 gap-4 mb-8">
          <Link href="/admin/products" className="card p-5 hover:shadow-md transition-shadow flex items-center gap-3">
            <Package className="w-6 h-6 text-primary-600" />
            <div><p className="font-semibold">Gérer les produits</p><p className="text-xs text-gray-500">CRUD produits</p></div>
          </Link>
          <Link href="/admin/orders" className="card p-5 hover:shadow-md transition-shadow flex items-center gap-3">
            <ShoppingBag className="w-6 h-6 text-primary-600" />
            <div><p className="font-semibold">Gérer les commandes</p><p className="text-xs text-gray-500">Statuts & suivi</p></div>
          </Link>
          <Link href="/admin/users" className="card p-5 hover:shadow-md transition-shadow flex items-center gap-3">
            <Users className="w-6 h-6 text-primary-600" />
            <div><p className="font-semibold">Gérer les clients</p><p className="text-xs text-gray-500">Comptes & rôles</p></div>
          </Link>
        </div>

        {/* Recent Orders */}
        <div className="card p-6">
          <h2 className="text-xl font-bold mb-6">Commandes récentes</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-gray-500">
                  <th className="pb-3 font-medium">Commande</th>
                  <th className="pb-3 font-medium">Client</th>
                  <th className="pb-3 font-medium">Date</th>
                  <th className="pb-3 font-medium">Statut</th>
                  <th className="pb-3 font-medium text-right">Total</th>
                  <th className="pb-3 font-medium text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {recentOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50">
                    <td className="py-3 font-medium">#{order.id.slice(-8).toUpperCase()}</td>
                    <td className="py-3 text-gray-600">{order.user.name || order.user.email}</td>
                    <td className="py-3 text-gray-500">{formatDate(order.createdAt)}</td>
                    <td className="py-3">
                      <span className={`badge ${ORDER_STATUS_COLORS[order.status]} px-2.5 py-1`}>
                        {ORDER_STATUS_LABELS[order.status]}
                      </span>
                    </td>
                    <td className="py-3 text-right font-semibold">{formatPrice(order.total)}</td>
                    <td className="py-3 text-right">
                      <Link href={`/admin/orders/${order.id}`} className="p-1.5 text-gray-400 hover:text-primary-600 inline-block">
                        <Eye className="w-4 h-4" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
