<#
.SYNOPSIS
    Instalador automatizado de dependencias para m-docflow (Windows).
.DESCRIPTION
    Verifica e instala de forma desatendida las herramientas necesarias:
    - Configuración de directiva de ejecución PowerShell
    - Node.js (v18+)
    - MiKTeX (Motor LaTeX ultrarrápido ~200MB con autodescarga de paquetes)
    - Configuración de MiKTeX para descargas silenciosas sin diálogos GUI
    - Marp CLI (Compilador de diapositivas institucionales)
    - Extensiones de productividad de VS Code (Marp + LaTeX Workshop)
    - Enlace global del comando m-docflow en PATH
    - Diagnóstico de verificación final
.NOTES
    Autor: Marlon Omar Torres Espinoza (@marlon-mte)
    Proyecto: m-docflow (https://github.com/marlon-mte/m-docflow)
#>

$ErrorActionPreference = "Continue"

Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "   ⚡ INSTALADOR AUTOMATIZADO DE ENTORNO -- m-docflow       " -ForegroundColor Cyan
Write-Host "   Autor: Marlon Omar Torres Espinoza (@marlon-mte)        " -ForegroundColor DarkGray
Write-Host "   Ubicación: $PSScriptRoot" -ForegroundColor DarkGray
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host ""

# Habilitar ejecución de scripts para el usuario actual
try {
    Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser -Force -ErrorAction SilentlyContinue
} catch {}

function Test-CommandAvailable ($cmd) {
    return [bool](Get-Command $cmd -ErrorAction SilentlyContinue)
}

function Refresh-EnvironmentPath {
    $machinePath = [System.Environment]::GetEnvironmentVariable("Path", "Machine")
    $userPath = [System.Environment]::GetEnvironmentVariable("Path", "User")
    $env:Path = "$machinePath;$userPath"
}

# 1. VERIFICAR GESTOR WINGET
Write-Host "[1/6] Verificando gestor de paquetes de Windows (winget)..." -ForegroundColor Yellow
if (Test-CommandAvailable "winget") {
    $wVer = winget --version 2>&1
    Write-Host "  ✔ Gestor winget disponible ($wVer)." -ForegroundColor Green
} else {
    Write-Host "  [ADVERTENCIA] No se detectó 'winget' en tu sistema." -ForegroundColor Yellow
    Write-Host "  Si algún programa no se puede descargar automáticamente, instálalo desde su web oficial." -ForegroundColor DarkGray
}

# 2. VERIFICAR O INSTALAR NODE.JS
Write-Host "`n[2/6] Verificando Node.js (Entorno de Ejecución)..." -ForegroundColor Yellow
if (Test-CommandAvailable "node") {
    $nodeVer = node -v
    Write-Host "  ✔ Node.js ya está instalado: $nodeVer" -ForegroundColor Green
} else {
    Write-Host "  ✖ Node.js no encontrado. Descargando e instalando vía winget..." -ForegroundColor Cyan
    winget install OpenJS.NodeJS -e --silent --accept-package-agreements --accept-source-agreements
    Refresh-EnvironmentPath
    if (Test-CommandAvailable "node") {
        Write-Host "  ✔ Node.js instalado con éxito: $(node -v)" -ForegroundColor Green
    } else {
        Write-Host "  ⚠ Instalación enviada. Si no se detecta de inmediato, reinicia la terminal." -ForegroundColor Yellow
    }
}

# 3. VERIFICAR O INSTALAR MOTOR LATEX (MiKTeX Rápido vs TeX Live)
Write-Host "`n[3/6] Verificando Motor LaTeX (latexmk / pdflatex)..." -ForegroundColor Yellow
if (Test-CommandAvailable "latexmk" -or Test-CommandAvailable "pdflatex") {
    Write-Host "  ✔ Motor LaTeX ya se encuentra disponible en tu sistema." -ForegroundColor Green
} else {
    Write-Host "  ✖ No se detectó ningún compilador LaTeX en el sistema." -ForegroundColor Yellow
    Write-Host "  ------------------------------------------------------------" -ForegroundColor DarkGray
    Write-Host "  ¿Por qué recomendamos MiKTeX en lugar de TeX Live?" -ForegroundColor White
    Write-Host "  • TeX Live : Pesa ~8 GB y demora más de 1 hora en instalar." -ForegroundColor DarkGray
    Write-Host "  • MiKTeX   : Pesa solo ~200 MB y se instala en 3 minutos con descarga automática." -ForegroundColor Green
    Write-Host "  ------------------------------------------------------------" -ForegroundColor DarkGray
    Write-Host "  [1] Instalar MiKTeX ahora vía winget (Recomendado - 3 min)" -ForegroundColor Green
    Write-Host "  [2] Omitir (Instalaré TeX Live u otro motor manualmente)" -ForegroundColor DarkGray
    
    $opc = Read-Host "`n  Selecciona una opción [1 o 2] (Por defecto 1)"
    if ($opc -ne "2") {
        Write-Host "  Instalando MiKTeX desatendido..." -ForegroundColor Cyan
        winget install MiKTeX.MiKTeX -e --silent --accept-package-agreements --accept-source-agreements
        Refresh-EnvironmentPath
        Write-Host "  ✔ MiKTeX instalado correctamente." -ForegroundColor Green
    }
}

# Configuración de MiKTeX para que no interrumpa con diálogos GUI
if (Test-CommandAvailable "initexmf") {
    try {
        initexmf --set-config-value [Core]AutoInstall=1 2>$null
    } catch {}
}

# 4. VERIFICAR O INSTALAR MARP CLI
Write-Host "`n[4/6] Verificando Marp CLI (Motor de Diapositivas)..." -ForegroundColor Yellow
if (Test-CommandAvailable "marp") {
    $marpVer = (marp --version 2>&1 | Select-Object -First 1)
    Write-Host "  ✔ Marp CLI ya está instalado: $marpVer" -ForegroundColor Green
} else {
    Write-Host "  ✖ Instalando Marp CLI globalmente con npm..." -ForegroundColor Cyan
    npm install -g @marp-team/marp-cli
    Refresh-EnvironmentPath
    Write-Host "  ✔ Marp CLI instalado con éxito." -ForegroundColor Green
}

# 5. ENLAZAR COMANDO GLOBAL m-docflow
Write-Host "`n[5/6] Registrando comando global 'm-docflow'..." -ForegroundColor Yellow
try {
    Push-Location $PSScriptRoot
    npm link | Out-Null
    Pop-Location
    Write-Host "  ✔ Comando 'm-docflow' vinculado exitosamente al sistema." -ForegroundColor Green
} catch {
    Write-Host "  ⚠ Nota: Si npm link dio advertencia, puedes usar node bin/m-docflow.js directamente." -ForegroundColor Yellow
}

# 6. EXTENSIONES RECOMENDADAS DE VS CODE
Write-Host "`n[6/6] Verificando extensiones recomendadas de VS Code..." -ForegroundColor Yellow
if (Test-CommandAvailable "code") {
    Write-Host "  Instalando extensiones de productividad en VS Code..." -ForegroundColor Cyan
    code --install-extension marp-team.marp-vscode --force | Out-Null
    code --install-extension James-Yu.latex-workshop --force | Out-Null
    Write-Host "  ✔ Extensiones instaladas: 'Marp for VS Code' y 'LaTeX Workshop'." -ForegroundColor Green
} else {
    Write-Host "  ○ VS Code CLI ('code') no detectado en PATH. Omitiendo extensiones." -ForegroundColor DarkGray
}

# 7. DIAGNÓSTICO FINAL
Write-Host ""
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "                 DIAGNÓSTICO FINAL DEL SISTEMA              " -ForegroundColor Cyan
Write-Host "============================================================" -ForegroundColor Cyan
node "$PSScriptRoot\bin\m-docflow.js" doctor
