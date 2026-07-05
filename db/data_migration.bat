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
echo Importing initial data into PostgreSQL...

docker exec -i db psql -U codicecaciotta -d vet < "%~dp0data_migration.sql"

echo Done.
pause
