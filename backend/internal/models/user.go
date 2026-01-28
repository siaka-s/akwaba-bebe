package models

import "time"

type User struct {
	ID           int       `json:"id"`
	Email        string    `json:"email"`
	PasswordHash string    `json:"-"`
	FullName     string    `json:"full_name"`
	Phone        string    `json:"phone"`
	Role         string    `json:"role"` // ex: "user", "admin"
	CreatedAt    time.Time `json:"created_at"`
}

// Ce que le client envoie pour s'inscrire
type SignupInput struct {
	Email    string `json:"email"`
	Password string `json:"password"`
	FullName string `json:"full_name"`
	Phone    string `json:"phone"`
}

// Ce que le client envoie pour se connecter
type LoginInput struct {
	Email    string `json:"email"`
	Password string `json:"password"`
}
