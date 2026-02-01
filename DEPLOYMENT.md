# Finance OS Backend - Deployment Guide

This guide covers deploying the Finance OS Backend to GCP Compute Engine with PM2 process management and Nginx reverse proxy.

## Prerequisites

- GCP Account with billing enabled
- Domain name (optional, for SSL)
- Supabase project set up with migrations applied

## Table of Contents

1. [GCP Compute Engine Setup](#1-gcp-compute-engine-setup)
2. [Server Configuration](#2-server-configuration)
3. [Application Deployment](#3-application-deployment)
4. [PM2 Configuration](#4-pm2-configuration)
5. [Nginx Setup](#5-nginx-setup)
6. [SSL Certificate Setup](#6-ssl-certificate-setup)
7. [Monitoring Setup](#7-monitoring-setup)
8. [Maintenance](#8-maintenance)

---

## 1. GCP Compute Engine Setup

### Create VM Instance

1. Go to GCP Console > Compute Engine > VM Instances
2. Click "Create Instance"
3. Configure the instance:

```
Name: finance-os-backend
Region: Choose closest to your users
Machine type: e2-small (2 vCPU, 2 GB memory) - adjust based on load
Boot disk: Ubuntu 22.04 LTS, 20 GB SSD
Firewall: Allow HTTP and HTTPS traffic
```

### Configure Firewall Rules

```bash
# Allow HTTP (port 80)
gcloud compute firewall-rules create allow-http \
  --allow tcp:80 \
  --target-tags http-server

# Allow HTTPS (port 443)
gcloud compute firewall-rules create allow-https \
  --allow tcp:443 \
  --target-tags https-server
```

### Connect to VM

```bash
gcloud compute ssh finance-os-backend --zone=YOUR_ZONE
```

---

## 2. Server Configuration

### Update System

```bash
sudo apt update && sudo apt upgrade -y
```

### Install Node.js 18+

```bash
# Install Node.js using NodeSource
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Verify installation
node --version
npm --version
```

### Install PM2 Globally

```bash
sudo npm install -g pm2
```

### Install Nginx

```bash
sudo apt install -y nginx
sudo systemctl enable nginx
sudo systemctl start nginx
```

### Install Git

```bash
sudo apt install -y git
```

### Create Application User (Optional but Recommended)

```bash
sudo useradd -m -s /bin/bash appuser
sudo usermod -aG sudo appuser
```

---

## 3. Application Deployment

### Clone Repository

```bash
cd /home/appuser
git clone <your-repository-url> finance-os-backend
cd finance-os-backend
```

### Install Dependencies

```bash
npm ci --production=false
```

### Build Application

```bash
npm run build
```

### Configure Environment

```bash
cp .env.example .env
nano .env
```

Set production environment variables:

```env
NODE_ENV=production
PORT=3000
HOST=127.0.0.1

# Supabase Configuration
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# CORS - Set to your frontend domain
CORS_ORIGIN=https://yourdomain.com

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Logging
LOG_LEVEL=info
```

### Set Proper Permissions

```bash
sudo chown -R appuser:appuser /home/appuser/finance-os-backend
chmod 600 /home/appuser/finance-os-backend/.env
```

---

## 4. PM2 Configuration

### Start Application with PM2

```bash
cd /home/appuser/finance-os-backend
pm2 start ecosystem.config.js --env production
```

### Save PM2 Process List

```bash
pm2 save
```

### Configure PM2 Startup Script

```bash
pm2 startup systemd -u appuser --hp /home/appuser
# Run the command that PM2 outputs
```

### Useful PM2 Commands

```bash
# View logs
pm2 logs finance-os-backend

# Monitor processes
pm2 monit

# Restart application
pm2 restart finance-os-backend

# Stop application
pm2 stop finance-os-backend

# View process details
pm2 show finance-os-backend
```

---

## 5. Nginx Setup

### Configure Nginx

```bash
sudo nano /etc/nginx/sites-available/finance-os-backend
```

Copy the contents from `nginx.conf` in this repository.

### Enable Site

```bash
sudo ln -s /etc/nginx/sites-available/finance-os-backend /etc/nginx/sites-enabled/
sudo rm /etc/nginx/sites-enabled/default
```

### Test Configuration

```bash
sudo nginx -t
```

### Reload Nginx

```bash
sudo systemctl reload nginx
```

---

## 6. SSL Certificate Setup

### Install Certbot

```bash
sudo apt install -y certbot python3-certbot-nginx
```

### Obtain Certificate

```bash
sudo certbot --nginx -d api.yourdomain.com
```

### Auto-Renewal

Certbot automatically sets up a cron job. Verify with:

```bash
sudo certbot renew --dry-run
```

---

## 7. Monitoring Setup

### PM2 Monitoring Dashboard (Optional)

```bash
pm2 link <secret_key> <public_key>
```

Get keys from [PM2 Plus](https://pm2.io/)

### System Monitoring with htop

```bash
sudo apt install -y htop
htop
```

### Log Management

Configure log rotation for PM2:

```bash
pm2 install pm2-logrotate
pm2 set pm2-logrotate:max_size 10M
pm2 set pm2-logrotate:retain 7
```

### Health Check Endpoint

The API provides a health check endpoint at `/api/health`:

```bash
curl http://localhost:3000/api/health
```

### Setup Simple Uptime Monitoring

Create a cron job to check application health:

```bash
crontab -e
```

Add:

```
*/5 * * * * curl -s http://localhost:3000/api/health > /dev/null || pm2 restart finance-os-backend
```

### GCP Monitoring (Recommended)

1. Enable Cloud Monitoring API in GCP Console
2. Install Ops Agent:

```bash
curl -sSO https://dl.google.com/cloudagents/add-google-cloud-ops-agent-repo.sh
sudo bash add-google-cloud-ops-agent-repo.sh --also-install
```

---

## 8. Maintenance

### Deployment Script

Use the provided deployment script for updates:

```bash
./scripts/deploy.sh
```

### Backup Considerations

Since data is stored in Supabase, backups are handled by Supabase's built-in backup system. You can also:

1. Enable Point-in-Time Recovery in Supabase dashboard
2. Schedule regular database exports

### Security Hardening

1. **Disable root SSH login**:
   ```bash
   sudo nano /etc/ssh/sshd_config
   # Set: PermitRootLogin no
   sudo systemctl restart sshd
   ```

2. **Configure UFW Firewall**:
   ```bash
   sudo ufw default deny incoming
   sudo ufw default allow outgoing
   sudo ufw allow ssh
   sudo ufw allow http
   sudo ufw allow https
   sudo ufw enable
   ```

3. **Enable automatic security updates**:
   ```bash
   sudo apt install -y unattended-upgrades
   sudo dpkg-reconfigure -plow unattended-upgrades
   ```

### Rolling Updates (Zero Downtime)

For zero-downtime deployments, use PM2's reload:

```bash
git pull origin main
npm ci --production=false
npm run build
pm2 reload ecosystem.config.js --env production
```

---

## Troubleshooting

### Application Won't Start

1. Check PM2 logs: `pm2 logs`
2. Verify environment variables: `cat .env`
3. Test manually: `node dist/server.js`

### Nginx 502 Bad Gateway

1. Check if app is running: `pm2 status`
2. Verify app is listening on correct port: `netstat -tlnp | grep 3000`
3. Check Nginx error logs: `sudo tail -f /var/log/nginx/error.log`

### Database Connection Issues

1. Verify Supabase URL and keys in `.env`
2. Check if Supabase project is active
3. Test connection: `curl https://your-project.supabase.co/rest/v1/`

### High Memory Usage

1. Monitor with: `pm2 monit`
2. Adjust PM2 instance count in `ecosystem.config.js`
3. Consider upgrading VM instance type

---

## Quick Reference

| Command | Description |
|---------|-------------|
| `pm2 status` | Check app status |
| `pm2 logs` | View logs |
| `pm2 restart all` | Restart all apps |
| `pm2 reload all` | Zero-downtime restart |
| `sudo systemctl status nginx` | Check Nginx status |
| `sudo nginx -t` | Test Nginx config |
| `sudo certbot renew` | Renew SSL certificates |
