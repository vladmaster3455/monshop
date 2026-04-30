// app/api/reviews/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { reviewSchema } from "@/lib/validations";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Connectez-vous pour laisser un avis" }, { status: 401 });
    }

    const body = await req.json();
    const data = reviewSchema.parse(body);
    const userId = (session.user as any).id;

    // Check if user already reviewed this product
    const existing = await prisma.review.findUnique({
      where: { userId_productId: { userId, productId: data.productId } },
    });

    if (existing) {
      // Update existing review
      const review = await prisma.review.update({
        where: { id: existing.id },
        data: { rating: data.rating, comment: data.comment },
        include: { user: { select: { name: true, image: true } } },
      });
      return NextResponse.json({ review });
    }

    const review = await prisma.review.create({
      data: { userId, productId: data.productId, rating: data.rating, comment: data.comment },
      include: { user: { select: { name: true, image: true } } },
    });

    return NextResponse.json({ review }, { status: 201 });
  } catch (e: any) {
    if (e.name === "ZodError") {
      return NextResponse.json({ error: "Données invalides" }, { status: 400 });
    }
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
