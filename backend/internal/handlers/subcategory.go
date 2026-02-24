package handlers

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"net/http"
	"strings"

	"akwaba-bebe/backend/internal/models"
)

type SubCategoryHandler struct {
	DB *sql.DB
}

// GET /subcategories?category_id=X — Sous-catégories d'une catégorie
func (h *SubCategoryHandler) GetSubCategories(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	categoryIDStr := r.URL.Query().Get("category_id")
	if categoryIDStr == "" {
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(map[string]string{"message": "Paramètre category_id requis"})
		return
	}

	subcategories := make([]models.SubCategory, 0)

	rows, err := h.DB.Query(
		"SELECT id, name, category_id FROM subcategories WHERE category_id = $1 ORDER BY id ASC",
		categoryIDStr,
	)
	if err != nil {
		fmt.Printf("Erreur BDD GetSubCategories : %v\n", err)
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(map[string]string{"message": "Erreur lors de la récupération des sous-catégories"})
		return
	}
	defer rows.Close()

	for rows.Next() {
		var sc models.SubCategory
		if err := rows.Scan(&sc.ID, &sc.Name, &sc.CategoryID); err != nil {
			continue
		}
		subcategories = append(subcategories, sc)
	}

	json.NewEncoder(w).Encode(subcategories)
}

// POST /subcategories — Créer une sous-catégorie [ADMIN]
func (h *SubCategoryHandler) CreateSubCategory(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	var sc models.SubCategory
	if err := json.NewDecoder(r.Body).Decode(&sc); err != nil {
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(map[string]string{"message": "Données invalides"})
		return
	}

	if sc.Name == "" {
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(map[string]string{"message": "Le nom de la sous-catégorie est requis"})
		return
	}

	if sc.CategoryID == 0 {
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(map[string]string{"message": "La catégorie parente est requise"})
		return
	}

	err := h.DB.QueryRow(
		"INSERT INTO subcategories (name, category_id) VALUES ($1, $2) RETURNING id",
		sc.Name, sc.CategoryID,
	).Scan(&sc.ID)

	if err != nil {
		fmt.Printf("Erreur BDD CreateSubCategory : %v\n", err)
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(map[string]string{"message": "Erreur lors de la création de la sous-catégorie"})
		return
	}

	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(sc)
}

// PUT /subcategories/update/{id} — Modifier une sous-catégorie [ADMIN]
func (h *SubCategoryHandler) UpdateSubCategory(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	idStr := strings.TrimPrefix(r.URL.Path, "/subcategories/update/")

	var sc models.SubCategory
	if err := json.NewDecoder(r.Body).Decode(&sc); err != nil {
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(map[string]string{"message": "Données invalides"})
		return
	}

	if sc.Name == "" {
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(map[string]string{"message": "Le nom ne peut pas être vide"})
		return
	}

	result, err := h.DB.Exec(
		"UPDATE subcategories SET name = $1 WHERE id = $2",
		sc.Name, idStr,
	)
	if err != nil {
		fmt.Printf("Erreur BDD UpdateSubCategory id=%s : %v\n", idStr, err)
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(map[string]string{"message": "Erreur lors de la modification"})
		return
	}

	rowsAffected, _ := result.RowsAffected()
	if rowsAffected == 0 {
		w.WriteHeader(http.StatusNotFound)
		json.NewEncoder(w).Encode(map[string]string{"message": "Sous-catégorie introuvable"})
		return
	}

	json.NewEncoder(w).Encode(map[string]string{"message": "Sous-catégorie mise à jour avec succès"})
}

// DELETE /subcategories/delete/{id} — Supprimer une sous-catégorie [ADMIN]
func (h *SubCategoryHandler) DeleteSubCategory(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	idStr := strings.TrimPrefix(r.URL.Path, "/subcategories/delete/")

	// ON DELETE SET NULL sur products.subcategory_id — pas de risque de conflit FK
	_, err := h.DB.Exec("DELETE FROM subcategories WHERE id = $1", idStr)
	if err != nil {
		fmt.Printf("Erreur BDD DeleteSubCategory id=%s : %v\n", idStr, err)
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(map[string]string{"message": "Erreur lors de la suppression"})
		return
	}

	json.NewEncoder(w).Encode(map[string]string{"message": "Sous-catégorie supprimée avec succès"})
}
