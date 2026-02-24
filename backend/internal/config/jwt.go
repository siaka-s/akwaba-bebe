package config

import "os"

// JWTKey retourne la clé de signature JWT depuis la variable d'environnement JWT_SECRET.
// En développement local, une valeur par défaut est utilisée si la variable n'est pas définie.
// ⚠️ En production (App Runner), JWT_SECRET doit absolument être configurée en tant que variable d'environnement.
func JWTKey() []byte {
	key := os.Getenv("JWT_SECRET")
	if key == "" {
		// Valeur de développement uniquement — jamais en production
		return []byte("ma_cle_secrete_akwaba_2026")
	}
	return []byte(key)
}
