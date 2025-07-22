@echo off
echo CiviGrantPro Setup Script
echo ========================

echo.
echo Checking prerequisites...

REM Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Node.js is not installed or not in PATH
    echo Please install Node.js from https://nodejs.org/
    echo After installation, restart your terminal and run this script again.
    pause
    exit /b 1
)

REM Check if Python is installed
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Python is not installed or not in PATH
    echo Please install Python from https://python.org/
    echo After installation, restart your terminal and run this script again.
    pause
    exit /b 1
)

echo ✓ Node.js and Python are installed

echo.
echo Installing Node.js dependencies...
npm install
if %errorlevel% neq 0 (
    echo ERROR: Failed to install Node.js dependencies
    pause
    exit /b 1
)

echo.
echo Installing Python dependencies...
pip install -r requirements.txt
if %errorlevel% neq 0 (
    echo ERROR: Failed to install Python dependencies
    pause
    exit /b 1
)

echo.
echo Setup complete!
echo.
echo Next steps:
echo 1. Create a .env file with your configuration
echo 2. Set up your PostgreSQL database
echo 3. Run: npm run db:push
echo 4. Run: npm run db:seed
echo 5. Run: npm run dev
echo.
echo See README.md for detailed instructions.
pause 