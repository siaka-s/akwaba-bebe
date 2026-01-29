package main

import (
	"fmt"
	"log"
	"net/http"

	"akwaba-bebe/backend/internal/database"
	"akwaba-bebe/backend/internal/handlers"
	"akwaba-bebe/backend/internal/middleware"

	_ "github.com/lib/pq"
)

func main() {
	db := database.InitDB()
	defer db.Close()

	// Initialisation des Vendeurs (Handlers)
	productHandler := &handlers.ProductHandler{DB: db}
	authHandler := &handlers.AuthHandler{DB: db}
	categoryHandler := &handlers.CategoryHandler{DB: db}
	articleHandler := &handlers.ArticleHandler{DB: db}
	orderHandler := &handlers.OrderHandler{DB: db}

	// --- ROUTES PUBLIQUES ---
	http.HandleFunc("/signup", enableCORS(authHandler.Signup))
	http.HandleFunc("/login", enableCORS(authHandler.Login))

	// --- ROUTE COMMANDES ---
	http.HandleFunc("/orders", enableCORS(func(w http.ResponseWriter, r *http.Request) {
		switch r.Method {
		case "POST":
			// Public : Créer une commande
			orderHandler.CreateOrder(w, r)
		case "GET":
			// Admin : Voir les commandes (Idéalement à protéger avec middleware.IsAdmin)
			orderHandler.GetAllOrders(w, r)
		default:
			http.Error(w, "Méthode non autorisée", http.StatusMethodNotAllowed)
		}
	}))

	http.HandleFunc("/orders/update/", enableCORS(func(w http.ResponseWriter, r *http.Request) {
		if r.Method == "POST" {
			// Admin seulement
			middleware.IsAdmin(orderHandler.UpdateOrderStatus)(w, r)
		} else {
			http.Error(w, "Méthode non autorisée", http.StatusMethodNotAllowed)
		}
	}))

	// ROUTE DÉTAIL COMMANDE (/orders/123)
	http.HandleFunc("/orders/", enableCORS(func(w http.ResponseWriter, r *http.Request) {
		if r.Method == "GET" {
			orderHandler.GetOrderDetails(w, r)
		} else {
			http.Error(w, "Méthode non autorisée", http.StatusMethodNotAllowed)
		}
	}))

	// Route /articles

	http.HandleFunc("/articles", enableCORS(func(w http.ResponseWriter, r *http.Request) {
		switch r.Method {
		case "GET":
			articleHandler.GetAllArticles(w, r)
		case "POST":
			// Protégé par Admin
			middleware.IsAdmin(articleHandler.CreateArticle)(w, r)
		default:
			http.Error(w, "Méthode non autorisée", http.StatusMethodNotAllowed)
		}
	}))

	// ROUTES CATÉGORIES
	http.HandleFunc("/categories", enableCORS(func(w http.ResponseWriter, r *http.Request) {
		if r.Method == "GET" {
			categoryHandler.GetCategories(w, r)
		} else if r.Method == "POST" {
			// Protégé par Admin
			middleware.IsAdmin(categoryHandler.CreateCategory)(w, r)
			categoryHandler.CreateCategory(w, r)
		}
	}))

	// Modification
	http.HandleFunc("/categories/update/", enableCORS(func(w http.ResponseWriter, r *http.Request) {
		if r.Method == "PUT" {
			categoryHandler.UpdateCategory(w, r)
		}
	}))

	// Suppression
	http.HandleFunc("/categories/delete/", enableCORS(func(w http.ResponseWriter, r *http.Request) {
		if r.Method == "DELETE" {
			categoryHandler.DeleteCategory(w, r)
		}
	}))

	// Route /products (Liste & Création)
	http.HandleFunc("/products", enableCORS(func(w http.ResponseWriter, r *http.Request) {

		switch r.Method {
		case http.MethodGet:
			// Tout le monde peut voir la liste
			productHandler.GetAllProducts(w, r)
		case http.MethodPost:
			// Seul l'admin peut créer
			middleware.IsAdmin(productHandler.CreateProduct)(w, r)
		case http.MethodOptions:
			// Géré par le middleware CORS, mais on peut le laisser vide ici
			return
		default:
			http.Error(w, "Méthode non autorisée", http.StatusMethodNotAllowed)
		}
	}))

	// Route /products/{id} (Détail, Modif, Suppr)
	http.HandleFunc("/products/", enableCORS(func(w http.ResponseWriter, r *http.Request) {

		switch r.Method {
		case http.MethodGet:
			productHandler.HandleByID(w, r)
		case http.MethodPut, http.MethodDelete:
			// On regroupe PUT et DELETE car ils ont la même protection (Admin)
			middleware.IsAdmin(productHandler.HandleByID)(w, r)
		case http.MethodOptions:
			return
		default:
			http.Error(w, "Méthode non autorisée", http.StatusMethodNotAllowed)
		}
	}))

	// http.HandleFunc("/products/update/", enableCORS(func(w http.ResponseWriter, r *http.Request) {
	// 	if r.Method == "PUT" {
	// 		productHandler.UpdateProduct(w, r)
	// 	}
	// }))

	// // Suppression
	// http.HandleFunc("/products/delete/", enableCORS(func(w http.ResponseWriter, r *http.Request) {
	// 	if r.Method == "DELETE" {
	// 		productHandler.DeleteProduct(w, r)
	// 	}
	// }))

	fmt.Println("🚀 Serveur Akwaba sécurisé prêt sur http://localhost:8080")
	log.Fatal(http.ListenAndServe(":8080", nil))
}

// Middleware CORS
func enableCORS(next http.HandlerFunc) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", "*")
		w.Header().Set("Access-Control-Allow-Methods", "POST, GET, OPTIONS, PUT, DELETE")
		w.Header().Set("Access-Control-Allow-Headers", "Accept, Content-Type, Content-Length, Accept-Encoding, Authorization")

		if r.Method == http.MethodOptions {
			w.WriteHeader(http.StatusOK)
			return
		}
		next(w, r)
	}
}
