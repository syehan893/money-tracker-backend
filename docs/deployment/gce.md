# Google Compute Engine (GCE) Deployment Guide

This guide covers deploying the Money Tracker Backend to Google Compute Engine using Docker.

## Prerequisites

-   Google Cloud Platform (GCP) Account
-   `gcloud` CLI installed and configured
-   A GCP Project created

## 1. Infrastructure Setup

### Create VM Instance

Create a VM instance optimized for Docker:

```bash
gcloud compute instances create money-tracker-backend \
    --project=YOUR_PROJECT_ID \
    --zone=us-central1-a \
    --machine-type=e2-small \
    --image-family=cos-stable \
    --image-project=cos-cloud \
    --boot-disk-size=20GB \
    --tags=http-server,https-server
```

*Note: We use Container-Optimized OS (COS) which is pre-configured with Docker.*

### Configure Firewall

Allow HTTP/HTTPS traffic:

```bash
gcloud compute firewall-rules create allow-http \
    --allow tcp:80 \
    --target-tags http-server

gcloud compute firewall-rules create allow-https \
    --allow tcp:443 \
    --target-tags https-server

# Allow API port if accessing directly (optional, recommended to use Load Balancer or Nginx)
gcloud compute firewall-rules create allow-api \
    --allow tcp:3000 \
    --target-tags http-server
```

## 2. Deploying with Docker

### Option A: Using Container-Optimized OS (Recommended)

Since we selected COS image, we can deploy the container directly using `gcloud`:

1.  **Build and Push Image** (requires Google Container Registry or Docker Hub):

    ```bash
    # Configure Docker to use gcloud credentials
    gcloud auth configure-docker

    # Build and push
    docker build -t gcr.io/YOUR_PROJECT_ID/money-tracker-api:latest .
    docker push gcr.io/YOUR_PROJECT_ID/money-tracker-api:latest
    ```

2.  **Deploy to VM**:

    ```bash
    gcloud compute instances update-container money-tracker-backend \
        --container-image=gcr.io/YOUR_PROJECT_ID/money-tracker-api:latest \
        --container-env-file=.env
    ```

### Option B: Using Ubuntu & Docker Compose

If you prefer a standard Ubuntu VM (as described in the legacy deployment guide):

1.  **SSH into VM**:
    ```bash
    gcloud compute ssh money-tracker-backend
    ```

2.  **Install Docker & Compose**:
    ```bash
    sudo apt-get update
    sudo apt-get install -y docker.io docker-compose
    sudo usermod -aG docker $USER
    # Log out and back in for group changes to take effect
    ```

3.  **Clone & Run**:
    ```bash
    git clone <your-repo-url>
    cd money-tracker-backend
    cp .env.example .env
    # Edit .env
    docker-compose up -d
    ```

## 3. High Availability & Load Balancing

For production, use an Instance Group and Load Balancer.

1.  **Create Instance Template**:
    ```bash
    gcloud compute instance-templates create-with-container money-tracker-template \
        --container-image=gcr.io/YOUR_PROJECT_ID/money-tracker-api:latest \
        --machine-type=e2-small
    ```

2.  **Create Managed Instance Group (MIG)**:
    ```bash
    gcloud compute instance-groups managed create money-tracker-mig \
        --template=money-tracker-template \
        --size=2 \
        --zone=us-central1-a
    ```

3.  **Set Autoscaling**:
    ```bash
    gcloud compute instance-groups managed set-autoscaling money-tracker-mig \
        --max-num-replicas=5 \
        --target-cpu-utilization=0.6
    ```

4.  **Create Load Balancer**:
    -   Go to Network Services > Load balancing.
    -   Create HTTP(S) Load Balancer.
    -   Backend configuration: Select your Instance Group.
    -   Frontend configuration: Reserve a static IP, set up HTTPS certificate.

## 4. Automation script

Use the following script (`scripts/deploy-gce.sh`) to automate updates:

```bash
#!/bin/bash
IMAGE_NAME="gcr.io/YOUR_PROJECT_ID/money-tracker-api:latest"

echo "Building image..."
docker build -t $IMAGE_NAME .

echo "Pushing image..."
docker push $IMAGE_NAME

echo "Updating instances..."
gcloud compute instance-groups managed rolling-action replace money-tracker-mig \
    --max-unavailable=1 \
    --region=us-central1
```

## 5. Cost Optimization

-   **Machine Type**: `e2-small` or `e2-micro` is sufficient for low traffic.
-   **Spot Instances**: Use Spot VMs for the Instance Group to save up to 90% costs (ensure your app is stateless).
-   **Autoscaling**: Configure autoscaling to scale down to 1 instance during low traffic.
