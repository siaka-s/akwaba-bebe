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

func (h *ProductHandler) GetAllProducts(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	rows, err := h.DB.Query("SELECT id, name, description, price, stock_quantity, image_url, category_id, subcategory_id, promotion_percent FROM products ORDER BY id ASC")
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(map[string]string{"message": "Erreur serveur BDD"})
		return
	}
	defer rows.Close()

	products := make([]models.Product, 0)
	for rows.Next() {
		var p models.Product
		if err := rows.Scan(&p.ID, &p.Name, &p.Description, &p.Price, &p.StockQuantity, &p.ImageURL, &p.CategoryID, &p.SubcategoryID, &p.PromotionPercent); err != nil {
			continue
		}
		products = append(products, p)
	}

	json.NewEncoder(w).Encode(products)
}

func (h *ProductHandler) GetProduct(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	idStr := strings.TrimPrefix(r.URL.Path, "/products/")
	id, err := strconv.Atoi(idStr)
	if err != nil {
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(map[string]string{"message": "ID invalide"})
		return
	}

	var p models.Product
	row := h.DB.QueryRow("SELECT id, name, description, price, stock_quantity, image_url, category_id, subcategory_id, promotion_percent FROM products WHERE id=$1", id)
	err = row.Scan(&p.ID, &p.Name, &p.Description, &p.Price, &p.StockQuantity, &p.ImageURL, &p.CategoryID, &p.SubcategoryID, &p.PromotionPercent)

	if err == sql.ErrNoRows {
		w.WriteHeader(http.StatusNotFound)
		json.NewEncoder(w).Encode(map[string]string{"message": "Produit introuvable"})
		return
	} else if err != nil {
		fmt.Printf("Erreur BDD GetProduct id=%d : %v\n", id, err)
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(map[string]string{"message": "Erreur lors de la récupération du produit"})
		return
	}

	json.NewEncoder(w).Encode(p)
}

func (h *ProductHandler) CreateProduct(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	var p models.Product

	if err := json.NewDecoder(r.Body).Decode(&p); err != nil {
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(map[string]string{"message": "Données invalides"})
		return
	}

	id := 0
	err := h.DB.QueryRow(
		`INSERT INTO products (name, description, price, stock_quantity, image_url, category_id, subcategory_id) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id`,
		p.Name, p.Description, p.Price, p.StockQuantity, p.ImageURL, p.CategoryID, p.SubcategoryID,
	).Scan(&id)
	if err != nil {
		fmt.Printf("Erreur BDD CreateProduct : %v\n", err)
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(map[string]string{"message": "Erreur lors de la création du produit"})
		return
	}

	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(map[string]interface{}{"id": id, "message": "Succès"})
}

func (h *ProductHandler) UpdateProduct(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	idStr := strings.TrimPrefix(r.URL.Path, "/products/")
	id, err := strconv.Atoi(idStr)
	if err != nil {
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(map[string]string{"message": "ID invalide"})
		return
	}

	var p models.Product
	if err := json.NewDecoder(r.Body).Decode(&p); err != nil {
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(map[string]string{"message": "Données invalides"})
		return
	}

	res, err := h.DB.Exec(
		`UPDATE products SET name=$1, description=$2, price=$3, stock_quantity=$4, image_url=$5, category_id=$6, subcategory_id=$7 WHERE id=$8`,
		p.Name, p.Description, p.Price, p.StockQuantity, p.ImageURL, p.CategoryID, p.SubcategoryID, id,
	)
	if err != nil {
		fmt.Printf("Erreur BDD UpdateProduct id=%d : %v\n", id, err)
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(map[string]string{"message": "Erreur lors de la modification du produit"})
		return
	}

	rowsAffected, _ := res.RowsAffected()
	if rowsAffected == 0 {
		w.WriteHeader(http.StatusNotFound)
		json.NewEncoder(w).Encode(map[string]string{"message": "Aucun produit trouvé avec cet ID"})
		return
	}

	json.NewEncoder(w).Encode(map[string]string{"message": "Produit mis à jour avec succès"})
}

func (h *ProductHandler) DeleteProduct(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	path := r.URL.Path
	if strings.Contains(path, "/delete/") {
		path = strings.Replace(path, "/delete", "", 1)
	}

	idStr := strings.TrimPrefix(path, "/products/")
	id, err := strconv.Atoi(idStr)
	if err != nil {
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(map[string]string{"message": "ID invalide"})
		return
	}

	_, err = h.DB.Exec("DELETE FROM products WHERE id = $1", id)
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(map[string]string{"message": "Erreur suppression BDD"})
		return
	}

	json.NewEncoder(w).Encode(map[string]string{"message": "Produit supprimé"})
}

// ApplyPromotion — PATCH /products/promotion/apply (admin)
// Body : { "percent": 15.0, "product_ids": [1,2,3] }
// OU    { "percent": 15.0, "category_id": 5 }
func (h *ProductHandler) ApplyPromotion(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	var body struct {
		Percent    float64 `json:"percent"`
		ProductIDs []int   `json:"product_ids"`
		CategoryID *int    `json:"category_id"`
	}
	if err := json.NewDecoder(r.Body).Decode(&body); err != nil || body.Percent <= 0 || body.Percent > 100 {
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(map[string]string{"message": "Données invalides (percent 1-100 requis)"})
		return
	}

	var affected int64
	var err error

	if body.CategoryID != nil {
		res, e := h.DB.Exec("UPDATE products SET promotion_percent=$1 WHERE category_id=$2", body.Percent, *body.CategoryID)
		err = e
		affected, _ = res.RowsAffected()
	} else if len(body.ProductIDs) > 0 {
		// Construit $1,$2,... pour IN
		args := []interface{}{body.Percent}
		placeholders := make([]string, len(body.ProductIDs))
		for i, pid := range body.ProductIDs {
			args = append(args, pid)
			placeholders[i] = fmt.Sprintf("$%d", i+2)
		}
		query := fmt.Sprintf("UPDATE products SET promotion_percent=$1 WHERE id IN (%s)", strings.Join(placeholders, ","))
		res, e := h.DB.Exec(query, args...)
		err = e
		affected, _ = res.RowsAffected()
	} else {
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(map[string]string{"message": "product_ids ou category_id requis"})
		return
	}

	if err != nil {
		fmt.Printf("Erreur ApplyPromotion : %v\n", err)
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(map[string]string{"message": "Erreur BDD"})
		return
	}

	json.NewEncoder(w).Encode(map[string]interface{}{"message": "Promotion appliquée", "affected": affected})
}

// RemovePromotion — PATCH /products/promotion/remove (admin)
// Body : { "product_ids": [1,2,3] } OU { "category_id": 5 } OU {} pour tout retirer
func (h *ProductHandler) RemovePromotion(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	var body struct {
		ProductIDs []int `json:"product_ids"`
		CategoryID *int  `json:"category_id"`
	}
	json.NewDecoder(r.Body).Decode(&body)

	var affected int64
	var err error

	if body.CategoryID != nil {
		res, e := h.DB.Exec("UPDATE products SET promotion_percent=NULL WHERE category_id=$1", *body.CategoryID)
		err = e
		affected, _ = res.RowsAffected()
	} else if len(body.ProductIDs) > 0 {
		args := []interface{}{}
		placeholders := make([]string, len(body.ProductIDs))
		for i, pid := range body.ProductIDs {
			args = append(args, pid)
			placeholders[i] = fmt.Sprintf("$%d", i+1)
		}
		query := fmt.Sprintf("UPDATE products SET promotion_percent=NULL WHERE id IN (%s)", strings.Join(placeholders, ","))
		res, e := h.DB.Exec(query, args...)
		err = e
		affected, _ = res.RowsAffected()
	} else {
		res, e := h.DB.Exec("UPDATE products SET promotion_percent=NULL")
		err = e
		affected, _ = res.RowsAffected()
	}

	if err != nil {
		fmt.Printf("Erreur RemovePromotion : %v\n", err)
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(map[string]string{"message": "Erreur BDD"})
		return
	}

	json.NewEncoder(w).Encode(map[string]interface{}{"message": "Promotion retirée", "affected": affected})
}

func (h *ProductHandler) UploadImage(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	r.ParseMultipartForm(10 << 20)

	file, handler, err := r.FormFile("file")
	if err != nil {
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(map[string]string{"message": "Fichier invalide ou absent"})
		return
	}
	defer file.Close()

	url, err := utils.UploadToS3(file, handler)
	if err != nil {
		fmt.Printf("Erreur S3 upload : %v\n", err)
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(map[string]string{"message": "Erreur lors de l'upload vers S3"})
		return
	}

	json.NewEncoder(w).Encode(map[string]string{"url": url})
}
