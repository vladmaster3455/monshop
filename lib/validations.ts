// lib/validations.ts
import { z } from "zod";

export const registerSchema = z.object({
  name: z.string().min(2, "Le nom doit contenir au moins 2 caractères"),
  email: z.string().email("Email invalide"),
  password: z
    .string()
    .min(8, "Le mot de passe doit contenir au moins 8 caractères")
    .regex(/[A-Z]/, "Le mot de passe doit contenir au moins une majuscule")
    .regex(/[0-9]/, "Le mot de passe doit contenir au moins un chiffre"),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Les mots de passe ne correspondent pas",
  path: ["confirmPassword"],
});

export const loginSchema = z.object({
  email: z.string().email("Email invalide"),
  password: z.string().min(1, "Mot de passe requis"),
});

export const shippingAddressSchema = z.object({
  firstName: z.string().min(2, "Prénom requis"),
  lastName: z.string().min(2, "Nom requis"),
  email: z.string().email("Email invalide"),
  phone: z.string().min(9, "Numéro de téléphone invalide"),
  street: z.string().min(5, "Adresse requise"),
  city: z.string().min(2, "Ville requise"),
  region: z.string().min(2, "Région requise"),
  country: z.string().default("SN"),
});

export const paymentInitSchema = z.object({
  amount: z.number().positive("Le montant doit être positif"),
  email: z.string().email("Email invalide"),
  name: z.string().min(2, "Nom requis"),
  orderId: z.string().min(1, "ID de commande requis"),
  currency: z.string().default("XOF"),
  callback_url: z.string().url("URL de retour invalide"),
  metadata: z.record(z.unknown()).optional(),
});

export const paymentVerifySchema = z.object({
  reference: z.string().min(1, "Référence requise"),
});

export const productSchema = z.object({
  name: z.string().min(2, "Nom du produit requis"),
  slug: z.string().optional(),
  description: z.string().min(10, "Description requise"),
  price: z.number().positive("Prix invalide"),
  comparePrice: z.number().optional(),
  images: z.array(z.string().url()).min(1, "Au moins une image requise"),
  category: z.string().min(2, "Catégorie requise"),
  tags: z.array(z.string()).default([]),
  variants: z.array(z.object({
    name: z.string(),
    options: z.array(z.string()),
  })).default([]),
  stock: z.number().int().min(0, "Stock invalide"),
  sku: z.string().optional(),
  isActive: z.boolean().default(true),
  isFeatured: z.boolean().default(false),
});

export const reviewSchema = z.object({
  productId: z.string().min(1, "Produit requis"),
  rating: z.number().int().min(1).max(5, "Note entre 1 et 5"),
  comment: z.string().optional(),
});

export const promoCodeSchema = z.object({
  code: z.string().min(3, "Code invalide"),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type ShippingAddressInput = z.infer<typeof shippingAddressSchema>;
export type PaymentInitInput = z.infer<typeof paymentInitSchema>;
export type ProductInput = z.infer<typeof productSchema>;
export type ReviewInput = z.infer<typeof reviewSchema>;
