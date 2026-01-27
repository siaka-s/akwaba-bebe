package handlers

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"net/http"
	"strconv"
	"strings"

	// ⚠️ IMPORTANT : Vérifie que ce chemin correspond bien à ton go.mod
	"akwaba-bebe/backend/internal/models"
)

// ProductHandler contient la connexion à la base de données
type ProductHandler struct {
	DB *sql.DB
}

// Routes est l'aiguillage principal
func (h *ProductHandler) Routes(w http.ResponseWriter, r *http.Request) {
	// Si l'URL a un ID (ex: /products/12)
	// On vérifie si le chemin est différent de "/products" et "/products/"
	if strings.TrimPrefix(r.URL.Path, "/products/") != r.URL.Path {
		h.HandleByID(w, r)
		return
	}

	// Sinon, c'est la racine /products
	switch r.Method {
	case "GET":
		h.GetAllProducts(w, r)
	case "POST":
		h.CreateProduct(w, r)
	default:
		http.Error(w, "Méthode non autorisée", http.StatusMethodNotAllowed)
	}
}

// HandleByID gère les requêtes spécifiques à un produit (ex: /products/5)
func (h *ProductHandler) HandleByID(w http.ResponseWriter, r *http.Request) {
	// Extraction de l'ID
	idStr := strings.TrimPrefix(r.URL.Path, "/products/")
	id, err := strconv.Atoi(idStr)
	if err != nil {
		http.Error(w, "ID invalide", http.StatusBadRequest)
		return
	}

	switch r.Method {
	case "GET":
		h.GetProduct(w, id)
	case "PUT":
		h.UpdateProduct(w, r, id)
	case "DELETE":
		h.DeleteProduct(w, id)
	default:
		http.Error(w, "Méthode non autorisée", http.StatusMethodNotAllowed)
	}
}

// --- 1. LISTER (READ ALL) ---
func (h *ProductHandler) GetAllProducts(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	rows, err := h.DB.Query("SELECT id, name, description, price, stock_quantity, category_id, image_url FROM products ORDER BY id ASC")
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	var products []models.Product
	for rows.Next() {
		var p models.Product
		if err := rows.Scan(&p.ID, &p.Name, &p.Description, &p.Price, &p.StockQuantity, &p.CategoryID, &p.ImageURL); err != nil {
			continue
		}
		products = append(products, p)
	}
	json.NewEncoder(w).Encode(products)
}

// CRÉER (CREATE) ---
func (h *ProductHandler) CreateProduct(w http.ResponseWriter, r *http.Request) {
	var p models.Product
	if err := json.NewDecoder(r.Body).Decode(&p); err != nil {
		http.Error(w, "Erreur JSON: "+err.Error(), http.StatusBadRequest)
		return
	}

	sqlStatement := `INSERT INTO products (name, description, price, stock_quantity, category_id, image_url) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id`

	id := 0
	err := h.DB.QueryRow(sqlStatement, p.Name, p.Description, p.Price, p.StockQuantity, p.CategoryID, p.ImageURL).Scan(&id)
	if err != nil {
		http.Error(w, "Erreur SQL: "+err.Error(), http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusCreated)
	fmt.Fprintf(w, `{"id": %d, "message": "Produit créé avec succès"}`, id)
}

// VOIR UN SEUL (READ ONE) ---
func (h *ProductHandler) GetProduct(w http.ResponseWriter, id int) {
	w.Header().Set("Content-Type", "application/json")
	var p models.Product

	sqlStatement := `SELECT id, name, description, price, stock_quantity, category_id, image_url FROM products WHERE id=$1`

	// Note : on utilise h.DB ici
	row := h.DB.QueryRow(sqlStatement, id)
	err := row.Scan(&p.ID, &p.Name, &p.Description, &p.Price, &p.StockQuantity, &p.CategoryID, &p.ImageURL)

	if err == sql.ErrNoRows {
		http.Error(w, "Produit introuvable", http.StatusNotFound)
		return
	} else if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	json.NewEncoder(w).Encode(p)
}

// METTRE À JOUR (UPDATE) ---
func (h *ProductHandler) UpdateProduct(w http.ResponseWriter, r *http.Request, id int) {
	var p models.Product
	if err := json.NewDecoder(r.Body).Decode(&p); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	sqlStatement := `
	UPDATE products
	SET name = $1, description = $2, price = $3, stock_quantity = $4, category_id = $5, image_url = $6
	WHERE id = $7`

	res, err := h.DB.Exec(sqlStatement, p.Name, p.Description, p.Price, p.StockQuantity, p.CategoryID, p.ImageURL, id)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	count, _ := res.RowsAffected()
	if count == 0 {
		http.Error(w, "Produit introuvable", http.StatusNotFound)
		return
	}

	w.WriteHeader(http.StatusOK)
	fmt.Fprintf(w, `{"message": "Produit mis à jour avec succès"}`)
}

// SUPPRIMER
func (h *ProductHandler) DeleteProduct(w http.ResponseWriter, id int) {
	sqlStatement := `DELETE FROM products WHERE id = $1`

	res, err := h.DB.Exec(sqlStatement, id)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	count, _ := res.RowsAffected()
	if count == 0 {
		http.Error(w, "Produit introuvable", http.StatusNotFound)
		return
	}

	w.WriteHeader(http.StatusOK)
	fmt.Fprintf(w, `{"message": "Produit supprimé avec succès"}`)
}
