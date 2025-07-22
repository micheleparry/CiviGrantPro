# Troubleshooting Guide

This guide helps you resolve common issues when setting up and running CiviGrantPro.

## Prerequisites Issues

### Node.js Not Found
**Error:** `'node' is not recognized as an internal or external command`

**Solution:**
1. Download and install Node.js from [nodejs.org](https://nodejs.org/)
2. Choose the LTS version (recommended)
3. During installation, make sure "Add to PATH" is checked
4. Restart your terminal/command prompt
5. Verify installation: `node --version`

### npm Not Found
**Error:** `'npm' is not recognized as an internal or external command`

**Solution:**
1. npm comes with Node.js - install Node.js first
2. If Node.js is installed but npm still not found:
   - Reinstall Node.js
   - Check if npm is in your PATH
   - Try using `npm.cmd` instead of `npm` on Windows

### Python Not Found
**Error:** `'python' is not recognized as an internal or external command`

**Solution:**
1. Download and install Python from [python.org](https://python.org/)
2. During installation, check "Add Python to PATH"
3. Restart your terminal
4. Verify installation: `python --version`

## Database Issues

### DATABASE_URL Not Set
**Error:** `DATABASE_URL must be set. Did you forget to provision a database?`

**Solution:**
1. Create a `.env` file in the project root
2. Add your database connection string:
   ```
   DATABASE_URL=postgresql://username:password@localhost:5432/civigrant_pro
   ```
3. Replace `username`, `password`, and database name with your actual values

### Database Connection Failed
**Error:** `connection to server at "localhost" failed`

**Solutions:**
1. **Check if PostgreSQL is running:**
   - Windows: Check Services app for "PostgreSQL"
   - Mac: `brew services list | grep postgresql`
   - Linux: `sudo systemctl status postgresql`

2. **Verify connection details:**
   - Check username, password, host, port, and database name
   - Test connection: `psql -h localhost -U username -d civigrant_pro`

3. **Create database if it doesn't exist:**
   ```sql
   CREATE DATABASE civigrant_pro;
   ```

### Database Schema Issues
**Error:** `relation "users" does not exist`

**Solution:**
1. Run database migrations: `npm run db:push`
2. Seed the database: `npm run db:seed`

## OpenAI API Issues

### API Key Not Set
**Error:** `OpenAI API key is required`

**Solution:**
1. Get an API key from [OpenAI Platform](https://platform.openai.com/)
2. Add to your `.env` file:
   ```
   OPENAI_API_KEY=your_actual_api_key_here
   ```

### API Key Invalid
**Error:** `Incorrect API key provided`

**Solution:**
1. Check your API key is correct
2. Ensure you have credits in your OpenAI account
3. Verify the key has the necessary permissions

## Build and Runtime Issues

### TypeScript Errors
**Error:** Various TypeScript compilation errors

**Solutions:**
1. Install dependencies: `npm install`
2. Check TypeScript: `npm run check`
3. Clear node_modules and reinstall:
   ```bash
   rm -rf node_modules package-lock.json
   npm install
   ```

### Vite Build Errors
**Error:** `Failed to resolve module`

**Solutions:**
1. Check import paths are correct
2. Verify all dependencies are installed
3. Clear Vite cache: `rm -rf node_modules/.vite`

### Port Already in Use
**Error:** `EADDRINUSE: address already in use :::5000`

**Solution:**
1. Find the process using port 5000:
   - Windows: `netstat -ano | findstr :5000`
   - Mac/Linux: `lsof -i :5000`
2. Kill the process or change the port in your `.env` file

## Python Integration Issues

### Python Dependencies Missing
**Error:** `ModuleNotFoundError: No module named 'PyPDF2'`

**Solution:**
1. Install Python dependencies: `pip install -r requirements.txt`
2. If using a virtual environment, activate it first

### Python Script Not Found
**Error:** `Failed to start Python script`

**Solution:**
1. Verify Python is in PATH: `python --version`
2. Check the Python script exists: `ls server/services/grant_analyzer.py`
3. Ensure Python script has execute permissions

## Windows-Specific Issues

### PowerShell Execution Policy
**Error:** `cannot be loaded because running scripts is disabled`

**Solution:**
1. Run PowerShell as Administrator
2. Execute: `Set-ExecutionPolicy RemoteSigned`
3. Type 'Y' to confirm

### Path Issues
**Error:** `'&&' is not a valid statement separator`

**Solution:**
1. Use separate commands instead of `&&`
2. Or use the provided setup scripts: `setup.bat` or `setup.ps1`

## Common Solutions

### Reset Everything
If you're having persistent issues, try a complete reset:

```bash
# Remove all generated files
rm -rf node_modules package-lock.json dist

# Reinstall dependencies
npm install

# Clear database (if using local PostgreSQL)
dropdb civigrant_pro
createdb civigrant_pro

# Rebuild everything
npm run db:push
npm run db:seed
npm run dev
```

### Check Logs
Look for detailed error messages in:
- Terminal output
- Browser console (F12)
- Network tab in browser dev tools

### Environment Variables
Ensure your `.env` file has all required variables:
```env
DATABASE_URL=postgresql://username:password@localhost:5432/civigrant_pro
OPENAI_API_KEY=your_openai_api_key_here
NODE_ENV=development
PORT=5000
```

## Getting Help

If you're still experiencing issues:

1. Check the [README.md](README.md) for detailed setup instructions
2. Look for similar issues in the project's issue tracker
3. Create a new issue with:
   - Your operating system and version
   - Node.js and Python versions
   - Complete error message
   - Steps to reproduce the issue

## Quick Diagnostic Commands

Run these commands to check your setup:

```bash
# Check Node.js
node --version
npm --version

# Check Python
python --version
pip --version

# Check database connection
npm run db:push

# Check TypeScript
npm run check

# Check build
npm run build
``` 