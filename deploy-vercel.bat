@echo off
title Deploiement Vercel - Algeria 2.0 Workshop
echo ===================================================
echo   Algeria 2.0 Workshop - Deploiement Vercel
echo ===================================================
cd /d "%~dp0\portal"

echo [1/2] Compilation du frontend (Vite Build)...
call npm.cmd run build

echo [2/2] Envoi en production vers nimble-cyclone-suwml6q...
call npx.cmd vercel deploy --prod --yes

echo.
echo Deploiement termine !
pause

