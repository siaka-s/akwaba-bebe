# Database — Akwaba Bébé

## Moteur : PostgreSQL (AWS RDS)

---

## Schéma des Tables

### 1. `users`

Déduit de : `handlers/auth.go` (INSERT, SELECT, UPDATE)

```sql
CREATE TABLE users (
    id            SERIAL PRIMARY KEY,
    email         VARCHAR(255) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,                     -- bcrypt DefaultCost
    full_name     VARCHAR(255) NOT NULL,             -- "Prénom Nom" (stocké fusionné)
    phone         VARCHAR(50),
    role          VARCHAR(20) DEFAULT 'customer',    -- 'customer' | 'admin'
    created_at    TIMESTAMP DEFAULT NOW()
);
```

**Notes :**
- Le backend stocke `full_name` comme une seule chaîne. La séparation Prénom/Nom est faite à la volée dans `GetProfile` via `strings.SplitN(fullName, " ", 2)`.
- `UpdateProfile` reçoit `first_name` + `last_name` du frontend et les recombine avant UPDATE.
- `role` est hardcodé à `'customer'` à l'inscription. La promotion admin se fait manuellement en BDD.

---

### 2. `categories`

Déduit de : `handlers/category.go` (SELECT, INSERT, UPDATE, DELETE)

```sql
CREATE TABLE categories (
    id   SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL
);
```

**Notes :**
- Suppression bloquée si des produits référencent la catégorie (contrainte FK côté `products`).
- Le backend renvoie toujours `[]` (jamais `null`) grâce à `make([]models.Category, 0)`.

---

### 3. `products`

Déduit de : `handlers/product.go` (SELECT, INSERT, UPDATE, DELETE)

```sql
CREATE TABLE products (
    id             SERIAL PRIMARY KEY,
    name           VARCHAR(255) NOT NULL,
    description    TEXT,
    price          DECIMAL(10, 2) NOT NULL,
    stock_quantity INTEGER DEFAULT 0,
    image_url      TEXT,                             -- URL S3 publique
    category_id    INTEGER REFERENCES categories(id)
);
```

**Notes :**
- `image_url` contient l'URL complète S3 (`https://akwaba-bebe-images.s3.eu-west-3.amazonaws.com/products/...`).
- `category_id` est nullable (produit sans catégorie possible).

---

### 4. `orders`

Déduit de : `handlers/order.go` (INSERT, SELECT, UPDATE) + `models/order.go`

```sql
CREATE TABLE orders (
    id                  SERIAL PRIMARY KEY,
    customer_firstname  VARCHAR(255) NOT NULL,
    customer_lastname   VARCHAR(255) NOT NULL,
    customer_email      VARCHAR(255) NOT NULL,       -- Clé de liaison avec users (par email)
    customer_phone      VARCHAR(50),
    delivery_method     VARCHAR(20) NOT NULL,        -- 'shipping' | 'pickup'
    shipping_city       VARCHAR(255),
    shipping_commune    VARCHAR(255),
    shipping_address    TEXT,
    order_note          TEXT,
    create_account      BOOLEAN DEFAULT FALSE,       -- Option "créer un compte" au checkout
    total_amount        DECIMAL(10, 2) NOT NULL,
    status              VARCHAR(50) DEFAULT 'pending', -- 'pending' | 'livré' | 'annulé'
    created_at          TIMESTAMP DEFAULT NOW()
);
```

**Notes importantes :**
- Les commandes ne sont **pas liées par FK** à `users.id`. La liaison est faite par `customer_email`. `GetMyOrders` récupère d'abord l'email depuis `users` via le JWT, puis filtre les commandes par email.
- `create_account = TRUE` est enregistré en BDD mais **la création de compte n'est pas implémentée** côté backend (le champ `password` du `OrderRequest` est ignoré).
- `status` : les valeurs utilisées dans l'UI sont `'pending'`, `'livré'`, `'annulé'`.

---

### 5. `order_items`

Déduit de : `handlers/order.go` (INSERT, SELECT JOIN) + `models/order.go`

```sql
CREATE TABLE order_items (
    id         SERIAL PRIMARY KEY,
    order_id   INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    product_id INTEGER NOT NULL REFERENCES products(id),
    quantity   INTEGER NOT NULL,
    price      DECIMAL(10, 2) NOT NULL    -- Prix unitaire au moment de la commande (snapshot)
);
```

**Notes :**
- `price` est un snapshot du prix au moment de l'achat. Il ne change pas si le prix du produit est modifié ultérieurement.
- La requête de détail commande joint `order_items` et `products` pour afficher `p.name`, `oi.quantity`, `oi.price`.

---

### 6. `articles`

Déduit de : `handlers/article.go` (SELECT, INSERT)

```sql
CREATE TABLE articles (
    id         SERIAL PRIMARY KEY,
    title      VARCHAR(500) NOT NULL,
    content    TEXT NOT NULL,
    image_url  TEXT,                     -- URL S3 publique
    created_at TIMESTAMP DEFAULT NOW()
);
```

**Notes :**
- Pas de mise à jour ni suppression d'article implémentée (endpoints absents).
- Triés par `created_at DESC`.

---

### 7. `reviews` et `cart_items`

> **Statut : Tables planifiées — non implémentées dans le backend actuel.**
> Mise à jour : la page `admin/products/edit/[id]/page.tsx` **existe** et est fonctionnelle.

Aucune requête SQL ni modèle Go ne référence ces tables. Elles font partie de la roadmap. Voici le schéma attendu :

```sql
-- À implémenter
CREATE TABLE reviews (
    id         SERIAL PRIMARY KEY,
    product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    user_id    INTEGER REFERENCES users(id),
    rating     INTEGER CHECK (rating BETWEEN 1 AND 5),
    comment    TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- À implémenter
CREATE TABLE cart_items (
    id         SERIAL PRIMARY KEY,
    user_id    INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    product_id INTEGER NOT NULL REFERENCES products(id),
    quantity   INTEGER NOT NULL DEFAULT 1,
    added_at   TIMESTAMP DEFAULT NOW(),
    UNIQUE(user_id, product_id)
);
```

> Actuellement, le panier est géré **entièrement côté client** via `localStorage` (voir `CartContext.tsx`). `cart_items` permettrait une persistance serveur.

---

## Relations entre Tables

```
categories
    │
    └──< products (category_id FK)
              │
              └──< order_items (product_id FK)
                        │
orders ────────────────>┘ (order_id FK)
   │
   │ (liaison par customer_email — pas de FK vers users)
   │
users

articles (table indépendante)

reviews (planifiée — product_id FK, user_id FK)
cart_items (planifiée — user_id FK, product_id FK)
```

---

## Script de création (ordre correct)

```sql
CREATE TABLE users (...);
CREATE TABLE categories (...);
CREATE TABLE products (...);      -- dépend de categories
CREATE TABLE orders (...);
CREATE TABLE order_items (...);   -- dépend de orders et products
CREATE TABLE articles (...);
-- Futures :
CREATE TABLE reviews (...);       -- dépend de products et users
CREATE TABLE cart_items (...);    -- dépend de users et products
```

---

## Conventions

| Règle | Valeur |
|---|---|
| Clés primaires | `SERIAL PRIMARY KEY` (auto-incrémentées) |
| Timestamps | `TIMESTAMP DEFAULT NOW()` |
| Nommage colonnes | `snake_case` |
| Nommage tables | `snake_case` pluriel |
| Chaînes vides vs NULL | Préférer `NOT NULL` avec valeur par défaut |
