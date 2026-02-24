# Commands — Akwaba Bébé

## Développement Local

### Prérequis

- Go 1.25.4+
- Node.js 20+
- PostgreSQL (local)
- AWS CLI configuré (pour S3 en dev)

---

### Backend Go

```bash
# Depuis la racine du projet
cd backend

# Installer les dépendances Go
go mod download

# Lancer le serveur en développement (port 8080)
go run ./cmd/api/main.go

# Build du binaire
go build -o main ./cmd/api/main.go

# Lancer le binaire compilé
./main

# Vérifier les dépendances et nettoyer go.mod
go mod tidy

# Lancer les tests (quand ils existent)
go test ./...
```

**Variables d'environnement requises** (créer `backend/.env`) :
```env
DATABASE_URL=postgres://siahouesiaka@localhost:5432/akwaba_db?sslmode=disable

AWS_REGION=eu-west-3
AWS_BUCKET_NAME=akwaba-bebe-images
# En dev local avec profil AWS CLI :
# AWS_PROFILE=default  (ou AWS_ACCESS_KEY_ID + AWS_SECRET_ACCESS_KEY)
```

---

### Frontend Next.js

```bash
# Depuis la racine du projet
cd frontend

# Installer les dépendances npm
npm install

# Lancer en développement (port 3000, hot-reload)
npm run dev

# Build de production
npm run build

# Lancer le build de production localement
npm run start

# Linter
npm run lint
```

**Variables d'environnement requises** (créer `frontend/.env.local`) :
```env
NEXT_PUBLIC_API_URL=http://localhost:8080
```

---

### Base de Données PostgreSQL (Local)

```bash
# Créer la base de données locale
createdb akwaba_db

# Se connecter à la BDD
psql -d akwaba_db

# Créer les tables (exécuter dans psql ou via fichier SQL)
psql -d akwaba_db -f docs/schema.sql

# Lister les tables
\dt

# Quitter psql
\q

# Ajouter un utilisateur admin manuellement
psql -d akwaba_db -c "UPDATE users SET role='admin' WHERE email='ton@email.com';"
```

---

### Lancement simultané (dev full-stack)

```bash
# Terminal 1 — Backend
cd backend && go run ./cmd/api/main.go

# Terminal 2 — Frontend
cd frontend && npm run dev
```

Le frontend sera accessible sur [http://localhost:3000](http://localhost:3000)
Le backend sera accessible sur [http://localhost:8080](http://localhost:8080)

---

## Docker

### Build de l'image Backend

```bash
cd backend

# Build de l'image
docker build -t akwaba-bebe-backend .

# Lancer le container (avec variables d'env)
docker run -p 8080:8080 \
  -e DATABASE_URL="postgres://user:pass@host:5432/akwaba_db" \
  -e AWS_REGION="eu-west-3" \
  -e AWS_BUCKET_NAME="akwaba-bebe-images" \
  akwaba-bebe-backend
```

---

## Déploiement Production

### Backend — AWS App Runner

```bash
# Push de l'image vers ECR (AWS Container Registry)
aws ecr get-login-password --region eu-west-3 | \
  docker login --username AWS --password-stdin <account-id>.dkr.ecr.eu-west-3.amazonaws.com

docker tag akwaba-bebe-backend:latest \
  <account-id>.dkr.ecr.eu-west-3.amazonaws.com/akwaba-bebe-backend:latest

docker push <account-id>.dkr.ecr.eu-west-3.amazonaws.com/akwaba-bebe-backend:latest

# App Runner se redéploie automatiquement si configuré sur push ECR
```

**Variables d'environnement à configurer dans App Runner :**
```
DATABASE_URL      = postgres://user:pass@rds-endpoint:5432/akwaba_db
AWS_REGION        = eu-west-3
AWS_BUCKET_NAME   = akwaba-bebe-images
JWT_SECRET        = <valeur secrète forte>
```

### Frontend — Vercel

```bash
# Via CLI Vercel
npm install -g vercel
vercel deploy --prod

# Ou via git push sur la branche connectée à Vercel (automatique)
git push origin main
```

**Variables d'environnement à configurer dans Vercel :**
```
NEXT_PUBLIC_API_URL = https://<service>.awsapprunner.com
```

---

## Utilitaires

### Tester les endpoints API (curl)

```bash
# Sanity check
curl http://localhost:8080/products

# Login
curl -X POST http://localhost:8080/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@test.com","password":"motdepasse"}'

# Créer un produit (avec token admin)
curl -X POST http://localhost:8080/products \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{"name":"Biberon","description":"...","price":5000,"stock_quantity":20,"image_url":"https://...","category_id":1}'

# Upload image
curl -X POST http://localhost:8080/upload \
  -F "file=@/chemin/vers/image.jpg"

# Mes commandes
curl http://localhost:8080/my-orders \
  -H "Authorization: Bearer <token>"
```

### Go — Commandes utiles

```bash
# Afficher les dépendances directes
go list -m all

# Mettre à jour une dépendance
go get github.com/golang-jwt/jwt/v5@latest

# Vérifier le code (vet)
go vet ./...

# Formater le code
gofmt -w .
```

### npm — Commandes utiles

```bash
# Ajouter une dépendance
npm install <package>

# Ajouter Shadcn UI
npx shadcn@latest init
npx shadcn@latest add button input card badge dialog select table

# Vérifier les dépendances obsolètes
npm outdated

# Audit de sécurité
npm audit
```
