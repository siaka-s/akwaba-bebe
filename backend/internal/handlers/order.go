package handlers

import (
	"akwaba-bebe/backend/internal/config"
	"akwaba-bebe/backend/internal/models"
	"database/sql"
	"encoding/json"
	"fmt"
	"net/http"
	"strconv"
	"strings"

	"github.com/golang-jwt/jwt/v5"
)

type OrderHandler struct {
	DB *sql.DB
}

// jwtKeyOrder utilise la même source que auth.go via config.JWTKey().
// La clé est lue depuis la variable d'environnement JWT_SECRET (config partagée).
var jwtKeyOrder = config.JWTKey()

// Structure pour recevoir le nouveau statut (JSON)
type UpdateStatusRequest struct {
	Status string `json:"status"`
}

// STRUCTURES DE RÉPONSE POUR LE FRONTEND

// Pour la liste des commandes (GetAllOrders et GetMyOrders)
type OrderSummary struct {
	ID             int     `json:"id"`
	CustomerName   string  `json:"customer_name"`
	Total          float64 `json:"total"` // Le frontend attend "total"
	Status         string  `json:"status"`
	CreatedAt      string  `json:"created_at"`
	DeliveryMethod string  `json:"delivery_method"`
}

// Pour le détail d'une commande (GetOrderDetails)
type OrderDetailResponse struct {
	ID              int                 `json:"id"`
	CustomerName    string              `json:"customer_name"`
	CustomerEmail   string              `json:"customer_email"`
	CustomerPhone   string              `json:"customer_phone"`
	Total           float64             `json:"total"`
	Status          string              `json:"status"`
	DeliveryMethod  string              `json:"delivery_method"`
	CreatedAt       string              `json:"created_at"`
	ShippingCity    string              `json:"shipping_city"`    // Utile pour l'admin
	ShippingAddress string              `json:"shipping_address"` // Utile pour l'admin
	Items           []OrderItemResponse `json:"items"`
}

type OrderItemResponse struct {
	ProductName string  `json:"product_name"` // Important: correspond au frontend
	Quantity    int     `json:"quantity"`
	UnitPrice   float64 `json:"unit_price"` // Important: correspond au frontend
}

// CRÉER UNE COMMANDE
func (h *OrderHandler) CreateOrder(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	var req models.OrderRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Données invalides", http.StatusBadRequest)
		return
	}

	tx, err := h.DB.Begin()
	if err != nil {
		http.Error(w, "Erreur serveur", http.StatusInternalServerError)
		return
	}

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

	queryItem := `INSERT INTO order_items (order_id, product_id, quantity, price) VALUES ($1, $2, $3, $4)`
	for _, item := range req.Items {
		_, err := tx.Exec(queryItem, orderID, item.ID, item.Quantity, item.Price)
		if err != nil {
			tx.Rollback()
			http.Error(w, "Erreur enregistrement article", http.StatusInternalServerError)
			return
		}
	}

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

// RÉCUPÉRER TOUTES LES COMMANDES (ADMIN)
func (h *OrderHandler) GetAllOrders(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

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

// DÉTAIL D'UNE COMMANDE (ADMIN)
func (h *OrderHandler) GetOrderDetails(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	idStr := strings.TrimPrefix(r.URL.Path, "/orders/")
	id, err := strconv.Atoi(idStr)
	if err != nil {
		http.Error(w, "ID invalide", http.StatusBadRequest)
		return
	}

	// Info Commande
	queryOrder := `
        SELECT id, customer_firstname, customer_lastname, customer_email, customer_phone,
               total_amount, status, created_at, delivery_method, shipping_city, shipping_address
        FROM orders WHERE id = $1`

	var o OrderDetailResponse
	var first, last string

	err = h.DB.QueryRow(queryOrder, id).Scan(
		&o.ID, &first, &last, &o.CustomerEmail, &o.CustomerPhone,
		&o.Total, &o.Status, &o.CreatedAt, &o.DeliveryMethod, &o.ShippingCity, &o.ShippingAddress,
	)

	if err == sql.ErrNoRows {
		http.Error(w, "Commande introuvable", http.StatusNotFound)
		return
	} else if err != nil {
		http.Error(w, "Erreur lecture commande: "+err.Error(), http.StatusInternalServerError)
		return
	}
	o.CustomerName = first + " " + last

	// Articles
	queryItems := `
        SELECT p.name, oi.quantity, oi.price 
        FROM order_items oi
        JOIN products p ON oi.product_id = p.id
        WHERE oi.order_id = $1`

	rows, err := h.DB.Query(queryItems, id)
	if err != nil {
		http.Error(w, "Erreur lecture articles", http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	var items []OrderItemResponse
	for rows.Next() {
		var item OrderItemResponse
		if err := rows.Scan(&item.ProductName, &item.Quantity, &item.UnitPrice); err == nil {
			items = append(items, item)
		}
	}

	if items == nil {
		items = []OrderItemResponse{}
	}
	o.Items = items

	json.NewEncoder(w).Encode(o)
}

// METTRE À JOUR LE STATUT (ADMIN)
func (h *OrderHandler) UpdateOrderStatus(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	idStr := strings.TrimPrefix(r.URL.Path, "/orders/update/")

	var req UpdateStatusRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Données invalides", http.StatusBadRequest)
		return
	}

	query := `UPDATE orders SET status = $1 WHERE id = $2`
	_, err := h.DB.Exec(query, req.Status, idStr)

	if err != nil {
		http.Error(w, "Erreur BDD", http.StatusInternalServerError)
		return
	}

	json.NewEncoder(w).Encode(map[string]string{
		"message": "Statut mis à jour",
	})
}

// MES COMMANDES (CLIENT CONNECTÉ)
func (h *OrderHandler) GetMyOrders(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	// Extraction du Token
	authHeader := r.Header.Get("Authorization")
	if authHeader == "" {
		http.Error(w, "Token manquant", http.StatusUnauthorized)
		return
	}
	// "Bearer <token>" -> on garde juste le token
	parts := strings.Split(authHeader, " ")
	if len(parts) != 2 || parts[0] != "Bearer" {
		http.Error(w, "Token malformé", http.StatusUnauthorized)
		return
	}
	tokenString := parts[1]

	// Validation Token & Récupération UserID
	claims := &jwt.MapClaims{}
	token, err := jwt.ParseWithClaims(tokenString, claims, func(token *jwt.Token) (interface{}, error) {
		return jwtKeyOrder, nil
	})

	if err != nil || !token.Valid {
		http.Error(w, "Token invalide", http.StatusUnauthorized)
		return
	}

	// Récupérer l'ID utilisateur depuis le Token
	idFloat, ok := (*claims)["user_id"].(float64)
	if !ok {
		http.Error(w, "ID utilisateur introuvable dans le token", http.StatusUnauthorized)
		return
	}
	userID := int(idFloat)

	// Récupérer l'email de l'utilisateur (car orders est lié par customer_email)
	var userEmail string
	err = h.DB.QueryRow("SELECT email FROM users WHERE id = $1", userID).Scan(&userEmail)
	if err != nil {
		// Cas rare : le user a un token mais n'est plus en BDD
		http.Error(w, "Utilisateur introuvable", http.StatusNotFound)
		return
	}

	// Récupérer les commandes liées à cet email
	query := `
        SELECT id, customer_firstname, customer_lastname, total_amount, status, created_at, delivery_method 
        FROM orders 
        WHERE customer_email = $1 
        ORDER BY created_at DESC`

	rows, err := h.DB.Query(query, userEmail)
	if err != nil {
		fmt.Println("Erreur SQL:", err) // Log pour débug
		http.Error(w, "Erreur serveur", http.StatusInternalServerError)
		return
	}
	defer rows.Close()

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
