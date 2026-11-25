@echo off
title Shoe Shop Backend (Spring Boot - Port 8080)
cd /d "%~dp0"
echo ==========================================================
echo Starting Spring Boot Backend (Port 8080)
echo Using profile configured in .env (Default: supabase)
echo Server: http://localhost:8080
echo ==========================================================
java -jar "target\stepstyle-backend-1.0.0.jar"
pause
