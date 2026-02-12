package utils

import (
	"context"
	"fmt"
	"mime/multipart"
	"os"
	"path/filepath"
	"time"

	"github.com/aws/aws-sdk-go-v2/aws"
	"github.com/aws/aws-sdk-go-v2/config"
	"github.com/aws/aws-sdk-go-v2/service/s3"
)

// UploadToS3 prend un fichier et le renvoie sur S3, retourne l'URL publique
func UploadToS3(file multipart.File, fileHeader *multipart.FileHeader) (string, error) {
	// Charger la config AWS
	cfg, err := config.LoadDefaultConfig(context.TODO(),
		config.WithRegion(os.Getenv("AWS_REGION")),
	)
	if err != nil {
		return "", fmt.Errorf("erreur config aws: %w", err)
	}

	// Création du client S3 standard
	client := s3.NewFromConfig(cfg)

	// Créer un nom de fichier unique
	ext := filepath.Ext(fileHeader.Filename)
	// On utilise UnixNano pour garantir l'unicité
	filename := fmt.Sprintf("products/%d%s", time.Now().UnixNano(), ext)
	bucketName := os.Getenv("AWS_BUCKET_NAME")

	// Upload direct avec PutObject (Remplace l'ancien Uploader)
	// file (multipart.File) implémente déjà io.Reader, ce qui est parfait pour Body
	_, err = client.PutObject(context.TODO(), &s3.PutObjectInput{
		Bucket:      aws.String(bucketName),
		Key:         aws.String(filename),
		Body:        file,
		ContentType: aws.String(fileHeader.Header.Get("Content-Type")),
	})

	if err != nil {
		return "", fmt.Errorf("erreur upload s3: %w", err)
	}

	// Retourner l'URL publique
	url := fmt.Sprintf("https://%s.s3.%s.amazonaws.com/%s", bucketName, os.Getenv("AWS_REGION"), filename)
	return url, nil
}
