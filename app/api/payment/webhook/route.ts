// app/api/payment/webhook/route.ts
import { NextRequest, NextResponse } from "next/server";
import { verifyWebhookSignature } from "@/lib/dexpay";
import { prisma } from "@/lib/prisma";
import { sendPaymentSuccessEmail } from "@/lib/email";

export async function POST(req: NextRequest) {
  try {
    const payload = await req.text();
    const signature = req.headers.get("x-dexpay-signature") || "";

    // Verify signature
    if (!verifyWebhookSignature(payload, signature)) {
      console.warn("[WEBHOOK] Invalid signature");
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    const event = JSON.parse(payload);
    const { type, data } = event;

    console.log(`[WEBHOOK] Event: ${type}`, data?.reference);

    // Find order
    const order = await prisma.order.findFirst({
      where: { paymentReference: data?.reference },
      include: { user: { select: { name: true, email: true } } },
    });

    if (!order) {
      // Return 200 to avoid Dexpay retrying
      return NextResponse.json({ received: true });
    }

    switch (type) {
      case "payment.success":
      case "payment.completed":
        await prisma.order.update({
          where: { id: order.id },
          data: { status: "PAID", paymentStatus: "SUCCESS" },
        });
        sendPaymentSuccessEmail(order as any).catch(console.error);
        break;

      case "payment.failed":
        await prisma.order.update({
          where: { id: order.id },
          data: { paymentStatus: "FAILED" },
        });
        break;

      case "payment.pending":
        await prisma.order.update({
          where: { id: order.id },
          data: { paymentStatus: "PENDING" },
        });
        break;

      default:
        console.log(`[WEBHOOK] Unhandled event type: ${type}`);
    }

    // Always return 200 immediately
    return NextResponse.json({ received: true });
  } catch (e: any) {
    console.error("[WEBHOOK] Error:", e);
    // Return 200 to prevent retries on our parsing errors
    return NextResponse.json({ received: true });
  }
}
