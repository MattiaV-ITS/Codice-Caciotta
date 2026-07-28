# ANALISI – SISTEMA DI GESTIONE STUDIO VETERINARIO ZAMPETTI

## 1. Descrizione del Problema
Lo studio veterinario del Dott. Camillo Zampetti, situato a Bergamo Alta, si trova ad affrontare una serie di inefficienze operative dovute alla gestione manuale, analogica e frammentata delle attività quotidiane. Con un volume di circa 280 pazienti attivi (suddivisi tra cani, gatti e altri piccoli animali), lo studio risente pesantemente dei seguenti ostacoli:

- Perdita di tempo in attività ripetitive: La gestione delle prenotazioni avviene tramite canali asincroni e non strutturati (telefonate tradizionali e messaggi WhatsApp manuali), saturando il tempo della reception e aumentando il rischio di errori umani o dimenticanze.
- Informazioni cliniche incomplete e frammentate: Lo storico medico dei pazienti e' diviso tra supporti cartacei (libretti vaccinali) e file digitali isolati. Questa disorganizzazione rende complessa, lenta e fallace la ricerca dei dati critici durante le visite o le chiamate d'urgenza.
- Smarrimento delle prescrizioni: Le ricette cartacee fornite ai proprietari vengono spesso smarrite, costringendo il medico a ripetere le operazioni di emissione e controllo, appesantendo la burocrazia interna.

## 2. Obiettivo del Progetto
La startup Codice Caciotta propone lo sviluppo di una Web App gestionale integrata, progettata su misura e strutturata su un'architettura moderna a tre livelli (Frontend in React, Backend centralizzato in Spring Boot e Database relazionale PostgreSQL).
L'obiettivo della piattaforma e' centralizzare l'intero ecosistema dello studio, automatizzare i flussi burocratici, digitalizzare le cartelle cliniche e i libretti vaccinali, garantendo al contempo la totale tracciabilita' storica dei pazienti.

## 3. Entita' del Sistema

### Proprietari
Tabella: `proprietari`
- id (PK, auto-increment)
- codice_fiscale (unique, nullable, max 16 caratteri)
- nome (NOT NULL)
- cognome (NOT NULL)
- email (NOT NULL, unique)
- telefono (NOT NULL)
- indirizzo (NOT NULL)
- citta (NOT NULL)
- data_registrazione (NOT NULL, date)
- stato (NOT NULL, boolean: true=attivo, false=disattivo)

### Animali (Pazienti)
Tabella: `animali`
- id (PK, auto-increment)
- nome (NOT NULL)
- specie (NOT NULL)
- razza (nullable)
- data_di_nascita (NOT NULL, date)
- sesso (nullable, enum: M, F)
- peso (NOT NULL, decimal)
- microchip (nullable, unique, 15 caratteri)
- taglia (nullable, enum: PICCOLA, MEDIA, GRANDE)
- colore_mantello (nullable)
- sterilizzato (nullable, default false)
- gruppo_sanguigno (nullable)
- allergie (nullable)
- patologie (nullable)
- stato (NOT NULL, enum: SANO, MALATO, IN_CURA, DECEDUTO, default SANO)
- note_generali (nullable)
- note_private (nullable)
- proprietario_id (FK -> proprietari.id, nullable)

### Prenotazioni
Tabella: `prenotazioni`
- id (PK, auto-increment)
- data_prenotazione (NOT NULL, timestamp)
- data_ora_appuntamento (NOT NULL, timestamp)
- tipo_visita (NOT NULL, string)
- note (nullable)
- stato (NOT NULL, enum: NON_ARRIVATO, IN_ATTESA, COMPLETATO, default NON_ARRIVATO)
- prestazione_id (FK -> prestazioni.id, nullable)
- animale_id (FK -> animali.id, NOT NULL)
- proprietario_id (FK -> proprietari.id, NOT NULL)

### Visite
Tabella: `visite`
- id (PK, auto-increment)
- data_ora_visita (NOT NULL, timestamp)
- data_ora_fine_visita (nullable, timestamp)
- tipo_visita (nullable)
- animale_id (FK -> animali.id, NOT NULL)
- prenotazione_id (FK -> prenotazioni.id, nullable, UNIQUE)

### Prestazioni
Tabella: `prestazioni`
- id (PK, auto-increment)
- nome_prestazione (NOT NULL)
- descrizione (nullable)
- durata_stimata (NOT NULL, integer, minuti)
- costo_base (NOT NULL, decimal(10,2))
- aliquota_iva (NOT NULL, integer, default 22)
- stato (NOT NULL, boolean: true=Disponibile, false=Non disponibile)
- note (nullable)
- colore (nullable, string)

### Visita_Prestazioni (tabella ponte N:M)
Tabella: `visita_prestazioni`
- visita_id (FK -> visite.id)
- prestazione_id (FK -> prestazioni.id)

### Diario Clinico
Tabella: `diario_clinico`
- id (PK, auto-increment)
- sintomi (nullable)
- diagnosi (nullable)
- trattamento_terapia (nullable)
- note (nullable)
- note_private (nullable, visibili solo al veterinario)
- visita_id (FK -> visite.id, NOT NULL, UNIQUE)

### Ricette
Tabella: `ricette`
- id (PK, auto-increment)
- codice_ricetta (NOT NULL)
- data_emissione (NOT NULL, timestamp, auto-generato)
- farmaco_prescritto (NOT NULL)
- posologia_modalita_uso (NOT NULL)
- durata_terapia (NOT NULL, string)
- note (nullable)
- visita_id (FK -> visite.id, NOT NULL)

### Vaccinazioni
Tabella: `vaccinazioni`
- id (PK, auto-increment)
- tipo_vaccino (NOT NULL)
- data_somministrazione (NOT NULL, date)
- data_scadenza (NOT NULL, date)
- lotto (NOT NULL)
- note (nullable)
- animale_id (FK -> animali.id, NOT NULL)

### Fatture
Tabella: `fatture`
- id (PK, auto-increment)
- numero_fattura (NOT NULL, unique)
- data_emissione (NOT NULL, timestamp, auto-generato)
- tipo_fattura (NOT NULL, default "Semplificata")
- codice_fiscale_cliente (nullable, max 16)
- indirizzo_cliente (nullable)
- citta_cliente (nullable)
- importo_totale (NOT NULL, decimal(10,2))
- metodo_pagamento (nullable)
- note (nullable)
- dettaglio_servizi (nullable, TEXT)
- pagata (NOT NULL, boolean, default false)
- proprietario_id (FK -> proprietari.id, nullable)
- visita_id (FK -> visite.id, NOT NULL, UNIQUE)

### Utenti (autenticazione)
Tabella: `utenti`
- id (PK, auto-increment)
- username (NOT NULL, unique, max 20)
- email (NOT NULL, unique, max 50)
- password (NOT NULL, max 120, hashata)
- proprietario_id (FK -> proprietari.id, nullable, UNIQUE)

### Ruoli
Tabella: `ruoli`
- id (PK, auto-increment)
- nome (enum: ROLE_USER, ROLE_STAFF, ROLE_ADMIN)

### Utente_Ruoli (tabella ponte N:M)
Tabella: `utente_ruoli`
- utente_id (FK -> utenti.id)
- ruolo_id (FK -> ruoli.id)

### Documenti Allegati
Tabella: `documenti_allegati`
- id (PK, auto-increment)
- animale_id (NOT NULL)
- visita_id (nullable)
- fattura_id (nullable)
- nome_originale (NOT NULL)
- percorso_file (NOT NULL)
- tipo_documento (NOT NULL, enum: REFERTO, RICETTA, ANALISI, LIBRETTO_VACCINALE, CERTIFICATO, SCAN_FATTURA, DOCUMENTO_GENERICO, ALTRO)
- dimensione_bytes (NOT NULL)
- tipo_mime (NOT NULL)
- note (nullable, max 500)
- data_caricamento (NOT NULL, timestamp, auto-generato)
- data_documento (nullable, timestamp)

### Orari Studio
Tabella: `orari_studio`
- id (PK, auto-increment)
- giorno_settimana (enum: LUNEDI, MARTEDI, MERCOLEDI, GIOVEDI, VENERDI, SABATO, DOMENICA)
- ora_apertura (time)
- ora_chiusura (time)
- ora_inizio_pausa_pranzo (nullable, time)
- ora_fine_pausa_pranzo (nullable, time)
- chiuso (boolean, default false)
- data_specifica (nullable, date, per eccezioni)
- is_default (boolean, default true)

### Orari Bloccati
Tabella: `orari_bloccati`
- id (PK, auto-increment)
- data (NOT NULL, date)
- ora_inizio (NOT NULL, time)
- ora_fine (NOT NULL, time)
- motivo (nullable)
- creato_il (date, auto-generato)
- creato_da (nullable)

## 4. Modello E-R

### Proprietari
PROPRIETARI (1) --- (N) ANIMALI
(un proprietario puo' avere piu' animali)
PROPRIETARI (1) --- (N) PRENOTAZIONI
(un proprietario puo' fare piu' prenotazioni)
PROPRIETARI (1) --- (N) FATTURE
(un proprietario puo' ricevere piu' fatture)
PROPRIETARI (1) --- (0,1) UTENTI
(un proprietario puo' avere un account di autenticazione)

### Animali
ANIMALI (1) --- (N) PRENOTAZIONI
(un animale puo' avere piu' prenotazioni)
ANIMALI (1) --- (N) VISITE
(un animale puo' avere piu' visite nel tempo)
ANIMALI (1) --- (N) VACCINAZIONI
(un animale puo' avere piu' vaccinazioni)
ANIMALI (1) --- (N) DOCUMENTI_ALLEGATI
(un animale puo' avere piu' documenti allegati)

### Prenotazioni
PRENOTAZIONI (0,1) --- (0,1) VISITE
(una prenotazione puo' generare al massimo una visita; una visita puo' non derivare da prenotazione)
PRENOTAZIONI (N) --- (1) PRESTAZIONI
(una prenotazione e' associata a una prestazione)

### Visite
VISITE (1) --- (1) DIARIO_CLINICO
(ogni visita ha un solo diario clinico)
VISITE (1) --- (N) RICETTE
(una visita puo' generare piu' ricette)
VISITE (1) --- (0,1) FATTURE
(una visita puo' non essere ancora fatturata o avere al massimo una fattura)
VISITE (N) --- (M) PRESTAZIONI
(risolta da VISITA_PRESTAZIONI: una visita puo' includere piu' prestazioni, una prestazione puo' essere eseguita in piu' visite)
VISITE (1) --- (N) DOCUMENTI_ALLEGATI
(una visita puo' avere piu' documenti allegati)

### Prestazioni
PRESTAZIONI (1) --- (N) PRENOTAZIONI
(una prestazione puo' essere prenotata piu' volte)
PRESTAZIONI (N) --- (M) VISITE
(risolta da VISITA_PRESTAZIONI)

### Diario Clinico
VISITE (1) --- (1) DIARIO_CLINICO
(relazione 1:1 con vincolo UNIQUE su visita_id)

### Fatture
FATTURE (1) --- (1) VISITE
(ogni fattura e' legata a una e una sola visita con vincolo UNIQUE su visita_id)
PROPRIETARI (1) --- (N) FATTURE
(un proprietario puo' ricevere piu' fatture)
FATTURE (1) --- (N) DOCUMENTI_ALLEGATI
(una fattura puo' avere piu' documenti allegati)

### Utenti
UTENTI (1) --- (N) UTENTI_RUOLI
UTENTI (1) --- (0,1) PROPRIETARI
(un utente autenticato puo' essere associato a un proprietario)
RUOLI (1) --- (N) UTENTI_RUOLI

## 5. Dashboard e Report

### Dashboard
All'accesso il veterinario visualizza i principali indicatori:
- Visite effettuate oggi (con elenco dettagliato)
- Numero di prenotazioni totali
- Fatture ancora da pagare e importo non pagato
- Totale animali e proprietari registrati
- Proprietari attivi
- Animali con vaccinazioni in scadenza

### Statistiche Animali
- Totale animali registrati
- Animali per specie
- Animali per sesso
- Animali deceduti
- Animali con microchip

### Statistiche Proprietari
- Totale proprietari registrati
- Proprietari attivi
- Nuovi proprietari

### Statistiche Fatture
- Totale fatture emesse
- Fatture pagate e non pagate
- Importo totale, importo pagato e importo non pagato

### Statistiche Vaccinazioni
- Vaccinazioni in scadenza (prossimi 30 giorni)
- Vaccinazioni scadute

## 6. Vincoli del Sistema e Regole di Business

### BR_01 – Gestione dei Ruoli
L'accesso alle funzionalita' del sistema e' regolato in base al ruolo dell'operatore tramite autenticazione JWT.
- ROLE_ADMIN: accesso completo a tutte le funzionalita', inclusa la gestione degli utenti e dei ruoli.
- ROLE_STAFF: accesso a gestione animali, prenotazioni, visite, fatture e statistiche.
- ROLE_USER: accesso limitato alle proprie prenotazioni e ai propri animali.
I ruoli sono gestiti tramite le tabelle `utenti`, `ruoli` e `utente_ruoli`.

### BR_02 – Integrita' Temporale delle Prenotazioni
Non e' consentito registrare una prenotazione con una data e ora di appuntamento antecedenti alla data e ora correnti.

### BR_03 – Sovrapposizione degli Appuntamenti
Non possono esistere due prenotazioni confermate con la stessa data e ora di appuntamento, poiche' il sistema e' progettato per uno studio veterinario con un unico veterinario operativo.

### BR_04 – Coerenza dei Richiami Vaccinali
Quando una vaccinazione prevede un richiamo, la data di scadenza deve essere successiva alla data di somministrazione.

### BR_05 – Gestione delle Specie
Il sistema consente la registrazione di animali appartenenti a specie compatibili con l'attivita' dell'ambulatorio veterinario (ad esempio cane, gatto, coniglio e altri animali domestici).

### BR_06 – Conservazione dello Storico Clinico
Un animale non puo' essere eliminato fisicamente dal database.
In caso di decesso o cessazione del rapporto con il proprietario, viene aggiornato il campo stato su DECEDUTO, mantenendo disponibili tutte le informazioni storiche (prenotazioni, visite, diario clinico, ricette e fatture).

### BR_07 – Registrazione degli Utenti
Ogni proprietario deve essere identificato univocamente tramite email (unique).
Il codice fiscale, se presente, deve essere univoco.

### BR_08 – Gestione Orari Studio
Il sistema permette di configurare gli orari di apertura per ogni giorno della settimana, con possibilita' di specificare fasce di pausa pranzo e giorni di chiusura.
E' possibile inserire eccezioni per date specifiche (festivita', chiusure straordinarie) e bloccare fasce orarie specifiche tramite la tabella `orari_bloccati`.

### BR_09 – Gestione Documenti Allegati
Il sistema permette di allegare documenti (referti, ricette, analisi, libretti vaccinali, certificati, scansioni fatture) a animali, visite e fatture.

## 7. Flussi Operativi

### Flusso di Prenotazione
1. L'utente (registrato o non registrato) contatta lo studio.
2. La segreteria o l'utente registrato crea una prenotazione specificando: animale, proprietario, tipo di visita/prestazione, data e ora.
3. La prenotazione viene salvata.
4. All'arrivo del cliente, la segreteria aggiorna lo stato della prenotazione a COMPLETATO e viene generata una visita associata.

### Flusso di Visita
1. La visita viene creata a partire da una prenotazione o direttamente (per urgenze senza prenotazione).
2. Durante la visita, il veterinario puo':
   - Registrare il diario clinico (sintomi, diagnosi, trattamento)
   - Registrare vaccinazioni
3. Al termine, viene calcolata la durata effettiva della visita.
4. Opzionalmente, viene generata una fattura per la visita.

### Flusso di Fatturazione
1. La fattura viene creata a partire da una visita completata.
2. Il sistema genera un numero fattura univoco e calcola l'importo totale.
3. La fattura puo' essere di tipo "Semplificata" (per ora unico tipo supportato).
4. La fattura viene associata al proprietario e alla visita specifica.
5. Il pagamento viene registrato aggiornando il campo `pagata`.

### Flusso di Autenticazione e Autorizzazione
1. L'utente si registra con username, email e password.
2. La password viene hashata e salvata nella tabella `utenti`.
3. All'utente viene assegnato il ruolo ROLE_USER di default.
4. Un amministratore puo' promuovere l'utente a ROLE_STAFF o ROLE_ADMIN.
5. L'utente puo' essere associato a un record nella tabella `proprietari`.
6. L'accesso alle API e' regolato tramite token JWT e annotazioni @PreAuthorize.

### Flusso di Gestione Documenti
1. L'utente carica un documento associandolo a un animale, una visita o una fattura.
2. Il file viene salvato su filesystem e il percorso registrato nel database.
3. Il documento viene categorizzato per tipo (referto, ricetta, analisi, ecc.).
4. I documenti possono essere visualizzati e scaricati dagli utenti autorizzati.

### Flusso di Gestione Orari
1. L'amministratore configura gli orari standard per ogni giorno della settimana.
2. E' possibile specificare fasce orarie di pausa pranzo.
3. Per date specifiche (festivita'), e' possibile sovrascrivere gli orari standard.
4. E' possibile bloccare fasce orarie specifiche (es. per ferie del veterinario, manutenzione).
5. Il sistema utilizza queste informazioni per validare la disponibilita' degli appuntamenti.

## 8. Persistenza dei Dati e Architettura Infrastrutturale
Tutti i dati del sistema vengono memorizzati in un database relazionale PostgreSQL, progettato con vincoli di integrita' per garantire coerenza e affidabilita':
- FOREIGN KEY
- UNIQUE
- NOT NULL
- CHECK constraints

### Architettura di Deploy
Il sistema e' containerizzato tramite Docker Compose con i seguenti servizi:
- **postgresdb**: database PostgreSQL (porta esterna 5433, interna 5432)
- **backend**: applicazione Spring Boot (porta esterna 6868, interna 8080)
- **frontend**: applicazione React con Nginx per produzione (porta 3000)
- **frontend-dev**: server di sviluppo Vite (porta 5174)

### Proxy e Routing
- **Sviluppo**: Vite proxy configura per instradare `/api` verso `http://localhost:6868`
- **Produzione**: Nginx gestisce il proxy di `/api/` verso `http://backend:8080/api/`

### Vantaggi dell'architettura containerizzata
- Accesso remoto sicuro: il personale dello studio puo' accedere ai dati da qualsiasi dispositivo autorizzato.
- Backup e affidabilita': backup automatici giornalieri del database, ripristino in caso di errore.
- Continuita' operativa: il sistema garantisce la continuita' anche in caso di guasti hardware locali.
- Isolamento dei servizi: ogni componente opera in un container separato.
- Scalabilita': possibilita' di replicare i servizi per gestire carichi maggiori.

## 9. Tecnologie Utilizzate

### Frontend
- React con Vite per lo sviluppo
- Nginx per il proxy di produzione
- Dipendenze gestite con npm

### Backend
- Spring Boot con Maven
- JPA/Hibernate per l'ORM
- Spring Security con JWT per l'autenticazione
- API RESTful

### Database
- PostgreSQL
- Migrazione dati da Excel tramite script SQL

### Infrastruttura
- Docker Compose per l'orchestrazione dei container
- Nginx come reverse proxy

## 10. Autore
Codice Caciotta - gruppo studenti ITS formato da: Simone Albanese, Alessandro Cistaro, Daniel Salamone, Gianluca Salzarulo, Mattia Viada