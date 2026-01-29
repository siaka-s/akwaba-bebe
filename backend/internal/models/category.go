package models

// Category représente une catégorie de produits dans la base de données
type Category struct {
	ID   int    `json:"id"`
	Name string `json:"name"`
}
