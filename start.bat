@echo off
REM Tracky (Progress2Win) - Quick Start Script for Windows

echo 🚀 Starting Tracky (Progress2Win)...
echo.

REM Check if .env exists
if not exist .env (
    echo ⚠️  No .env file found. Creating from .env.example...
    copy .env.example .env
    echo ✅ Created .env file
    echo ⚠️  IMPORTANT: Edit .env and set secure JWT secrets before deploying to production!
    echo.
)

echo 🔨 Building containers...
docker-compose up --build -d

echo.
echo ⏳ Waiting for services to be ready...
timeout /t 5 /nobreak > nul

echo.
echo ✅ Tracky is running!
echo.
echo 📱 Frontend: http://localhost
echo 🔌 Backend API: http://localhost:3001/api
echo.
echo 📊 View logs:
echo    docker-compose logs -f
echo.
echo 🛑 Stop services:
echo    docker-compose down
echo.

pause
