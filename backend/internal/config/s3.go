package config

import (
	"os"

	"github.com/aws/aws-sdk-go/aws"
	"github.com/aws/aws-sdk-go/aws/session"
	"github.com/aws/aws-sdk-go/service/s3"
)

// InitS3Session prépare la connexion avec S3
func InitS3Session() (*s3.S3, error) {
	region := os.Getenv("AWS_REGION")
	if region == "" {
		region = "us-east-1"
		
	}

	sess, err := session.NewSession(&aws.Config{
		Region: aws.String(region),
	})

	if err != nil {
		return nil, err
	}

	return s3.New(sess), nil
}
