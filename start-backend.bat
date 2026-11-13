@echo off
title Algeria 2.0 Workshop - Backend Server
echo ===================================================
echo   Algeria 2.0 Workshop - Backend Node.js
echo ===================================================
cd /d "%~dp0\backend"

if not exist node_modules (
  echo Installation des dependances du backend...
  call npm.cmd install
)

echo Demarrage du serveur backend sur le port 3001...
node src/index.js
pause

