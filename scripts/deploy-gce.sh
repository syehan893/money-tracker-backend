#!/bin/bash

# Configuration
PROJECT_ID="your-project-id"
IMAGE_NAME="gcr.io/$PROJECT_ID/money-tracker-api:latest"
INSTANCE_GROUP="money-tracker-mig"
REGION="us-central1"

# Ensure we stop on error
set -e

echo "Starting deployment to GCE..."

# 1. Build and Push Docker Image
echo "Building Docker image..."
docker build -t $IMAGE_NAME .

echo "Pushing image to Container Registry..."
docker push $IMAGE_NAME

# 2. Update Managed Instance Group
echo "Updating instances in group $INSTANCE_GROUP..."
gcloud compute instance-groups managed rolling-action replace $INSTANCE_GROUP \
    --max-unavailable=1 \
    --region=$REGION

echo "Deployment initiated. Monitor status with:"
echo "gcloud compute instance-groups managed list-instances $INSTANCE_GROUP --region=$REGION"
