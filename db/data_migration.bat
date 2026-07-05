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

:: Attende che il frontend sia pronto (il frontend parte solo dopo che il backend è healthy)
echo Waiting for frontend to be ready...
:waitfrontend
docker inspect --format="{{.State.Health.Status}}" frontend | find "healthy" >nul
IF %ERRORLEVEL% NEQ 0 (
    echo Frontend not ready yet...
    timeout /t 5 >nul
    goto waitfrontend
)

:: Aspetta un po' extra per dare tempo a JPA di creare le tabelle
echo Waiting extra time for JPA to create tables...
timeout /t 10 >nul

echo Importing initial data into PostgreSQL...

docker exec -i db psql -U codicecaciotta -d vet < "%~dp0data_migration.sql"

echo Done.
pause
