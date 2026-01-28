package handlers

import (
	"akwaba-bebe/backend/internal/models"
	"database/sql"
	"encoding/json"
	"net/http"
)

type OrderHandler struct {
	DB *sql.DB
}

func (h *OrderHandler) CreateOrder(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	var req models.OrderRequest
	// On décode le JSON envoyé par le site
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Données invalides", http.StatusBadRequest)
		return
	}

	// On commence une "Transaction" (sécurité : tout ou rien)
	tx, err := h.DB.Begin()
	if err != nil {
		http.Error(w, "Erreur serveur", http.StatusInternalServerError)
		return
	}

	//  On insère la commande principale (Table orders)
	// On récupère l'ID généré (RETURNING id)
	var orderID int
	queryOrder := `
		INSERT INTO orders (customer_name, customer_email, customer_phone, customer_address, total_amount)
		VALUES ($1, $2, $3, $4, $5)
		RETURNING id`

	err = tx.QueryRow(queryOrder, req.CustomerName, req.CustomerEmail, req.CustomerPhone, req.CustomerAddress, req.Total).Scan(&orderID)
	if err != nil {
		tx.Rollback() // On annule tout si ça plante
		http.Error(w, "Erreur enregistrement commande: "+err.Error(), http.StatusInternalServerError)
		return
	}

	// 4. On insère chaque article (Table order_items)
	queryItem := `INSERT INTO order_items (order_id, product_id, quantity, price) VALUES ($1, $2, $3, $4)`

	for _, item := range req.Items {
		_, err := tx.Exec(queryItem, orderID, item.ID, item.Quantity, item.Price)
		if err != nil {
			tx.Rollback()
			http.Error(w, "Erreur enregistrement article", http.StatusInternalServerError)
			return
		}
	}

	// 5. On valide tout
	if err := tx.Commit(); err != nil {
		http.Error(w, "Erreur validation", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(map[string]interface{}{
		"message":  "Commande enregistrée avec succès",
		"order_id": orderID,
	})
}
