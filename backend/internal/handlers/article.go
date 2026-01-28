package handlers

import (
	"database/sql"
	"encoding/json"
	"net/http"

	"akwaba-bebe/backend/internal/models"
)

type ArticleHandler struct {
	DB *sql.DB
}

// 1. Lire tous les articles
func (h *ArticleHandler) GetAllArticles(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	rows, err := h.DB.Query("SELECT id, title, content, image_url, created_at FROM articles ORDER BY created_at DESC")
	if err != nil {
		http.Error(w, "Erreur BDD", http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	var articles []models.Article
	for rows.Next() {
		var a models.Article
		if err := rows.Scan(&a.ID, &a.Title, &a.Content, &a.ImageURL, &a.CreatedAt); err != nil {
			continue
		}
		articles = append(articles, a)
	}

	if articles == nil {
		articles = []models.Article{}
	}
	json.NewEncoder(w).Encode(articles)
}

// 2. Créer un article (Pour l'admin)
func (h *ArticleHandler) CreateArticle(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	var a models.Article

	if err := json.NewDecoder(r.Body).Decode(&a); err != nil {
		http.Error(w, "Données invalides", http.StatusBadRequest)
		return
	}

	sqlStatement := `INSERT INTO articles (title, content, image_url) VALUES ($1, $2, $3) RETURNING id`
	id := 0
	err := h.DB.QueryRow(sqlStatement, a.Title, a.Content, a.ImageURL).Scan(&id)
	if err != nil {
		http.Error(w, "Erreur création: "+err.Error(), http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(map[string]interface{}{"id": id, "message": "Article créé"})
}
