@echo off
echo ===================================================
echo  Limpiando tracking de Git y actualizando
echo ===================================================

cd /d "%~dp0"

echo [1/3] Eliminando todos los archivos de la zona de espera (cached)...
REM Esto no borra tus archivos, solo le dice a git que olvide lo que iba a subir
git rm -r --cached . >nul 2>&1

echo [2/3] Agregando archivos nuevamente (ahora respetando .gitignore)...
git add .

echo [3/3] Creando commit...
git commit -m "Fix: Ignore node_modules and update project structure"

echo.
echo ===================================================
echo  !Listo! node_modules ignorado y cambios guardados.
echo ===================================================
pause
