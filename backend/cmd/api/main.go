package main

import (
	"fmt"
	"log"
	"net/http"

	"akwaba-bebe/backend/internal/database"
	"akwaba-bebe/backend/internal/handlers"

	_ "github.com/lib/pq"
)

func main() {
	db := database.InitDB()
	defer db.Close()

	productHandler := &handlers.ProductHandler{DB: db}

	// On enveloppe nos routes avec la fonction enableCORS
	http.HandleFunc("/products", enableCORS(productHandler.Routes))
	http.HandleFunc("/products/", enableCORS(productHandler.Routes))

	fmt.Println("🚀 Serveur Akwaba prêt sur http://localhost:8080")
	log.Fatal(http.ListenAndServe(":8080", nil))
}

// enableCORS est un "Middleware"
func enableCORS(next http.HandlerFunc) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		// auth * to l'API
		w.Header().Set("Access-Control-Allow-Origin", "*")

		// auth (GET, POST, etc.)
		w.Header().Set("Access-Control-Allow-Methods", "POST, GET, OPTIONS, PUT, DELETE")

		// auth  JSON
		w.Header().Set("Access-Control-Allow-Headers", "Accept, Content-Type, Content-Length, Accept-Encoding")

		// pré-vérification (OPTIONS), on dit OK tout de suite
		if r.Method == "OPTIONS" {
			return
		}

		// 5. Sinon, on laisse passer la requête vers le vrai code (next)
		next(w, r)
	}
}
