package models

type Product struct {
	ID               int      `json:"id"`
	Name             string   `json:"name"`
	Description      string   `json:"description"`
	Price            float64  `json:"price"`
	StockQuantity    int      `json:"stock_quantity"`
	ImageURL         string   `json:"image_url"`
	CategoryID       int      `json:"category_id"`
	SubcategoryID    *int     `json:"subcategory_id"`
	PromotionPercent *float64 `json:"promotion_percent"`
}
