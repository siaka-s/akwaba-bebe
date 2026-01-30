package main

import (
	"fmt"
	"log"
	"net/http"
	"strings" // <--- Ne pas oublier d'importer strings

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

	// --- PRODUITS (Refactorisé) ---

	// 1. Route exacte "/products" -> Liste (GET) et Création (POST)
	http.HandleFunc("/products", enableCORS(func(w http.ResponseWriter, r *http.Request) {
		// Sécurité : Si l'URL est "/products/" (avec slash final) mais traitée ici par erreur
		if r.URL.Path != "/products" {
			// On renvoie vers le gestionnaire d'ID
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
	// Note: Idéalement, faire pareil pour catégories (regrouper update/delete sous /categories/)
	// Pour l'instant on garde tes anciennes routes catégories pour ne pas tout casser d'un coup
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
	http.HandleFunc("/orders/", enableCORS(func(w http.ResponseWriter, r *http.Request) {
		if r.Method == "GET" {
			orderHandler.GetOrderDetails(w, r)
		}
	}))

	// --- ARTICLES (BLOG) ---
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
	// Ici l'URL est par exemple "/products/15"
	// On vérifie qu'il y a bien un ID
	id := strings.TrimPrefix(r.URL.Path, "/products/")
	if id == "" || id == "/" {
		http.Error(w, "ID manquant", http.StatusBadRequest)
		return
	}

	switch r.Method {
	case http.MethodGet:
		// IMPORTANT: Tu dois avoir cette méthode dans ton handler !
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
