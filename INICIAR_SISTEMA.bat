@echo off
title Sistema de Gestao - Modo Rede
echo ==========================================
echo   INICIANDO SISTEMA (ACESSO EXTERNO)
echo ==========================================
echo.

echo 1. Descobrindo seu IP Local...
set "IP_ADDR="
for /f "tokens=2 delims=:" %%a in ('ipconfig ^| find "IPv4"') do set IP_ADDR=%%a
set IP_ADDR=%IP_ADDR: =%

echo ---------------------------------------------------
echo  Seu IP Local e: %IP_ADDR%
echo.
echo  NO CELULAR, ACESSE: http://%IP_ADDR%:3000
echo ---------------------------------------------------
echo.

echo 2. Verificando dependencias...
if not exist "node_modules" (
    call npm install
)

echo.
echo 3. Iniciando Servidor...
echo O navegador abrira no PC em http://localhost:3000
echo.

REM Abre o navegador localmente após 5 segundos
timeout /t 5 >nul
start http://localhost:3000

REM Inicia o Next.js com -H 0.0.0.0 para liberar acesso na rede
call npm run dev -- -H 0.0.0.0

pause
