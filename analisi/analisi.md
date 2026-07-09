# ANALISI – SISTEMA DI GESTIONE STUDIO VETERINARIO ZAMPETTI


## 1. Descrizione del Problema
Lo studio veterinario del Dott. Camillo Zampetti, situato a Bergamo Alta, si trova ad affrontare una serie di inefficienze operative dovute alla gestione manuale, analogica e frammentata delle attività quotidiane. Con un volume di circa 280 pazienti attivi (suddivisi tra cani, gatti e altri piccoli animali), lo studio risente pesantemente dei seguenti ostacoli:

-  Perdita di tempo in attività ripetitive: La gestione delle prenotazioni avviene tramite canali asincroni e non strutturati (telefonate tradizionali e messaggi WhatsApp manuali), saturando il tempo della reception e aumentando il rischio di errori umani o dimenticanze.
-	Informazioni cliniche incomplete e frammentate: Lo storico medico dei pazienti è diviso tra supporti cartacei (libretti vaccinali) e file digitali isolati. Questa disorganizzazione rende complessa, lenta e fallace la ricerca dei dati critici durante le visite o le chiamate d'urgenza.
-	Smarrimento delle prescrizioni: Le ricette cartacee fornite ai proprietari vengono spesso smarrite, costringendo il medico a ripetere le operazioni di emissione e controllo, appesantendo la burocrazia interna.
-	Isolamento delle informazioni genealogiche: In caso di patologie ereditarie o indagini anamnestiche di lungo periodo, l'assenza di uno storico permanente impedisce di tracciare le linee di sangue dei discendenti (es. analizzare le patologie pregresse dei genitori per curare i figli), a causa della prassi di eliminazione dei vecchi archivi.

## 2. Obiettivo del Progetto
La startup Codice Caciotta propone lo sviluppo di una Web App gestionale integrata, progettata su misura e strutturata su un'architettura moderna a tre livelli (Frontend in React, Backend centralizzato in Spring Boot e Database relazionale PostgreSQL).
L'obiettivo della piattaforma è centralizzare l'intero ecosistema dello studio, automatizzare i flussi burocratici, digitalizzare le cartelle cliniche e i libretti vaccinali, e trasformare i canali di comunicazione tradizionali (WhatsApp e SMS) in strumenti automatizzati di notifica e gestione di scadenze ed appuntamenti, garantendo al contempo la totale tracciabilità storica dei pazienti.

## 3. Entità del sistema
Utenti
-	Attributi: id_utente, codice_fiscale, nome, cognome, email, telefono, indirizzo, città, data_registrazione, stato_attività, .

Animali (Pazienti)
-	Attributi: id_animale, nome, specie, razza, data_nascita, sesso, peso, microchip, colore_mantello, stato_sopravvivenza, note_generali.

Prenotazioni
-	Attributi: id_prenotazione, data_prenotazione, data_ora_appuntamento, motivo, stato_prenotazione, priorità, note.

Visite
-	Attributi: id_visita, data_ora_visita, tipo_visita, motivo/diagnosi, trattamento, durata, importo, stato, note.

Cartelle Cliniche
-	Attributi: id_cartella_clinica, sintomi, diagnosi, trattamento_terapia, note.

Ricette
-	Attributi: id_ricetta, codice_ricetta, data_emissione, farmaco_prescritto, posologia_modalità_uso, durata_terapia, note.

Vaccinazioni
-	Attributi: id_vaccino, tipo_vaccino, data_somministrazione, data_scadenza, lotto_farmaco, stato, note.

Prestazioni
-	Attributi: id_prestazione, nome_prestazione, descrizione, categoria, costo_base, aliquota_IVA, stato_disponibilità, note.

Fatture
-	Attributi: id_fattura, numero_fattura, data_emissione, descrizione_prestazione, importo_imponibile, aliquota_IVA, importo_IVA, importo_totale, denominazione_cliente, codice_fiscale_cliente, partita_IVA_cliente, indirizzo_cliente, codice_destinatario, PEC_cliente, metodo_pagamento, stato_pagamento, data_pagamento, stato_fattura, note.

## MODELLO E-R:
### proprietario
-	id_utente (PK)
-	codice_fiscale
-	nome
-	cognome
-	email
-	telefono
-	indirizzo
-	città
-	data_registrazione
-	stato_attività

### ANIMALI
-	id_animale (PK)
-	id_utente (FK)
-	nome
-	specie
-	razza
-	data_nascita
-	sesso
-	peso
-	microchip
-	colore_mantello
-	sterilizzato
-	gruppo_sanguigno
-	allergie
-	patologie
-	statoAnimale
-	note_generali

## PRENOTAZIONI

-	id_prenotazione (PK)
-	id_utente (FK)
-	id_animale (FK) → NOT NULL
-	data_prenotazione
-	data_ora_appuntamento
-	motivo
-	stato_prenotazione
-	priorità
-	note

## TABELLA PONTE PRENOTAZIONI_PRESTAZIONI
-	id_prenotazione_prestazione (PK)
-	id_prenotazione (FK)
-	id_prestazione (FK)
-	prezzo_prenotato
-	note

## VISITE
-	id_visita (PK)
-	id_prenotazione (FK) (nullable)
-	id_animale (FK) → NOT NULL
-	data_ora_visita
-	durata
-	importo_totale
-	stato
-	note

## TABELLA PONTE VISITE_PRESTAZIONI
-	id_visita_prestazione (PK)
-	id_visita (FK)
-	id_prestazione (FK)
-	prezzo_applicato
-	data_esecuzione
-	nome_farmaco → NULLABLE
-	lotto_farmaco → NULLABLE
-	data_prossima_scadenza  → NULLABLE
-	note

## PRESTAZIONI
-	id_prestazione (PK)
-	nome_prestazione
-	descrizione
-	categoria
-	durata_stimata
-	costo_base
-	aliquota_IVA
-	codice_prestazione
-	stato
-	note

## DIARIO CLINICO
-	id_diario_clinico (PK)
-	id_visita (FK) UNIQUE
-	sintomi
-	diagnosi
-	trattamento_terapia
-	note

## RICETTE
-	id_ricetta (PK)
-	id_visita (FK)
-	codice_ricetta
-	data_emissione
-	farmaco_prescritto
-	posologia_modalità_uso
-	durata_terapia
-	note

## FATTURE
-	id_fattura (PK)
-	id_utente (FK)
-	id_visita (FK) UNIQUE NOT NULL
-	numero_fattura
-	data_emissione
-	denominazione_cliente
-	codice_fiscale_cliente
-	partita_IVA_cliente
-	indirizzo_cliente
-	codice_destinatario
-	PEC_cliente
-	importo_imponibile
-	aliquota_IVA
-	importo_IVA
-	importo_totale
-	metodo_pagamento
-	stato_pagamento
-	data_ora_pagamento
-	stato_fattura
-	note


## UTENTI
UTENTI (1) ─── (N) ANIMALI
(un utente può avere più animali)
UTENTI (1) ─── (N) PRENOTAZIONI
(un utente può fare più prenotazioni)
UTENTI (1) ─── (N) FATTURE
(un utente può ricevere più fatture)

## ANIMALI
ANIMALI (1) ─── (N) PRENOTAZIONI
(un animale può avere più prenotazioni)
ANIMALI (1) ─── (N) VISITE
(un animale può avere più visite nel tempo)

## PRENOTAZIONI
PRENOTAZIONI (0,1) ─── (0,1) VISITE
(una prenotazione può generare al massimo una visita; una visita può non derivare da prenotazione)
PRENOTAZIONI (1) ─── (N) PRENOTAZIONI_PRESTAZIONI
PRESTAZIONI (1) ─── (N) PRENOTAZIONI_PRESTAZIONI
👉 (N:M risolta tramite tabella ponte)

## VISITE
VISITE (1) ─── (1) DIARIO_CLINICO
(ogni visita ha un solo diario clinico)
VISITE (1) ─── (N) VISITE_PRESTAZIONI
PRESTAZIONI (1) ─── (N) VISITE_PRESTAZIONI
👉 (N:M risolta tramite tabella ponte)
VISITE (1) ─── (N) RICETTE
(una visita può generare più ricette)
VISITE (1) ─── (0,1) FATTURE
(una visita può non essere ancora fatturata o avere al massimo una fattura)

## PRESTAZIONI
PRESTAZIONI (1) ─── (N) PRENOTAZIONI_PRESTAZIONI
PRESTAZIONI (1) ─── (N) VISITE_PRESTAZIONI

## DIARIO CLINICO
VISITE (1) ─── (1) DIARIO_CLINICO
(relazione 1:1 con vincolo UNIQUE su id_visita)

##  FATTURE
FATTURE (1) ─── (1) VISITE
(ogni fattura è legata a una e una sola visita con vincolo UNIQUE su id_visita)
UTENTI (1) ─── (N) FATTURE
(un utente può ricevere più fatture)

## RISOLUZIONE RELAZIONI N:M
📌 Prenotazioni ↔ Prestazioni
PRENOTAZIONI (N) ─── (M) PRESTAZIONI
→ risolta da PRENOTAZIONI_PRESTAZIONI
📌 Visite ↔ Prestazioni eseguite
VISITE (N) ─── (M) PRESTAZIONI
→ risolta da VISITE_PRESTAZIONI



###  Dashboard
All'accesso il veterinario visualizza i principali indicatori:
-	Numero di visite effettuate oggi
-	Numero di prenotazioni previste per oggi
-	Fatturato della giornata
-	Pazienti attivi nell'ultimo anno
-	Vaccinazioni effettuate nel mese
-	Fatture ancora da pagare
-	Richiami vaccinali in scadenza nei prossimi 30 giorni


### Report Visite
-	Visite effettuate oggi
-	Visite effettuate nell'ultima settimana
-	Visite effettuate nell'ultimo mese
-	Visite effettuate nell'ultimo anno
-	Numero di visite per tipologia di prestazione
-	Durata media delle visite


### Report Pazienti
-	Pazienti attivi (almeno una visita nell'ultimo anno)
-	Nuovi pazienti registrati nel mese
-	Specie più frequenti
-	Razze più frequenti
-	Peso medio per specie
-	Animali deceduti


### Report Economici
-	Fatturato giornaliero
-	Fatturato mensile
-	Fatturato annuale
-	Totale IVA incassata
-	Numero di fatture emesse
-	Numero di fatture pagate
-	Numero di fatture non pagate
-	Importo ancora da incassare

### Report Sanitari
-	Vaccinazioni effettuate oggi
-	Vaccinazioni effettuate nel mese
-	Storico vaccinazioni per animale
-	Richiami vaccinali in scadenza nei prossimi 30 giorni
-	Farmaci prescritti più frequentemente

## 5. Vincoli del Sistema e Regole di Business.
Le seguenti Business Rules definiscono i principali vincoli funzionali e logici del sistema gestionale veterinario.
### BR_01 – Gestione dei Ruoli
L'accesso alle funzionalità del sistema è regolato in base al ruolo dell'operatore.
-	Solo il veterinario può inserire, modificare o eliminare i dati clinici presenti nel Diario Clinico e nelle Ricette.
-	Il personale amministrativo può gestire utenti, animali, prenotazioni e fatture, ma non può modificare le informazioni cliniche.
Nota: questa regola richiede una futura gestione degli utenti del sistema (es. tabella operatori con relativi ruoli), non ancora modellata nel database.
________________________________________
### BR_02 – Integrità Temporale delle Prenotazioni
Non è consentito registrare una prenotazione con una data e ora di appuntamento antecedenti alla data e ora correnti.
________________________________________
### BR_03 – Sovrapposizione degli Appuntamenti
Non possono esistere due prenotazioni confermate con la stessa data e ora di appuntamento, poiché il sistema è progettato per uno studio veterinario con un unico veterinario operativo.
________________________________________
### BR_04 – Coerenza dei Richiami Vaccinali
Quando una prestazione prevede un richiamo, la data del prossimo richiamo deve essere successiva alla data di esecuzione della prestazione.
________________________________________
### BR_05 – Gestione delle Specie
Il sistema consente la registrazione di animali appartenenti a specie compatibili con l'attività dell'ambulatorio veterinario (ad esempio cane, gatto e altri animali domestici).
________________________________________
### BR_06 – Conservazione dello Storico Clinico
Un animale non può essere eliminato fisicamente dal database.
In caso di decesso o cessazione del rapporto con il proprietario, viene aggiornato il campo stato_sopravvivenza, mantenendo disponibili tutte le informazioni storiche (prenotazioni, visite, diario clinico, ricette e fatture).
________________________________________
### BR_07 – Gestione della Cancellazione dei Dati Personali
Nel caso in cui un utente richieda la cancellazione dei propri dati personali, il sistema deve rispettare la normativa vigente sulla protezione dei dati personali.
I dati necessari per obblighi fiscali e amministrativi (ad esempio le fatture già emesse) devono essere conservati secondo quanto previsto dalla normativa.
Nota: questa regola rappresenta un requisito funzionale e non viene implementata tramite semplici vincoli del database.
________________________________________
### BR_08 – Registrazione degli Utenti
Ogni utente deve essere identificato univocamente tramite il proprio codice fiscale.
L'indirizzo e-mail, se presente, deve essere univoco.
________________________________________
### BR_09 – Stato di Attività dell'Utente
Il campo stato_attivita può essere aggiornato automaticamente dal sistema qualora un utente non effettui prenotazioni o visite per un periodo di 24 mesi.
________________________________________
### BR_10 – Gestione dei Cuccioli
L'età dell'animale viene calcolata automaticamente a partire dalla data di nascita.
Se l'animale ha un'età inferiore a sei mesi, il sistema può generare un promemoria per:
-	avvio del piano vaccinale;
-	controlli periodici consigliati.


## 6. Funzionalità Richieste e Ottimizzazione del Flusso di Lavoro (CORRETTA)

### Flusso di Prenotazione per Utenti Non Registrati
Il sistema mette a disposizione un portale pubblico che consente anche a utenti non registrati di richiedere un appuntamento.
L’utente può inserire:
-	nome e cognome
-	email e telefono
-	dati dell’animale (nome, specie, razza, età)
e selezionare uno slot disponibile nel calendario.
La prenotazione viene salvata con stato:
-	PRENOTATA (in attesa di conferma)
Successivamente, alla prima visita presso lo studio, la segreteria:
-	verifica i dati inseriti
-	associa o crea un account utente nel sistema
-	registra l’animale nel database (se non presente)
- L’utente viene sempre registrato con un record completo nella tabella utenti.
- Non viene utilizzato il campo password come discriminante tra utenti registrati e non registrati, poiché lo stato dell’utente è gestito tramite il sistema di autenticazione.
- 
### Modulo di Notifiche Automatiche (SMS / WhatsApp)
Il sistema integra servizi di notifica tramite API esterne (SMS gateway e WhatsApp Business API) per automatizzare la comunicazione con i clienti.

### Notifiche Scadenze Vaccinali
Il sistema esegue un controllo periodico sulle vaccinazioni registrate.
Se una vaccinazione è in scadenza entro un intervallo configurato (es. 7 o 30 giorni), il sistema invia automaticamente:
-	SMS o messaggio WhatsApp al proprietario dell’animale

### Promemoria Appuntamenti
Il sistema invia automaticamente:
-	conferma immediata alla creazione della prenotazione
-	promemoria 24 ore prima dell’appuntamento
Questo riduce significativamente il numero di appuntamenti mancati.


## 7. Persistenza dei Dati e Architettura Infrastrutturale
Tutti i dati del sistema vengono memorizzati in un database relazionale PostgreSQL, progettato con vincoli di integrità per garantire coerenza e affidabilità:
-	FOREIGN KEY
-	UNIQUE
-	NOT NULL
-	CHECK constraints

### Deploy Cloud
Il sistema è progettato per essere distribuito su infrastruttura cloud, utilizzando:
- AWS (Amazon Web Services)
 - servizio gestito: Amazon RDS (PostgreSQL)

### Vantaggi dell’architettura cloud
📡 Accesso remoto sicuro
Il personale dello studio può accedere ai dati (visite, cartelle cliniche, prenotazioni) da qualsiasi dispositivo autorizzato.

### Backup e affidabilità
-	backup automatici giornalieri
-	ripristino in caso di errore
-	alta disponibilità del servizio

### Continuità operativa
Il sistema garantisce la continuità anche in caso di:
-	guasti hardware locali
-	problemi del server dello studio
