// app/admin/products/new/page.tsx
"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { productSchema, ProductInput } from "@/lib/validations";
import { Header } from "@/components/layout/Header";
import Link from "next/link";
import { ArrowLeft, Plus, Trash2, Loader2 } from "lucide-react";
import toast from "react-hot-toast";

export default function NewProductPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [variants, setVariants] = useState<Array<{ name: string; options: string[] }>>([]);
  const [newVariantName, setNewVariantName] = useState("");
  const [images, setImages] = useState<string[]>([""]);

  const { register, handleSubmit, formState: { errors } } = useForm<ProductInput>({
    resolver: zodResolver(productSchema),
    defaultValues: { isActive: true, isFeatured: false, stock: 0, tags: [] },
  });

  function addVariant() {
    if (!newVariantName.trim()) return;
    setVariants([...variants, { name: newVariantName.trim(), options: [] }]);
    setNewVariantName("");
  }

  function addOption(variantIdx: number, option: string) {
    if (!option.trim()) return;
    const updated = [...variants];
    if (!updated[variantIdx].options.includes(option.trim())) {
      updated[variantIdx].options.push(option.trim());
    }
    setVariants(updated);
  }

  function removeOption(variantIdx: number, optIdx: number) {
    const updated = [...variants];
    updated[variantIdx].options.splice(optIdx, 1);
    setVariants(updated);
  }

  async function onSubmit(data: ProductInput) {
    setLoading(true);
    try {
      const payload = {
        ...data,
        images: images.filter(Boolean),
        variants,
        tags: typeof data.tags === "string" ? (data.tags as any).split(",").map((t: string) => t.trim()).filter(Boolean) : data.tags,
      };

      const res = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error);
      }

      toast.success("Produit créé avec succès !");
      router.push("/admin/products");
    } catch (e: any) {
      toast.error(e.message || "Erreur lors de la création");
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link href="/admin/products" className="flex items-center gap-2 text-gray-500 hover:text-primary-600 mb-6 text-sm">
          <ArrowLeft className="w-4 h-4" /> Retour aux produits
        </Link>
        <h1 className="text-2xl font-bold mb-6">Nouveau produit</h1>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Basic Info */}
          <div className="card p-6 space-y-4">
            <h2 className="font-semibold text-lg">Informations de base</h2>
            <div>
              <label className="block text-sm font-medium mb-1">Nom du produit *</label>
              <input {...register("name")} className="input-field" placeholder="Boubou Wax Premium" />
              {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Description *</label>
              <textarea {...register("description")} rows={4} className="input-field resize-none" placeholder="Description détaillée..." />
              {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description.message}</p>}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Prix (FCFA) *</label>
                <input {...register("price", { valueAsNumber: true })} type="number" className="input-field" placeholder="45000" />
                {errors.price && <p className="text-red-500 text-xs mt-1">{errors.price.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Prix barré (FCFA)</label>
                <input {...register("comparePrice", { valueAsNumber: true })} type="number" className="input-field" placeholder="60000" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Catégorie *</label>
                <select {...register("category")} className="input-field">
                  <option value="">Choisir...</option>
                  {["Vêtements", "Accessoires", "Bijoux", "Tissus", "Chaussures", "Beauté"].map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
                {errors.category && <p className="text-red-500 text-xs mt-1">{errors.category.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Stock *</label>
                <input {...register("stock", { valueAsNumber: true })} type="number" className="input-field" placeholder="100" />
                {errors.stock && <p className="text-red-500 text-xs mt-1">{errors.stock.message}</p>}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">SKU</label>
                <input {...register("sku")} className="input-field" placeholder="BWP-001" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Tags</label>
                <input {...register("tags" as any)} className="input-field" placeholder="wax, boubou, cérémonie" />
                <p className="text-xs text-gray-400 mt-1">Séparés par des virgules</p>
              </div>
            </div>
            <div className="flex gap-6">
              <label className="flex items-center gap-2 cursor-pointer">
                <input {...register("isActive")} type="checkbox" className="rounded" />
                <span className="text-sm font-medium">Produit actif</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input {...register("isFeatured")} type="checkbox" className="rounded" />
                <span className="text-sm font-medium">En vedette</span>
              </label>
            </div>
          </div>

          {/* Images */}
          <div className="card p-6 space-y-4">
            <h2 className="font-semibold text-lg">Images</h2>
            {images.map((img, i) => (
              <div key={i} className="flex gap-2">
                <input
                  type="url"
                  value={img}
                  onChange={(e) => {
                    const updated = [...images];
                    updated[i] = e.target.value;
                    setImages(updated);
                  }}
                  className="input-field flex-1"
                  placeholder="https://exemple.com/image.jpg"
                />
                {images.length > 1 && (
                  <button type="button" onClick={() => setImages(images.filter((_, idx) => idx !== i))} className="p-2 text-red-500 hover:bg-red-50 rounded-lg">
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
            <button type="button" onClick={() => setImages([...images, ""])} className="flex items-center gap-2 text-primary-600 text-sm hover:underline">
              <Plus className="w-4 h-4" /> Ajouter une image
            </button>
          </div>

          {/* Variants */}
          <div className="card p-6 space-y-4">
            <h2 className="font-semibold text-lg">Variantes (optionnel)</h2>
            {variants.map((v, vIdx) => (
              <div key={vIdx} className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <p className="font-medium">{v.name}</p>
                  <button type="button" onClick={() => setVariants(variants.filter((_, i) => i !== vIdx))} className="text-red-500 text-sm hover:underline">
                    Supprimer
                  </button>
                </div>
                <div className="flex flex-wrap gap-2 mb-3">
                  {v.options.map((opt, oIdx) => (
                    <span key={oIdx} className="badge bg-white border px-3 py-1 flex items-center gap-1">
                      {opt}
                      <button type="button" onClick={() => removeOption(vIdx, oIdx)} className="text-gray-400 hover:text-red-500">×</button>
                    </span>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Ajouter une option..."
                    className="input-field text-sm py-2 flex-1"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        addOption(vIdx, (e.target as HTMLInputElement).value);
                        (e.target as HTMLInputElement).value = "";
                      }
                    }}
                  />
                </div>
              </div>
            ))}
            <div className="flex gap-2">
              <input
                type="text"
                value={newVariantName}
                onChange={(e) => setNewVariantName(e.target.value)}
                className="input-field text-sm py-2 flex-1"
                placeholder="Nom de la variante (ex: Taille, Couleur)"
                onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addVariant(); } }}
              />
              <button type="button" onClick={addVariant} className="btn-secondary text-sm py-2 px-4">
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>

          <button type="submit" disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2 text-base py-4">
            {loading && <Loader2 className="w-5 h-5 animate-spin" />}
            {loading ? "Création en cours..." : "Créer le produit"}
          </button>
        </form>
      </div>
    </div>
  );
}
