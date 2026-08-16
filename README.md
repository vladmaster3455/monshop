# MonShop - E-commerce Next.js 14 + Dexpay Africa

Application e-commerce complète avec **Next.js 14**, **Prisma ORM**, **NextAuth.js**, et intégration de paiements **Dexpay Africa**.

## Fonctionnalités

-  Catalogue de produits avec recherche et filtres
-  Panier persistant (localStorage + Zustand)
-  Authentification multi-canaux (Email/Password + Google OAuth)
-  Paiement sécurisé via Dexpay (Wave, Orange Money, Free Money, Carte bancaire)
-  Gestion des commandes
-  Tableau de bord administrateur
-  Notifications email (Nodemailer)
-  Design responsif (Tailwind CSS + Shadcn UI)
-  Support multidevises (XOF, EUR, USD)

---

##  Démarrage rapide en local

### 1. Cloner et installer
```bash
git clone https://github.com/vladmaster3455/monshop.git
cd monshop
npm install
```

### 2. Configurer l'environnement
```bash
# Copier le template
cp .env.example .env.local

# Éditer et compléter les valeurs
nano .env.local
```

### 3. Base de données
```bash
# Créer les tables
npx prisma db push

# Seed les données (produits, utilisateurs test)
npm run db:seed
```

### 4. Lancer le serveur
```bash
npm run dev
```

Ouvrir: http://localhost:3000

---

##  Compte administrateur local

Le seeding crée le compte administrateur avec `SEED_ADMIN_EMAIL` et `SEED_ADMIN_PASSWORD`. Définir ces variables dans `.env` ou `.env.local` avant de lancer `npm run db:seed` ; aucun mot de passe n'est conservé dans le dépôt.

Pour les essais, Google OAuth peut aussi être activé avec les variables correspondantes. Ne pas utiliser de compte ou de secret de développement en production.

---




### Résumé rapide:
1. Push sur GitHub
2. Connecter le repo à Vercel
3. Configurer les variables d'environnement (voir `.env.example`)
4. Déployer (automatic sur push vers main)

---

##  Configuration détaillée

### Google OAuth
- Console: https://console.cloud.google.com
- Créer un projet → Activer Google+ API → Créer identifiants OAuth
- Redirect URI: `http://localhost:3000/api/auth/callback/google`
- Copier Client ID et Secret dans `.env.local`

### PostgreSQL
**Option 1: Supabase (gratuit)**
- https://supabase.com → New Project → copier DATABASE_URL

**Option 2: Local**
```bash
createdb monshop_db
# DATABASE_URL="postgresql://user:password@localhost:5432/monshop_db"
```

### Dexpay (Paiements)
- Test API déjà configurées dans `.env.example`
- Production: récupérer les clés depuis https://merchant-portal.dexpay.africa

---

##  Scripts disponibles

```bash
npm run dev          # Développement avec hot reload
npm run build        # Build production
npm run start        # Lancer la version produite
npm run db:seed        # Seed la BD avec données test
npm run db:push      # Créer/synchroniser les tables
npm run db:studio    # Ouvrir Prisma Studio (interface BD)
npm run lint         # Vérifier le code
```

---

##  Structure du projet

```
app/
├── auth/                # Pages d'authentification (login, register)
├── (shop)/              # Pages du magasin public
│   ├── products/
│   ├── checkout/
│   └── cart/
├── (account)/           # Compte utilisateur
│   └── account/
├── admin/               # Tableau de bord admin
├── api/                 # Routes API
│   ├── auth/            # NextAuth
│   ├── payment/         # Dexpay integration
│   └── orders/

components/
├── layout/              # Header, Footer, Logo
├── product/             # Product Card, Detail
├── cart/                # Panier (drawer)
└── checkout/            # Payment

lib/
├── auth.ts              # NextAuth config
├── dexpay.ts            # Dexpay API wrapper
├── prisma.ts            # Prisma client
└── validations.ts       # Zod schemas

prisma/
└── schema.prisma        # Schéma de la BD
```

---

##  Dépannage

### "redirect_uri_mismatch" avec Google OAuth
- Vérifier que le Redirect URI dans Google Console correspond à votre domaine
- Attendre 5-10 minutes après modification

### Erreur 422 Dexpay "Invalid URL"
- Vérifier que `NEXT_PUBLIC_APP_URL` est une HTTPS valide
- En dev local, localhost ne fonctionne pas (utiliser ngrok)

### "Could not connect to database"
- Vérifier DATABASE_URL est correcte
- Vérifier que PostgreSQL est running
- Pour Supabase: activer "Connection Pooling" si nécessaire

### Emails ne s'envoient pas
- Pour Gmail: générer un "App Password" → https://myaccount.google.com/apppasswords
- Entrer le app password dans SMTP_PASS (pas le mot de passe Google)
- Vérifier SMTP_USER et SMTP_HOST

---

##  Pages disponibles

| URL                        | Description                    |
|----------------------------|--------------------------------|
| `/`                        | Page d'accueil                 |
| `/products`                | Catalogue avec filtres         |
| `/products/[slug]`         | Fiche produit                  |
| `/cart`                    | Panier                         |
| `/checkout`                | Tunnel de commande + Dexpay    |
| `/checkout/success`        | Confirmation paiement          |
| `/account`                 | Espace client                  |
| `/admin`                   | Dashboard admin                |
| `/auth/login`              | Connexion                      |
| `/auth/register`           | Inscription                    |

---

##  Documentation & Ressources

- [Next.js 14 Docs](https://nextjs.org/docs)
- [Prisma ORM](https://www.prisma.io/docs)
- [NextAuth.js](https://next-auth.js.org)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Dexpay API](https://dexpay.africa/docs)

---
