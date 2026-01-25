package main

import (
	"database/sql"
	"fmt"
	"log"

	_ "github.com/lib/pq"
)

func main() {
	connStr := "user=siahouesiaka dbname=akwaba_db sslmode=disable"
	db, err := sql.Open("postgres", connStr)
	if err != nil {
		log.Fatal(err)
	}

	defer db.Close()

	err = db.Ping()
	if err != nil {
		log.Fatal("Impossible de se connecter à la base : ", err)
	}

	fmt.Println("🎉 Succès ! Akwaba Bébé est connecté à la base de données PostgreSQL !")
}
