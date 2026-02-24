package handlers

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"net/http"
	"strconv"
	"strings"

	"akwaba-bebe/backend/internal/models"
	"akwaba-bebe/backend/internal/utils"
)

type ProductHandler struct {
	DB *sql.DB
}

// RÉCUPÉRER TOUS LES PRODUITS (GET /products) ---
func (h *ProductHandler) GetAllProducts(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	// Sélection des champs essentiels
	rows, err := h.DB.Query("SELECT id, name, description, price, stock_quantity, image_url, category_id FROM products ORDER BY id ASC")
	if err != nil {
		http.Error(w, "Erreur serveur BDD", http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	var products []models.Product
	for rows.Next() {
		var p models.Product
		if err := rows.Scan(&p.ID, &p.Name, &p.Description, &p.Price, &p.StockQuantity, &p.ImageURL, &p.CategoryID); err != nil {
			continue
		}
		products = append(products, p)
	}

	// Retourner un tableau vide [] au lieu de null si pas de produits
	if products == nil {
		products = []models.Product{}
	}

	json.NewEncoder(w).Encode(products)
}

// RÉCUPÉRER UN SEUL PRODUIT (GET /products/{id})
func (h *ProductHandler) GetProduct(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	// Extraction propre de l'ID depuis l'URL
	idStr := strings.TrimPrefix(r.URL.Path, "/products/")
	id, err := strconv.Atoi(idStr)
	if err != nil {
		http.Error(w, "ID invalide", http.StatusBadRequest)
		return
	}

	var p models.Product
	sqlStatement := `SELECT id, name, description, price, stock_quantity, image_url, category_id FROM products WHERE id=$1`

	row := h.DB.QueryRow(sqlStatement, id)
	err = row.Scan(&p.ID, &p.Name, &p.Description, &p.Price, &p.StockQuantity, &p.ImageURL, &p.CategoryID)

	if err == sql.ErrNoRows {
		w.WriteHeader(http.StatusNotFound)
		json.NewEncoder(w).Encode(map[string]string{"message": "Produit introuvable"})
		return
	} else if err != nil {
		// Log interne pour le débogage — ne jamais exposer l'erreur SQL au client
		fmt.Printf("Erreur BDD GetProduct id=%d : %v\n", id, err)
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(map[string]string{"message": "Erreur lors de la récupération du produit"})
		return
	}

	json.NewEncoder(w).Encode(p)
}

// CRÉER UN PRODUIT (POST /products)
func (h *ProductHandler) CreateProduct(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	var p models.Product

	if err := json.NewDecoder(r.Body).Decode(&p); err != nil {
		http.Error(w, "Données invalides", http.StatusBadRequest)
		return
	}

	sqlStatement := `
        INSERT INTO products (name, description, price, stock_quantity, image_url, category_id)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING id`

	id := 0
	err := h.DB.QueryRow(sqlStatement, p.Name, p.Description, p.Price, p.StockQuantity, p.ImageURL, p.CategoryID).Scan(&id)
	if err != nil {
		http.Error(w, "Erreur insertion BDD: "+err.Error(), http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(map[string]interface{}{"id": id, "message": "Succès"})
}

// MODIFIER UN PRODUIT (PUT /products/{id})
func (h *ProductHandler) UpdateProduct(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	idStr := strings.TrimPrefix(r.URL.Path, "/products/")
	id, err := strconv.Atoi(idStr)
	if err != nil {
		http.Error(w, "ID invalide", http.StatusBadRequest)
		return
	}

	var p models.Product
	if err := json.NewDecoder(r.Body).Decode(&p); err != nil {
		http.Error(w, "Données invalides", http.StatusBadRequest)
		return
	}

	query := `
        UPDATE products 
        SET name=$1, description=$2, price=$3, stock_quantity=$4, image_url=$5, category_id=$6 
        WHERE id=$7`

	res, err := h.DB.Exec(query, p.Name, p.Description, p.Price, p.StockQuantity, p.ImageURL, p.CategoryID, id)
	if err != nil {
		http.Error(w, "Erreur modification SQL: "+err.Error(), http.StatusInternalServerError)
		return
	}

	rowsAffected, _ := res.RowsAffected()
	if rowsAffected == 0 {
		http.Error(w, "Aucun produit trouvé avec cet ID", http.StatusNotFound)
		return
	}

	json.NewEncoder(w).Encode(map[string]string{"message": "Produit mis à jour avec succès"})
}

// SUPPRIMER UN PRODUIT (DELETE /products/{id})
func (h *ProductHandler) DeleteProduct(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	// Nettoyage de l'URL pour gérer d'éventuels "/delete/" résiduels
	path := r.URL.Path
	if strings.Contains(path, "/delete/") {
		path = strings.Replace(path, "/delete", "", 1)
	}

	idStr := strings.TrimPrefix(path, "/products/")
	id, err := strconv.Atoi(idStr)
	if err != nil {
		http.Error(w, "ID invalide", http.StatusBadRequest)
		return
	}

	_, err = h.DB.Exec("DELETE FROM products WHERE id = $1", id)
	if err != nil {
		http.Error(w, "Erreur suppression BDD", http.StatusInternalServerError)
		return
	}

	json.NewEncoder(w).Encode(map[string]string{"message": "Produit supprimé"})
}

// UPLOAD IMAGE VERS AWS S3 (POST /upload)
func (h *ProductHandler) UploadImage(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	// Limiter la taille du fichier (ex: 10MB)
	r.ParseMultipartForm(10 << 20)

	// Récupérer le fichier depuis le champ "file" du formulaire
	file, handler, err := r.FormFile("file")
	if err != nil {
		http.Error(w, "Fichier invalide ou absent", http.StatusBadRequest)
		return
	}
	defer file.Close()

	// Appel au service utilitaire S3
	url, err := utils.UploadToS3(file, handler)
	if err != nil {
		fmt.Println("Erreur S3:", err) // Log console serveur
		http.Error(w, "Erreur lors de l'upload vers S3", http.StatusInternalServerError)
		return
	}

	// Succès : renvoyer l'URL publique
	json.NewEncoder(w).Encode(map[string]string{
		"url": url,
	})
}
