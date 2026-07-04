@echo off
echo Importing initial data into PostgreSQL...

docker exec -i db psql -U codicecaciotta -d vet < data_migration.sql

echo Done.
pause
