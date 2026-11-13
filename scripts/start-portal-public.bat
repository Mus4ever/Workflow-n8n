@echo off
title Algeria 2.0 - n8n Production Lab (Public Tunnel)
echo =========================================================================
echo    ALGERIA 2.0 - n8n Production Lab (Deploiement Public Cloudflare)
echo =========================================================================
echo 1. Demarrage du serveur web local sur le port 3000...
start /b cmd /c "cd portal && npm.cmd run dev"

timeout /t 3 >nul

echo 2. Ouverture du tunnel public securise Cloudflare HTTPS...
echo.
echo =========================================================================
echo Scannez ou ouvrez l'URL "trycloudflare.com" qui va s'afficher ci-dessous :
echo =========================================================================
cloudflared tunnel --url http://localhost:3000
pause

