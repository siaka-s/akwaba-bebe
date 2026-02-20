package handlers

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"net/http"
	"strings" // Nécessaire pour traiter le Token "Bearer ..."
	"time"

	"akwaba-bebe/backend/internal/models"

	"github.com/golang-jwt/jwt/v5"
	"golang.org/x/crypto/bcrypt"
)

// ⚠️ Clé de signature JWT (En prod : variable d'environnement)
var jwtKey = []byte("ma_cle_secrete_akwaba_2026")

type AuthHandler struct {
	DB *sql.DB
}

// Structure pour la mise à jour du profil (Reçoit Prénom/Nom séparés du Front)
type UpdateProfileRequest struct {
	FirstName string `json:"first_name"`
	LastName  string `json:"last_name"`
	Phone     string `json:"phone"`
}

// Structure pour l'envoi du profil au Front (Sépare le full_name)
type ProfileResponse struct {
	ID        int    `json:"id"`
	FirstName string `json:"first_name"`
	LastName  string `json:"last_name"`
	Email     string `json:"email"`
	Phone     string `json:"phone"`
	Role      string `json:"role"`
}

// --- 1. INSCRIPTION (Signup) ---
// --- 1. INSCRIPTION (Signup) ---
func (h *AuthHandler) Signup(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json") // On prévient le front qu'on envoie du JSON
	var input models.SignupInput

	// Décodage du JSON
	if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(map[string]string{"message": "Données JSON invalides"})
		return
	}

	// Hashage du mot de passe
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(input.Password), bcrypt.DefaultCost)
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(map[string]string{"message": "Erreur interne de sécurité"})
		return
	}

	// Insertion SQL
	sqlStatement := `
        INSERT INTO users (email, password_hash, full_name, phone, role)
        VALUES ($1, $2, $3, $4, 'customer')
        RETURNING id`

	id := 0
	err = h.DB.QueryRow(sqlStatement, input.Email, string(hashedPassword), input.FullName, input.Phone).Scan(&id)

	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		// Ici on envoie la VRAIE erreur pour le debug
		json.NewEncoder(w).Encode(map[string]string{
			"message": fmt.Sprintf("Erreur BDD : %v", err),
		})
		return
	}

	// Réponse Succès en JSON propre
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(map[string]interface{}{
		"message": "Utilisateur créé avec succès",
		"id":      id,
	})
}

// --- 2. CONNEXION (Login) ---
func (h *AuthHandler) Login(w http.ResponseWriter, r *http.Request) {
	var input models.LoginInput

	if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
		http.Error(w, "Données invalides", http.StatusBadRequest)
		return
	}

	// Recherche utilisateur
	var user models.User
	sqlStatement := `SELECT id, email, password_hash, role, full_name FROM users WHERE email=$1`
	row := h.DB.QueryRow(sqlStatement, input.Email)
	err := row.Scan(&user.ID, &user.Email, &user.PasswordHash, &user.Role, &user.FullName)

	if err == sql.ErrNoRows {
		http.Error(w, "Email ou mot de passe incorrect", http.StatusUnauthorized)
		return
	}

	// Vérification Hash Mot de passe
	err = bcrypt.CompareHashAndPassword([]byte(user.PasswordHash), []byte(input.Password))
	if err != nil {
		http.Error(w, "Email ou mot de passe incorrect", http.StatusUnauthorized)
		return
	}

	// Création du Token JWT
	expirationTime := time.Now().Add(24 * time.Hour)
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

	// Réponse JSON
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{
		"token":     tokenString,
		"role":      user.Role,
		"full_name": user.FullName,
	})
}

// GET PROFILE (Récupérer les infos)
func (h *AuthHandler) GetProfile(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	// 1. Validation Token
	userID, err := h.validateRequestToken(r)
	if err != nil {
		http.Error(w, "Non autorisé", http.StatusUnauthorized)
		return
	}

	// Récupération Données BDD
	var fullName, email, phone, role string
	query := `SELECT full_name, email, phone, role FROM users WHERE id=$1`
	err = h.DB.QueryRow(query, userID).Scan(&fullName, &email, &phone, &role)

	if err != nil {
		http.Error(w, "Utilisateur introuvable", http.StatusNotFound)
		return
	}

	// Découpage du Nom Complet pour le Frontend (Prénom / Nom)
	// Si "Jean Kouassi" -> First: Jean, Last: Kouassi
	names := strings.SplitN(fullName, " ", 2)
	firstName := names[0]
	lastName := ""
	if len(names) > 1 {
		lastName = names[1]
	}

	response := ProfileResponse{
		ID:        userID,
		FirstName: firstName,
		LastName:  lastName,
		Email:     email,
		Phone:     phone,
		Role:      role,
	}

	json.NewEncoder(w).Encode(response)
}

// UPDATE PROFILE (Modifier les infos) ---
func (h *AuthHandler) UpdateProfile(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	// Validation Token
	userID, err := h.validateRequestToken(r)
	if err != nil {
		http.Error(w, "Non autorisé", http.StatusUnauthorized)
		return
	}

	// Décodage du body
	var req UpdateProfileRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Données invalides", http.StatusBadRequest)
		return
	}

	// Recombinaison du Nom Complet (BDD attend full_name)
	fullName := strings.TrimSpace(req.FirstName + " " + req.LastName)

	// Mise à jour SQL
	query := `UPDATE users SET full_name=$1, phone=$2 WHERE id=$3`
	_, err = h.DB.Exec(query, fullName, req.Phone, userID)

	if err != nil {
		http.Error(w, "Erreur mise à jour BDD", http.StatusInternalServerError)
		return
	}

	json.NewEncoder(w).Encode(map[string]string{
		"message": "Profil mis à jour avec succès",
	})
}

// ---------------------------------------------------------
// FONCTIONS UTILITAIRES (Privées)
// ---------------------------------------------------------

// Vérifie le token dans la requête et renvoie l'ID utilisateur
func (h *AuthHandler) validateRequestToken(r *http.Request) (int, error) {
	// Extraire "Bearer <token>"
	authHeader := r.Header.Get("Authorization")
	parts := strings.Split(authHeader, " ")
	if len(parts) != 2 || parts[0] != "Bearer" {
		return 0, fmt.Errorf("token absent ou malformé")
	}
	tokenString := parts[1]

	// Parser et Valider le JWT
	claims := &jwt.MapClaims{}
	token, err := jwt.ParseWithClaims(tokenString, claims, func(token *jwt.Token) (interface{}, error) {
		return jwtKey, nil
	})

	if err != nil || !token.Valid {
		return 0, err
	}

	// Extraire l'ID (stocké en float64 par défaut dans le JSON)
	idFloat, ok := (*claims)["user_id"].(float64)
	if !ok {
		return 0, fmt.Errorf("id utilisateur invalide dans le token")
	}

	return int(idFloat), nil
}
