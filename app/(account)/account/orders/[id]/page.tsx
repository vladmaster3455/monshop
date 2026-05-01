// app/(account)/account/orders/[id]/page.tsx
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import Image from "next/image";
import Link from "next/link";
import { formatPrice, formatDate, ORDER_STATUS_LABELS, ORDER_STATUS_COLORS } from "@/lib/utils";
import { ArrowLeft, Package } from "lucide-react";

interface Props {
  params: { id: string };
}

export default async function OrderDetailPage({ params }: Props) {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/auth/login");

  const order = await prisma.order.findUnique({
    where: { id: params.id, userId: (session.user as any).id },
  });

  if (!order) notFound();

  const items = order.items as any[];
  const shippingAddress = order.shippingAddress as any;

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        <Link href="/account" className="flex items-center gap-2 text-gray-500 hover:text-primary-600 mb-6 text-sm">
          <ArrowLeft className="w-4 h-4" /> Retour à mon compte
        </Link>

        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold">Commande #{order.id.slice(-8).toUpperCase()}</h1>
            <p className="text-gray-500 text-sm mt-1">Passée le {formatDate(order.createdAt)}</p>
          </div>
          <span className={`badge ${ORDER_STATUS_COLORS[order.status]} px-3 py-1.5 text-sm`}>
            {ORDER_STATUS_LABELS[order.status]}
          </span>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-4">
            <div className="card p-6">
              <h2 className="font-bold mb-4">Articles commandés</h2>
              <div className="space-y-4">
                {items.map((item: any, i: number) => (
                  <div key={i} className="flex gap-4 items-center">
                    <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-gray-100 shrink-0">
                      {item.image && <Image src={item.image} alt={item.name} fill className="object-cover" />}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">{item.name}</p>
                      {item.variant && (
                        <p className="text-sm text-gray-500">
                          {Object.entries(item.variant).map(([k, v]) => `${k}: ${v}`).join(", ")}
                        </p>
                      )}
                      <p className="text-sm text-gray-500">Qté : {item.quantity}</p>
                    </div>
                    <p className="font-semibold">{formatPrice(item.price * item.quantity)}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="card p-6">
              <h2 className="font-bold mb-4">Adresse de livraison</h2>
              <p className="text-gray-600">
                {shippingAddress.firstName} {shippingAddress.lastName}<br />
                {shippingAddress.street}<br />
                {shippingAddress.city}, {shippingAddress.region}<br />
                {shippingAddress.country}<br />
                <span className="font-medium">{shippingAddress.phone}</span>
              </p>
            </div>
          </div>

          <div className="card p-6 h-fit">
            <h2 className="font-bold mb-4">Récapitulatif</h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Sous-total</span>
                <span>{formatPrice(order.subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Livraison</span>
                <span>{formatPrice(order.shipping)}</span>
              </div>
              {order.discount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Réduction</span>
                  <span>-{formatPrice(order.discount)}</span>
                </div>
              )}
            </div>
            <div className="border-t mt-3 pt-3 flex justify-between font-bold">
              <span>Total</span>
              <span className="text-primary-900">{formatPrice(order.total)}</span>
            </div>

            {order.paymentReference && (
              <div className="mt-4 bg-gray-50 rounded-lg p-3 text-xs text-gray-500">
                <p><strong>Référence paiement :</strong></p>
                <p className="font-mono mt-1">{order.paymentReference}</p>
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
