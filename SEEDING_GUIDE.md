
# Guide de Seeding - Base de Données

## 📋 Vue d'ensemble

Le seeding (peuplement de la base de données) **n'est PLUS exécuté automatiquement lors des déploiements Vercel**. Cela réduit le temps de build de 60-80%.

### Avant (LENT ❌)
```
Build: 20-30s
├─ prisma generate
├─ next build
├─ prisma db push
└─ prisma seed.ts  ← 10-15s d'attente BD!
= Total: ~35-45s
```

### Après (RAPIDE ✅)
```
Build: 8-15s
├─ prisma generate
├─ next build
└─ prisma db push
= Total: ~15-20s
```

---

## 🚀 Utiliser le Seeding

### Local (Développement)
```bash
npm run db:seed
```
Le script `prisma/seed.ts` s'exécute avec `tsx` et peuple la BD locale.

### Production (Vercel)

#### 1️⃣ **Première déploiement** - Initialiser la BD
```bash
# Via curl
curl -X POST https://votre-domaine.vercel.app/api/admin/seed \
  -H "x-seed-token: $SEED_TOKEN" \
  -H "Content-Type: application/json"

# Via Node/JavaScript
fetch('https://votre-domaine.vercel.app/api/admin/seed', {
  method: 'POST',
  headers: {
    'x-seed-token': process.env.SEED_TOKEN,
    'Content-Type': 'application/json'
  }
}).then(r => r.json()).then(console.log)
```

#### 2️⃣ **Configurer SEED_TOKEN sur Vercel**
1. Aller à **Vercel Dashboard** → **Settings** → **Environment Variables**
2. Ajouter une nouvelle variable:
   - Nom: `SEED_TOKEN`
   - Valeur: `votre-token-securise` (ex: `seed_prod_xyz123abc`)
   - Appliquer à: Production

#### 3️⃣ **Déclencher le seeding**
```bash
# Après déploiement successful
curl -X POST https://votre-domaine/api/admin/seed \
  -H "x-seed-token: seed_prod_xyz123abc"
```

---

## 🔐 Sécurité

⚠️ **Important**: Le token `SEED_TOKEN` doit être:
- Unique et complexe (min 32 caractères)
- Stocké UNIQUEMENT dans Vercel Environment Variables
- **JAMAIS** commité dans Git
- Régulièrement roté en production

### Exemple de token secure:
```
seed_prod_$(openssl rand -hex 16)
# Résultat: seed_prod_a8f3e2c1b5d9f6e4a1c3b8d2e5f9a6c1
```

---

## 📊 Endpoint API

**POST** `/api/admin/seed`

### Headers requis:
```http
x-seed-token: {SEED_TOKEN}
Content-Type: application/json
```

### Réponses:
```json
// ✅ Succès (200)
{
  "message": "✅ Database seeded successfully!",
  "admin": {
    "email": "admin@monshop.sn",
    "role": "ADMIN"
  },
  "productsCount": 6,
  "promoCodesCount": 3
}

// ❌ Erreur (401)
{
  "error": "Unauthorized"
}

// ❌ Erreur serveur (500)
{
  "error": "Seeding failed",
  "details": "..."
}
```

---

## 🔄 Workflow Recommandé

```
1. Développement local
   → npm install
   → npm run db:push  (créer schéma)
   → npm run db:seed  (peupler données)
   → npm run dev

2. Déploiement Vercel
   → Push sur main
   → Vercel build automatique (~15s)
   → Build réussi ✅
   → POST /api/admin/seed (manuelle une fois)
   → Live avec données! 🚀

3. Redéploiements futurs
   → Juste push et build
   → Pas de seeding automatique
   → BD conserve données existantes
```

---

## 📝 Variables d'environnement

Ajouter à votre `.env.local` (développement):
```env
# Optionnel - utilisé uniquement si vous appelez l'endpoint localement
SEED_TOKEN=dev_token_local_123
```

Et à **Vercel Dashboard**:
```
SEED_TOKEN=seed_prod_a8f3e2c1b5d9f6e4a1c3b8d2e5f9a6c1
DATABASE_URL=postgresql://...
```

---

## 🐛 Troubleshooting

### Q: "Unauthorized" en appelant l'endpoint?
**R:** Vérifier que `SEED_TOKEN` est défini dans Vercel Environment Variables

### Q: "Connection timeout" lors du seeding?
**R:** Augmenter le timeout dans Vercel:
- Dashboard → Settings → Function Timeout: 60s (max)

### Q: "Duplicate key error"?
**R:** Le seeding utilise `upsert` donc c'est safe. Relancer sans problème.

### Q: Revenir à l'ancien système?
**R:** Modifier `vercel.json`:
```json
"buildCommand": "prisma generate && next build && npx prisma db push --skip-generate && npx tsx prisma/seed.ts"
```
⚠️ Cela ralentira les builds de 20-30s

---

## 📚 Ressources

- [Prisma Seeding](https://www.prisma.io/docs/orm/reference/command-reference#db-seed)
- [Vercel Environment Variables](https://vercel.com/docs/projects/environment-variables)
- [NextAuth.js + Prisma](https://authjs.dev/reference/adapter/prisma)
