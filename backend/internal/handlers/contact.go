package handlers

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"net/http"
	"strings"

	"akwaba-bebe/backend/internal/models"
)

type ContactHandler struct {
	DB *sql.DB
}

// POST /contact — Envoyer un message (public)
func (h *ContactHandler) CreateMessage(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	if r.Method != http.MethodPost {
		w.WriteHeader(http.StatusMethodNotAllowed)
		return
	}

	var body struct {
		FullName string `json:"full_name"`
		Email    string `json:"email"`
		Subject  string `json:"subject"`
		Message  string `json:"message"`
	}

	if err := json.NewDecoder(r.Body).Decode(&body); err != nil {
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(map[string]string{"message": "Corps de requête invalide"})
		return
	}

	if body.FullName == "" || body.Email == "" || body.Subject == "" || body.Message == "" {
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(map[string]string{"message": "Tous les champs sont requis"})
		return
	}

	_, err := h.DB.Exec(
		`INSERT INTO contact_messages (full_name, email, subject, message) VALUES ($1, $2, $3, $4)`,
		body.FullName, body.Email, body.Subject, body.Message,
	)
	if err != nil {
		fmt.Printf("Erreur INSERT contact_messages: %v\n", err)
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(map[string]string{"message": "Erreur serveur"})
		return
	}

	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(map[string]string{"message": "Message envoyé avec succès"})
}

// GET /contact — Liste des messages [ADMIN]
func (h *ContactHandler) GetMessages(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	messages := make([]models.ContactMessage, 0)

	rows, err := h.DB.Query(
		`SELECT id, full_name, email, subject, message, is_read, created_at FROM contact_messages ORDER BY created_at DESC`,
	)
	if err != nil {
		fmt.Printf("Erreur SELECT contact_messages: %v\n", err)
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(map[string]string{"message": "Erreur serveur"})
		return
	}
	defer rows.Close()

	for rows.Next() {
		var m models.ContactMessage
		if err := rows.Scan(&m.ID, &m.FullName, &m.Email, &m.Subject, &m.Message, &m.IsRead, &m.CreatedAt); err != nil {
			fmt.Printf("Erreur Scan contact_messages: %v\n", err)
			continue
		}
		messages = append(messages, m)
	}

	json.NewEncoder(w).Encode(messages)
}

// PATCH /contact/{id}/read — Marquer comme lu [ADMIN]
func (h *ContactHandler) MarkAsRead(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	// Extraire l'ID depuis /contact/{id}/read
	path := strings.TrimPrefix(r.URL.Path, "/contact/")
	path = strings.TrimSuffix(path, "/read")
	id := strings.TrimSpace(path)

	if id == "" {
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(map[string]string{"message": "ID requis"})
		return
	}

	result, err := h.DB.Exec(`UPDATE contact_messages SET is_read = TRUE WHERE id = $1`, id)
	if err != nil {
		fmt.Printf("Erreur UPDATE contact_messages: %v\n", err)
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(map[string]string{"message": "Erreur serveur"})
		return
	}

	rows, _ := result.RowsAffected()
	if rows == 0 {
		w.WriteHeader(http.StatusNotFound)
		json.NewEncoder(w).Encode(map[string]string{"message": "Message introuvable"})
		return
	}

	json.NewEncoder(w).Encode(map[string]string{"message": "Message marqué comme lu"})
}
