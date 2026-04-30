// app/(shop)/checkout/page.tsx
"use client";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useCart } from "@/hooks/useCart";
import { shippingAddressSchema, ShippingAddressInput } from "@/lib/validations";
import { formatPrice, getShippingCost, SHIPPING_ZONES } from "@/lib/utils";
import { PaymentButton } from "@/components/checkout/PaymentButton";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { ShoppingBag } from "lucide-react";
import toast from "react-hot-toast";

const STEPS = ["Livraison", "Paiement", "Confirmation"];

export default function CheckoutPage() {
  const router = useRouter();
  const { items, totalPrice } = useCart();
  const { data: session, status } = useSession();
  const [step, setStep] = useState(0);
  const [shippingData, setShippingData] = useState<ShippingAddressInput | null>(null);
  const [promoCode, setPromoCode] = useState("");
  const [discount, setDiscount] = useState(0);
  const [promoLoading, setPromoLoading] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<ShippingAddressInput>({
    resolver: zodResolver(shippingAddressSchema),
    defaultValues: {
      email: session?.user?.email || "",
      country: "SN",
    },
  });

  const city = watch("city");
  const shippingCost = city ? getShippingCost(city) : SHIPPING_ZONES[0].price;
  const subtotal = totalPrice();
  const total = subtotal + shippingCost - discount;

  // Show loading while checking authentication
  if (status === "loading") {
    return (
      <div className="max-w-2xl mx-auto px-4 py-24 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-primary-900 mx-auto"></div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-24 text-center">
        <ShoppingBag className="w-20 h-20 text-gray-300 mx-auto mb-6" />
        <h1 className="text-2xl font-bold mb-3">Panier vide</h1>
        <Link href="/products" className="btn-primary inline-block">Retour aux produits</Link>
      </div>
    );
  }

  async function applyPromo() {
    if (!promoCode.trim()) return;
    setPromoLoading(true);
    try {
      const res = await fetch("/api/promo/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: promoCode, subtotal }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setDiscount(data.discount);
      toast.success(`Code promo appliqué ! -${formatPrice(data.discount)}`);
    } catch (e: any) {
      toast.error(e.message || "Code invalide");
    } finally {
      setPromoLoading(false);
    }
  }

  function onShippingSubmit(data: ShippingAddressInput) {
    // Check if user is authenticated before proceeding to payment
    if (!session) {
      toast.error("Veuillez vous connecter pour continuer");
      router.push("/auth/login?redirect=/checkout");
      return;
    }
    
    setShippingData(data);
    setStep(1);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Progress */}
      <div className="flex items-center justify-center mb-10">
        {STEPS.map((s, i) => (
          <div key={s} className="flex items-center">
            <div className={`flex items-center gap-2 ${i <= step ? "text-primary-900" : "text-gray-400"}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border-2 ${
                i < step ? "bg-primary-900 border-primary-900 text-white" :
                i === step ? "border-primary-900 text-primary-900" :
                "border-gray-300"
              }`}>
                {i < step ? "OK" : i + 1}
              </div>
              <span className="hidden sm:block text-sm font-medium">{s}</span>
            </div>
            {i < STEPS.length - 1 && (
              <div className={`w-16 sm:w-24 h-0.5 mx-3 ${i < step ? "bg-primary-900" : "bg-gray-200"}`} />
            )}
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Forms */}
        <div className="lg:col-span-2">
          {/* Step 0: Shipping */}
          {step === 0 && (
            <div className="card p-6">
              <h2 className="text-xl font-bold mb-6">Adresse de livraison</h2>
              <form onSubmit={handleSubmit(onShippingSubmit)} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Prénom *</label>
                    <input {...register("firstName")} className="input-field" placeholder="Fatou" />
                    {errors.firstName && <p className="text-red-500 text-xs mt-1">{errors.firstName.message}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Nom *</label>
                    <input {...register("lastName")} className="input-field" placeholder="Diallo" />
                    {errors.lastName && <p className="text-red-500 text-xs mt-1">{errors.lastName.message}</p>}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Email *</label>
                  <input {...register("email")} type="email" className="input-field" placeholder="fatou@email.com" />
                  {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Téléphone *</label>
                  <input {...register("phone")} className="input-field" placeholder="+221 77 000 00 00" />
                  {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone.message}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Adresse *</label>
                  <input {...register("street")} className="input-field" placeholder="Rue 10 × 23, HLM" />
                  {errors.street && <p className="text-red-500 text-xs mt-1">{errors.street.message}</p>}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Ville *</label>
                    <input {...register("city")} className="input-field" placeholder="Dakar" />
                    {errors.city && <p className="text-red-500 text-xs mt-1">{errors.city.message}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Région *</label>
                    <input {...register("region")} className="input-field" placeholder="Dakar" />
                    {errors.region && <p className="text-red-500 text-xs mt-1">{errors.region.message}</p>}
                  </div>
                </div>

                {city && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm">
                    <strong>Livraison estimée :</strong> {formatPrice(shippingCost)}
                    <span className="text-gray-500 ml-2">
                      ({SHIPPING_ZONES.find((z) => z.cities.some((c) => c.toLowerCase() === city.toLowerCase()))?.estimatedDays || "3-5 jours"})
                    </span>
                  </div>
                )}

                <button type="submit" className="btn-primary w-full mt-4">
                  Continuer vers le paiement →
                </button>
              </form>
            </div>
          )}

          {/* Step 1: Payment */}
          {step === 1 && shippingData && (
            <div className="card p-6">
              <h2 className="text-xl font-bold mb-6">Paiement sécurisé</h2>

              {/* Recap address */}
              <div className="bg-gray-50 rounded-xl p-4 mb-6">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-medium">{shippingData.firstName} {shippingData.lastName}</p>
                    <p className="text-sm text-gray-600">{shippingData.street}</p>
                    <p className="text-sm text-gray-600">{shippingData.city}, {shippingData.region}</p>
                    <p className="text-sm text-gray-600">{shippingData.phone}</p>
                  </div>
                  <button onClick={() => setStep(0)} className="text-primary-600 text-sm hover:underline">Modifier</button>
                </div>
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6">
                <div className="flex items-center gap-2 mb-2">
                  <p className="font-semibold">Paiement 100% sécurisé</p>
                </div>
                <p className="text-sm text-gray-600">
                  Votre paiement est traité par <strong>Dexpay Africa</strong>.
                  Modes acceptés : Wave, Orange Money, Free Money, carte bancaire.
                </p>
              </div>

              <PaymentButton
                shippingAddress={shippingData}
                items={items}
                subtotal={subtotal}
                shipping={shippingCost}
                discount={discount}
                total={total}
                promoCode={promoCode || undefined}
              />
            </div>
          )}
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="card p-6 sticky top-24">
            <h2 className="font-bold text-lg mb-4">Récapitulatif</h2>
            <div className="space-y-3 mb-4">
              {items.map((item) => (
                <div key={item.id} className="flex gap-3 items-center">
                  <div className="relative w-14 h-14 rounded-lg overflow-hidden bg-gray-100 shrink-0">
                    {item.image && <Image src={item.image} alt={item.name} fill className="object-cover" />}
                    <span className="absolute -top-1 -right-1 bg-primary-900 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                      {item.quantity}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium line-clamp-1">{item.name}</p>
                    <p className="text-xs text-gray-500">{formatPrice(item.price)}</p>
                  </div>
                  <p className="text-sm font-semibold shrink-0">{formatPrice(item.price * item.quantity)}</p>
                </div>
              ))}
            </div>

            {/* Promo */}
            <div className="border-t pt-4 mb-4">
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Code promo"
                  value={promoCode}
                  onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                  className="input-field text-sm py-2 flex-1"
                />
                <button onClick={applyPromo} disabled={promoLoading} className="btn-secondary text-sm py-2 px-3 whitespace-nowrap">
                  {promoLoading ? "..." : "Appliquer"}
                </button>
              </div>
            </div>

            <div className="space-y-2 text-sm border-t pt-4">
              <div className="flex justify-between">
                <span className="text-gray-600">Sous-total</span>
                <span>{formatPrice(subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Livraison</span>
                <span>{city ? formatPrice(shippingCost) : "À calculer"}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Réduction</span>
                  <span>-{formatPrice(discount)}</span>
                </div>
              )}
            </div>
            <div className="border-t mt-3 pt-3 flex justify-between font-bold text-lg">
              <span>Total</span>
              <span className="text-primary-900">{formatPrice(city ? total : subtotal)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
