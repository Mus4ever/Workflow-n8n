@echo off
title Deploiement Automatique - Algeria 2.0 Workshop
echo ===================================================
echo   Algeria 2.0 Workshop - Deploiement GitHub & Vercel
echo ===================================================
cd /d "%~dp0\.."

echo [1/3] Verification de la compilation du frontend...
cd portal
call npm.cmd run build
if %ERRORLEVEL% neq 0 (
  echo Erreur de compilation Vite !
  pause
  exit /b %ERRORLEVEL%
)
cd ..

echo [2/3] Synchronisation Git (Mus4ever/Workflow-n8n)...
git add .
git commit -m "chore: update workshop code"
git push origin main

echo.
echo [3/3] Deploiement termine ! Vercel compile automatiquement le repo GitHub.
echo URL de Production : https://nimble-cyclone-suwml6q.vercel.app
echo.
pause
