# CiviGrantPro Deployment Guide

## Recommended Deployment Platform: Railway

Railway is the ideal companion to Cursor for deploying complex applications like CiviGrantPro. It handles Node.js/TypeScript, databases, and AI integrations seamlessly.

## Quick Setup (5 minutes)

### 1. **Prepare Your Project**

Ensure your project has these files:
- ✅ `railway.json` - Railway configuration
- ✅ `Procfile` - Process definition
- ✅ `package.json` - Dependencies and scripts
- ✅ `.env.example` - Environment variable template

### 2. **Deploy to Railway**

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login to Railway
railway login

# Initialize Railway project
railway init

# Deploy your application
railway up
```

### 3. **Set Environment Variables**

In Railway dashboard, add these variables:
```env
DATABASE_URL=postgresql://...
OPENAI_API_KEY=sk-...
GRANTS_GOV_API_KEY=your_key
GOOGLE_APPLICATION_CREDENTIALS=path/to/credentials.json
GOOGLE_CLOUD_PROJECT_ID=your_project_id
NODE_ENV=production
PORT=5000
```

### 4. **Add Database**

```bash
# Add PostgreSQL database
railway add

# Get database URL
railway variables
```

## Alternative Deployment Options

### Option 1: Render (Good Alternative)

**Pros**: Free tier, easy setup, good for full-stack apps
**Cons**: Slower cold starts, limited resources

```bash
# Create render.yaml
services:
  - type: web
    name: civigrant-pro
    env: node
    buildCommand: npm install && npm run build
    startCommand: npm start
    envVars:
      - key: NODE_ENV
        value: production
```

### Option 2: Vercel (Frontend-Focused)

**Pros**: Excellent for React apps, fast deployments
**Cons**: Limited backend support, no database hosting

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

### Option 3: Fly.io (Global Deployment)

**Pros**: Global edge deployment, Docker support
**Cons**: More complex setup

```bash
# Install Fly CLI
curl -L https://fly.io/install.sh | sh

# Launch app
fly launch
```

## Testing Strategy

### 1. **Local Testing**

```bash
# Install dependencies
npm install

# Set up database
npm run db:push
npm run db:seed

# Start development server
npm run dev

# Run tests
npm test
```

### 2. **Staging Environment**

Create a staging environment in Railway:
```bash
# Create staging environment
railway environment create staging

# Deploy to staging
railway up --environment staging
```

### 3. **Production Testing**

```bash
# Deploy to production
railway up --environment production

# Monitor logs
railway logs

# Check health
curl https://your-app.railway.app/api/health
```

## Environment-Specific Configurations

### Development (.env.local)
```env
NODE_ENV=development
DATABASE_URL=postgresql://localhost:5432/civigrant_dev
OPENAI_API_KEY=sk-test-...
PORT=5000
```

### Staging (.env.staging)
```env
NODE_ENV=staging
DATABASE_URL=postgresql://staging-db-url
OPENAI_API_KEY=sk-live-...
PORT=5000
```

### Production (.env.production)
```env
NODE_ENV=production
DATABASE_URL=postgresql://production-db-url
OPENAI_API_KEY=sk-live-...
PORT=5000
```

## Database Migration Strategy

### 1. **Development**
```bash
# Generate migration
npm run db:generate

# Apply migration
npm run db:push

# Seed data
npm run db:seed
```

### 2. **Production**
```bash
# Apply migrations
npm run db:migrate

# Verify schema
npm run db:studio
```

## Monitoring and Debugging

### Railway Dashboard
- **Logs**: Real-time application logs
- **Metrics**: CPU, memory, network usage
- **Deployments**: Deployment history and rollbacks
- **Variables**: Environment variable management

### Health Checks
```bash
# Check application health
curl https://your-app.railway.app/api/health

# Expected response:
{
  "status": "healthy",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "version": "1.0.0",
  "services": ["api", "database", "ai", "mcp"]
}
```

### Common Issues and Solutions

#### Issue 1: Build Failures
```bash
# Check build logs
railway logs

# Common fixes:
# - Ensure all dependencies are in package.json
# - Check Node.js version compatibility
# - Verify build commands in railway.json
```

#### Issue 2: Database Connection
```bash
# Verify database URL
railway variables

# Test connection
railway run npm run db:studio
```

#### Issue 3: Environment Variables
```bash
# List all variables
railway variables

# Set variable
railway variables set OPENAI_API_KEY=sk-...
```

## CI/CD Pipeline

### GitHub Actions Workflow

Create `.github/workflows/deploy.yml`:
```yaml
name: Deploy to Railway

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          
      - name: Install dependencies
        run: npm ci
        
      - name: Run tests
        run: npm test
        
      - name: Deploy to Railway
        uses: railway/deploy@v1
        with:
          railway_token: ${{ secrets.RAILWAY_TOKEN }}
```

## Performance Optimization

### 1. **Build Optimization**
```json
// package.json
{
  "scripts": {
    "build": "vite build && esbuild server/index.ts --platform=node --packages=external --bundle --format=esm --outdir=dist",
    "start": "node dist/index.js"
  }
}
```

### 2. **Database Optimization**
```typescript
// Enable connection pooling
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});
```

### 3. **Caching Strategy**
```typescript
// Implement Redis caching for AI responses
import Redis from 'ioredis';

const redis = new Redis(process.env.REDIS_URL);

// Cache AI responses
const cachedResponse = await redis.get(cacheKey);
if (cachedResponse) {
  return JSON.parse(cachedResponse);
}
```

## Security Best Practices

### 1. **Environment Variables**
- Never commit API keys to Git
- Use Railway's secure variable storage
- Rotate keys regularly

### 2. **Database Security**
- Use connection pooling
- Implement proper authentication
- Regular backups

### 3. **API Security**
- Rate limiting
- Input validation
- CORS configuration

## Cost Optimization

### Railway Pricing
- **Free Tier**: $5 credit monthly
- **Pay-as-you-go**: $0.000463 per second
- **Database**: $5/month for PostgreSQL

### Optimization Tips
- Use staging environment for testing
- Monitor resource usage
- Implement proper caching
- Optimize build times

## Troubleshooting Guide

### Common Deployment Issues

#### 1. **Port Configuration**
```typescript
// server/index.ts
const port = process.env.PORT || 5000;
```

#### 2. **Database Migrations**
```bash
# Run migrations on deploy
railway run npm run db:migrate
```

#### 3. **Build Failures**
```bash
# Check Node.js version
node --version

# Verify package.json scripts
cat package.json | grep scripts -A 10
```

#### 4. **Environment Variables**
```bash
# List all variables
railway variables

# Set missing variables
railway variables set KEY=value
```

## Next Steps

1. **Deploy to Railway** using the quick setup
2. **Set up staging environment** for testing
3. **Configure CI/CD** with GitHub Actions
4. **Monitor performance** and optimize
5. **Set up custom domain** for production

## Support Resources

- [Railway Documentation](https://docs.railway.app/)
- [Railway Discord](https://discord.gg/railway)
- [CiviGrantPro Issues](https://github.com/yourusername/civigrant-pro/issues)

---

This deployment guide ensures your CiviGrantPro application runs smoothly in production with proper monitoring, security, and performance optimization. 