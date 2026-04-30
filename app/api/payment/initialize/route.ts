// app/api/payment/initialize/route.ts
import { NextRequest, NextResponse } from "next/server";
import { initializePayment } from "@/lib/dexpay";
import { paymentInitSchema } from "@/lib/validations";
import { prisma } from "@/lib/prisma";

// Simple in-memory rate limiter (use Redis in production)
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const limit = rateLimitMap.get(ip);
  if (!limit || now > limit.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + 60_000 });
    return true;
  }
  if (limit.count >= 5) return false;
  limit.count++;
  return true;
}

export async function POST(req: NextRequest) {
  // Rate limiting
  const ip = req.headers.get("x-forwarded-for") || "unknown";
  if (!checkRateLimit(ip)) {
    return NextResponse.json({ error: "Trop de requêtes. Réessayez dans 1 minute." }, { status: 429 });
  }

  try {
    const body = await req.json();
    const data = paymentInitSchema.parse(body);

    // Verify order exists
    const order = await prisma.order.findUnique({ where: { id: data.orderId } });
    if (!order) {
      return NextResponse.json({ error: "Commande introuvable" }, { status: 404 });
    }

    // Initialize Dexpay payment
    const payment = await initializePayment({
      amount: data.amount,
      email: data.email,
      name: data.name,
      orderId: data.orderId,
      currency: data.currency || "XOF",
      callback_url: `${process.env.NEXT_PUBLIC_APP_URL}/checkout/success`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/checkout/cancel`,
      metadata: {
        orderId: data.orderId,
        ...data.metadata,
      },
    });

    // Store payment reference on order
    await prisma.order.update({
      where: { id: data.orderId },
      data: {
        paymentReference: payment.reference,
        paymentMethod: "DEXPAY",
      },
    });

    return NextResponse.json({
      payment_url: payment.payment_url,
      reference: payment.reference,
      status: payment.status,
    });
  } catch (e: any) {
    console.error("[PAYMENT_INIT]", e);
    if (e.name === "ZodError") {
      return NextResponse.json({ error: "Données invalides", details: e.errors }, { status: 400 });
    }
    return NextResponse.json({ error: e.message || "Erreur lors de l'initialisation du paiement" }, { status: 500 });
  }
}
