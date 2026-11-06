@echo off
echo ========================================================
echo   DEMARRAGE DE LA PLATEFORME LOGEMENTPLUS
echo   Backend : Laravel (Port 8000)
echo   Frontend : Angular (Port 4200)
echo ========================================================
echo.

start "LogementPlus Backend (Laravel)" cmd /k "cd backend && php artisan serve --port 8000"
start "LogementPlus Frontend (Angular)" cmd /k "cd frontend && npm start"

echo Les deux serveurs sont en cours de lancement.
echo Rendez-vous sur http://localhost:4200 dès que la compilation est terminée.
echo.
pause
