@echo off
title Shoe Shop Backend - Local Mode (Port 8080)
cd /d "%~dp0"
echo ==========================================
echo Starting Spring Boot Backend (Local H2 Mode)
echo Backend URL: http://localhost:8080
echo Health Check: http://localhost:8080/api/test
echo ==========================================
java -Dspring.profiles.active=local -jar "target\stepstyle-backend-1.0.0.jar"
pause

