package models

// SubCategory représente une sous-catégorie liée à une catégorie parente
type SubCategory struct {
	ID         int    `json:"id"`
	Name       string `json:"name"`
	CategoryID int    `json:"category_id"`
}
