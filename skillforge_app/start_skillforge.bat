@echo off
title SkillForge Assessment Platform
color 0A
echo.
echo  ==========================================
echo   SkillForge Unified Assessment Platform
echo  ==========================================
echo.
cd /d "%~dp0"
echo  Installing backend dependencies...
cd backend && call npm install --silent
echo.
echo  Installing frontend dependencies...
cd ..\frontend && call npm install --silent
echo.
echo  Building React app...
set REACT_APP_API_URL=
set CI=false
call npm run build
echo.
cd ..\backend
echo ==========================================
echo   SkillForge Platform Starting...
echo ==========================================
echo.
echo   Super Admin Login:
echo   Email:    superadmin@skillforge.com
echo   Password: SuperAdmin@123
echo.
echo   Platform URL: http://localhost:3000
echo   All 5 tests accessible from single platform
echo ==========================================
echo.
node server.js
pause
