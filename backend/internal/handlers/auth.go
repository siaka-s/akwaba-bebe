package handlers

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"net/http"
	"time"

	"akwaba-bebe/backend/internal/models"

	"github.com/golang-jwt/jwt/v5"
	"golang.org/x/crypto/bcrypt"
)

// ⚠️ En prod, mets ça dans une variable d'environnement !
var jwtKey = []byte("ma_cle_secrete_akwaba_2026")

type AuthHandler struct {
	DB *sql.DB
}

// INSCRIPTION
func (h *AuthHandler) Signup(w http.ResponseWriter, r *http.Request) {
	var input models.SignupInput

	// Lire  JSON reçu
	if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
		http.Error(w, "Données invalides", http.StatusBadRequest)
		return
	}

	// Crypter le mot de passe
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(input.Password), bcrypt.DefaultCost)
	if err != nil {
		http.Error(w, "Erreur serveur", http.StatusInternalServerError)
		return
	}

	// Insérer dans la base (Rôle par défaut = 'customer')
	sqlStatement := `
		INSERT INTO users (email, password_hash, full_name, phone, role)
		VALUES ($1, $2, $3, $4, 'customer')
		RETURNING id`

	id := 0
	err = h.DB.QueryRow(sqlStatement, input.Email, string(hashedPassword), input.FullName, input.Phone).Scan(&id)
	if err != nil {
		// Si l'erreur contient "unique constraint", c'est que l'email existe déjà
		http.Error(w, "Cet email est déjà utilisé", http.StatusConflict)
		return
	}

	w.WriteHeader(http.StatusCreated)
	fmt.Fprintf(w, `{"message": "Utilisateur créé avec succès", "id": %d}`, id)
}

// CONNEXION
func (h *AuthHandler) Login(w http.ResponseWriter, r *http.Request) {
	var input models.LoginInput

	// 1. Lire le JSON
	if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
		http.Error(w, "Données invalides", http.StatusBadRequest)
		return
	}

	// 2. Chercher l'utilisateur par email
	var user models.User
	sqlStatement := `SELECT id, email, password_hash, role, full_name FROM users WHERE email=$1`
	row := h.DB.QueryRow(sqlStatement, input.Email)
	err := row.Scan(&user.ID, &user.Email, &user.PasswordHash, &user.Role, &user.FullName)

	if err == sql.ErrNoRows {
		http.Error(w, "Email ou mot de passe incorrect", http.StatusUnauthorized)
		return
	}

	// Vérifier le mot de passe (Comparaison du Hash)
	err = bcrypt.CompareHashAndPassword([]byte(user.PasswordHash), []byte(input.Password))
	if err != nil {
		http.Error(w, "Email ou mot de passe incorrect", http.StatusUnauthorized)
		return
	}

	// Créer le Token JWT (Le Badge d'accès)
	expirationTime := time.Now().Add(24 * time.Hour) // Valable 24 heures
	claims := &jwt.MapClaims{
		"user_id": user.ID,
		"role":    user.Role,
		"exp":     expirationTime.Unix(),
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	tokenString, err := token.SignedString(jwtKey)
	if err != nil {
		http.Error(w, "Erreur génération token", http.StatusInternalServerError)
		return
	}

	// Envoyer le token au client
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{
		"token":     tokenString,
		"role":      user.Role,
		"full_name": user.FullName,
	})
}
