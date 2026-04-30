// app/api/payment/verify/route.ts
import { NextRequest, NextResponse } from "next/server";
import { verifyPayment } from "@/lib/dexpay";
import { paymentVerifySchema } from "@/lib/validations";
import { prisma } from "@/lib/prisma";
import { sendPaymentSuccessEmail } from "@/lib/email";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { reference } = paymentVerifySchema.parse(body);

    // Verify with Dexpay
    const result = await verifyPayment(reference);

    // Find order by reference
    const order = await prisma.order.findFirst({
      where: { paymentReference: reference },
      include: { user: { select: { name: true, email: true } } },
    });

    if (!order) {
      return NextResponse.json({ error: "Commande introuvable" }, { status: 404 });
    }

    if (result.status === "success" || result.status === "completed") {
      // Update order status
      await prisma.order.update({
        where: { id: order.id },
        data: {
          status: "PAID",
          paymentStatus: "SUCCESS",
        },
      });

      // Send confirmation email (don't await to avoid timeout)
      sendPaymentSuccessEmail(order as any).catch(console.error);

      return NextResponse.json({ success: true, orderId: order.id, status: "paid" });
    } else {
      await prisma.order.update({
        where: { id: order.id },
        data: { paymentStatus: "FAILED" },
      });
      return NextResponse.json({ success: false, status: result.status });
    }
  } catch (e: any) {
    console.error("[PAYMENT_VERIFY]", e);
    if (e.name === "ZodError") {
      return NextResponse.json({ error: "Référence manquante" }, { status: 400 });
    }
    return NextResponse.json({ error: e.message || "Erreur de vérification" }, { status: 500 });
  }
}
