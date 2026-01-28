package handlers

import (
	"database/sql"
	"encoding/json"
	"net/http"
	"strconv"
	"strings"

	"akwaba-bebe/backend/internal/models"
)

type ProductHandler struct {
	DB *sql.DB
}

// --- 1. RECUPERER TOUS LES PRODUITS ---
func (h *ProductHandler) GetAllProducts(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	// On sélectionne aussi description et category_id
	rows, err := h.DB.Query("SELECT id, name, description, price, stock_quantity, image_url, category_id FROM products")
	if err != nil {
		http.Error(w, "Erreur serveur BDD", http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	var products []models.Product
	for rows.Next() {
		var p models.Product
		// L'ordre du Scan doit correspondre à l'ordre du SELECT
		// On utilise sql.NullString pour description/image au cas où c'est vide, mais ici on fait simple
		if err := rows.Scan(&p.ID, &p.Name, &p.Description, &p.Price, &p.StockQuantity, &p.ImageURL, &p.CategoryID); err != nil {
			continue
		}
		products = append(products, p)
	}

	// Si vide, on renvoie un tableau vide [] et pas null
	if products == nil {
		products = []models.Product{}
	}

	json.NewEncoder(w).Encode(products)
}

// --- 2. GÉRER UN PRODUIT PAR ID (GET, PUT, DELETE) ---
func (h *ProductHandler) HandleByID(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	// Extraction de l'ID de l'URL (ex: /products/12)
	idStr := strings.TrimPrefix(r.URL.Path, "/products/")
	id, err := strconv.Atoi(idStr)
	if err != nil {
		http.Error(w, "ID invalide", http.StatusBadRequest)
		return
	}

	switch r.Method {
	case "GET":
		h.getProduct(w, id)
	case "DELETE":
		h.deleteProduct(w, id)
	case "PUT":
		// Optionnel : Mise à jour du produit (à faire plus tard)
	default:
		http.Error(w, "Méthode non autorisée", http.StatusMethodNotAllowed)
	}
}

func (h *ProductHandler) getProduct(w http.ResponseWriter, id int) {
	var p models.Product
	sqlStatement := `SELECT id, name, description, price, stock_quantity, image_url, category_id FROM products WHERE id=$1`
	row := h.DB.QueryRow(sqlStatement, id)
	err := row.Scan(&p.ID, &p.Name, &p.Description, &p.Price, &p.StockQuantity, &p.ImageURL, &p.CategoryID)

	if err == sql.ErrNoRows {
		http.Error(w, "Produit non trouvé", http.StatusNotFound)
		return
	} else if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	json.NewEncoder(w).Encode(p)
}

func (h *ProductHandler) deleteProduct(w http.ResponseWriter, id int) {
	_, err := h.DB.Exec("DELETE FROM products WHERE id=$1", id)
	if err != nil {
		http.Error(w, "Erreur suppression", http.StatusInternalServerError)
		return
	}
	w.WriteHeader(http.StatusOK)
	w.Write([]byte(`{"message": "Produit supprimé"}`))
}

// --- 3. CRÉER UN PRODUIT (POST) ---
func (h *ProductHandler) CreateProduct(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	var p models.Product

	if err := json.NewDecoder(r.Body).Decode(&p); err != nil {
		http.Error(w, "Données invalides", http.StatusBadRequest)
		return
	}

	// SQL Mis à jour avec Description et CategoryID
	sqlStatement := `
		INSERT INTO products (name, description, price, stock_quantity, image_url, category_id)
		VALUES ($1, $2, $3, $4, $5, $6)
		RETURNING id`

	id := 0
	err := h.DB.QueryRow(sqlStatement, p.Name, p.Description, p.Price, p.StockQuantity, p.ImageURL, p.CategoryID).Scan(&id)
	if err != nil {
		// C'est ici qu'on verra l'erreur dans le terminal si ça plante
		http.Error(w, "Erreur insertion BDD: "+err.Error(), http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusCreated)
	// On renvoie l'ID créé
	json.NewEncoder(w).Encode(map[string]interface{}{"id": id, "message": "Succès"})
}
