package handlers

import (
	"akwaba-bebe/backend/internal/models"
	"database/sql"
	"encoding/json"
	"net/http" // Pour convertir les ID string en int
)

type CategoryHandler struct {
	DB *sql.DB
}

// 1. LIRE (GET) - Déjà existant normalement
func (h *CategoryHandler) GetCategories(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	rows, err := h.DB.Query("SELECT id, name FROM categories ORDER BY id ASC")
	if err != nil {
		http.Error(w, "Erreur serveur", http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	var categories []models.Category
	for rows.Next() {
		var c models.Category
		if err := rows.Scan(&c.ID, &c.Name); err == nil {
			categories = append(categories, c)
		}
	}
	json.NewEncoder(w).Encode(categories)
}

// 2. CRÉER (POST)
func (h *CategoryHandler) CreateCategory(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	var c models.Category
	if err := json.NewDecoder(r.Body).Decode(&c); err != nil {
		http.Error(w, "Données invalides", http.StatusBadRequest)
		return
	}

	err := h.DB.QueryRow("INSERT INTO categories (name) VALUES ($1) RETURNING id", c.Name).Scan(&c.ID)
	if err != nil {
		http.Error(w, "Erreur création", http.StatusInternalServerError)
		return
	}
	json.NewEncoder(w).Encode(c)
}

// 3. MODIFIER (PUT)
func (h *CategoryHandler) UpdateCategory(w http.ResponseWriter, r *http.Request) {
	// Récupérer l'ID depuis l'URL /categories/update/1
	idStr := r.URL.Path[len("/categories/update/"):]

	var c models.Category
	if err := json.NewDecoder(r.Body).Decode(&c); err != nil {
		http.Error(w, "Données invalides", http.StatusBadRequest)
		return
	}

	_, err := h.DB.Exec("UPDATE categories SET name = $1 WHERE id = $2", c.Name, idStr)
	if err != nil {
		http.Error(w, "Erreur modification", http.StatusInternalServerError)
		return
	}
	json.NewEncoder(w).Encode(map[string]string{"message": "Catégorie mise à jour"})
}

// 4. SUPPRIMER (DELETE)
func (h *CategoryHandler) DeleteCategory(w http.ResponseWriter, r *http.Request) {
	// Récupérer l'ID depuis l'URL /categories/delete/1
	idStr := r.URL.Path[len("/categories/delete/"):]

	// Attention : Si des produits sont liés, ça peut planter selon ta BDD.
	// Idéalement, il faut gérer ça, mais restons simple pour l'instant.
	_, err := h.DB.Exec("DELETE FROM categories WHERE id = $1", idStr)
	if err != nil {
		http.Error(w, "Impossible de supprimer (peut-être liée à des produits ?)", http.StatusConflict)
		return
	}
	json.NewEncoder(w).Encode(map[string]string{"message": "Catégorie supprimée"})
}
