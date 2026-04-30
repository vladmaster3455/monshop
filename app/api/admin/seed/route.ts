// app/api/admin/seed/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(req: NextRequest) {
  try {
    // Security: simple token check (change this in production)
    const token = req.headers.get("x-seed-token");
    if (token !== process.env.SEED_TOKEN) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    console.log("🌱 Starting database seed...");

    // Admin user
    const adminPassword = await bcrypt.hash("passer", 12);
    await prisma.user.upsert({
      where: { email: "sergesenghor@gmail.com" },
      update: {},
      create: {
        name: "Admin",
        email: "sergesenghor@gmail.com",
        password: adminPassword,
        role: "ADMIN",
      },
    });

    // Sample products (14 products synchronized with seed.ts)
    const products = [
      {
        name: "Boubou Wax Premium",
        slug: "boubou-wax-premium",
        description: "Magnifique boubou en tissu wax de qualité supérieure, parfait pour les cérémonies et occasions spéciales.",
        price: 45000,
        comparePrice: 60000,
        images: [
          "https://images.unsplash.com/photo-1594938298603-c8148c4b4733?w=800",
          "https://images.unsplash.com/photo-1583623025817-d180a2221d0a?w=800",
        ],
        category: "Vêtements",
        tags: ["wax", "boubou", "cérémonies"],
        variants: [
          { name: "Taille", options: ["S", "M", "L", "XL", "XXL"] },
          { name: "Couleur", options: ["Bleu royal", "Rouge bordeaux", "Vert émeraude"] },
        ],
        stock: 50,
        sku: "BWP-001",
        isFeatured: true,
      },
      {
        name: "Sac en Cuir Artisanal",
        slug: "sac-cuir-artisanal",
        description: "Sac à main en cuir véritable fabriqué à la main par nos artisans locaux. Durable et élégant.",
        price: 35000,
        images: [
          "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=800",
          "https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=800",
        ],
        category: "Accessoires",
        tags: ["cuir", "sac", "artisanal"],
        variants: [
          { name: "Couleur", options: ["Marron", "Noir", "Camel"] },
        ],
        stock: 30,
        sku: "SCA-002",
        isFeatured: true,
      },
      {
        name: "Bijoux Cauri Traditionnel",
        slug: "bijoux-cauri-traditionnel",
        description: "Collier et bracelet en cauris naturels, symbole de prospérité et de tradition africaine.",
        price: 12000,
        comparePrice: 15000,
        images: [
          "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=800",
        ],
        category: "Bijoux",
        tags: ["bijoux", "cauri", "traditionnel"],
        variants: [
          { name: "Type", options: ["Collier", "Bracelet", "Ensemble"] },
        ],
        stock: 100,
        sku: "BCT-003",
        isFeatured: true,
      },
      {
        name: "Tissu Bazin Riche",
        slug: "tissu-bazin-riche",
        description: "Tissu bazin riche de haute qualité, idéal pour confectionner des tenues traditionnelles élégantes.",
        price: 8500,
        images: [
          "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800",
        ],
        category: "Tissus",
        tags: ["bazin", "tissu", "couture"],
        variants: [
          { name: "Couleur", options: ["Blanc", "Or", "Argenté", "Bleu"] },
          { name: "Longueur", options: ["2m", "4m", "6m"] },
        ],
        stock: 200,
        sku: "TBR-004",
      },
      {
        name: "Chaussures Babouches",
        slug: "chaussures-babouches",
        description: "Babouches artisanales en cuir, confortables et élégantes pour toutes occasions.",
        price: 18000,
        images: [
          "https://images.unsplash.com/photo-1603487742131-4160ec999306?w=800",
        ],
        category: "Chaussures",
        tags: ["babouches", "cuir", "chaussures"],
        variants: [
          { name: "Pointure", options: ["38", "39", "40", "41", "42", "43", "44"] },
          { name: "Couleur", options: ["Beige", "Marron", "Noir"] },
        ],
        stock: 60,
        sku: "CB-005",
        isFeatured: true,
      },
      {
        name: "Parfum Musc d'Orient",
        slug: "parfum-musc-orient",
        description: "Parfum artisanal au musc naturel, une fragrance envoûtante qui dure toute la journée.",
        price: 25000,
        images: [
          "https://images.unsplash.com/photo-1523293182086-7651a899d37f?w=800",
        ],
        category: "Beauté",
        tags: ["parfum", "musc", "beauté"],
        variants: [
          { name: "Volume", options: ["10ml", "30ml", "50ml"] },
        ],
        stock: 80,
        sku: "PMO-006",
      },
      {
        name: "Dashiki Coloré",
        slug: "dashiki-colore",
        description: "Chemise dashiki aux motifs géométriques vibrants, symbole de la culture africaine moderne.",
        price: 22000,
        comparePrice: 28000,
        images: [
          "https://images.unsplash.com/photo-1594938298603-c8148c4b4733?w=800",
        ],
        category: "Vêtements",
        tags: ["dashiki", "chemise", "motifs"],
        variants: [
          { name: "Taille", options: ["S", "M", "L", "XL"] },
          { name: "Motif", options: ["Géométrique", "Floral", "Géométrique Bleu"] },
        ],
        stock: 45,
        sku: "DSH-007",
        isFeatured: true,
      },
      {
        name: "Bracelet Doré Massif",
        slug: "bracelet-dore-massif",
        description: "Bracelet en or massif 18k, design élégant et intemporel pour toutes occasions.",
        price: 55000,
        comparePrice: 75000,
        images: [
          "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=800",
        ],
        category: "Bijoux",
        tags: ["bracelet", "or", "luxe"],
        variants: [
          { name: "Taille", options: ["S", "M", "L"] },
        ],
        stock: 20,
        sku: "BRC-008",
        isFeatured: true,
      },
      {
        name: "Foulard Soie Premium",
        slug: "foulard-soie-premium",
        description: "Foulard en soie véritable, doux et élégant, parfait pour compléter n'importe quelle tenue.",
        price: 15000,
        comparePrice: 20000,
        images: [
          "https://images.unsplash.com/photo-1593062096033-9a26b09da705?w=800",
        ],
        category: "Accessoires",
        tags: ["foulard", "soie", "accessoire"],
        variants: [
          { name: "Couleur", options: ["Rose", "Bleu", "Vert", "Bordeaux"] },
        ],
        stock: 70,
        sku: "FSP-009",
      },
      {
        name: "Sandales Artisanales",
        slug: "sandales-artisanales",
        description: "Sandales fabriquées à la main avec matériaux naturels, confortables et durables.",
        price: 16000,
        images: [
          "https://images.unsplash.com/photo-1622365131055-3d48007b7313?w=800",
        ],
        category: "Chaussures",
        tags: ["sandales", "artisanal", "naturel"],
        variants: [
          { name: "Pointure", options: ["36", "37", "38", "39", "40", "41", "42"] },
        ],
        stock: 55,
        sku: "SAN-010",
      },
      {
        name: "Boucles d'Oreilles Traditionnelles",
        slug: "boucles-oreilles-traditionnelles",
        description: "Boucles d'oreilles en bronze tradition, témoignage de l'art ancestral africain.",
        price: 8000,
        comparePrice: 12000,
        images: [
          "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=800",
        ],
        category: "Bijoux",
        tags: ["boucles", "bronze", "traditionnel"],
        variants: [
          { name: "Style", options: ["Cercles", "Géométrique", "Feuille"] },
        ],
        stock: 120,
        sku: "BOU-011",
        isFeatured: true,
      },
      {
        name: "Sac Pagne Multicolore",
        slug: "sac-pagne-multicolore",
        description: "Sac de pagne transformé en accessoire tendance, unique et coloré.",
        price: 12000,
        images: [
          "https://images.unsplash.com/photo-1590736969955-71cc94901144?w=800",
        ],
        category: "Accessoires",
        tags: ["sac", "pagne", "tendance"],
        variants: [
          { name: "Motif", options: ["Géométrique", "Floral", "Ethnique"] },
        ],
        stock: 40,
        sku: "SPM-012",
      },
      {
        name: "Ceinture Cuir Gravée",
        slug: "ceinture-cuir-gravee",
        description: "Ceinture en cuir véritable avec gravure personnalisée, accessoire essentiel pour homme et femme.",
        price: 11000,
        images: [
          "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800",
        ],
        category: "Accessoires",
        tags: ["ceinture", "cuir", "gravure"],
        variants: [
          { name: "Couleur", options: ["Marron", "Noir", "Camel", "Cognac"] },
          { name: "Taille", options: ["S", "M", "L", "XL"] },
        ],
        stock: 65,
        sku: "CEI-013",
      },
      {
        name: "Crème Visage Naturelle",
        slug: "creme-visage-naturelle",
        description: "Crème hydratante à base d'ingrédients naturels africains, douce et efficace.",
        price: 9500,
        comparePrice: 14000,
        images: [
          "https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=800",
        ],
        category: "Beauté",
        tags: ["crème", "visage", "naturelle"],
        variants: [
          { name: "Type Peau", options: ["Sèche", "Mixte", "Grasse"] },
        ],
        stock: 150,
        sku: "CRV-014",
      },
    ];

    for (const product of products) {
      await prisma.product.upsert({
        where: { slug: product.slug },
        update: {},
        create: product as any,
      });
    }

    console.log("✅ Seed completed successfully!");
    return NextResponse.json({ message: "Seed completed!", productsCount: products.length });
  } catch (error) {
    console.error("❌ Seed error:", error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
