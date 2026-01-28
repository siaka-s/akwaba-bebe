package middleware

import (
	"net/http"
	"strings"

	"github.com/golang-jwt/jwt/v5"
)

var jwtKey = []byte("ma_cle_secrete_akwaba_2026") // meme que handlers/auth.go

// verifie si le token est valide ET si 'admin'
func IsAdmin(next http.HandlerFunc) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {

		// Récupérer le token dans le Header Authorization
		authHeader := r.Header.Get("Authorization")
		if authHeader == "" {
			http.Error(w, "Token manquant", http.StatusUnauthorized)
			return
		}

		// Le header arrive sous la forme "Bearer eyJhbGciOi..."
		// On enlève le "Bearer " pour garder juste le code
		tokenString := strings.TrimPrefix(authHeader, "Bearer ")

		// Décoder et vérifier le token
		claims := jwt.MapClaims{}
		token, err := jwt.ParseWithClaims(tokenString, claims, func(token *jwt.Token) (interface{}, error) {
			return jwtKey, nil
		})

		if err != nil || !token.Valid {
			http.Error(w, "Token invalide", http.StatusUnauthorized)
			return
		}

		// Vérifier le Rôle
		role, ok := claims["role"].(string)
		if !ok || role != "admin" {
			http.Error(w, "Accès refusé : Réservé aux administrateurs", http.StatusForbidden)
			return
		}

		// 4. Tout est bon, on laisse passer
		next(w, r)
	}
}
