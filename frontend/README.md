# Akwaba Bébé — Frontend

Application e-commerce pour la boutique **Akwaba Bébé** (Côte d'Ivoire).
Stack : **Next.js 16 · React 19 · TypeScript · Tailwind CSS v4 · Shadcn UI v3**

---

## Lancer en développement

```bash
npm install
npm run dev
```

Ouvrir [http://localhost:3000](http://localhost:3000).

---

## Structure des pages

### Client

| Route | Description |
|---|---|
| `/` | Accueil — mise en avant produits & catégories |
| `/produits` | Catalogue avec filtre catégorie / sous-catégorie / recherche |
| `/produits/[id]` | Fiche produit |
| `/panier` | Panier |
| `/commande` | Tunnel de commande |
| `/blog` | Articles |
| `/blog/[id]` | Article |
| `/login` · `/register` | Authentification |
| `/profil` | Profil utilisateur |

### Admin (`/admin/*`)

| Route | Description |
|---|---|
| `/admin` | Dashboard |
| `/admin/categories` | Gestion catégories + sous-catégories (accordéon) |
| `/admin/products` | Liste produits |
| `/admin/products/add` | Créer un produit |
| `/admin/products/edit/[id]` | Modifier un produit |
| `/admin/articles` | Gestion blog |
| `/admin/orders` | Gestion commandes |

---

## Variables d'environnement

Créer `.env.local` à la racine de `/frontend` :

```
NEXT_PUBLIC_API_URL=http://localhost:8080
```

En production (Vercel), pointer vers l'URL App Runner :

```
NEXT_PUBLIC_API_URL=https://ctqzzggxht.us-east-1.awsapprunner.com
```

---

## Déploiement

Le frontend est déployé automatiquement sur **Vercel** à chaque push sur `main`.
URL : [https://www.akwababebe.com](https://www.akwababebe.com)
