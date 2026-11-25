@echo off
title Shoe Shop Backend - Local PostgreSQL (Port 8080)
cd /d "%~dp0"
echo ==========================================================
echo Starting Spring Boot Backend (Local PostgreSQL)
echo Server: http://localhost:8080
echo Database: Local PostgreSQL (localhost:5432/postgres)
echo ==========================================================
java -jar "target\stepstyle-backend-1.0.0.jar" --spring.profiles.active=local-pg
pause
