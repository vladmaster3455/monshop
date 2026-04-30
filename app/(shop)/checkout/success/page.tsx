// app/(shop)/checkout/success/page.tsx
"use client";
import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { CheckCircle, Loader2 } from "lucide-react";
import { useCart } from "@/hooks/useCart";

function SuccessContent() {
  const searchParams = useSearchParams();
  const reference = searchParams.get("reference") || searchParams.get("ref");
  const { clearCart } = useCart();
  const [status, setStatus] = useState<"loading" | "success" | "failed">("loading");
  const [orderId, setOrderId] = useState<string | null>(null);

  useEffect(() => {
    if (!reference) {
      setStatus("failed");
      return;
    }

    async function verify() {
      try {
        const res = await fetch("/api/payment/verify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ reference }),
        });
        const data = await res.json();
        if (res.ok && data.success) {
          setStatus("success");
          setOrderId(data.orderId);
          clearCart();
        } else {
          setStatus("failed");
        }
      } catch {
        setStatus("failed");
      }
    }

    verify();
  }, [reference]);

  if (status === "loading") {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-primary-600 mx-auto mb-4" />
          <p className="text-lg font-medium">Vérification du paiement...</p>
          <p className="text-gray-500 text-sm mt-1">Veuillez patienter</p>
        </div>
      </div>
    );
  }

  if (status === "failed") {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="text-4xl">❌</span>
          </div>
          <h1 className="text-2xl font-bold mb-3">Paiement non confirmé</h1>
          <p className="text-gray-600 mb-8">
            Nous n'avons pas pu confirmer votre paiement. Si vous avez été débité, contactez-nous.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/checkout" className="btn-primary">Réessayer</Link>
            <Link href="/account" className="btn-secondary">Mon compte</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="w-14 h-14 text-green-600" />
        </div>
        <h1 className="text-3xl font-bold mb-3">Commande confirmée ! 🎉</h1>
        <p className="text-gray-600 mb-2">
          Merci pour votre commande ! Un email de confirmation vous a été envoyé.
        </p>
        {orderId && (
          <p className="text-sm text-gray-500 mb-8">
            Référence : <strong>#{orderId.slice(-8).toUpperCase()}</strong>
          </p>
        )}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          {orderId && (
            <Link href={`/account/orders/${orderId}`} className="btn-primary">
              Voir ma commande
            </Link>
          )}
          <Link href="/products" className="btn-secondary">
            Continuer mes achats
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function SuccessPage() {
  return (
    <Suspense fallback={<div className="min-h-[60vh] flex items-center justify-center"><div className="text-center"><Loader2 className="w-12 h-12 animate-spin text-primary-600 mx-auto mb-4" /><p className="text-lg font-medium">Chargement...</p></div></div>}>
      <SuccessContent />
    </Suspense>
  );
}
