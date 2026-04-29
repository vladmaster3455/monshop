// lib/dexpay.ts
import type { DexpayPaymentInit, DexpayPaymentResponse, DexpayVerifyResponse } from "@/types";

const BASE_URL = "https://api.dexpay.africa/api/v1";
const API_KEY = process.env.DEXPAY_PUBLIC_KEY!;
const SECRET_KEY = process.env.DEXPAY_SECRET_KEY!;

if (!API_KEY || !SECRET_KEY) {
  console.warn("DEXPAY_PUBLIC_KEY or DEXPAY_SECRET_KEY is not set");
}

async function dexpayRequest<T>(
  endpoint: string,
  method: "GET" | "POST" = "GET",
  body?: unknown
): Promise<T> {
  const response = await fetch(`${BASE_URL}${endpoint}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      "x-api-key": API_KEY,
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: "Unknown error" }));
    console.error(`[DEXPAY] Error ${response.status}:`, JSON.stringify(error, null, 2));
    console.error(`[DEXPAY] Request body:`, JSON.stringify(body, null, 2));
    throw new Error(
      `Dexpay API error [${response.status}]: ${error.message || JSON.stringify(error)}`
    );
  }

  const result = await response.json();
  console.log(`[DEXPAY] Success ${response.status} Response:`, JSON.stringify(result, null, 2));
  return result;
}

/**
 * Initialise une session de paiement Dexpay
 */
export async function initializePayment(
  data: DexpayPaymentInit
): Promise<DexpayPaymentResponse> {
  const response = await dexpayRequest<{
    status: number;
    message: string;
    data: DexpayPaymentResponse;
  }>("/checkout-sessions", "POST", {
    reference: data.orderId,
    item_name: "Commande MonShop",
    amount: Math.round(data.amount),
    currency: data.currency || "XOF",
    countryISO: "SN",
    webhook_url: data.callback_url,
    success_url: data.callback_url,
    failure_url: data.cancel_url,
  });
  
  return response.data;
}

/**
 * Vérifie le statut d'un paiement via sa référence
 */
export async function verifyPayment(reference: string): Promise<DexpayVerifyResponse> {
  return dexpayRequest<DexpayVerifyResponse>(`/v1/payments/${reference}/verify`);
}

/**
 * Liste toutes les transactions
 */
export async function listTransactions(params?: {
  page?: number;
  limit?: number;
  status?: string;
}) {
  const query = new URLSearchParams();
  if (params?.page) query.set("page", String(params.page));
  if (params?.limit) query.set("limit", String(params.limit));
  if (params?.status) query.set("status", params.status);

  const qs = query.toString() ? `?${query.toString()}` : "";
  return dexpayRequest(`/v1/payments${qs}`);
}

/**
 * Vérifie la signature d'un webhook Dexpay
 */
export function verifyWebhookSignature(
  payload: string,
  signature: string
): boolean {
  // En production, implémenter la vérification HMAC avec la secret key
  // Pour les tests, on retourne true
  if (process.env.NODE_ENV === "development") return true;

  try {
    const crypto = require("crypto");
    const expectedSignature = crypto
      .createHmac("sha256", SECRET_KEY)
      .update(payload)
      .digest("hex");
    return crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(expectedSignature)
    );
  } catch {
    return false;
  }
}
