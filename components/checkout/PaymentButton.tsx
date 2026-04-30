// components/checkout/PaymentButton.tsx
"use client";
import { useState } from "react";
import { CartItem, ShippingAddress } from "@/types";
import toast from "react-hot-toast";
import { Lock, Loader2 } from "lucide-react";

interface Props {
  shippingAddress: ShippingAddress;
  items: CartItem[];
  subtotal: number;
  shipping: number;
  discount: number;
  total: number;
  promoCode?: string;
}

export function PaymentButton({ shippingAddress, items, subtotal, shipping, discount, total, promoCode }: Props) {
  const [loading, setLoading] = useState(false);

  async function handlePayment() {
    setLoading(true);
    try {
      // 1. Create order
      const orderRes = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items,
          subtotal,
          shipping,
          discount,
          total,
          shippingAddress,
          promoCode,
        }),
      });

      if (!orderRes.ok) {
        const err = await orderRes.json();
        throw new Error(err.error || "Erreur lors de la création de la commande");
      }

      const { order } = await orderRes.json();

      // 2. Initialize payment
      const payRes = await fetch("/api/payment/initialize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: total,
          email: shippingAddress.email,
          name: `${shippingAddress.firstName} ${shippingAddress.lastName}`,
          orderId: order.id,
          currency: "XOF",
          callback_url: `${window.location.origin}/checkout/success`,
          metadata: { orderId: order.id },
        }),
      });

      if (!payRes.ok) {
        const err = await payRes.json();
        throw new Error(err.error || "Erreur lors de l'initialisation du paiement");
      }

      const { payment_url } = await payRes.json();

      // 3. Redirect to Dexpay
      if (payment_url) {
        window.location.href = payment_url;
      } else {
        throw new Error("URL de paiement manquante");
      }
    } catch (e: any) {
      toast.error(e.message || "Une erreur est survenue");
      setLoading(false);
    }
  }

  return (
    <button
      onClick={handlePayment}
      disabled={loading}
      className="btn-primary w-full text-base flex items-center justify-center gap-3 py-4"
    >
      {loading ? (
        <>
          <Loader2 className="w-5 h-5 animate-spin" />
          Redirection vers Dexpay...
        </>
      ) : (
        <>
          <Lock className="w-5 h-5" />
          Payer {new Intl.NumberFormat("fr-SN").format(total)} FCFA
        </>
      )}
    </button>
  );
}
