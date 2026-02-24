# Akwaba Bébé — Mémoire Projet

> Fichier de référence pour Claude Code. À commiter et conserver à la racine du projet.

---

## Stack

- **Backend** : Go 1.25, net/http stdlib, JWT (golang-jwt/jwt/v5), bcrypt, aws-sdk-go-v2, lib/pq (PostgreSQL)
- **Frontend** : Next.js 16.1.5, React 19, TypeScript 5, Tailwind CSS v4, Shadcn UI v3, lucide-react, react-hot-toast
- **Cloud** : AWS App Runner (backend), AWS RDS PostgreSQL (DB), AWS S3 (images, bucket: `akwaba-bebe-images`, région: `eu-west-3`), Vercel (frontend)
- **URL prod backend** : `https://ctqzzggxht.us-east-1.awsapprunner.com`
- **URL prod frontend** : `https://www.akwababebe.com`

---

## Conventions critiques

- Toutes les réponses Go en JSON (`json.NewEncoder(w).Encode(...)`) — jamais `http.Error()`
- Les erreurs SQL ne s'exposent jamais au client — `fmt.Printf` interne + message générique
- URLs fetch : toujours des backticks `` `${API_URL}/...` `` jamais des guillemets simples
- Auteur dans les fichiers/migrations : **Siahoué Siaka** (pas Claude Code)
- App en français

## Bug récurrent : guillemets simples vs backticks

Fichiers corrigés : `edit/[id]/page.tsx`, `admin/products/page.tsx`, `admin/products/edit/page.tsx`, `page.tsx` (accueil)
→ Vérifier systématiquement avant chaque push

---

## Architecture DB (RDS PostgreSQL)

**Tables** : `users`, `categories`, `subcategories`, `products`, `orders`, `order_items`, `articles`

**Migrations** :
| Fichier | Description | Statut |
|---|---|---|
| `001_init_schema.sql` | Schéma initial | Appliqué |
| `002_add_articles.sql` | Table articles | Appliqué |
| `003_add_subcategories.sql` | Table subcategories + `products.subcategory_id` | **À exécuter sur RDS** |

**Contraintes FK importantes** :
- `subcategories.category_id → categories.id` ON DELETE CASCADE
- `products.subcategory_id → subcategories.id` ON DELETE SET NULL
- `orders.status` DEFAULT `'pending'`

---

## Shadcn UI

- Initialisé avec Tailwind v4 (`components.json` présent)
- Composants installés : `button`, `card`, `badge`, `input`, `textarea`, `table`
- Variables CSS : `--primary = #007D5A` (vert), `--secondary = #FFC727` (jaune)
- **Fix bordures Tailwind v4** : `border-color: var(--border)` dans `@layer base`
  - ⚠️ PAS `var(--color-border)` — c'est un token `@theme inline`, pas une vraie var CSS
  - `--border: oklch(0.936 0 0)` · `--input: oklch(0.898 0 0)` · `--ring: oklch(0.47 0.12 163)`
- Pages migrées : toutes les pages admin (categories, articles, products, products/add, products/edit)

---

## Feature Sous-catégories

Pattern : sélection catégorie → fetch `/subcategories?category_id=X` → dropdown optionnel

| Fichier | Rôle |
|---|---|
| `backend/migrations/003_add_subcategories.sql` | Migration DB |
| `backend/internal/models/subcategory.go` | Modèle SubCategory |
| `backend/internal/handlers/subcategory.go` | CRUD (GET/POST/PUT/DELETE) |
| `backend/internal/handlers/product.go` | subcategory_id dans les 4 requêtes SQL |
| `backend/cmd/api/main.go` | 3 routes `/subcategories` enregistrées |
| `frontend/app/admin/categories/page.tsx` | Accordéon lazy loading + CRUD inline |
| `frontend/app/admin/products/add/page.tsx` | Second dropdown conditionnel |
| `frontend/app/admin/products/edit/[id]/page.tsx` | Second dropdown + pré-remplissage |
| `frontend/app/produits/page.tsx` | Filtre sidebar en retrait |

Go model : `SubcategoryID *int` (pointeur pour gérer NULL SQL → `null` en JSON)

---

## JWT & Auth

- `config/jwt.go` : source unique de la clé JWT (lit `JWT_SECRET` env var)
- Middleware `IsAdmin` requis sur : `POST/PUT/DELETE /products`, `/categories`, `/subcategories`, `/articles`, `GET /orders`
- Passer admin RDS : `UPDATE users SET role = 'admin' WHERE email = '...'`

---

## S3 Upload

- Endpoint : `POST /upload` (multipart/form-data, champ `"file"`)
- Variables App Runner requises : `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_REGION`, `AWS_BUCKET_NAME`
- URL retournée : `https://akwaba-bebe-images.s3.eu-west-3.amazonaws.com/products/{timestamp}.ext`
