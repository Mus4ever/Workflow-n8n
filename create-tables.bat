@echo off
setlocal
echo ===================================================
echo   Creation automatique des Tables n8n Data Tables
echo ===================================================
echo.
set /p API_KEY="Collez votre cle API n8n (depuis Settings > n8n API) : "

if "%API_KEY%"=="" (
    echo [ERREUR] Aucune cle fournie.
    pause
    exit /b 1
)

node "%~dp0scripts\create_tables.cjs" %API_KEY%

echo.
pause

