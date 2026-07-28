# Codice-Caciotta

Team: Mattia Viada, Daniel Salamone, Gianluca Salzarulo, Simone Albanese, Alessandro Cistaro


## Istruzioni per l'uso
- Installare Docker.
- Copiare .env.example in .env e modificare le variabili di ambiente secondo le proprie esigenze.
- Eseguire `docker-compose up -d` per avviare i container.
- Quando i container sono avviati, si può eseguire il file `db\data_migration.bat` per eseguire le migrazioni del database.
- Aprire il programma al link: localhost:3000.
- Eseguire `docker-compose down` per fermare i container.
- Eseguire `docker-compose down -v` per fermare i container e rimuovere i volumi associati (resettare il database).