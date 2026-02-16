# --- Phase de construction (Build) ---
FROM golang:1.25.4-alpine AS builder

# Installation des dépendances système nécessaires
RUN apk add --no-cache git

WORKDIR /app

# Gestion des dépendances Go
COPY go.mod go.sum ./
RUN go mod download

# Copie du code source et compilation
COPY . .
RUN CGO_ENABLED=0 GOOS=linux go build -o main ./cmd/api/main.go

# --- Phase d'exécution (Run) ---
FROM alpine:latest
RUN apk --no-cache add ca-certificates

WORKDIR /root/

# Récupération du binaire compilé depuis l'étape de build
COPY --from=builder /app/main .

# Port d'écoute standard pour App Runner
EXPOSE 8080

# Lancement de l'application
CMD ["./main"]