package models

type OrderRequest struct {
	// Infos Client
	FirstName string `json:"first_name"`
	LastName  string `json:"last_name"`
	Email     string `json:"email"`
	Phone     string `json:"phone"`

	// Livraison
	DeliveryMethod  string `json:"delivery_method"` // "pickup" ou "shipping"
	ShippingCity    string `json:"shipping_city"`
	ShippingCommune string `json:"shipping_commune"`
	ShippingAddress string `json:"shipping_address"`

	// Options
	CreateAccount bool   `json:"create_account"`
	Password      string `json:"password"` // on ne le stocke pas dans la table commande (logique utilisateur à part)
	OrderNote     string `json:"order_note"`

	// Panier
	Items []CartItem `json:"items"`
	Total float64    `json:"total"`
}

type CartItem struct {
	ID       int     `json:"id"`
	Quantity int     `json:"quantity"`
	Price    float64 `json:"price"`
}
