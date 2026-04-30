// app/(shop)/checkout/cancel/page.tsx
import Link from "next/link";

export default function CancelPage() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <span className="text-4xl">[!]</span>
        </div>
        <h1 className="text-2xl font-bold mb-3">Paiement annulé</h1>
        <p className="text-gray-600 mb-8">
          Votre paiement a été annulé. Votre panier a été conservé, vous pouvez réessayer quand vous le souhaitez.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/checkout" className="btn-primary">Réessayer le paiement</Link>
          <Link href="/cart" className="btn-secondary">Voir mon panier</Link>
        </div>
      </div>
    </div>
  );
}
