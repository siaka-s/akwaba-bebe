package database

import (
	"database/sql"
	"fmt"
	"log"

	_ "github.com/lib/pq"
)

// InitDB ouvre la connexion et retourne l'objet *sql.DB utilisable par les autres fichiers
func InitDB() *sql.DB {
	const (
		host   = "localhost"
		port   = 5432
		user   = "siahouesiaka"
		dbname = "akwaba_db"
	)

	psqlInfo := fmt.Sprintf("host=%s port=%d user=%s dbname=%s sslmode=disable",
		host, port, user, dbname)

	db, err := sql.Open("postgres", psqlInfo)
	if err != nil {
		log.Fatal("Erreur de configuration DB :", err)
	}

	if err = db.Ping(); err != nil {
		log.Fatal("Impossible de joindre la DB :", err)
	}

	fmt.Println("✅ Connecté à PostgreSQL avec succès !")
	return db
}
