package middleware

import (
	"encoding/json"
	"net/http"
	"strings"

	"akwaba-bebe/backend/internal/config"

	"github.com/golang-jwt/jwt/v5"
)

// jwtKey utilise config.JWTKey() — source unique partagée avec auth.go et order.go.
// Ne plus jamais définir la clé en dur dans ce fichier.
var jwtKey = config.JWTKey()

// IsAdmin vérifie que la requête contient un token JWT valide avec le rôle "admin".
// Toutes les réponses d'erreur sont en JSON (règle absolue du projet).
func IsAdmin(next http.HandlerFunc) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")

		// Vérification de la présence du header Authorization
		authHeader := r.Header.Get("Authorization")
		if authHeader == "" {
			w.WriteHeader(http.StatusUnauthorized)
			json.NewEncoder(w).Encode(map[string]string{"message": "Authentification requise"})
			return
		}

		// Format attendu : "Bearer <token>" — on extrait uniquement le token
		tokenString := strings.TrimPrefix(authHeader, "Bearer ")

		// Validation du JWT avec la clé partagée
		claims := jwt.MapClaims{}
		token, err := jwt.ParseWithClaims(tokenString, claims, func(token *jwt.Token) (interface{}, error) {
			return jwtKey, nil
		})

		if err != nil || !token.Valid {
			w.WriteHeader(http.StatusUnauthorized)
			json.NewEncoder(w).Encode(map[string]string{"message": "Token invalide ou expiré"})
			return
		}

		// Vérification du rôle — seul "admin" est autorisé à continuer
		role, ok := claims["role"].(string)
		if !ok || role != "admin" {
			w.WriteHeader(http.StatusForbidden)
			json.NewEncoder(w).Encode(map[string]string{"message": "Accès refusé : réservé aux administrateurs"})
			return
		}

		// Token valide et rôle admin confirmé — on laisse passer la requête
		next(w, r)
	}
}
