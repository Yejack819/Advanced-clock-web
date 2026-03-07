@echo off
REM Advanced Clock - Electron Build Script for Windows
REM This script builds the Electron application and creates Windows installers

echo.
echo ========================================
echo Advanced Clock - Electron Build Script
echo ========================================
echo.

REM Check if Node.js is installed
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo Error: Node.js is not installed or not in PATH
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

REM Check if pnpm is installed
where pnpm >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo Error: pnpm is not installed
    echo Installing pnpm...
    npm install -g pnpm
)

echo.
echo Step 1: Installing dependencies...
call pnpm install
if %ERRORLEVEL% NEQ 0 (
    echo Error: Failed to install dependencies
    pause
    exit /b 1
)

echo.
echo Step 2: Building Vite project...
call pnpm run build
if %ERRORLEVEL% NEQ 0 (
    echo Error: Failed to build Vite project
    pause
    exit /b 1
)

echo.
echo Step 3: Compiling Electron main process...
call npx tsc electron/main.ts --outDir electron --module esnext --target es2020 --lib es2020 --moduleResolution node --esModuleInterop --skipLibCheck --strict false
if %ERRORLEVEL% NEQ 0 (
    echo Error: Failed to compile main.ts
    pause
    exit /b 1
)

echo.
echo Step 4: Compiling Electron preload script...
call npx tsc electron/preload.ts --outDir electron --module esnext --target es2020 --lib es2020 --moduleResolution node --esModuleInterop --skipLibCheck --strict false
if %ERRORLEVEL% NEQ 0 (
    echo Error: Failed to compile preload.ts
    pause
    exit /b 1
)

echo.
echo Step 5: Building Electron application...
call pnpm run electron-build
if %ERRORLEVEL% NEQ 0 (
    echo Error: Failed to build Electron application
    pause
    exit /b 1
)

echo.
echo ========================================
echo Build completed successfully!
echo ========================================
echo.
echo Output files are located in: dist\electron\
echo.
echo Files created:
echo - Advanced Clock.exe (NSIS Installer)
echo - Advanced Clock Setup.exe (Portable Executable)
echo.
pause
