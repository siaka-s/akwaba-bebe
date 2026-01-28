package handlers

import (
	"database/sql"
	"encoding/json"
	"net/http"
)

type CategoryHandler struct {
	DB *sql.DB
}

type CategoryInput struct {
	Name        string `json:"name"`
	Description string `json:"description"`
}

// Créer une catégorie
func (h *CategoryHandler) CreateCategory(w http.ResponseWriter, r *http.Request) {
	var input CategoryInput
	if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
		http.Error(w, "Données invalides", http.StatusBadRequest)
		return
	}

	sqlStatement := `
		INSERT INTO categories (name, description)
		VALUES ($1, $2)
		RETURNING id`

	id := 0
	err := h.DB.QueryRow(sqlStatement, input.Name, input.Description).Scan(&id)
	if err != nil {
		http.Error(w, "Erreur création catégorie: "+err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(map[string]interface{}{"id": id, "message": "Catégorie créée"})
}

// Récupérer les catégories (Utile pour vérifier)
func (h *CategoryHandler) GetAllCategories(w http.ResponseWriter, r *http.Request) {
	rows, err := h.DB.Query("SELECT id, name, description FROM categories")
	if err != nil {
		http.Error(w, "Erreur serveur", http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	var categories []map[string]interface{}
	for rows.Next() {
		var id int
		var name, description string
		if err := rows.Scan(&id, &name, &description); err != nil {
			continue
		}
		categories = append(categories, map[string]interface{}{
			"id": id, "name": name, "description": description,
		})
	}

	if categories == nil {
		categories = []map[string]interface{}{}
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(categories)
}
