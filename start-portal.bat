@echo off
title Algeria 2.0 - Essayez de casser mon workflow
echo.
echo   Essayez de casser mon workflow.
echo   Algeria 2.0 - Workshop n8n Production
echo.
cd /d "%~dp0portal"
start http://localhost:3000
cmd /c npm.cmd run dev
pause
