package models

type OrderRequest struct {
	CustomerName    string     `json:"customer_name"`
	CustomerEmail   string     `json:"customer_email"`
	CustomerPhone   string     `json:"customer_phone"`
	CustomerAddress string     `json:"customer_address"`
	Items           []CartItem `json:"items"` // La liste du panier
	Total           float64    `json:"total"`
}

// Un article du panier reçu
type CartItem struct {
	ID       int     `json:"id"`
	Quantity int     `json:"quantity"`
	Price    float64 `json:"price"`
}
