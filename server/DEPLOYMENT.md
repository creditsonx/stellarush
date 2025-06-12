# 🚀 STELLARUSH Server Deployment Guide

This guide covers deploying the STELLARUSH WebSocket server to various cloud platforms.

## 🚂 Railway Deployment (Recommended)

Railway is the easiest option for Node.js deployments with excellent WebSocket support.

### Step 1: Prepare Repository

1. **Push server code to GitHub** (already done)
2. **Ensure all files are committed**:
   ```bash
   git add .
   git commit -m "Prepare server for Railway deployment"
   git push origin main
   ```

### Step 2: Deploy to Railway

1. **Go to [Railway.app](https://railway.app)**
2. **Sign up/Login** with GitHub
3. **Click "New Project"**
4. **Select "Deploy from GitHub repo"**
5. **Choose your repository**: `creditsonx/stellarush`
6. **Select the server directory**: Set root directory to `/server`

### Step 3: Configure Environment Variables

In Railway dashboard, add these environment variables:

```env
NODE_ENV=production
PORT=3001
LOG_LEVEL=INFO
CORS_ORIGINS=https://stellarush.netlify.app,https://creditsonx.github.io
RATE_LIMIT_MAX_REQUESTS=100
MAX_CONNECTIONS=1000
```

### Step 4: Configure Build Settings

Railway should auto-detect the Node.js setup, but ensure:
- **Build Command**: `npm run build`
- **Start Command**: `npm start`
- **Node Version**: 18.x

### Step 5: Deploy

1. **Click Deploy**
2. **Wait for build to complete** (~2-3 minutes)
3. **Copy the Railway URL** (e.g., `https://stellarush-server-production.up.railway.app`)

## 🎨 Render Deployment

### Step 1: Create Render Account

1. Go to [Render.com](https://render.com)
2. Sign up with GitHub

### Step 2: Create Web Service

1. **Click "New +" → "Web Service"**
2. **Connect GitHub repository**
3. **Configure settings**:
   - **Name**: `stellarush-server`
   - **Root Directory**: `server`
   - **Environment**: `Node`
   - **Build Command**: `npm run build`
   - **Start Command**: `npm start`
   - **Instance Type**: `Free` (or `Starter` for production)

### Step 3: Environment Variables

Add the same environment variables as Railway.

## 🌊 DigitalOcean App Platform

### Step 1: Create DigitalOcean Account

1. Go to [DigitalOcean](https://www.digitalocean.com)
2. Create account and navigate to App Platform

### Step 2: Create App

1. **Choose GitHub repository**
2. **Configure component**:
   - **Type**: Web Service
   - **Source Directory**: `/server`
   - **Build Command**: `npm run build`
   - **Run Command**: `npm start`

### Step 3: Configure Plan

- **Plan**: Basic ($5/month recommended for production)
- **Instance Size**: Basic

## 🐳 Docker Deployment

For custom deployments using Docker:

```bash
# Build image
docker build -t stellarush-server .

# Run container
docker run -p 3001:3001 \
  -e NODE_ENV=production \
  -e LOG_LEVEL=INFO \
  stellarush-server
```

## 🔧 Post-Deployment Setup

### 1. Test Server Health

Visit your deployed URL + `/health`:
```
https://your-deployment-url/health
```

Should return:
```json
{
  "status": "ok",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "uptime": 123.45,
  "activeConnections": 0,
  "activeGame": false,
  "version": "1.0.0"
}
```

### 2. Test WebSocket Connection

Use browser console:
```javascript
const socket = io('https://your-deployment-url');
socket.on('connect', () => console.log('Connected!'));
socket.on('gameState', (state) => console.log('Game State:', state));
```

### 3. Monitor Logs

Check platform-specific logs for any errors:
- **Railway**: Dashboard → Deploy Logs
- **Render**: Dashboard → Logs
- **DigitalOcean**: App → Runtime Logs

## ⚡ Performance Optimization

### 1. Enable Compression

Server already includes gzip compression for API responses.

### 2. Connection Limits

Adjust `MAX_CONNECTIONS` based on your plan:
- **Free tier**: 100-500 connections
- **Paid tier**: 1000+ connections

### 3. Memory Management

Set `NODE_OPTIONS=--max-old-space-size=512` for 512MB memory limit.

## 📊 Monitoring

### Health Checks

All platforms support health checks using `/health` endpoint.

### Metrics Available

- Active connections: `/stats`
- Server uptime
- Memory usage
- Game statistics

## 🔒 Security Checklist

- [ ] Environment variables set (no hardcoded secrets)
- [ ] CORS origins properly configured
- [ ] Rate limiting enabled
- [ ] Bot detection active
- [ ] HTTPS/WSS enabled (automatic on most platforms)

## 🐛 Troubleshooting

### Common Issues

1. **Build Fails**
   - Check Node.js version (18.x required)
   - Verify all dependencies are in package.json
   - Check TypeScript compilation errors

2. **Connection Refused**
   - Verify PORT environment variable
   - Check if WebSocket is supported
   - Ensure CORS origins include your frontend domain

3. **High Memory Usage**
   - Monitor player connections
   - Check for memory leaks in logs
   - Restart service if needed

### Debug Mode

Enable debug logging:
```env
LOG_LEVEL=DEBUG
```

## 📞 Support

- Check deployment platform documentation
- Review server logs for errors
- Test health endpoints
- Monitor connection metrics

## 🚀 Next Steps

After successful deployment:

1. **Update frontend** to connect to live server
2. **Test multiplayer functionality**
3. **Monitor performance** and optimize
4. **Set up alerts** for downtime
5. **Plan scaling** strategy
