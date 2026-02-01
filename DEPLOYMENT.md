# Finance OS Backend - Deployment Documentation

This repository contains the backend API for Finance OS. This document serves as the entry point for deployment procedures.

## Quick Links

-   [**Docker Deployment Guide**](docs/deployment/docker.md): Instructions for deploying using Docker and Docker Compose (Recommended).
-   [**Google Compute Engine Guide**](docs/deployment/gce.md): Instructions for deploying to GCP, including High Availability setup.
-   [**CircleCI CI/CD Guide**](docs/deployment/circleci.md): Automate deployment to GCE using CircleCI.
-   [**API Documentation**](docs/api/money-tracker-api.postman_collection.json): Postman collection for API testing.

## Deployment Options

### 1. Docker (Recommended)

The easiest way to run the application is using Docker. It handles dependencies and environment setup automatically.

```bash
# Build and run
docker-compose up -d --build
```

See [Docker Deployment Guide](docs/deployment/docker.md) for full details.

### 2. Traditional VM (Ubuntu)

If you prefer running directly on a VM (e.g., using PM2), please refer to the legacy instructions or adapt the [Docker Guide](docs/deployment/docker.md) to run manually. The previous deployment guide is available in git history or can be adapted from the `scripts/` folder.

## API Documentation

The API is fully documented using Postman.
Import the [Postman Collection](docs/api/money-tracker-api.postman_collection.json) to view all endpoints, request schemas, and examples.

## Environment Variables

Copy `.env.example` to `.env` and configure the following:

-   `NODE_ENV`: `production` or `development`
-   `PORT`: API port (default 3000)
-   `SUPABASE_URL`: Your Supabase project URL
-   `SUPABASE_ANON_KEY`: Supabase Anon Key
-   `SUPABASE_SERVICE_ROLE_KEY`: Supabase Service Role Key
-   `CORS_ORIGIN`: Allowed origins (e.g., `https://your-frontend.com`)

## Health Check

The API exposes a health check endpoint:

```
GET /api/health
```
