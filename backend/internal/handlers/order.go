package handlers

import (
	"akwaba-bebe/backend/internal/models"
	"database/sql"
	"encoding/json"
	"net/http"
)

type OrderHandler struct {
	DB *sql.DB
}

// Structure pour recevoir le nouveau statut de commande client depuis admin
type UpdateStatusRequest struct {
	Status string `json:"status"`
}

func (h *OrderHandler) CreateOrder(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	var req models.OrderRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Données invalides", http.StatusBadRequest)
		return
	}

	// Démarrage Transaction
	tx, err := h.DB.Begin()
	if err != nil {
		http.Error(w, "Erreur serveur", http.StatusInternalServerError)
		return
	}

	// Insertion Commande
	// On ne stocke pas le mot de passe ici. Si create_account est true,
	// appeler une fonction d'inscription utilisateur ici.

	queryOrder := `
		INSERT INTO orders 
		(customer_firstname, customer_lastname, customer_email, customer_phone, 
		 delivery_method, shipping_city, shipping_commune, shipping_address, 
		 order_note, create_account, total_amount)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
		RETURNING id`

	var orderID int
	err = tx.QueryRow(queryOrder,
		req.FirstName, req.LastName, req.Email, req.Phone,
		req.DeliveryMethod, req.ShippingCity, req.ShippingCommune, req.ShippingAddress,
		req.OrderNote, req.CreateAccount, req.Total,
	).Scan(&orderID)

	if err != nil {
		tx.Rollback()
		http.Error(w, "Erreur enregistrement commande: "+err.Error(), http.StatusInternalServerError)
		return
	}

	// Insertion Articles
	queryItem := `INSERT INTO order_items (order_id, product_id, quantity, price) VALUES ($1, $2, $3, $4)`
	for _, item := range req.Items {
		_, err := tx.Exec(queryItem, orderID, item.ID, item.Quantity, item.Price)
		if err != nil {
			tx.Rollback()
			http.Error(w, "Erreur enregistrement article", http.StatusInternalServerError)
			return
		}
	}

	// Validation
	if err := tx.Commit(); err != nil {
		http.Error(w, "Erreur validation transaction", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(map[string]interface{}{
		"message":  "Commande validée !",
		"order_id": orderID,
	})
}

func (h *OrderHandler) GetAllOrders(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	// On récupère les commandes du plus récent au plus ancien
	query := `
		SELECT id, customer_firstname, customer_lastname, total_amount, status, created_at, delivery_method
		FROM orders 
		ORDER BY created_at DESC`

	rows, err := h.DB.Query(query)
	if err != nil {
		http.Error(w, "Erreur BDD", http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	// On crée une structure simplifiée pour la liste
	type OrderSummary struct {
		ID             int     `json:"id"`
		CustomerName   string  `json:"customer_name"`
		Total          float64 `json:"total"`
		Status         string  `json:"status"`
		CreatedAt      string  `json:"created_at"`
		DeliveryMethod string  `json:"delivery_method"`
	}

	var orders []OrderSummary
	for rows.Next() {
		var o OrderSummary
		var first, last string
		if err := rows.Scan(&o.ID, &first, &last, &o.Total, &o.Status, &o.CreatedAt, &o.DeliveryMethod); err != nil {
			continue
		}
		o.CustomerName = first + " " + last
		orders = append(orders, o)
	}

	if orders == nil {
		orders = []OrderSummary{}
	}
	json.NewEncoder(w).Encode(orders)
}

func (h *OrderHandler) GetOrderDetails(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	// 1. Extraire l'ID de l'URL (ex: /orders/5 -> 5)
	idStr := r.URL.Path[len("/orders/"):]

	// 2. Récupérer les infos de la commande
	queryOrder := `
		SELECT id, customer_firstname, customer_lastname, customer_email, customer_phone,
		       delivery_method, shipping_city, shipping_commune, shipping_address,
		       order_note, total_amount, status, created_at
		FROM orders WHERE id = $1`

	var o models.OrderRequest // On réutilise la structure existante
	var id int
	var status, createdAt string

	err := h.DB.QueryRow(queryOrder, idStr).Scan(
		&id, &o.FirstName, &o.LastName, &o.Email, &o.Phone,
		&o.DeliveryMethod, &o.ShippingCity, &o.ShippingCommune, &o.ShippingAddress,
		&o.OrderNote, &o.Total, &status, &createdAt,
	)

	if err != nil {
		http.Error(w, "Commande introuvable", http.StatusNotFound)
		return
	}

	// 3. Récupérer les articles (avec le nom du produit via une JOINTURE)
	queryItems := `
		SELECT oi.quantity, oi.price, p.name 
		FROM order_items oi
		JOIN products p ON oi.product_id = p.id
		WHERE oi.order_id = $1`

	rows, err := h.DB.Query(queryItems, idStr)
	if err != nil {
		http.Error(w, "Erreur articles", http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	// On crée une structure temporaire pour la réponse JSON complète
	type OrderResponse struct {
		Info  models.OrderRequest `json:"info"`
		Items []struct {
			Name     string  `json:"name"`
			Quantity int     `json:"quantity"`
			Price    float64 `json:"price"`
		} `json:"items"`
		Status    string `json:"status"`
		CreatedAt string `json:"created_at"`
		ID        int    `json:"id"`
	}

	var resp OrderResponse
	resp.ID = id
	resp.Info = o
	resp.Status = status
	resp.CreatedAt = createdAt

	for rows.Next() {
		var name string
		var qty int
		var price float64
		if err := rows.Scan(&qty, &price, &name); err == nil {
			resp.Items = append(resp.Items, struct {
				Name     string  `json:"name"`
				Quantity int     `json:"quantity"`
				Price    float64 `json:"price"`
			}{Name: name, Quantity: qty, Price: price})
		}
	}

	json.NewEncoder(w).Encode(resp)
}

func (h *OrderHandler) UpdateOrderStatus(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	// 1. Récupérer l'ID dans l'URL (ex: /orders/update/5)
	// On coupe la chaîne après "/orders/update/"
	idStr := r.URL.Path[len("/orders/update/"):]

	// 2. Décoder le JSON reçu (ex: {"status": "livré"})
	var req UpdateStatusRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Données invalides", http.StatusBadRequest)
		return
	}

	// 3. Exécuter la mise à jour SQL
	query := `UPDATE orders SET status = $1 WHERE id = $2`
	_, err := h.DB.Exec(query, req.Status, idStr)

	if err != nil {
		http.Error(w, "Erreur lors de la mise à jour en base de données", http.StatusInternalServerError)
		return
	}

	// 4. Répondre que tout est OK
	json.NewEncoder(w).Encode(map[string]string{
		"message": "Statut mis à jour avec succès",
	})
}
