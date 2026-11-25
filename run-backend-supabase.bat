@echo off
title Shoe Shop Backend - Supabase Cloud DB (Port 8080)
cd /d "%~dp0"
echo ==========================================================
echo Starting Spring Boot Backend (Supabase Cloud PostgreSQL)
echo Server: http://localhost:8080
echo Database: Supabase Cloud (aws-0-ap-southeast-2.pooler.supabase.com:5432)
echo ==========================================================
java -jar "target\stepstyle-backend-1.0.0.jar" --spring.profiles.active=supabase
pause
