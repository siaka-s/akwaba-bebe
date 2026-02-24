# Coding Rules — Akwaba Bébé

## Règles Absolues

Ces règles sont **non négociables**. Tout code qui les viole doit être corrigé avant merge.

---

## Règles de Workflow

### RÈGLE 0 — Langue : Français

L'application Akwaba Bébé est **principalement en français**. Toutes les chaînes visibles par l'utilisateur (labels, messages d'erreur, toasts, placeholders, boutons) doivent être en français.

```tsx
// ❌ INTERDIT
toast.error("Product not found");
<button>Save</button>

// ✅ CORRECT
toast.error("Produit introuvable");
<button>Enregistrer</button>
```

---

### RÈGLE W1 — Toujours expliquer ses modifications avec des commentaires

Chaque modification non triviale doit être accompagnée d'un commentaire expliquant le **pourquoi**, pas le **quoi**.

```go
// ✅ CORRECT — explique la raison
// Utilisation de make() pour garantir un tableau JSON vide [] et non null
products := make([]models.Product, 0)

// ❌ INUTILE — décrit ce qui est évident
// Création d'un tableau de produits
products := make([]models.Product, 0)
```

```tsx
// ✅ CORRECT — contexte utile
// Protection : l'API peut retourner null si la table est vide
.then(data => setProducts(data || []))
```

---

### RÈGLE W2 — Mettre à jour les fichiers docs/ après chaque changement

Après toute modification qui impacte l'architecture, les endpoints, les tables ou les règles :
- Mettre à jour le fichier `.md` concerné dans `docs/`
- Fichiers concernés selon le type de changement :

| Type de changement | Fichier à mettre à jour |
|---|---|
| Nouvel endpoint API | `docs/api.md` |
| Nouvelle table / colonne | `docs/database.md` |
| Nouveau déploiement / service cloud | `docs/infrastructure.md` |
| Nouvelle règle de code | `docs/coding-rules.md` |
| Nouvelle commande de dev/build | `docs/commands.md` |
| Nouveau composant UI / couleur | `docs/ui-guidelines.md` |

---

### RÈGLE W3 — Demander avant de pousser (git push)

Avant tout `git push` (vers `main` ou une branche distante), **toujours demander confirmation**.
Ne jamais pousser automatiquement, même après un fix urgent.

```
# À chaque fin de session de modifications importantes :
→ "Veux-tu que je pousse ces changements sur GitHub ?"
```

---

---

## Backend Go

### RÈGLE 1 — Toujours retourner du JSON

Le backend doit **systématiquement** retourner du JSON. Jamais de texte brut.

```go
// ❌ INTERDIT — texte brut
http.Error(w, "Erreur serveur", http.StatusInternalServerError)

// ✅ CORRECT — JSON structuré
w.Header().Set("Content-Type", "application/json")
w.WriteHeader(http.StatusInternalServerError)
json.NewEncoder(w).Encode(map[string]string{"message": "Erreur serveur"})
```

**Toujours poser `Content-Type: application/json` AVANT d'écrire le corps :**

```go
func (h *Handler) MyEndpoint(w http.ResponseWriter, r *http.Request) {
    w.Header().Set("Content-Type", "application/json") // ← Ligne 1 obligatoire
    // ...
}
```

---

### RÈGLE 2 — Initialiser les slices avec `make([]T, 0)`

Pour garantir que JSON sérialise `[]` et non `null` quand une liste est vide :

```go
// ❌ INTERDIT — retourne "null" en JSON si vide
var products []models.Product
// ...
json.NewEncoder(w).Encode(products) // → null

// ✅ CORRECT — retourne "[]" en JSON si vide
products := make([]models.Product, 0)
// ...
json.NewEncoder(w).Encode(products) // → []
```

**Alternative acceptable (vérification finale) :**
```go
if products == nil {
    products = []models.Product{}
}
```

La première forme (`make`) est **préférée** car elle évite l'oubli de la vérification.

---

### RÈGLE 3 — Structure standard d'un handler

```go
func (h *XxxHandler) MyEndpoint(w http.ResponseWriter, r *http.Request) {
    // 1. Headers JSON en premier
    w.Header().Set("Content-Type", "application/json")

    // 2. Validation entrée
    var input models.MyInput
    if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
        w.WriteHeader(http.StatusBadRequest)
        json.NewEncoder(w).Encode(map[string]string{"message": "Données invalides"})
        return
    }

    // 3. Logique métier + requête BDD
    result, err := h.DB.QueryRow(...).Scan(...)
    if err == sql.ErrNoRows {
        w.WriteHeader(http.StatusNotFound)
        json.NewEncoder(w).Encode(map[string]string{"message": "Ressource introuvable"})
        return
    }
    if err != nil {
        w.WriteHeader(http.StatusInternalServerError)
        json.NewEncoder(w).Encode(map[string]string{"message": "Erreur serveur"})
        return
    }

    // 4. Réponse succès
    w.WriteHeader(http.StatusOK) // ou 201 pour création
    json.NewEncoder(w).Encode(result)
}
```

---

### RÈGLE 4 — Clé JWT en variable d'environnement

```go
// ❌ INTERDIT — clé hardcodée
var jwtKey = []byte("ma_cle_secrete_akwaba_2026")

// ✅ CORRECT — lue depuis l'environnement
var jwtKey = []byte(os.Getenv("JWT_SECRET"))
```

Et une seule variable `jwtKey` dans tout le projet (actuellement dupliquée dans `auth.go` et `order.go`).

---

### RÈGLE 5 — Transactions pour les opérations multi-tables

Toute opération qui écrit dans plusieurs tables doit utiliser une transaction :

```go
tx, err := h.DB.Begin()
if err != nil { /* erreur */ }

// ... opérations sur tx ...

if err := tx.Commit(); err != nil {
    tx.Rollback()
    /* erreur */
}
```

---

### RÈGLE 6 — Ne jamais exposer les erreurs SQL brutes en production

```go
// ❌ INTERDIT — expose les détails SQL au client
json.NewEncoder(w).Encode(map[string]string{
    "message": fmt.Sprintf("Erreur BDD : %v", err),
})

// ✅ CORRECT — log l'erreur côté serveur, message générique au client
log.Printf("DB error in CreateProduct: %v", err)
json.NewEncoder(w).Encode(map[string]string{"message": "Erreur interne"})
```

> Exception : pendant le développement, les erreurs détaillées sont acceptables. À masquer avant mise en production.

---

## Frontend Next.js / TypeScript

### RÈGLE 7 — Toujours utiliser les template literals pour les URLs API

```tsx
// ❌ INTERDIT — concaténation fragile
fetch(API_URL + "/products/" + id)

// ✅ CORRECT — template literal avec backticks
fetch(`${API_URL}/products/${id}`)
```

**Import obligatoire dans chaque fichier qui appelle l'API :**
```tsx
import { API_URL } from '@/config';
// ou
import { API_URL } from '../../config'; // chemin relatif selon profondeur
```

---

### RÈGLE 8 — Typer les réponses API

```tsx
// ❌ INTERDIT — any implicite
const [products, setProducts] = useState([]);

// ✅ CORRECT — type explicite
interface Product {
  id: number;
  name: string;
  price: number;
  stock_quantity: number;
  image_url: string;
  category_id: number;
  description: string;
}

const [products, setProducts] = useState<Product[]>([]);
```

---

### RÈGLE 9 — Initialiser les listes à `[]` pour éviter les erreurs de rendu

```tsx
// ❌ RISQUE — si l'API retourne null, .map() crash
const [products, setProducts] = useState(null);

// ✅ CORRECT
const [products, setProducts] = useState<Product[]>([]);

// Et au fetch :
.then(data => setProducts(data || []))  // Protection si backend retourne null
```

---

### RÈGLE 10 — Structure standard d'un appel API

```tsx
const [data, setData] = useState<MyType[]>([]);
const [loading, setLoading] = useState(true);
const [error, setError] = useState<string | null>(null);

useEffect(() => {
  fetch(`${API_URL}/endpoint`)
    .then(res => {
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return res.json();
    })
    .then(data => setData(data || []))
    .catch(err => {
      console.error(err);
      setError("Impossible de charger les données.");
      toast.error("Erreur de chargement.");
    })
    .finally(() => setLoading(false));
}, []);
```

---

### RÈGLE 11 — Appels authentifiés

```tsx
const token = localStorage.getItem('token');

fetch(`${API_URL}/my-orders`, {
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
  },
})
```

---

### RÈGLE 12 — Utiliser Shadcn UI et Lucide React pour l'interface

```tsx
// ✅ CORRECT — composants Shadcn
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';

// ✅ CORRECT — icônes Lucide
import { Trash2, Edit, Plus, Search } from 'lucide-react';

// ❌ INTERDIT — créer des boutons/inputs manuellement au lieu de Shadcn
<button className="bg-pink-500 text-white px-4 py-2 rounded">...</button>
```

---

## Conventions de Nommage

### Backend Go

| Élément | Convention | Exemple |
|---|---|---|
| Fichiers | `snake_case.go` | `product_handler.go` |
| Types/Structs | `PascalCase` | `ProductHandler` |
| Fonctions | `PascalCase` | `GetAllProducts` |
| Variables locales | `camelCase` | `orderID` |
| Colonnes SQL | `snake_case` | `stock_quantity` |
| JSON fields | `snake_case` | `"image_url"` |

### Frontend TypeScript

| Élément | Convention | Exemple |
|---|---|---|
| Fichiers composant | `PascalCase.tsx` | `ProductCard.tsx` |
| Fichiers page | `page.tsx` | `page.tsx` |
| Variables/fonctions | `camelCase` | `handleSubmit` |
| Types/Interfaces | `PascalCase` | `interface Product` |
| Constantes | `UPPER_SNAKE_CASE` | `API_URL` |

---

## Gestion des Erreurs — Référence Rapide

### Codes HTTP à utiliser

| Situation | Code |
|---|---|
| Succès (lecture) | `200 OK` |
| Création réussie | `201 Created` |
| Données invalides | `400 Bad Request` |
| Non authentifié | `401 Unauthorized` |
| Interdit (pas admin) | `403 Forbidden` |
| Ressource introuvable | `404 Not Found` |
| Conflit (ex: FK constraint) | `409 Conflict` |
| Erreur serveur | `500 Internal Server Error` |

### Format de réponse d'erreur

```json
{ "message": "Description claire de l'erreur" }
```

### Format de réponse de succès

```json
{ "message": "Opération réussie", "id": 42 }
// ou directement la ressource :
{ "id": 1, "name": "Produit", ... }
```
