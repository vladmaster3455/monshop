// app/api/promo/verify/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { calculateDiscount } from "@/lib/utils";

export async function POST(req: NextRequest) {
  try {
    const { code, subtotal } = await req.json();

    if (!code || !subtotal) {
      return NextResponse.json({ error: "Code et sous-total requis" }, { status: 400 });
    }

    const promo = await prisma.promoCode.findFirst({
      where: { code: code.toUpperCase().trim(), isActive: true },
    });

    if (!promo) {
      return NextResponse.json({ error: "Code promo invalide" }, { status: 404 });
    }

    if (promo.maxUses && promo.currentUses >= promo.maxUses) {
      return NextResponse.json({ error: "Ce code a atteint sa limite d'utilisation" }, { status: 400 });
    }

    if (promo.expiresAt && new Date(promo.expiresAt) < new Date()) {
      return NextResponse.json({ error: "Ce code promo a expiré" }, { status: 400 });
    }

    const discount = calculateDiscount(subtotal, promo.discount, promo.type as "PERCENT" | "FIXED");

    return NextResponse.json({
      valid: true,
      discount,
      type: promo.type,
      percentage: promo.discount,
    });
  } catch (e) {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
