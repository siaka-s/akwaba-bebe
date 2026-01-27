package models

// --- MODÈLE DE DONNÉES ---
type Product struct {
	ID            int     `json:"id"`
	Name          string  `json:"name"`
	Description   string  `json:"description"`
	Price         float64 `json:"price"`
	StockQuantity int     `json:"stock_quantity"`
	CategoryID    int     `json:"category_id"`
	ImageURL      string  `json:"image_url"`
}
