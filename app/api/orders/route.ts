// app/api/orders/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { sendOrderConfirmationEmail } from "@/lib/email";
import { z } from "zod";

const createOrderSchema = z.object({
  items: z.array(z.object({
    productId: z.string(),
    name: z.string(),
    price: z.number().positive(),
    quantity: z.number().int().positive(),
    image: z.string(),
    variant: z.record(z.string()).optional(),
    slug: z.string().optional(),
  })).min(1),
  subtotal: z.number().positive(),
  shipping: z.number().min(0),
  discount: z.number().min(0),
  total: z.number().positive(),
  shippingAddress: z.object({
    firstName: z.string(),
    lastName: z.string(),
    email: z.string().email(),
    phone: z.string(),
    street: z.string(),
    city: z.string(),
    region: z.string(),
    country: z.string().default("SN"),
  }),
  promoCode: z.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    const body = await req.json();
    const data = createOrderSchema.parse(body);
    const userId = (session.user as any).id;

    // Validate promo code if provided
    if (data.promoCode) {
      const promo = await prisma.promoCode.findFirst({
        where: { code: data.promoCode, isActive: true },
      });
      if (promo) {
        if (promo.maxUses && promo.currentUses >= promo.maxUses) {
          return NextResponse.json({ error: "Ce code promo a atteint sa limite d'utilisation" }, { status: 400 });
        }
        if (promo.expiresAt && new Date(promo.expiresAt) < new Date()) {
          return NextResponse.json({ error: "Ce code promo a expiré" }, { status: 400 });
        }
        // Increment usage
        await prisma.promoCode.update({
          where: { id: promo.id },
          data: { currentUses: { increment: 1 } },
        });
      }
    }

    // Create order
    const order = await prisma.order.create({
      data: {
        userId,
        items: data.items as any,
        subtotal: data.subtotal,
        shipping: data.shipping,
        discount: data.discount,
        total: data.total,
        shippingAddress: data.shippingAddress as any,
        promoCode: data.promoCode,
        status: "PENDING",
        paymentStatus: "PENDING",
      },
      include: {
        user: { select: { name: true, email: true } },
      },
    });

    // Send confirmation email
    sendOrderConfirmationEmail(order as any).catch(console.error);

    return NextResponse.json({ order }, { status: 201 });
  } catch (e: any) {
    console.error("[ORDERS_POST]", e);
    if (e.name === "ZodError") {
      return NextResponse.json({ error: "Données invalides", details: e.errors }, { status: 400 });
    }
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    const userId = (session.user as any).id;
    const isAdmin = (session.user as any).role === "ADMIN";

    const orders = await prisma.order.findMany({
      where: isAdmin ? {} : { userId },
      orderBy: { createdAt: "desc" },
      include: { user: { select: { name: true, email: true } } },
    });

    return NextResponse.json({ orders });
  } catch (e: any) {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
