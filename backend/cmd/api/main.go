package main

import (
	"fmt"
	"log"
	"net/http"
	"strings"

	"akwaba-bebe/backend/internal/database"
	"akwaba-bebe/backend/internal/handlers"
	"akwaba-bebe/backend/internal/middleware"

	_ "github.com/lib/pq"
)

func main() {
	db := database.InitDB()
	defer db.Close()

	// Initialisation des Handlers
	productHandler := &handlers.ProductHandler{DB: db}
	authHandler := &handlers.AuthHandler{DB: db}
	categoryHandler := &handlers.CategoryHandler{DB: db}
	articleHandler := &handlers.ArticleHandler{DB: db}
	orderHandler := &handlers.OrderHandler{DB: db}

	// --- AUTH ---
	http.HandleFunc("/signup", enableCORS(authHandler.Signup))
	http.HandleFunc("/login", enableCORS(authHandler.Login))

	// --- PROFIL USER
	http.HandleFunc("/profile", enableCORS(func(w http.ResponseWriter, r *http.Request) {
		switch r.Method {
		case http.MethodGet:
			// Récupérer les infos du profil
			authHandler.GetProfile(w, r)
		case http.MethodPut:
			// Mettre à jour le profil
			authHandler.UpdateProfile(w, r)
		default:
			http.Error(w, "Méthode non autorisée", http.StatusMethodNotAllowed)
		}
	}))

	// --- PRODUITS ---

	// 1. Route exacte "/products" -> Liste (GET) et Création (POST)
	http.HandleFunc("/products", enableCORS(func(w http.ResponseWriter, r *http.Request) {
		if r.URL.Path != "/products" {
			productHandlerDispatcher(w, r, productHandler)
			return
		}

		switch r.Method {
		case http.MethodGet:
			productHandler.GetAllProducts(w, r)
		case http.MethodPost:
			middleware.IsAdmin(productHandler.CreateProduct)(w, r)
		default:
			http.Error(w, "Méthode non autorisée", http.StatusMethodNotAllowed)
		}
	}))

	// 2. Route avec ID "/products/" -> Détail, Update, Delete
	http.HandleFunc("/products/", enableCORS(func(w http.ResponseWriter, r *http.Request) {
		productHandlerDispatcher(w, r, productHandler)
	}))

	// --- CATÉGORIES ---
	http.HandleFunc("/categories", enableCORS(func(w http.ResponseWriter, r *http.Request) {
		if r.Method == "GET" {
			categoryHandler.GetCategories(w, r)
		} else if r.Method == "POST" {
			middleware.IsAdmin(categoryHandler.CreateCategory)(w, r)
		}
	}))

	http.HandleFunc("/categories/update/", enableCORS(func(w http.ResponseWriter, r *http.Request) {
		if r.Method == "PUT" {
			categoryHandler.UpdateCategory(w, r)
		}
	}))
	http.HandleFunc("/categories/delete/", enableCORS(func(w http.ResponseWriter, r *http.Request) {
		if r.Method == "DELETE" {
			categoryHandler.DeleteCategory(w, r)
		}
	}))

	// --- COMMANDES ---
	http.HandleFunc("/orders", enableCORS(func(w http.ResponseWriter, r *http.Request) {
		switch r.Method {
		case "POST":
			orderHandler.CreateOrder(w, r)
		case "GET":
			orderHandler.GetAllOrders(w, r)
		}
	}))

	// Détail commande (GET /orders/123)
	http.HandleFunc("/orders/", enableCORS(func(w http.ResponseWriter, r *http.Request) {
		if r.Method == "GET" {
			orderHandler.GetOrderDetails(w, r)
		}
	}))

	// Mise à jour statut commande (POST /orders/update/123)
	http.HandleFunc("/orders/update/", enableCORS(func(w http.ResponseWriter, r *http.Request) {
		if r.Method == "POST" {
			// Idéalement à protéger par middleware.IsAdmin
			orderHandler.UpdateOrderStatus(w, r)
		}
	}))

	// MES COMMANDES (Client)
	http.HandleFunc("/my-orders", enableCORS(func(w http.ResponseWriter, r *http.Request) {
		if r.Method == "GET" {
			orderHandler.GetMyOrders(w, r)
		}
	}))

	// ARTICLES (BLOG)
	http.HandleFunc("/articles", enableCORS(func(w http.ResponseWriter, r *http.Request) {
		switch r.Method {
		case "GET":
			articleHandler.GetAllArticles(w, r)
		case "POST":
			middleware.IsAdmin(articleHandler.CreateArticle)(w, r)
		}
	}))

	fmt.Println("🚀 Serveur Akwaba sécurisé prêt sur http://localhost:8080")
	log.Fatal(http.ListenAndServe(":8080", nil))
}

// Fonction utilitaire pour gérer les routes /products/{id}
func productHandlerDispatcher(w http.ResponseWriter, r *http.Request, h *handlers.ProductHandler) {
	id := strings.TrimPrefix(r.URL.Path, "/products/")
	if id == "" || id == "/" {
		http.Error(w, "ID manquant", http.StatusBadRequest)
		return
	}

	switch r.Method {
	case http.MethodGet:
		h.GetProduct(w, r)
	case http.MethodPut:
		middleware.IsAdmin(h.UpdateProduct)(w, r)
	case http.MethodDelete:
		middleware.IsAdmin(h.DeleteProduct)(w, r)
	default:
		http.Error(w, "Méthode non autorisée", http.StatusMethodNotAllowed)
	}
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
