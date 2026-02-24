# Infrastructure — Akwaba Bébé

## Architecture Globale

```
┌─────────────────────────────────────────────────────────┐
│                        CLIENT                           │
│                    (Navigateur Web)                     │
└───────────────────────────┬─────────────────────────────┘
                            │ HTTPS
                            ▼
┌─────────────────────────────────────────────────────────┐
│                    VERCEL (Frontend)                    │
│               Next.js 16 / React 19                     │
│         NEXT_PUBLIC_API_URL → AWS App Runner            │
└───────────────────────────┬─────────────────────────────┘
                            │ HTTP REST (JSON)
                            ▼
┌─────────────────────────────────────────────────────────┐
│              AWS APP RUNNER (Backend)                   │
│                   Go API — Port 8080                    │
│             Image Docker multi-étapes                   │
│      (golang:1.25.4-alpine builder → alpine:latest)     │
└──────────────┬────────────────────────┬─────────────────┘
               │ database/sql           │ aws-sdk-go-v2
               ▼                        ▼
┌──────────────────────┐   ┌────────────────────────────┐
│  AWS RDS (PostgreSQL)│   │       AWS S3               │
│  Connexion via       │   │  Bucket: akwaba-bebe-images │
│  DATABASE_URL        │   │  Région: eu-west-3          │
│  Pool: 25 max conns  │   │  Chemin: products/{ts}.ext  │
│  Lifetime: 5 min     │   │  Accès: URL publique        │
└──────────────────────┘   └────────────────────────────┘
```

---

## Composants

### Frontend — Vercel

| Paramètre | Valeur |
|---|---|
| Framework | Next.js 16.1.5 |
| Runtime | React 19.2.3 |
| Language | TypeScript 5 |
| Styling | Tailwind CSS v4 |
| Build command | `npm run build` |
| Variable d'env | `NEXT_PUBLIC_API_URL` |

### Backend — AWS App Runner

| Paramètre | Valeur |
|---|---|
| Language | Go 1.25.4 |
| Port exposé | `8080` |
| Base HTTP | `net/http` (stdlib) |
| Déploiement | Dockerfile multi-étapes |
| Variables d'env | `DATABASE_URL`, `AWS_REGION`, `AWS_BUCKET_NAME` |

**Dockerfile build process :**
```
Stage 1 (builder) : golang:1.25.4-alpine
  → go mod download
  → CGO_ENABLED=0 GOOS=linux go build -o main ./cmd/api/main.go

Stage 2 (run) : alpine:latest
  → COPY --from=builder /app/main .
  → EXPOSE 8080
  → CMD ["./main"]
```

### Base de Données — AWS RDS PostgreSQL

| Paramètre | Valeur |
|---|---|
| Moteur | PostgreSQL |
| Connexion | `DATABASE_URL` (env var) |
| Local dev | `localhost:5432` / db: `akwaba_db` / user: `siahouesiaka` |
| Max open conns | 25 |
| Max idle conns | 25 |
| Max conn lifetime | 5 minutes |

### Stockage Fichiers — AWS S3

| Paramètre | Valeur |
|---|---|
| Bucket | `akwaba-bebe-images` |
| Région | `eu-west-3` (Paris) |
| SDK | `aws-sdk-go-v2` |
| Dossier | `products/{UnixNano}.{ext}` |
| URL publique | `https://akwaba-bebe-images.s3.eu-west-3.amazonaws.com/products/...` |
| Taille max upload | 10 MB |

---

## Flux Image S3

L'upload d'image passe **toujours par le backend**. Le frontend n'accède jamais directement à S3.

```
Frontend                   Backend Go              AWS S3
   │                           │                      │
   │  POST /upload             │                      │
   │  (multipart/form-data)    │                      │
   │──────────────────────────>│                      │
   │                           │  PutObject()         │
   │                           │─────────────────────>│
   │                           │                      │
   │                           │  { url: "https://…" }│
   │  { "url": "https://…" }   │<─────────────────────│
   │<──────────────────────────│                      │
   │                           │                      │
   │  POST /products           │                      │
   │  { ..., image_url: url }  │                      │
   │──────────────────────────>│                      │
   │                           │  INSERT INTO products│
   │                           │  (image_url = url)   │
```

**Règle absolue :** Seule l'URL finale S3 est stockée en base de données. Jamais le fichier binaire.

---

## Variables d'Environnement

### Backend (`.env` local / App Runner env)

```env
DATABASE_URL=postgres://user:password@host:5432/dbname

AWS_REGION=eu-west-3
AWS_BUCKET_NAME=akwaba-bebe-images
# Credentials AWS : via IAM Role App Runner (prod) ou AWS_ACCESS_KEY_ID / AWS_SECRET_ACCESS_KEY (dev)
```

### Frontend (`.env.local` local / Vercel env)

```env
NEXT_PUBLIC_API_URL=https://votre-service.awsapprunner.com
```

> En développement local : `NEXT_PUBLIC_API_URL=http://localhost:8080`

---

## CORS

Le middleware CORS du backend (`main.go`) autorise :
- Toutes les origines si `Origin` header présent (mode développement permissif)
- Méthodes autorisées : `GET, POST, PUT, DELETE, OPTIONS`
- Headers autorisés : `Accept, Content-Type, Content-Length, Authorization`

> **À restreindre en production** aux domaines Vercel explicites.

---

## Authentification

| Mécanisme | Détails |
|---|---|
| Type | JWT (HS256) |
| Durée | 24 heures |
| Claims | `user_id`, `role`, `exp` |
| Transport | Header `Authorization: Bearer <token>` |
| Stockage client | `localStorage` (token, user_role, user_name) |
| Clé de signature | Variable d'env `JWT_SECRET` (**⚠️ à externaliser**) |
