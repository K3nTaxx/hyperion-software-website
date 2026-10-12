@echo off
rem Ouvre le site Hyperion en local : demarre un petit serveur (sans cache) puis ouvre le navigateur.
cd /d "%~dp0"
where python >nul 2>nul
if errorlevel 1 (
  rem Python absent : on ouvre directement la page d'accueil
  start "" "%~dp0index.html"
  exit /b
)
rem regenere les pages depuis src/ (elles ne sont pas sur GitHub : Netlify les construit lui-meme)
python tools\build.py >nul
start "Hyperion NOUVELLE VERSION - serveur local (fermer pour arreter)" /min python tools\serve.py 5530
timeout /t 1 /nobreak >nul
start "" "http://localhost:5530/index.html"
