# Docker Deployment Guide

This guide details how to deploy the Money Tracker Backend using Docker and Docker Compose.

## Prerequisites

- Docker Engine 20.10+ installed
- Docker Compose v2.0+ installed
- Git

## Docker Configuration

### Dockerfile

The project uses a multi-stage build process to ensure a small and secure production image.

1.  **Builder Stage**: Installs all dependencies and builds the TypeScript source code.
2.  **Production Stage**: Copies only the built artifacts (`dist`) and production dependencies. Runs as a non-root user (`appuser`).

### Docker Compose

The `docker-compose.yml` file defines the service configuration, including:
-   Port mapping (3000:3000)
-   Environment variables injection
-   Health checks
-   Resource limits
-   Restart policies

## Step-by-Step Deployment

### 1. Build the Image

```bash
docker-compose build
```

### 2. Configure Environment

Create a `.env` file from the example:

```bash
cp .env.example .env
```

Edit `.env` and populate the required variables (Supabase credentials, etc.).

### 3. Start the Service

Run the container in detached mode:

```bash
docker-compose up -d
```

### 4. Verify Deployment

Check if the container is running:

```bash
docker-compose ps
```

View logs:

```bash
docker-compose logs -f
```

Check the health endpoint:

```bash
curl http://localhost:3000/api/health
```

## Production Optimizations

-   **Multi-stage Build**: Reduces image size by excluding dev dependencies and source code.
-   **Non-root User**: The application runs as `appuser` instead of `root` for better security.
-   **Resource Limits**: CPU and memory limits are defined in `docker-compose.yml` to prevent resource exhaustion.
-   **Health Checks**: Built-in health check ensures the container is restarted if the application becomes unresponsive.

## Troubleshooting

### Container Exits Immediately

Check the logs for errors:

```bash
docker-compose logs api
```

Common causes:
-   Missing environment variables.
-   Database connection failure (check Supabase credentials).
-   Port conflicts (ensure port 3000 is free).

### Connectivity Issues

If you cannot access the API:
-   Ensure the container is running (`docker-compose ps`).
-   Check firewall settings (allow port 3000).
-   Verify `HOST` environment variable is set to `0.0.0.0` (default in docker-compose).

### Rebuilding

If you make changes to the code, rebuild the image:

```bash
docker-compose up -d --build
```
