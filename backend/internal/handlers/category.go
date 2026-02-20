package handlers

import (
	"akwaba-bebe/backend/internal/models"
	"database/sql"
	"encoding/json"
	"fmt" // Ajouté pour des messages d'erreur plus clairs
	"net/http"
)

type CategoryHandler struct {
	DB *sql.DB
}

// LIRE (GET) - Corrigé pour renvoyer [] si la BDD est vide
func (h *CategoryHandler) GetCategories(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	rows, err := h.DB.Query("SELECT id, name FROM categories ORDER BY id ASC")
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(map[string]string{"message": "Erreur lors de la récupération des catégories"})
		return
	}
	defer rows.Close()

	// Initialisation forcée à un tableau vide pour éviter le "null" en JSON
	categories := make([]models.Category, 0)

	for rows.Next() {
		var c models.Category
		if err := rows.Scan(&c.ID, &c.Name); err != nil {
			continue
		}
		categories = append(categories, c)
	}

	json.NewEncoder(w).Encode(categories)
}

// CRÉER (POST)
func (h *CategoryHandler) CreateCategory(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	var c models.Category
	if err := json.NewDecoder(r.Body).Decode(&c); err != nil {
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(map[string]string{"message": "Données invalides"})
		return
	}

	// Protection : éviter d'insérer des noms vides
	if c.Name == "" {
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(map[string]string{"message": "Le nom de la catégorie est requis"})
		return
	}

	err := h.DB.QueryRow("INSERT INTO categories (name) VALUES ($1) RETURNING id", c.Name).Scan(&c.ID)
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		// On renvoie l'erreur réelle pour t'aider à débugger (ex: table manquante)
		json.NewEncoder(w).Encode(map[string]string{"message": fmt.Sprintf("Erreur BDD : %v", err)})
		return
	}

	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(c)
}

// MODIFIER (PUT)
func (h *CategoryHandler) UpdateCategory(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	idStr := r.URL.Path[len("/categories/update/"):]

	var c models.Category
	if err := json.NewDecoder(r.Body).Decode(&c); err != nil {
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(map[string]string{"message": "Données invalides"})
		return
	}

	result, err := h.DB.Exec("UPDATE categories SET name = $1 WHERE id = $2", c.Name, idStr)
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(map[string]string{"message": "Erreur lors de la modification"})
		return
	}

	// Vérifier si une ligne a vraiment été modifiée
	rowsAffected, _ := result.RowsAffected()
	if rowsAffected == 0 {
		w.WriteHeader(http.StatusNotFound)
		json.NewEncoder(w).Encode(map[string]string{"message": "Catégorie introuvable"})
		return
	}

	json.NewEncoder(w).Encode(map[string]string{"message": "Catégorie mise à jour avec succès"})
}

// SUPPRIMER (DELETE)
func (h *CategoryHandler) DeleteCategory(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	idStr := r.URL.Path[len("/categories/delete/"):]

	_, err := h.DB.Exec("DELETE FROM categories WHERE id = $1", idStr)
	if err != nil {
		w.WriteHeader(http.StatusConflict)
		json.NewEncoder(w).Encode(map[string]string{"message": "Impossible de supprimer : vérifiez si des produits utilisent cette catégorie"})
		return
	}

	json.NewEncoder(w).Encode(map[string]string{"message": "Catégorie supprimée avec succès"})
}
