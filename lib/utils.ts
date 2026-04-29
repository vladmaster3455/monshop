// lib/utils.ts
import { type ClassValue, clsx } from "clsx";
import { ShippingZone } from "@/types";

export function cn(...inputs: ClassValue[]) {
  return inputs.filter(Boolean).join(" ");
}

export function formatPrice(amount: number, currency = "XOF"): string {
  return new Intl.NumberFormat("fr-SN", {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatDate(date: Date | string): string {
  return new Intl.DateTimeFormat("fr-SN", {
    dateStyle: "long",
  }).format(new Date(date));
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
}

export function generateOrderId(): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `ORD-${timestamp}-${random}`;
}

export const SHIPPING_ZONES: ShippingZone[] = [
  {
    name: "Dakar (Dakar, Pikine, Guédiawaye, Rufisque)",
    cities: ["Dakar", "Pikine", "Guédiawaye", "Rufisque", "Bargny"],
    price: 1500,
    estimatedDays: "1-2 jours",
  },
  {
    name: "Banlieue étendue (Thiès, Mbour, Diourbel)",
    cities: ["Thiès", "Mbour", "Diourbel", "Tivaouane", "Saly"],
    price: 3000,
    estimatedDays: "2-3 jours",
  },
  {
    name: "Régions (Saint-Louis, Ziguinchor, Tambacounda...)",
    cities: ["Saint-Louis", "Ziguinchor", "Tambacounda", "Kaolack", "Kolda", "Matam", "Fatick"],
    price: 5000,
    estimatedDays: "3-5 jours",
  },
  {
    name: "International",
    cities: [],
    price: 15000,
    estimatedDays: "7-14 jours",
  },
];

export function getShippingCost(city: string): number {
  const normalizedCity = city.trim().toLowerCase();
  for (const zone of SHIPPING_ZONES) {
    if (zone.cities.some((c) => c.toLowerCase() === normalizedCity)) {
      return zone.price;
    }
  }
  return SHIPPING_ZONES[2].price; // Default to regions
}

export function calculateDiscount(
  subtotal: number,
  discount: number,
  type: "PERCENT" | "FIXED"
): number {
  if (type === "PERCENT") {
    return Math.round((subtotal * discount) / 100);
  }
  return Math.min(discount, subtotal);
}

export function truncate(text: string, length: number): string {
  if (text.length <= length) return text;
  return text.slice(0, length) + "...";
}

export const ORDER_STATUS_LABELS: Record<string, string> = {
  PENDING: "En attente",
  PAID: "Payée",
  PROCESSING: "En préparation",
  SHIPPED: "Expédiée",
  DELIVERED: "Livrée",
  CANCELLED: "Annulée",
};

export const ORDER_STATUS_COLORS: Record<string, string> = {
  PENDING: "bg-yellow-100 text-yellow-800",
  PAID: "bg-blue-100 text-blue-800",
  PROCESSING: "bg-purple-100 text-purple-800",
  SHIPPED: "bg-indigo-100 text-indigo-800",
  DELIVERED: "bg-green-100 text-green-800",
  CANCELLED: "bg-red-100 text-red-800",
};
