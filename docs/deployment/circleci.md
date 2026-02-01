# CircleCI Deployment Guide

This guide details how to set up Continuous Integration and Deployment (CI/CD) for the Money Tracker Backend using CircleCI and Google Compute Engine (GCE).

## Overview

The pipeline configured in `.circleci/config.yml` performs the following steps:
1.  **Build and Test**: Installs dependencies, runs linting and build.
2.  **Build and Push Image**: Builds the Docker image and pushes it to Google Container Registry (GCR).
3.  **Deploy to GCE**: Updates the Managed Instance Group (MIG) with the new image version.

## Prerequisites

1.  **CircleCI Account**: Sign up and link your GitHub repository.
2.  **Google Cloud Project**: An active GCP project.
3.  **Service Account**: A GCP Service Account with permissions to access GCR and Compute Engine.

## Setup Steps

### 1. Configure GCP Service Account

1.  Go to **IAM & Admin > Service Accounts** in GCP Console.
2.  Create a new service account (e.g., `circleci-deployer`).
3.  Grant the following roles:
    *   `Storage Admin` (for GCR)
    *   `Compute Instance Admin (v1)` (for managing instances)
    *   `Service Account User` (to act as the compute service account)
4.  Create and download a **JSON Key** for this service account.

### 2. Configure CircleCI Environment Variables

In your CircleCI Project Settings > Environment Variables, add the following:

| Variable | Description |
|----------|-------------|
| `GOOGLE_PROJECT_ID` | Your GCP Project ID |
| `GOOGLE_COMPUTE_ZONE` | Default zone (e.g., `us-central1-a`) |
| `GOOGLE_COMPUTE_REGION`| Default region (e.g., `us-central1`) |
| `GCLOUD_SERVICE_KEY` | The content of your JSON key file (paste the whole JSON) |
| `SUPABASE_URL` | Your Supabase Project URL |
| `SUPABASE_ANON_KEY` | Your Supabase Anon Key |
| `SUPABASE_SERVICE_ROLE_KEY` | Your Supabase Service Role Key |
| `CORS_ORIGIN` | Allowed origins (e.g., `https://your-domain.com`) |

### 3. Initial GCP Infrastructure Setup

Before the first deployment, ensure your infrastructure exists. You can use the `gcloud` commands manually or the steps in the [GCE Deployment Guide](gce.md).

**Required Resources:**
1.  **Managed Instance Group (MIG)** named `money-tracker-mig`.
    *   This group should be created using an initial Instance Template.
    *   The CircleCI script assumes this group exists and will perform rolling updates on it.

**Quick Setup for MIG:**
```bash
# 1. Build initial image manually
gcloud builds submit --tag gcr.io/YOUR_PROJECT/money-tracker-api:initial .

# 2. Create initial template
gcloud compute instance-templates create-with-container money-tracker-template-initial \
    --container-image gcr.io/YOUR_PROJECT/money-tracker-api:initial \
    --machine-type e2-small

# 3. Create MIG
gcloud compute instance-groups managed create money-tracker-mig \
    --template money-tracker-template-initial \
    --size 1 \
    --zone us-central1-a
```

### 4. Enable APIs

Ensure the following APIs are enabled in your GCP project:
*   Google Container Registry API
*   Compute Engine API

## How it Works

1.  **Commit**: When you push to the `main` branch, CircleCI triggers the pipeline.
2.  **Docker Build**: CircleCI builds the Docker image and tags it with the commit SHA.
3.  **Push**: The image is pushed to `gcr.io/YOUR_PROJECT_ID/money-tracker-api:COMMIT_SHA`.
4.  **Deploy**:
    *   CircleCI generates a `.env` file from the project secrets.
    *   It creates a *new* Instance Template pointing to the new image and including the `.env` configuration.
    *   It triggers a rolling update on `money-tracker-mig`, replacing instances one by one with the new template.

## Troubleshooting

### Deployment Fails

*   **Permissions**: Check if `GCLOUD_SERVICE_KEY` service account has enough permissions.
*   **MIG Not Found**: Ensure `money-tracker-mig` exists in the specified region/zone.
*   **Health Checks**: If the new instances fail health checks, the rolling update will pause. Check the application logs on the instance.

### Secrets Management

The current configuration writes secrets to a `.env` file inside the Instance Template. For higher security, consider using **Google Secret Manager** and modifying the application to fetch secrets at runtime.
