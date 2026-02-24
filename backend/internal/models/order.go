package models

import "time"

// Ce que le Frontend envoie lors du checkout
type OrderRequest struct {
	// Infos Client
	FirstName string `json:"first_name"`
	LastName  string `json:"last_name"`
	Email     string `json:"email"`
	Phone     string `json:"phone"`

	// Livraison
	DeliveryMethod  string `json:"delivery_method"`
	ShippingCity    string `json:"shipping_city"`
	ShippingCommune string `json:"shipping_commune"`
	ShippingAddress string `json:"shipping_address"`

	// Options
	CreateAccount bool   `json:"create_account"`
	Password      string `json:"password"` // Non stocké dans la table orders
	OrderNote     string `json:"order_note"`

	// Panier
	Items []CartItem `json:"items"`
	Total float64    `json:"total"`
}

type CartItem struct {
	ID       int     `json:"id"` // ID du produit
	Quantity int     `json:"quantity"`
	Price    float64 `json:"price"`
}

// MODÈLES BASE DE DONNÉES

// Représente une ligne de la table 'orders'
type Order struct {
	ID                int    `json:"id"`
	CustomerFirstname string `json:"customer_firstname"`
	CustomerLastname  string `json:"customer_lastname"`
	CustomerEmail     string `json:"customer_email"`
	CustomerPhone     string `json:"customer_phone"`

	DeliveryMethod  string `json:"delivery_method"`
	ShippingCity    string `json:"shipping_city"`
	ShippingCommune string `json:"shipping_commune"`
	ShippingAddress string `json:"shipping_address"`

	OrderNote   string  `json:"order_note"`
	TotalAmount float64 `json:"total_amount"`
	Status      string  `json:"status"`

	CreatedAt time.Time `json:"created_at"`
}

// Représente une ligne de la table 'order_items'
type OrderItem struct {
	ID        int     `json:"id"`
	OrderID   int     `json:"order_id"`
	ProductID int     `json:"product_id"`
	Quantity  int     `json:"quantity"`
	Price     float64 `json:"price"`
}
