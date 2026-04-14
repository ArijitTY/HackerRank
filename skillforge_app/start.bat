@echo off
echo Starting SkillForge...
cd /d "%~dp0skillforge_app\backend"
start "SkillForge Backend" cmd /k "node server.js"
cd /d "%~dp0skillforge_app\frontend"
start "SkillForge Frontend" cmd /k "npm start"
echo.
echo SkillForge started!
echo   Backend:       http://localhost:3000
echo   Frontend Dev:  http://localhost:3001
echo.
