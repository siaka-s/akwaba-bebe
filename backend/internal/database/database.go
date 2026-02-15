package database

import (
	"database/sql"
	"fmt"
	"log"
	"os"
	"time"

	_ "github.com/lib/pq"
)

// InitDB initialise la connexion en basculant entre le mode local et production
func InitDB() *sql.DB {
	var psqlInfo string

	// Récupération de la variable d'environnement aws RDS
	dsn := os.Getenv("DATABASE_URL")

	if dsn != "" {
		// --- CONFIGURATION PRODUCTION (AWS RDS) ---
		psqlInfo = dsn
	} else {
		// Garder les params pour travailler en local
		const (
			host   = "localhost"
			port   = 5432
			user   = "siahouesiaka"
			dbname = "akwaba_db"
		)
		psqlInfo = fmt.Sprintf("host=%s port=%d user=%s dbname=%s sslmode=disable",
			host, port, user, dbname)
	}

	db, err := sql.Open("postgres", psqlInfo)
	if err != nil {
		log.Fatal("Erreur de configuration DB :", err)
	}

	// --- OPTIMISATION POUR LA PRODUCTION ---
	// Limite le nombre de connexions ouvertes pour ne pas saturer le RDS
	db.SetMaxOpenConns(25)
	db.SetMaxIdleConns(25)
	db.SetConnMaxLifetime(5 * time.Minute)

	// Vérification de la connexion
	if err = db.Ping(); err != nil {
		log.Fatal("Impossible de joindre la DB :", err)
	}

	if dsn != "" {
		fmt.Println("🚀 Connecté à AWS RDS avec succès !")
	} else {
		fmt.Println("✅ Connecté à PostgreSQL Local avec succès !")
	}

	return db
}
