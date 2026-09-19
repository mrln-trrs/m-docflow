<#
.SYNOPSIS
    Instalador automatizado de dependencias para m-docflow (Windows).
.DESCRIPTION
    Verifica e instala de forma desatendida las herramientas necesarias:
    - Node.js (v18+)
    - MiKTeX (Motor LaTeX ultrarrápido ~200MB con autodescarga de paquetes)
    - Marp CLI (Compilador de diapositivas institucionales)
    - Extensiones recomendadas de VS Code
    - Registro global del comando m-docflow
.NOTES
    Autor: Marlon Omar Torres Espinoza (@marlon-mte)
    Proyecto: m-docflow (https://github.com/marlon-mte/m-docflow)
#>

$ErrorActionPreference = "Continue"

Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "   ⚡ INSTALADOR AUTOMATIZADO DE ENTORNO -- m-docflow       " -ForegroundColor Cyan
Write-Host "   Autor: Marlon Omar Torres Espinoza (@marlon-mte)        " -ForegroundColor DarkGray
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host ""

function Test-CommandAvailable ($cmd) {
    return [bool](Get-Command $cmd -ErrorAction SilentlyContinue)
}

# 1. VERIFICAR WINGET
if (-not (Test-CommandAvailable "winget")) {
    Write-Host "[ADVERTENCIA] No se detectó 'winget' en tu sistema Windows." -ForegroundColor Yellow
    Write-Host "Recomendamos actualizar Windows o instalar 'App Installer' desde la Microsoft Store." -ForegroundColor Yellow
}

# 2. VERIFICAR O INSTALAR NODE.JS
Write-Host "[1/5] Verificando Node.js..." -ForegroundColor Yellow
if (Test-CommandAvailable "node") {
    $nodeVer = node -v
    Write-Host "  ✔ Node.js ya está instalado: $nodeVer" -ForegroundColor Green
} else {
    Write-Host "  ✖ Node.js no encontrado. Instalando mediante winget..." -ForegroundColor Cyan
    winget install OpenJS.NodeJS -e --silent --accept-package-agreements --accept-source-agreements
    # Refrescar PATH
    $env:Path = [System.Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path","User")
}

# 3. VERIFICAR O INSTALAR MOTOR LATEX
Write-Host "`n[2/5] Verificando Motor LaTeX (latexmk / pdflatex)..." -ForegroundColor Yellow
if (Test-CommandAvailable "latexmk" -or Test-CommandAvailable "pdflatex") {
    Write-Host "  ✔ Motor LaTeX ya disponible en PATH." -ForegroundColor Green
} else {
    Write-Host "  ✖ No se detectó ningún compilador LaTeX." -ForegroundColor Cyan
    Write-Host "  ¿Qué distribución deseas instalar?" -ForegroundColor White
    Write-Host "    [1] MiKTeX (Recomendado: Rápido ~200MB, 3 minutos, descarga paquetes automáticamente)" -ForegroundColor Green
    Write-Host "    [2] Omitir (Instalaré TeX Live u otro manualmente más tarde)" -ForegroundColor DarkGray
    
    $opc = Read-Host "  Ingresa una opción [1 o 2] (Por defecto 1)"
    if ($opc -ne "2") {
        Write-Host "  Instalando MiKTeX mediante winget (esto demora ~3 minutos)..." -ForegroundColor Cyan
        winget install MiKTeX.MiKTeX -e --silent --accept-package-agreements --accept-source-agreements
        Write-Host "  ✔ MiKTeX instalado. Reinicia tu terminal después de este script para cargar el PATH." -ForegroundColor Green
    }
}

# 4. VERIFICAR O INSTALAR MARP CLI
Write-Host "`n[3/5] Verificando Marp CLI (Presentaciones)..." -ForegroundColor Yellow
if (Test-CommandAvailable "marp") {
    $marpVer = (marp --version 2>&1 | Select-Object -First 1)
    Write-Host "  ✔ Marp CLI ya está instalado: $marpVer" -ForegroundColor Green
} else {
    Write-Host "  ✖ Instalando Marp CLI globalmente con npm..." -ForegroundColor Cyan
    npm install -g @marp-team/marp-cli
    Write-Host "  ✔ Marp CLI instalado con éxito." -ForegroundColor Green
}

# 5. ENLAZAR COMANDO GLOBAL m-docflow
Write-Host "`n[4/5] Registrando comando global 'm-docflow'..." -ForegroundColor Yellow
Push-Location $PSScriptRoot
npm link
Pop-Location
Write-Host "  ✔ Comando 'm-docflow' registrado globalmente en tu terminal." -ForegroundColor Green

# 6. EXTENSIONES DE VS CODE (OPCIONAL)
Write-Host "`n[5/5] Verificando extensiones recomendadas para VS Code..." -ForegroundColor Yellow
if (Test-CommandAvailable "code") {
    Write-Host "  Instalando extensiones de productividad en VS Code..." -ForegroundColor Cyan
    code --install-extension marp-team.marp-vscode --force | Out-Null
    code --install-extension James-Yu.latex-workshop --force | Out-Null
    Write-Host "  ✔ Extensiones instaladas: Marp for VS Code, LaTeX Workshop." -ForegroundColor Green
} else {
    Write-Host "  ○ VS Code CLI ('code') no detectado. Omitiendo extensiones." -ForegroundColor DarkGray
}

Write-Host ""
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "                 DIAGNÓSTICO FINAL DEL SISTEMA              " -ForegroundColor Cyan
Write-Host "============================================================" -ForegroundColor Cyan
node "$PSScriptRoot\bin\m-docflow.js" doctor
