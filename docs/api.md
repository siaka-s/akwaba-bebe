# Documentation API — Akwaba Bébé

**Base URL (prod)** : `https://<service>.awsapprunner.com`
**Base URL (dev)** : `http://localhost:8080`
**Format** : JSON uniquement — toutes les réponses ont `Content-Type: application/json`
**Authentification** : Bearer Token JWT dans le header `Authorization`

---

## Authentification

### POST `/signup` — Inscription

Crée un nouveau compte utilisateur avec le rôle `customer`.

**Headers :** `Content-Type: application/json`

**Body :**
```json
{
  "email": "marie.konan@email.com",
  "password": "motdepasse123",
  "full_name": "Marie Konan",
  "phone": "+225 07 00 00 00"
}
```

**Réponse 201 Created :**
```json
{
  "message": "Utilisateur créé avec succès",
  "id": 42
}
```

**Réponse 500 (email déjà existant) :**
```json
{ "message": "Erreur BDD : ..." }
```

---

### POST `/login` — Connexion

Authentifie l'utilisateur et retourne un token JWT valable 24 heures.

**Headers :** `Content-Type: application/json`

**Body :**
```json
{
  "email": "marie.konan@email.com",
  "password": "motdepasse123"
}
```

**Réponse 200 OK :**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "role": "customer",
  "full_name": "Marie Konan"
}
```

**Réponse 401 (identifiants incorrects) :**
```json
{ "message": "Email ou mot de passe incorrect" }
```

> **Note frontend** : Stocker `token` dans `localStorage.token`, `role` dans `localStorage.user_role`, `full_name` dans `localStorage.user_name`.

---

### GET `/profile` — Récupérer le profil

Retourne les informations de l'utilisateur connecté. Le `full_name` est découpé en `first_name` / `last_name`.

**Headers :** `Authorization: Bearer <token>`

**Réponse 200 OK :**
```json
{
  "id": 42,
  "first_name": "Marie",
  "last_name": "Konan",
  "email": "marie.konan@email.com",
  "phone": "+225 07 00 00 00",
  "role": "customer"
}
```

**Réponse 401 :** `{ "message": "Non autorisé : token invalide ou absent" }`

---

### PUT `/profile` — Modifier le profil

Met à jour le nom et le téléphone de l'utilisateur connecté. L'email n'est pas modifiable.

**Headers :** `Authorization: Bearer <token>`, `Content-Type: application/json`

**Body :**
```json
{
  "first_name": "Marie",
  "last_name": "Konan Brou",
  "phone": "+225 07 11 22 33"
}
```

**Réponse 200 OK :**
```json
{ "message": "Profil mis à jour avec succès" }
```

---

## Produits

### GET `/products` — Liste des produits

Retourne tous les produits, triés par ID croissant. Retourne `[]` si aucun produit.

**Headers :** aucun requis

**Réponse 200 OK :**
```json
[
  {
    "id": 1,
    "name": "Biberon anti-coliques",
    "description": "Biberon 260ml avec tétine silicone",
    "price": 5500,
    "stock_quantity": 25,
    "image_url": "https://akwaba-bebe-images.s3.eu-west-3.amazonaws.com/products/1234567890.jpg",
    "category_id": 3
  }
]
```

---

### GET `/products/{id}` — Détail d'un produit

**Réponse 200 OK :** Un seul objet produit (même structure que ci-dessus)

**Réponse 404 :** `{ "message": "Produit introuvable" }`

---

### POST `/products` — Créer un produit `[ADMIN]`

**Headers :** `Authorization: Bearer <token admin>`, `Content-Type: application/json`

**Body :**
```json
{
  "name": "Biberon anti-coliques",
  "description": "Biberon 260ml avec tétine silicone",
  "price": 5500,
  "stock_quantity": 25,
  "image_url": "https://akwaba-bebe-images.s3.eu-west-3.amazonaws.com/products/1234567890.jpg",
  "category_id": 3
}
```

**Réponse 201 Created :**
```json
{ "id": 12, "message": "Succès" }
```

---

### PUT `/products/{id}` — Modifier un produit `[ADMIN]`

**Headers :** `Authorization: Bearer <token admin>`, `Content-Type: application/json`

**Body :** même structure que la création

**Réponse 200 OK :**
```json
{ "message": "Produit mis à jour avec succès" }
```

**Réponse 404 :** `{ "message": "Aucun produit trouvé avec cet ID" }`

---

### DELETE `/products/{id}` — Supprimer un produit `[ADMIN]`

**Headers :** `Authorization: Bearer <token admin>`

**Réponse 200 OK :**
```json
{ "message": "Produit supprimé" }
```

---

### POST `/upload` — Upload image vers S3

Upload une image et retourne son URL publique S3 à stocker dans `image_url`.

**Headers :** `Authorization: Bearer <token>` (optionnel en prod, requis dans edit page)

**Body :** `multipart/form-data` avec champ `file` (max 10MB, formats image uniquement)

**Réponse 200 OK :**
```json
{
  "url": "https://akwaba-bebe-images.s3.eu-west-3.amazonaws.com/products/1703123456789.jpg"
}
```

> **Flux recommandé :** appeler `/upload` d'abord, récupérer l'URL, puis l'inclure dans le body de `POST /products` ou `PUT /products/{id}`.

---

## Catégories

### GET `/categories` — Liste des catégories

Retourne `[]` si aucune catégorie.

**Réponse 200 OK :**
```json
[
  { "id": 1, "name": "Allaitement" },
  { "id": 2, "name": "Bain & Hygiène" },
  { "id": 3, "name": "Biberons & Tétines" }
]
```

---

### POST `/categories` — Créer une catégorie `[ADMIN]`

**Headers :** `Authorization: Bearer <token admin>`, `Content-Type: application/json`

**Body :**
```json
{ "name": "Jouets d'éveil" }
```

**Réponse 201 Created :**
```json
{ "id": 5, "name": "Jouets d'éveil" }
```

**Réponse 400 :** `{ "message": "Le nom de la catégorie est requis" }`

---

### PUT `/categories/update/{id}` — Modifier une catégorie `[ADMIN]`

**Headers :** `Authorization: Bearer <token admin>`, `Content-Type: application/json`

**Body :**
```json
{ "name": "Nouveau nom" }
```

**Réponse 200 OK :** `{ "message": "Catégorie mise à jour avec succès" }`

**Réponse 404 :** `{ "message": "Catégorie introuvable" }`

---

### DELETE `/categories/delete/{id}` — Supprimer une catégorie `[ADMIN]`

**Headers :** `Authorization: Bearer <token admin>`

**Réponse 200 OK :** `{ "message": "Catégorie supprimée avec succès" }`

**Réponse 409 Conflict** (si des produits utilisent cette catégorie) :
```json
{ "message": "Impossible de supprimer : vérifiez si des produits utilisent cette catégorie" }
```

---

## Commandes

### POST `/orders` — Créer une commande

Crée la commande et ses articles en une transaction atomique.

**Headers :** `Content-Type: application/json` (pas d'auth requise)

**Body :**
```json
{
  "first_name": "Marie",
  "last_name": "Konan",
  "email": "marie.konan@email.com",
  "phone": "+225 07 00 00 00",
  "delivery_method": "shipping",
  "shipping_city": "Abidjan",
  "shipping_commune": "Cocody",
  "shipping_address": "Angré 8ème tranche, rue des Jardins",
  "order_note": "Sonner au portail bleu",
  "create_account": false,
  "password": "",
  "items": [
    { "id": 1, "quantity": 2, "price": 5500 },
    { "id": 4, "quantity": 1, "price": 12000 }
  ],
  "total": 23000
}
```

> `delivery_method` : `"shipping"` (livraison à domicile) ou `"pickup"` (retrait magasin)
> Les champs `shipping_*` sont obligatoires uniquement si `delivery_method = "shipping"`
> `price` dans `items` = prix unitaire au moment de la commande (snapshot)

**Réponse 201 Created :**
```json
{
  "message": "Commande validée !",
  "order_id": 87
}
```

---

### GET `/orders` — Liste de toutes les commandes `[ADMIN]`

Retourne toutes les commandes, triées par date décroissante.

**Headers :** aucun requis _(protection admin à ajouter)_

**Réponse 200 OK :**
```json
[
  {
    "id": 87,
    "customer_name": "Marie Konan",
    "total": 23000,
    "status": "pending",
    "created_at": "2026-02-23T14:30:00Z",
    "delivery_method": "shipping"
  }
]
```

---

### GET `/orders/{id}` — Détail d'une commande

Retourne la commande avec ses articles.

**Réponse 200 OK :**
```json
{
  "id": 87,
  "customer_name": "Marie Konan",
  "customer_email": "marie.konan@email.com",
  "customer_phone": "+225 07 00 00 00",
  "total": 23000,
  "status": "pending",
  "delivery_method": "shipping",
  "created_at": "2026-02-23T14:30:00Z",
  "shipping_city": "Abidjan",
  "shipping_address": "Angré 8ème tranche, rue des Jardins",
  "items": [
    { "product_name": "Biberon anti-coliques", "quantity": 2, "unit_price": 5500 },
    { "product_name": "Gigoteuse 0-6 mois",    "quantity": 1, "unit_price": 12000 }
  ]
}
```

**Réponse 404 :** `{ "message": "Commande introuvable" }`

---

### POST `/orders/update/{id}` — Changer le statut `[ADMIN]`

**Headers :** `Authorization: Bearer <token admin>`, `Content-Type: application/json`

**Body :**
```json
{ "status": "livré" }
```

> Valeurs de statut : `"pending"` | `"livré"` | `"annulé"`

**Réponse 200 OK :** `{ "message": "Statut mis à jour" }`

---

### GET `/my-orders` — Mes commandes (client connecté)

Retourne les commandes liées à l'email de l'utilisateur connecté.

**Headers :** `Authorization: Bearer <token>`

**Réponse 200 OK :** même structure que `/orders` (tableau de `OrderSummary`)

**Réponse 401 :** `{ "message": "Token manquant" }`

---

## Articles (Blog)

### GET `/articles` — Liste des articles

Triés par date décroissante.

**Réponse 200 OK :**
```json
[
  {
    "id": 1,
    "title": "5 conseils pour l'allaitement",
    "content": "...",
    "image_url": "https://akwaba-bebe-images.s3.eu-west-3.amazonaws.com/...",
    "created_at": "2026-01-15T10:00:00Z"
  }
]
```

---

### POST `/articles` — Créer un article `[ADMIN]`

**Headers :** `Authorization: Bearer <token admin>`, `Content-Type: application/json`

**Body :**
```json
{
  "title": "Comment choisir le bon biberon",
  "content": "Contenu de l'article...",
  "image_url": "https://akwaba-bebe-images.s3.eu-west-3.amazonaws.com/..."
}
```

**Réponse 201 Created :**
```json
{ "id": 5, "message": "Article créé" }
```

---

## Codes d'erreur — Référence

| Code | Signification |
|---|---|
| `200` | Succès |
| `201` | Ressource créée |
| `400` | Données invalides (body malformé, champ manquant) |
| `401` | Non authentifié (token absent ou expiré) |
| `403` | Interdit (token valide mais pas admin) |
| `404` | Ressource introuvable |
| `409` | Conflit (contrainte FK, doublon) |
| `500` | Erreur serveur interne |

**Format uniforme des erreurs :**
```json
{ "message": "Description en français de l'erreur" }
```

---

## Légende

| Symbole | Signification |
|---|---|
| `[ADMIN]` | Nécessite un token JWT avec `role = "admin"` |
| Pas de symbole | Accessible sans authentification |
