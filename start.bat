@echo off
title Diwakar Ji Laundry Launcher
echo ============================================================
echo      Starting Diwakar Ji Laundry Full-Stack System
echo ============================================================
echo.

echo [1/3] Starting Backend API Server (Port 5000)...
start "Diwakar Ji Backend API" cmd /k "cd /d "%~dp0server" && node server.js"

timeout /t 2 /nobreak >nul

echo [2/3] Starting Frontend Client (Port 5173)...
start "Diwakar Ji Frontend Client" cmd /k "cd /d "%~dp0client" && npm.cmd run dev"

timeout /t 3 /nobreak >nul

echo [3/3] Opening Diwakar Ji Laundry in your default web browser...
start http://localhost:5173

echo.
echo ============================================================
echo Both servers are running!
echo Customer Website:  http://localhost:5173
echo Admin Console:     http://localhost:5173/admin/login
echo Admin Username:    admin
echo Admin Password:    admin123
echo ============================================================
echo.
pause
