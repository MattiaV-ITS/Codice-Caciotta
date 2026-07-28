# Analisi del Progetto – Gestionale Veterinario

## Introduzione

Questa cartella contiene l'analisi del progetto relativo allo sviluppo di una web application per la gestione di uno studio veterinario.

L'obiettivo del sistema e' digitalizzare e centralizzare le principali attivita' dello studio, tra cui:
- gestione degli utenti (proprietari)
- gestione degli animali (pazienti)
- prenotazioni e visite
- prestazioni veterinarie
- diario clinico e ricette
- vaccinazioni
- fatturazione
- gestione documenti allegati
- configurazione orari studio
- dashboard e reportistica

## Documentazione

All'interno di questa cartella sono presenti i seguenti file:

- `analisi.md` -- documento completo dell'analisi del sistema
- `studio_veterinario_zampetti.docx` -- documento originale dell'analisi (bozza iniziale)

## Contenuti dell'analisi

Il documento descrive in dettaglio:

- modello E-R del database (tutte le 12 entita' e le relative relazioni)
- schema relazionale PostgreSQL con vincoli di integrita'
- business rules del sistema (BR_01-BR_12)
- flussi operativi (prenotazione, visita, fatturazione, autenticazione, documenti, orari)
- dashboard e statistiche (animali, proprietari, fatture, vaccinazioni, prestazioni)
- architettura logica e infrastrutturale del sistema

## Entita' del database

Il database e' composto dalle seguenti tabelle:

| Tabella | Descrizione |
|---|---|
| `proprietari` | Anagrafica dei proprietari degli animali |
| `animali` | Anagrafica dei pazienti (animali) |
| `prenotazioni` | Appuntamenti prenotati |
| `visite` | Visite effettuate |
| `prestazioni` | Catalogo prestazioni veterinarie |
| `visita_prestazioni` | Tabella ponte visite-prestazioni (N:M) |
| `diario_clinico` | Dettaglio clinico delle visite (1:1) |
| `ricette` | Prescrizioni farmacologiche |
| `vaccinazioni` | Somministrazioni vaccinali |
| `fatture` | Documenti fiscali |
| `utenti` | Account di autenticazione |
| `ruoli` | Ruoli per il controllo accessi |
| `utente_ruoli` | Tabella ponte utenti-ruoli (N:M) |
| `documenti_allegati` | File allegati (referti, ricette, ecc.) |
| `orari_studio` | Configurazione orari di apertura |
| `orari_bloccati` | Blocchi orari per ferie/manutenzione |

## Note tecniche

Il sistema e' progettato come una web application e utilizza:

- Frontend: React con Vite (sviluppo) e Nginx (produzione)
- Backend: Spring Boot con Maven e JPA/Hibernate
- Database: PostgreSQL
- Autenticazione: JWT (JSON Web Token) con gestione ruoli (ROLE_USER, ROLE_STAFF, ROLE_ADMIN)
- Containerizzazione: Docker Compose con servizi separati per database, backend e frontend
- Proxy: Nginx per instradamento API in produzione, Vite proxy in sviluppo

## Obiettivo finale

L'obiettivo del progetto e' realizzare un sistema scalabile e modulare per la gestione completa di uno studio veterinario, migliorando l'efficienza operativa e la gestione dei dati clinici.

## Autore

Codice Caciotta - gruppo studenti ITS formato da: Simone Albanese, Alessandro Cistaro, Daniel Salamone, Gianluca Salzarulo, Mattia Viada