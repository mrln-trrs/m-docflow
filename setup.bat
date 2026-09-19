@echo off
setlocal
title m-docflow :: Instalador Automatizado de Entorno
color 0B

echo ============================================================
echo   m-docflow :: Framework Modular de Documentacion
echo   Autor: Marlon Omar Torres Espinoza (@marlon-mte)
echo ============================================================
echo.
echo Iniciando verificacion e instalacion de dependencias...
echo Por favor, si Windows solicita permisos de Administrador, acepta.
echo.

powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0setup.ps1" %*

echo.
echo Presiona cualquier tecla para cerrar esta ventana...
pause >nul
