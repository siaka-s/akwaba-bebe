package main

import (
	"fmt"
	"log"
	"net/http"
	"strings"

	"akwaba-bebe/backend/internal/database"
	"akwaba-bebe/backend/internal/handlers"
	"akwaba-bebe/backend/internal/middleware"

	"github.com/joho/godotenv"
	_ "github.com/lib/pq"
)

func main() {
	// Configuration de l'environnement
	err := godotenv.Load()
	if err != nil {
		log.Println("Note: Utilisation des variables système (RDS/AppRunner).")
	}

	// Initialisation Base de Données
	db := database.InitDB()
	defer db.Close()

	// Initialisation des Handlers
	productHandler := &handlers.ProductHandler{DB: db}
	authHandler := &handlers.AuthHandler{DB: db}
	categoryHandler := &handlers.CategoryHandler{DB: db}
	articleHandler := &handlers.ArticleHandler{DB: db}
	orderHandler := &handlers.OrderHandler{DB: db}

	// --- ROUTES AUTHENTIFICATION ---
	http.HandleFunc("/signup", enableCORS(authHandler.Signup))
	http.HandleFunc("/login", enableCORS(authHandler.Login))

	// --- ROUTES PROFIL ---
	http.HandleFunc("/profile", enableCORS(func(w http.ResponseWriter, r *http.Request) {
		switch r.Method {
		case http.MethodGet:
			authHandler.GetProfile(w, r)
		case http.MethodPut:
			authHandler.UpdateProfile(w, r)
		default:
			http.Error(w, "Méthode non autorisée", http.StatusMethodNotAllowed)
		}
	}))

	// --- ROUTE S3 UPLOAD ---
	http.HandleFunc("/upload", enableCORS(func(w http.ResponseWriter, r *http.Request) {
		if r.Method == http.MethodPost {
			productHandler.UploadImage(w, r)
		} else {
			http.Error(w, "POST requis", http.StatusMethodNotAllowed)
		}
	}))

	// --- ROUTES PRODUITS ---
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

	http.HandleFunc("/products/", enableCORS(func(w http.ResponseWriter, r *http.Request) {
		productHandlerDispatcher(w, r, productHandler)
	}))

	// --- ROUTES CATÉGORIES ---
	http.HandleFunc("/categories", enableCORS(func(w http.ResponseWriter, r *http.Request) {
		switch r.Method {
		case "GET":
			categoryHandler.GetCategories(w, r)
		case "POST":
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

	// --- ROUTES COMMANDES ---
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

	http.HandleFunc("/orders/update/", enableCORS(func(w http.ResponseWriter, r *http.Request) {
		if r.Method == "POST" {
			orderHandler.UpdateOrderStatus(w, r)
		}
	}))

	http.HandleFunc("/my-orders", enableCORS(func(w http.ResponseWriter, r *http.Request) {
		if r.Method == "GET" {
			orderHandler.GetMyOrders(w, r)
		}
	}))

	// --- ROUTES BLOG ---
	http.HandleFunc("/articles", enableCORS(func(w http.ResponseWriter, r *http.Request) {
		switch r.Method {
		case "GET":
			articleHandler.GetAllArticles(w, r)
		case "POST":
			middleware.IsAdmin(articleHandler.CreateArticle)(w, r)
		}
	}))

	// Lancement du serveur
	port := ":8080"
	fmt.Printf("🚀 Serveur AWS opérationnel sur le port %s\n", port)
	log.Fatal(http.ListenAndServe(port, nil))
}

// Dispatcher pour IDs dynamiques (/products/123)
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

// Middleware CORS optimisé pour Vercel & Local
func enableCORS(next http.HandlerFunc) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		// On récupère l'origine pour renvoyer la même (indispensable pour les credentials)
		origin := r.Header.Get("Origin")
		if origin != "" {
			w.Header().Set("Access-Control-Allow-Origin", origin)
		} else {
			w.Header().Set("Access-Control-Allow-Origin", "*")
		}

		w.Header().Set("Access-Control-Allow-Methods", "POST, GET, OPTIONS, PUT, DELETE")
		// Vercel et Next.js envoient souvent des headers spécifiques, on les autorise tous :
		w.Header().Set("Access-Control-Allow-Headers", "Accept, Content-Type, Content-Length, Accept-Encoding, Authorization, X-Requested-With")
		w.Header().Set("Access-Control-Allow-Credentials", "true")

		// TRÈS IMPORTANT : Répondre OK immédiatement à OPTIONS
		if r.Method == http.MethodOptions {
			w.WriteHeader(http.StatusOK)
			return
		}

		next(w, r)
	}
}
