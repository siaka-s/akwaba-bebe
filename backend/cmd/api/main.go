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

	// Charger les variables d'environnement depuis .env
	err := godotenv.Load()
	if err != nil {
		log.Println("Note: Aucun fichier .env trouvé, on utilise les variables système.")
	}
	// Initialisation de la Base de Données
	db := database.InitDB()
	defer db.Close()

	// Initialisation des Gestionnaires (Handlers)
	productHandler := &handlers.ProductHandler{DB: db}
	authHandler := &handlers.AuthHandler{DB: db}
	categoryHandler := &handlers.CategoryHandler{DB: db}
	articleHandler := &handlers.ArticleHandler{DB: db}
	orderHandler := &handlers.OrderHandler{DB: db}

	// --- AUTHENTIFICATION ---
	http.HandleFunc("/signup", enableCORS(authHandler.Signup))
	http.HandleFunc("/login", enableCORS(authHandler.Login))

	// --- PROFIL UTILISATEUR ---
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

	// --- UPLOAD IMAGE (NOUVEAU - AWS S3) ---
	// Route pour uploader une image produit
	http.HandleFunc("/upload", enableCORS(func(w http.ResponseWriter, r *http.Request) {
		if r.Method == http.MethodPost {
			// Idéalement, à protéger avec middleware.IsAdmin(productHandler.UploadImage)(w, r)
			productHandler.UploadImage(w, r)
		} else {
			http.Error(w, "Méthode non autorisée, utilisez POST", http.StatusMethodNotAllowed)
		}
	}))

	// --- PRODUITS ---

	// Route racine "/products" -> Liste & Création
	http.HandleFunc("/products", enableCORS(func(w http.ResponseWriter, r *http.Request) {
		// Sécurité : évite que "/products/quelquechose" soit traité ici par erreur
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

	// Route dynamique "/products/{id}" -> Détail, Modif, Suppr
	http.HandleFunc("/products/", enableCORS(func(w http.ResponseWriter, r *http.Request) {
		productHandlerDispatcher(w, r, productHandler)
	}))

	// --- CATÉGORIES ---
	http.HandleFunc("/categories", enableCORS(func(w http.ResponseWriter, r *http.Request) {

		switch r.Method {
		case "POST":
			categoryHandler.GetCategories(w, r)
		case "GET":
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

	// Création et Liste Admin
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
			orderHandler.UpdateOrderStatus(w, r)
		}
	}))

	// Historique Client (GET /my-orders)
	http.HandleFunc("/my-orders", enableCORS(func(w http.ResponseWriter, r *http.Request) {
		if r.Method == "GET" {
			orderHandler.GetMyOrders(w, r)
		}
	}))

	// --- BLOG / ARTICLES ---
	http.HandleFunc("/articles", enableCORS(func(w http.ResponseWriter, r *http.Request) {
		switch r.Method {
		case "GET":
			articleHandler.GetAllArticles(w, r)
		case "POST":
			middleware.IsAdmin(articleHandler.CreateArticle)(w, r)
		}
	}))

	fmt.Println("🚀 Serveur Akwaba sécurisé prêt sur http://localhost:8080")
	fmt.Println("déploiement avec les nouveaux secrets pour actions github")
	log.Fatal(http.ListenAndServe(":8080", nil))
}

// ---------------------------------------------------------
// UTILITAIRES
// ---------------------------------------------------------

// Dispatcher pour gérer les routes dynamiques /products/{id}
func productHandlerDispatcher(w http.ResponseWriter, r *http.Request, h *handlers.ProductHandler) {
	// Extraction de l'ID depuis l'URL
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

// Middleware pour activer CORS (Cross-Origin Resource Sharing)
func enableCORS(next http.HandlerFunc) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		// Autoriser toutes les origines (pour le dev)
		w.Header().Set("Access-Control-Allow-Origin", "*")
		w.Header().Set("Access-Control-Allow-Methods", "POST, GET, OPTIONS, PUT, DELETE")
		w.Header().Set("Access-Control-Allow-Headers", "Accept, Content-Type, Content-Length, Accept-Encoding, Authorization")

		// Gestion de la requête préliminaire (Preflight)
		if r.Method == http.MethodOptions {
			w.WriteHeader(http.StatusOK)
			return
		}
		next(w, r)
	}
}
