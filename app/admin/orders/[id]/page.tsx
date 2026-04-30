// app/admin/orders/[id]/page.tsx
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect, notFound } from "next/navigation";
import { Header } from "@/components/layout/Header";
import Link from "next/link";
import Image from "next/image";
import { formatPrice, formatDate, ORDER_STATUS_LABELS } from "@/lib/utils";
import { ArrowLeft } from "lucide-react";
import { OrderStatusUpdater } from "@/components/admin/OrderStatusUpdater";

interface Props { params: { id: string } }

export default async function AdminOrderDetailPage({ params }: Props) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== "ADMIN") redirect("/");

  const order = await prisma.order.findUnique({
    where: { id: params.id },
    include: { user: { select: { name: true, email: true } } },
  });

  if (!order) notFound();

  const items = order.items as any[];
  const address = order.shippingAddress as any;

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link href="/admin/orders" className="flex items-center gap-2 text-gray-500 hover:text-primary-600 mb-6 text-sm">
          <ArrowLeft className="w-4 h-4" /> Retour aux commandes
        </Link>

        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Commande #{order.id.slice(-8).toUpperCase()}</h1>
          <OrderStatusUpdater orderId={order.id} currentStatus={order.status} />
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-4">
            <div className="card p-6">
              <h2 className="font-bold mb-4">Articles ({items.length})</h2>
              <div className="space-y-3">
                {items.map((item: any, i: number) => (
                  <div key={i} className="flex gap-4 items-center">
                    <div className="relative w-14 h-14 rounded-lg overflow-hidden bg-gray-100 shrink-0">
                      {item.image && <Image src={item.image} alt={item.name} fill className="object-cover" />}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-sm">{item.name}</p>
                      {item.variant && (
                        <p className="text-xs text-gray-500">{Object.entries(item.variant).map(([k, v]) => `${k}: ${v}`).join(", ")}</p>
                      )}
                      <p className="text-xs text-gray-500">Qté: {item.quantity} × {formatPrice(item.price)}</p>
                    </div>
                    <p className="font-semibold text-sm">{formatPrice(item.price * item.quantity)}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="card p-6">
              <h2 className="font-bold mb-4">Client & Livraison</h2>
              <div className="grid sm:grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-500 mb-1">Client</p>
                  <p className="font-medium">{order.user.name || "—"}</p>
                  <p className="text-gray-600">{order.user.email}</p>
                </div>
                <div>
                  <p className="text-gray-500 mb-1">Adresse de livraison</p>
                  <p className="font-medium">{address.firstName} {address.lastName}</p>
                  <p className="text-gray-600">{address.street}</p>
                  <p className="text-gray-600">{address.city}, {address.region}</p>
                  <p className="text-gray-600">{address.phone}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="card p-6">
              <h2 className="font-bold mb-4">Résumé financier</h2>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-gray-500">Sous-total</span><span>{formatPrice(order.subtotal)}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Livraison</span><span>{formatPrice(order.shipping)}</span></div>
                {order.discount > 0 && <div className="flex justify-between text-green-600"><span>Réduction</span><span>-{formatPrice(order.discount)}</span></div>}
              </div>
              <div className="border-t mt-3 pt-3 flex justify-between font-bold">
                <span>Total</span><span>{formatPrice(order.total)}</span>
              </div>
            </div>

            <div className="card p-6">
              <h2 className="font-bold mb-3">Informations paiement</h2>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Méthode</span>
                  <span>{order.paymentMethod || "—"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Statut</span>
                  <span className={order.paymentStatus === "SUCCESS" ? "text-green-600 font-medium" : "text-red-500"}>
                    {order.paymentStatus === "SUCCESS" ? "[OK] Payé" : order.paymentStatus}
                  </span>
                </div>
                {order.paymentReference && (
                  <div className="mt-2 bg-gray-50 rounded p-2">
                    <p className="text-xs text-gray-500">Référence :</p>
                    <p className="font-mono text-xs break-all">{order.paymentReference}</p>
                  </div>
                )}
              </div>
            </div>

            <div className="card p-4 text-sm text-gray-500">
              <p>Créée le {formatDate(order.createdAt)}</p>
              <p>Mise à jour le {formatDate(order.updatedAt)}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
