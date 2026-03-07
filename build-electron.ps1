# Advanced Clock - Electron Build Script for Windows (PowerShell)
# This script builds the Electron application and creates Windows installers

Write-Host ""
Write-Host "========================================"
Write-Host "Advanced Clock - Electron Build Script"
Write-Host "========================================"
Write-Host ""

# Check if Node.js is installed
try {
    $nodeVersion = node --version
    Write-Host "✓ Node.js found: $nodeVersion"
} catch {
    Write-Host "✗ Error: Node.js is not installed or not in PATH"
    Write-Host "Please install Node.js from https://nodejs.org/"
    Read-Host "Press Enter to exit"
    exit 1
}

# Check if pnpm is installed
try {
    $pnpmVersion = pnpm --version
    Write-Host "✓ pnpm found: $pnpmVersion"
} catch {
    Write-Host "! pnpm not found, installing..."
    npm install -g pnpm
}

Write-Host ""
Write-Host "Step 1: Installing dependencies..."
pnpm install
if ($LASTEXITCODE -ne 0) {
    Write-Host "✗ Error: Failed to install dependencies"
    Read-Host "Press Enter to exit"
    exit 1
}

Write-Host ""
Write-Host "Step 2: Building Vite project..."
pnpm run build
if ($LASTEXITCODE -ne 0) {
    Write-Host "✗ Error: Failed to build Vite project"
    Read-Host "Press Enter to exit"
    exit 1
}

Write-Host ""
Write-Host "Step 3: Compiling Electron main process..."
npx tsc electron/main.ts --outDir electron --module esnext --target es2020 --lib es2020 --moduleResolution node --esModuleInterop --skipLibCheck --strict false
if ($LASTEXITCODE -ne 0) {
    Write-Host "✗ Error: Failed to compile main.ts"
    Read-Host "Press Enter to exit"
    exit 1
}

Write-Host ""
Write-Host "Step 4: Compiling Electron preload script..."
npx tsc electron/preload.ts --outDir electron --module esnext --target es2020 --lib es2020 --moduleResolution node --esModuleInterop --skipLibCheck --strict false
if ($LASTEXITCODE -ne 0) {
    Write-Host "✗ Error: Failed to compile preload.ts"
    Read-Host "Press Enter to exit"
    exit 1
}

Write-Host ""
Write-Host "Step 5: Building Electron application..."
pnpm run electron-build
if ($LASTEXITCODE -ne 0) {
    Write-Host "✗ Error: Failed to build Electron application"
    Read-Host "Press Enter to exit"
    exit 1
}

Write-Host ""
Write-Host "========================================"
Write-Host "✓ Build completed successfully!"
Write-Host "========================================"
Write-Host ""
Write-Host "Output files are located in: dist\electron\"
Write-Host ""
Write-Host "Files created:"
Write-Host "- Advanced Clock.exe (NSIS Installer)"
Write-Host "- Advanced Clock Setup.exe (Portable Executable)"
Write-Host ""
Read-Host "Press Enter to exit"
