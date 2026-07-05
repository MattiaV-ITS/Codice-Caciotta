@echo off
:: Attende che il database PostgreSQL sia pronto per le connessioni
echo Waiting for PostgreSQL to be ready...
:waitloop
docker exec db pg_isready -U codicecaciotta -d vet >nul 2>&1
IF %ERRORLEVEL% NEQ 0 (
    echo PostgreSQL not ready yet...
    timeout /t 2 >nul
    goto waitloop
)
echo PostgreSQL is ready!

:: Attende che il backend sia pronto (il backend parte solo dopo che il database è ready)
echo Waiting for backend to be ready...
:waitbackend
docker inspect --format="{{.State.Health.Status}}" backend | find "healthy" >nul
IF %ERRORLEVEL% NEQ 0 (
    echo Backend not ready yet...
    timeout /t 5 >nul
    goto waitbackend
)

:: Aspetta un po' extra per dare tempo a JPA di creare le tabelle
echo Waiting extra time for JPA to create tables...
timeout /t 10 >nul

echo Importing initial data into PostgreSQL...

docker exec -i db psql -U codicecaciotta -d vet < "%~dp0data_migration.sql"

echo Done.
pause
