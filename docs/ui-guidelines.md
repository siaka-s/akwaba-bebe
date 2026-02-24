# UI Guidelines — Akwaba Bébé

## Stack UI

| Outil | Version | Rôle |
|---|---|---|
| Tailwind CSS | v4 | Styling utility-first |
| Shadcn UI | À intégrer | Composants accessibles (base Radix UI) |
| Lucide React | 0.563.0 | Icônes SVG |
| react-hot-toast | 2.6.0 | Notifications toast |

---

## Palette de Couleurs

Source officielle : [frontend/app/globals.css](../frontend/app/globals.css) — Variables CSS Tailwind v4

### Couleur Primaire — Vert Émeraude

Couleur d'action principale (boutons, liens actifs, focus rings).

| Token | Valeur hex | Usage |
|---|---|---|
| `primary-50` | `#f0fdf4` | Fond très léger, hover subtil |
| `primary-100` | `#dcfce7` | Fond badge succès |
| `primary-500` | `#007D5A` | **Couleur principale — boutons, icônes actives** |
| `primary-600` | `#006b4c` | Hover des boutons primaires |
| `primary-700` | `#00593e` | Actif / pressed |
| `primary-900` | `#003522` | Titres sur fond clair |

### Couleur Secondaire — Jaune Doré

Accents, badges promotionnels, call-to-action secondaires.

| Token | Valeur hex | Usage |
|---|---|---|
| `secondary-50` | `#fffbeb` | Fond notice/info |
| `secondary-500` | `#FFC727` | **Couleur secondaire — badges, accents** |
| `secondary-600` | `#e6b323` | Hover badges secondaires |

### Couleur Accent — Rose

Touches féminines, éléments de marque, catégories spéciales.

| Token | Valeur hex | Usage |
|---|---|---|
| `accent-50` | `#fdf2f8` | Fond général de l'app |
| `accent-500` | `#ec4899` | Accents roses (ancienne couleur primaire) |
| `accent-600` | `#db2777` | Hover accent |

### Dégradés Officiels

```css
/* Dégradé Akwaba — utilisé pour les hero sections et bannières */
background: linear-gradient(135deg, #007D5A 0%, #FFC727 100%);

/* Dégradé Féminin — pour les sections spéciales */
background: linear-gradient(135deg, #007D5A 0%, #ec4899 50%, #FFC727 100%);
```

### Couleurs Système

| Usage | Token Tailwind |
|---|---|
| Fond général | `bg-accent-50` / `bg-gray-50` |
| Texte principal | `text-gray-800` |
| Texte secondaire | `text-gray-500` |
| Bordures | `border-gray-200` |
| Fond carte | `bg-white` |
| Erreur | `text-red-600` / `bg-red-50` |
| Succès | `text-emerald-600` / `bg-emerald-50` |

### Usage dans le code

```tsx
// ✅ CORRECT — utiliser les tokens du thème
<button className="bg-primary-500 hover:bg-primary-600 text-white">
  Ajouter au panier
</button>

<span className="bg-secondary-500 text-white px-2 py-1 rounded">
  Promotion
</span>

// Dégradé Akwaba — Tailwind v4 : bg-linear-to-br (et non bg-gradient-to-br)
<div className="bg-linear-to-br from-primary-500 to-secondary-500">
```

---

## Plan de Migration Shadcn UI

L'intégration de Shadcn se fait **page par page**, sans tout réécrire d'un coup.

### Étape 1 — Installation (à faire une seule fois)

```bash
cd frontend
npx shadcn@latest init
# Choisir : TypeScript, app/ router, Tailwind CSS
# Choisir la couleur de base : "green" (correspond à notre primary-500)
```

Ajouter les composants au fur et à mesure :

```bash
npx shadcn@latest add button input label card badge dialog select table textarea
```

### Étape 2 — Configurer les couleurs Shadcn avec notre thème

Dans `frontend/components/ui/button.tsx` (généré par shadcn), les classes `bg-primary` utilisent la variable CSS `--primary`. La faire correspondre à notre `primary-500` dans `globals.css` :

```css
/* À ajouter dans globals.css dans @layer base */
:root {
  --primary: 160 100% 24%;          /* #007D5A en HSL */
  --primary-foreground: 0 0% 100%;  /* Blanc */
}
```

### Étape 3 — Ordre de migration recommandé

| Priorité | Page | Composants à migrer |
|---|---|---|
| 1 | `/admin/categories` | `Button`, `Input`, `Card`, `Table`, `Badge`, `Dialog` |
| 2 | `/admin/products` | `Button`, `Input`, `Table`, `Badge` |
| 3 | `/admin/products/add` & `/edit` | `Button`, `Input`, `Label`, `Textarea`, `Select` |
| 4 | `/admin/orders` | `Table`, `Badge`, `Dialog` |
| 5 | `/login` & `/signup` | `Button`, `Input`, `Label`, `Card` |
| 6 | `/profil` | `Button`, `Input`, `Label`, `Card` |
| 7 | `/produits` | `Badge`, `Button`, `Card` |
| 8 | `/checkout` | `Button`, `Input`, `Label`, `Select`, `Textarea` |

> **Règle** : Migrer une page complètement avant de passer à la suivante.

---

## Composants Shadcn UI (à utiliser)

Shadcn UI doit être utilisé pour tous les composants d'interface. Installer via :

```bash
npx shadcn@latest init
npx shadcn@latest add button input label card badge dialog select table
```

### Règles d'utilisation Shadcn

- Utiliser `<Button>` Shadcn plutôt que des `<button>` Tailwind manuels
- Utiliser `<Input>` et `<Label>` pour tous les champs de formulaire
- Utiliser `<Card>`, `<CardHeader>`, `<CardContent>` pour les blocs d'information
- Utiliser `<Badge>` pour les statuts (commandes, stock)
- Utiliser `<Dialog>` pour les modales de confirmation (suppression, détails)
- Utiliser `<Select>` pour les dropdowns (catégories, statuts)
- Utiliser `<Table>`, `<TableHeader>`, `<TableRow>` pour les listes admin

---

## Icônes — Lucide React

Toujours importer depuis `lucide-react`. Ne pas utiliser d'autres librairies d'icônes.

```tsx
import { ShoppingCart, Package, Trash2, Edit, Plus, Search, ChevronDown } from 'lucide-react';
```

### Icônes par contexte

| Contexte | Icône |
|---|---|
| Panier | `ShoppingCart` |
| Produit | `Package` |
| Supprimer | `Trash2` |
| Modifier | `Edit` / `Pencil` |
| Ajouter | `Plus` |
| Recherche | `Search` |
| Commande | `ClipboardList` |
| Livraison | `Truck` |
| Utilisateur | `User` |
| Admin | `Shield` |
| Succès | `CheckCircle` |
| Erreur | `XCircle` |
| Chargement | `Loader2` (avec `animate-spin`) |

---

## Notifications Toast

Utiliser `react-hot-toast` (déjà configuré dans `app/layout.tsx`).

```tsx
import toast from 'react-hot-toast';

// Succès
toast.success("Produit ajouté au panier !");

// Erreur
toast.error("Une erreur est survenue.");

// Toast personnalisé (avec action)
toast((t) => (
  <div className="flex items-center gap-2">
    <CheckCircle className="text-green-500" size={16} />
    <span>Commande validée !</span>
    <button onClick={() => toast.dismiss(t.id)}>×</button>
  </div>
), { duration: 4000 });
```

**Configuration globale** (ne pas modifier, déjà dans `layout.tsx`) :
- Position : `top-center`
- Durée : `4000ms`
- Style succès : fond `#ecfdf5`, texte vert
- Style erreur : fond `#fef2f2`, texte rouge

---

## Layout & Responsive

### Breakpoints Tailwind v4

| Breakpoint | Largeur |
|---|---|
| `sm` | 640px |
| `md` | 768px |
| `lg` | 1024px |
| `xl` | 1280px |

### Grilles Produits

```tsx
// Catalogue produits
<div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">

// Dashboard admin
<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
```

### Conteneur principal

```tsx
<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
```

---

## Patterns de Pages

### Page avec chargement

```tsx
const [loading, setLoading] = useState(true);

if (loading) return (
  <div className="flex justify-center items-center min-h-64">
    <Loader2 className="animate-spin text-pink-500" size={32} />
  </div>
);
```

### Page protégée (auth requise)

```tsx
useEffect(() => {
  const token = localStorage.getItem('token');
  if (!token) {
    router.push('/login');
    return;
  }
  // ... fetch data
}, []);
```

### Bouton de suppression avec confirmation

```tsx
// Utiliser un toast de confirmation plutôt qu'un window.confirm
const handleDelete = (id: number) => {
  toast((t) => (
    <div>
      <p>Supprimer ce produit ?</p>
      <div className="flex gap-2 mt-2">
        <button
          onClick={() => { confirmDelete(id); toast.dismiss(t.id); }}
          className="bg-red-500 text-white px-3 py-1 rounded"
        >
          Supprimer
        </button>
        <button onClick={() => toast.dismiss(t.id)}>Annuler</button>
      </div>
    </div>
  ), { duration: Infinity });
};
```

---

## Badges de Statut Commande

```tsx
const statusConfig = {
  pending:  { label: 'En attente',  class: 'bg-yellow-100 text-yellow-800' },
  livré:    { label: 'Livré',       class: 'bg-green-100 text-green-800'  },
  annulé:   { label: 'Annulé',      class: 'bg-red-100 text-red-800'     },
};

<span className={`px-2 py-1 rounded-full text-xs font-medium ${statusConfig[order.status]?.class}`}>
  {statusConfig[order.status]?.label}
</span>
```

---

## Formatage des Prix

Toujours formater en FCFA (Francs CFA) :

```tsx
const formatPrice = (amount: number) =>
  new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'XOF',
    minimumFractionDigits: 0,
  }).format(amount);

// Usage : formatPrice(5000) → "5 000 F CFA"
```

---

## Structure d'une Page Admin

```tsx
export default function AdminPage() {
  return (
    <div className="p-6">
      {/* En-tête */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Titre</h1>
        <Button onClick={...}>
          <Plus size={16} className="mr-2" />
          Ajouter
        </Button>
      </div>

      {/* Barre de recherche */}
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
        <Input className="pl-9" placeholder="Rechercher..." onChange={...} />
      </div>

      {/* Table */}
      <Card>
        <Table>
          <TableHeader>...</TableHeader>
          <TableBody>...</TableBody>
        </Table>
      </Card>
    </div>
  );
}
```

---

## Accessibilité

- Tous les `<input>` doivent avoir un `<label>` associé via `htmlFor`
- Utiliser `aria-label` sur les boutons icône seuls (ex: bouton supprimer)
- Les images produit doivent avoir un `alt` descriptif
- Contraste minimum : ratio 4.5:1 (respecté par la palette ci-dessus)
