@echo off
chcp 65001 >nul
title Thanh Duong Nguyen Uoc Online - TikTok Live Server (Port 8888)
cd /d "%~dp0"
echo ===========================================================
echo   DANG KHOI DONG THANH DUONG NGUYEN UOC ONLINE (PORT 8888)
echo ===========================================================
start "" "http://localhost:8888/admin"
start "" "http://localhost:8888"
node server/index.js
pause
