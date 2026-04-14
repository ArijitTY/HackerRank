@echo off
echo ============================================
echo SkillForge - Windows Dependency Rebuild
echo ============================================
echo.
echo This script rebuilds native Node.js modules for Windows.
echo Run this if you see "invalid ELF header" errors.
echo.
cd /d "%~dp0backend"
echo Cleaning old build...
rmdir /s /q node_modules\better-sqlite3\build 2>/dev/null
echo Rebuilding better-sqlite3 for Windows...
npm rebuild better-sqlite3
echo.
echo Done! You can now start the server with:
echo   node backend\server.js
echo.
pause
