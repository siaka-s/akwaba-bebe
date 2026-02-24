package handlers

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"net/http"

	"akwaba-bebe/backend/internal/models"
)

type ArticleHandler struct {
	DB *sql.DB
}

// Lire tous les articles (GET /articles) — trié du plus récent au plus ancien
func (h *ArticleHandler) GetAllArticles(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	rows, err := h.DB.Query("SELECT id, title, content, image_url, created_at FROM articles ORDER BY created_at DESC")
	if err != nil {
		// Log interne pour le débogage — message générique au client (règle sécurité)
		fmt.Printf("Erreur BDD GetAllArticles : %v\n", err)
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(map[string]string{"message": "Erreur lors de la récupération des articles"})
		return
	}
	defer rows.Close()

	// make() garantit un tableau JSON vide [] et non null si la table est vide
	articles := make([]models.Article, 0)
	for rows.Next() {
		var a models.Article
		if err := rows.Scan(&a.ID, &a.Title, &a.Content, &a.ImageURL, &a.CreatedAt); err != nil {
			continue
		}
		articles = append(articles, a)
	}

	json.NewEncoder(w).Encode(articles)
}

// Créer un article (POST /articles) — réservé admin
func (h *ArticleHandler) CreateArticle(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	var a models.Article
	if err := json.NewDecoder(r.Body).Decode(&a); err != nil {
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(map[string]string{"message": "Données invalides"})
		return
	}

	sqlStatement := `INSERT INTO articles (title, content, image_url) VALUES ($1, $2, $3) RETURNING id`
	id := 0
	err := h.DB.QueryRow(sqlStatement, a.Title, a.Content, a.ImageURL).Scan(&id)
	if err != nil {
		// Log interne — ne pas exposer l'erreur SQL au client
		fmt.Printf("Erreur BDD CreateArticle : %v\n", err)
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(map[string]string{"message": "Erreur lors de la création de l'article"})
		return
	}

	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(map[string]interface{}{"id": id, "message": "Article créé avec succès"})
}
