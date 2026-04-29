// lib/email.ts
import nodemailer from "nodemailer";
import { Order } from "@/types";
import { formatPrice, formatDate } from "./utils";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT) || 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

const FROM = `${process.env.NEXT_PUBLIC_APP_NAME || "MonShop"} <${process.env.EMAIL_FROM || "noreply@monshop.sn"}>`;

export async function sendOrderConfirmationEmail(order: Order & { user: { name: string | null; email: string } }) {
  const itemsHtml = (order.items as any[])
    .map(
      (item) => `
      <tr>
        <td style="padding:8px;border-bottom:1px solid #eee">${item.name}</td>
        <td style="padding:8px;border-bottom:1px solid #eee;text-align:center">${item.quantity}</td>
        <td style="padding:8px;border-bottom:1px solid #eee;text-align:right">${formatPrice(item.price)}</td>
      </tr>`
    )
    .join("");

  await transporter.sendMail({
    from: FROM,
    to: order.user.email,
    subject: `Confirmation de commande #${order.id.slice(-8).toUpperCase()}`,
    html: `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto">
        <div style="background:#1a1a2e;padding:20px;text-align:center">
          <h1 style="color:#fff;margin:0">MonShop</h1>
        </div>
        <div style="padding:30px">
          <h2>Merci pour votre commande, ${order.user.name || "cher client"} !</h2>
          <p>Votre commande <strong>#${order.id.slice(-8).toUpperCase()}</strong> a été reçue et est en cours de traitement.</p>
          <table style="width:100%;border-collapse:collapse;margin:20px 0">
            <thead>
              <tr style="background:#f5f5f5">
                <th style="padding:8px;text-align:left">Produit</th>
                <th style="padding:8px;text-align:center">Qté</th>
                <th style="padding:8px;text-align:right">Prix</th>
              </tr>
            </thead>
            <tbody>${itemsHtml}</tbody>
          </table>
          <div style="text-align:right;margin-top:10px">
            <p>Sous-total : <strong>${formatPrice(order.subtotal)}</strong></p>
            <p>Livraison : <strong>${formatPrice(order.shipping)}</strong></p>
            ${order.discount > 0 ? `<p>Réduction : <strong>-${formatPrice(order.discount)}</strong></p>` : ""}
            <p style="font-size:18px">Total : <strong>${formatPrice(order.total)}</strong></p>
          </div>
          <hr style="margin:20px 0">
          <p><strong>Adresse de livraison :</strong><br>
          ${(order.shippingAddress as any).firstName} ${(order.shippingAddress as any).lastName}<br>
          ${(order.shippingAddress as any).street}<br>
          ${(order.shippingAddress as any).city}, ${(order.shippingAddress as any).region}</p>
        </div>
        <div style="background:#f5f5f5;padding:20px;text-align:center;color:#666;font-size:12px">
          <p>© ${new Date().getFullYear()} MonShop. Tous droits réservés.</p>
        </div>
      </div>
    `,
  });
}

export async function sendPaymentSuccessEmail(order: Order & { user: { name: string | null; email: string } }) {
  await transporter.sendMail({
    from: FROM,
    to: order.user.email,
    subject: `Paiement confirmé - Commande #${order.id.slice(-8).toUpperCase()}`,
    html: `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto">
        <div style="background:#16a34a;padding:20px;text-align:center">
          <h1 style="color:#fff;margin:0">✅ Paiement reçu !</h1>
        </div>
        <div style="padding:30px">
          <h2>Bonjour ${order.user.name || ""},</h2>
          <p>Nous avons bien reçu votre paiement de <strong>${formatPrice(order.total)}</strong> pour la commande <strong>#${order.id.slice(-8).toUpperCase()}</strong>.</p>
          <p>Votre commande est maintenant en cours de préparation. Vous recevrez un email dès qu'elle sera expédiée.</p>
          <div style="background:#f0fdf4;border:1px solid #86efac;padding:15px;border-radius:8px;margin:20px 0">
            <p style="margin:0"><strong>Référence de paiement :</strong> ${order.paymentReference}</p>
          </div>
          <a href="${process.env.NEXT_PUBLIC_APP_URL}/account/orders/${order.id}" 
             style="display:inline-block;background:#1a1a2e;color:#fff;padding:12px 24px;text-decoration:none;border-radius:6px">
            Voir ma commande
          </a>
        </div>
      </div>
    `,
  });
}

export async function sendShippingNotificationEmail(
  order: Order & { user: { name: string | null; email: string } },
  trackingNumber: string
) {
  await transporter.sendMail({
    from: FROM,
    to: order.user.email,
    subject: `Votre commande a été expédiée ! #${order.id.slice(-8).toUpperCase()}`,
    html: `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto">
        <div style="background:#2563eb;padding:20px;text-align:center">
          <h1 style="color:#fff;margin:0">🚚 En route !</h1>
        </div>
        <div style="padding:30px">
          <h2>Bonjour ${order.user.name || ""},</h2>
          <p>Votre commande <strong>#${order.id.slice(-8).toUpperCase()}</strong> a été expédiée !</p>
          <div style="background:#eff6ff;border:1px solid #93c5fd;padding:15px;border-radius:8px;margin:20px 0">
            <p style="margin:0"><strong>Numéro de suivi :</strong> ${trackingNumber}</p>
          </div>
        </div>
      </div>
    `,
  });
}

export async function sendPasswordResetEmail(email: string, resetUrl: string) {
  await transporter.sendMail({
    from: FROM,
    to: email,
    subject: "Réinitialisation de votre mot de passe",
    html: `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto">
        <div style="background:#1a1a2e;padding:20px;text-align:center">
          <h1 style="color:#fff;margin:0">MonShop</h1>
        </div>
        <div style="padding:30px">
          <h2>Réinitialisation du mot de passe</h2>
          <p>Vous avez demandé la réinitialisation de votre mot de passe. Cliquez sur le bouton ci-dessous (valable 1 heure) :</p>
          <a href="${resetUrl}" 
             style="display:inline-block;background:#1a1a2e;color:#fff;padding:12px 24px;text-decoration:none;border-radius:6px;margin:20px 0">
            Réinitialiser mon mot de passe
          </a>
          <p style="color:#666;font-size:12px">Si vous n'avez pas fait cette demande, ignorez cet email.</p>
        </div>
      </div>
    `,
  });
}
