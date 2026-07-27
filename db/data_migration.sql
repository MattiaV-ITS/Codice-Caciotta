-- ============================================================
-- Migrazione da Excel a PostgreSQL per il database di gestione clinica veterinaria.
-- ============================================================
-- ============================================================
-- DATA INSERTION ONLY (tables already exist)
-- ============================================================

BEGIN;

-- ------------------------------------------------------------
-- 1. PROPRIETARI
-- ------------------------------------------------------------
INSERT INTO proprietari (nome, cognome, email, telefono, indirizzo, citta, data_registrazione, stato)
VALUES
  ('Marco','Rossi','marco.rossi@email.it','335 1234567','Via Roma 12','Bergamo','2019-03-15'::date, true),
  ('Francesca','Bianchi','f.bianchi@gmail.com','347 2345678','Via Garibaldi 5','Bergamo Alta','2019-07-22'::date, true),
  ('Luigi','Colombo','l.colombo@libero.it','328 3456789','Via Manzoni 33','Sorisole','2019-11-10'::date, true),
  ('Anna','Ferrari','anna.ferrari@yahoo.it','339 4567890','Piazza Vecchia 1','Bergamo Alta','2020-02-05'::date, true),
  ('Giorgio','Ricci','g.ricci@email.it','366 5678901','Via Tasso 8','Bergamo','2020-04-18'::date, true),
  ('Maria','Conti','maria.conti@gmail.com','351 6789012','Via Pignolo 44','Bergamo','2020-06-30'::date, true),
  ('Paolo','Manzoni','p.manzoni@libero.it','342 7890123','Via Borgo Palazzo 17','Bergamo','2020-09-12'::date, true),
  ('Elena','Galli','e.galli@email.it','333 8901234','Via S. Tomaso 9','Bergamo Alta','2021-01-25'::date, true),
  ('Roberto','Esposito','r.esposito@gmail.com','370 9012345','Via Zambonate 22','Bergamo','2021-03-08'::date, true),
  ('Chiara','Ferretti','c.ferretti@email.it','348 0123456','Viale Papa Giovanni 15','Bergamo','2021-05-19'::date, true),
  ('Antonio','Moretti','a.moretti@libero.it','335 1234568','Via Tiraboschi 6','Bergamo','2021-08-02'::date, true),
  ('Valentina','Caruso','v.caruso@gmail.com','347 2345679','Via Quarenghi 11','Bergamo','2021-10-14'::date, true),
  ('Francesco','Lombardi','f.lombardi@email.it','328 3456780','Via Moroni 28','Bergamo','2021-12-27'::date, true),
  ('Giulia','Barbieri','g.barbieri@yahoo.it','339 4567891','Via Camozzi 3','Bergamo','2022-02-09'::date, true),
  ('Stefano','Marchetti','s.marchetti@gmail.com','366 5678902','Via Angelo Mai 19','Bergamo Alta','2022-04-21'::date, true)
ON CONFLICT (email) DO NOTHING;

-- ------------------------------------------------------------
-- 2. ANIMALI
-- ------------------------------------------------------------
WITH prop AS (
  SELECT id, email FROM proprietari
)
INSERT INTO animali (nome, specie, razza, data_di_nascita, sesso, peso, microchip, proprietario_id, note_generali, stato)
VALUES
  ('Briciola','Cane','Labrador','2017-05-12'::date,'F',28.5,'380260040123456',
   (SELECT id FROM prop WHERE email='marco.rossi@email.it'), NULL, 'SANO'),
  ('Rex','Cane','Pastore Tedesco','2018-09-03'::date,'M',34,'380260040234567',
   (SELECT id FROM prop WHERE email='f.bianchi@gmail.com'), 'Allergia al pollame', 'IN_CURA'),
  ('Luna','Gatto','Europeo Comune','2020-02-17'::date,'F',4.2,'380260040345678',
   (SELECT id FROM prop WHERE email='f.bianchi@gmail.com'), NULL, 'SANO'),
  ('Pallina','Cane','Bassotto','2016-11-28'::date,'F',9.1,'380260040456789',
   (SELECT id FROM prop WHERE email='l.colombo@libero.it'), 'Problemi alla schiena', 'IN_CURA'),
  ('Micio','Gatto','Persiano','2019-04-06'::date,'M',5.8,'380260040567890',
   (SELECT id FROM prop WHERE email='anna.ferrari@yahoo.it'), NULL, 'SANO'),  -- corrected from DECEDUTO
  ('Fido','Cane','Golden Retriever','2018-08-14'::date,'M',31.2,'380260040678901',
   (SELECT id FROM prop WHERE email='g.ricci@email.it'), NULL, 'SANO'),
  ('Neve','Gatto','Siamese','2021-01-22'::date,'F',3.9,'380260040789012',
   (SELECT id FROM prop WHERE email='maria.conti@gmail.com'), NULL, 'SANO'),
  ('Birillo','Cane','Beagle','2017-06-09'::date,'M',12.4,'380260040890123',
   (SELECT id FROM prop WHERE email='p.manzoni@libero.it'), 'Tendenza all''obesità', 'SANO'),
  ('Cioccolata','Cane','Labrador','2019-03-30'::date,'F',26,'380260040901234',
   (SELECT id FROM prop WHERE email='e.galli@email.it'), NULL, 'SANO'),
  ('Tigre','Gatto','Maine Coon','2018-10-11'::date,'M',7.3,'380260041012345',
   (SELECT id FROM prop WHERE email='r.esposito@gmail.com'), NULL, 'SANO'),
  ('Oscar','Cane','Boxer','2020-07-05'::date,'M',29.5,'380260041123456',
   (SELECT id FROM prop WHERE email='c.ferretti@email.it'), NULL, 'SANO'),
  ('Puffo','Coniglio','Nano Olandese','2021-12-18'::date,'M',1.4,NULL,
   (SELECT id FROM prop WHERE email='a.moretti@libero.it'), NULL, 'SANO'),
  ('Stella','Gatto','Europeo Comune','2019-05-24'::date,'F',3.6,'380260041234567',
   (SELECT id FROM prop WHERE email='v.caruso@gmail.com'), 'FIV positivo', 'MALATO'),
  ('Zeus','Cane','Rottweiler','2017-02-02'::date,'M',44,'380260041345678',
   (SELECT id FROM prop WHERE email='f.lombardi@email.it'), NULL, 'SANO'),
  ('Mia','Gatto','Ragdoll','2020-09-16'::date,'F',5.1,'380260041456789',
   (SELECT id FROM prop WHERE email='g.barbieri@yahoo.it'), NULL, 'SANO'),
  ('Artù','Cane','Border Collie','2018-11-07'::date,'M',18.7,'380260041567890',
   (SELECT id FROM prop WHERE email='s.marchetti@gmail.com'), NULL, 'SANO'),
  ('Mochi','Gatto','Birmano','2021-06-29'::date,'M',4.4,'380260041678901',
   (SELECT id FROM prop WHERE email='marco.rossi@email.it'), NULL, 'SANO'),
  ('Lilly','Cane','Barboncino','2020-03-13'::date,'F',5.2,'380260041789012',
   (SELECT id FROM prop WHERE email='g.ricci@email.it'), NULL, 'SANO'),
  ('Charlie','Cane','Cocker Spaniel','2019-08-25'::date,'M',11.8,'380260041890123',
   (SELECT id FROM prop WHERE email='e.galli@email.it'), 'Otite cronica', 'IN_CURA'),
  ('Fiocco','Coniglio','Ariete','2022-01-04'::date,'F',2.1,NULL,
   (SELECT id FROM prop WHERE email='a.moretti@libero.it'), NULL, 'SANO')
ON CONFLICT (microchip) DO NOTHING;

-- ------------------------------------------------------------
-- 3. VACCINAZIONI
-- ------------------------------------------------------------
WITH animal_lookup AS (
  SELECT a.id, a.nome, p.email
  FROM animali a
  JOIN proprietari p ON a.proprietario_id = p.id
)
INSERT INTO vaccinazioni (animale_id, tipo_vaccino, data_somministrazione, data_scadenza, lotto, note)
VALUES
  ((SELECT id FROM animal_lookup WHERE nome='Briciola' AND email='marco.rossi@email.it'),
   'Polivalente cane (DHPPI)', '2024-01-10'::date, '2025-01-10'::date, 'LOT-2024-0011', NULL),
  ((SELECT id FROM animal_lookup WHERE nome='Briciola' AND email='marco.rossi@email.it'),
   'Antirabbico', '2024-01-10'::date, '2027-01-10'::date, 'LOT-2024-0012', 'Validità 3 anni'),
  ((SELECT id FROM animal_lookup WHERE nome='Rex' AND email='f.bianchi@gmail.com'),
   'Polivalente cane (DHPPI)', '2023-03-15'::date, '2024-03-15'::date, 'LOT-2023-0045', 'Richiamo non ancora effettuato'),
  ((SELECT id FROM animal_lookup WHERE nome='Rex' AND email='f.bianchi@gmail.com'),
   'Antirabbico', '2023-03-15'::date, '2026-03-15'::date, 'LOT-2023-0046', NULL),
  ((SELECT id FROM animal_lookup WHERE nome='Luna' AND email='f.bianchi@gmail.com'),
   'Trivalente felina (HCP)', '2024-01-18'::date, '2025-01-18'::date, 'LOT-2024-0031', NULL),
  ((SELECT id FROM animal_lookup WHERE nome='Luna' AND email='f.bianchi@gmail.com'),
   'Leucemia felina (FeLV)', '2024-01-18'::date, '2025-01-18'::date, 'LOT-2024-0032', NULL),
  ((SELECT id FROM animal_lookup WHERE nome='Micio' AND email='anna.ferrari@yahoo.it'),
   'Trivalente felina (HCP)', '2023-04-22'::date, '2024-04-22'::date, 'LOT-2023-0078', 'Proprietaria contattata via WhatsApp'),
  ((SELECT id FROM animal_lookup WHERE nome='Fido' AND email='g.ricci@email.it'),
   'Polivalente cane (DHPPI)', '2024-01-15'::date, '2025-01-15'::date, 'LOT-2024-0019', NULL),
  ((SELECT id FROM animal_lookup WHERE nome='Fido' AND email='g.ricci@email.it'),
   'Antirabbico', '2024-01-15'::date, '2027-01-15'::date, 'LOT-2024-0020', NULL),
  ((SELECT id FROM animal_lookup WHERE nome='Fido' AND email='g.ricci@email.it'),
   'Leishmaniosi', '2024-01-15'::date, '2025-01-15'::date, 'LOT-2024-0021', 'Zona a rischio'),
  ((SELECT id FROM animal_lookup WHERE nome='Neve' AND email='maria.conti@gmail.com'),
   'Trivalente felina (HCP)', '2024-02-19'::date, '2025-02-19'::date, 'LOT-2024-0041', 'Prima vaccinazione'),
  ((SELECT id FROM animal_lookup WHERE nome='Birillo' AND email='p.manzoni@libero.it'),
   'Polivalente cane (DHPPI)', '2023-05-20'::date, '2024-05-20'::date, 'LOT-2023-0099', NULL),
  ((SELECT id FROM animal_lookup WHERE nome='Cioccolata' AND email='e.galli@email.it'),
   'Polivalente cane (DHPPI)', '2023-06-07'::date, '2024-06-07'::date, 'LOT-2023-0102', NULL),
  ((SELECT id FROM animal_lookup WHERE nome='Cioccolata' AND email='e.galli@email.it'),
   'Antirabbico', '2023-06-07'::date, '2026-06-07'::date, 'LOT-2023-0103', NULL),
  ((SELECT id FROM animal_lookup WHERE nome='Tigre' AND email='r.esposito@gmail.com'),
   'Trivalente felina (HCP)', '2023-03-14'::date, '2024-03-14'::date, 'LOT-2023-0061', NULL),
  ((SELECT id FROM animal_lookup WHERE nome='Oscar' AND email='c.ferretti@email.it'),
   'Polivalente cane (DHPPI)', '2023-08-10'::date, '2024-08-10'::date, 'LOT-2023-0121', NULL),
  ((SELECT id FROM animal_lookup WHERE nome='Puffo' AND email='a.moretti@libero.it'),
   'Trivalente felina (HCP)', '2024-02-26'::date, '2025-02-26'::date, 'LOT-2024-0051', NULL),
  ((SELECT id FROM animal_lookup WHERE nome='Stella' AND email='v.caruso@gmail.com'),
   'Polivalente cane (DHPPI)', '2024-01-29'::date, '2025-01-29'::date, 'LOT-2024-0022', NULL),
  ((SELECT id FROM animal_lookup WHERE nome='Stella' AND email='v.caruso@gmail.com'),
   'Antirabbico', '2024-01-29'::date, '2027-01-29'::date, 'LOT-2024-0023', NULL),
  ((SELECT id FROM animal_lookup WHERE nome='Zeus' AND email='f.lombardi@email.it'),
   'Trivalente felina (HCP)', '2024-03-19'::date, '2025-03-19'::date, 'LOT-2024-0062', NULL),
  ((SELECT id FROM animal_lookup WHERE nome='Mia' AND email='g.barbieri@yahoo.it'),
   'Polivalente cane (DHPPI)', '2023-11-10'::date, '2024-11-10'::date, 'LOT-2023-0155', NULL),
  ((SELECT id FROM animal_lookup WHERE nome='Mia' AND email='g.barbieri@yahoo.it'),
   'Antirabbico', '2023-11-10'::date, '2026-11-10'::date, 'LOT-2023-0156', NULL),
  ((SELECT id FROM animal_lookup WHERE nome='Artù' AND email='s.marchetti@gmail.com'),
   'Trivalente felina (HCP)', '2024-03-08'::date, '2025-03-08'::date, 'LOT-2024-0058', NULL),
  ((SELECT id FROM animal_lookup WHERE nome='Mochi' AND email='marco.rossi@email.it'),
   'Polivalente cane (DHPPI)', '2023-04-25'::date, '2024-04-25'::date, 'LOT-2023-0088', NULL),
  ((SELECT id FROM animal_lookup WHERE nome='Lilly' AND email='g.ricci@email.it'),
   'Polivalente cane (DHPPI)', '2023-07-12'::date, '2024-07-12'::date, 'LOT-2023-0112', NULL)
ON CONFLICT (animale_id, tipo_vaccino, data_somministrazione) DO NOTHING;

-- ------------------------------------------------------------
-- 4. PRESTAZIONI
-- ------------------------------------------------------------
INSERT INTO prestazioni (nome_prestazione, descrizione, durata_stimata, costo_base, aliquota_iva, stato, colore)
VALUES
  ('Controllo annuale', 'Visita di controllo annuale', 30, 45.00, 22, 'Disponibile', '#4299E1'),
  ('Visita ortopedica', 'Visita specialistica ortopedica', 30, 85.00, 22, 'Disponibile', '#9F7AEA'),
  ('Chirurgia', 'Intervento chirurgico', 120, 220.00, 22, 'Disponibile', '#ED8936'),
  ('Visita urgente', 'Visita per problemi urgenti', 30, 70.00, 22, 'Disponibile', '#F56565'),
  ('Controllo peso', 'Controllo del peso e dieta', 30, 35.00, 22, 'Disponibile', '#48BB78'),
  ('Vaccinazione', 'Somministrazione vaccini', 30, 35.00, 22, 'Disponibile', '#48BB78'),
  ('Dermatologia', 'Visita specialistica dermatologica', 30, 65.00, 22, 'Disponibile', '#ED64A6'),
  ('Ecografia', 'Esame ecografico', 30, 95.00, 22, 'Disponibile', '#63B3ED'),
  ('Visita neurologica', 'Visita specialistica neurologica', 30, 90.00, 22, 'Disponibile', '#2B6CB0'),
  ('Controllo post-op', 'Controllo post-operatorio', 30, 50.00, 22, 'Disponibile', '#38B2AC'),
  ('Malattia infettiva', 'Visita per malattie infettive', 30, 75.00, 22, 'Disponibile', '#EF4444'),
  ('Controllo semestrale', 'Visita di controllo semestrale', 30, 40.00, 22, 'Disponibile', '#3182CE'),
  ('Otorinolaringoiatria', 'Visita specialistica ORL', 30, 60.00, 22, 'Disponibile', '#805AD5'),
  ('Prima visita', 'Prima visita per nuovo paziente', 30, 40.00, 22, 'Disponibile', '#2C7A7B')
ON CONFLICT (nome_prestazione) DO NOTHING;

-- ------------------------------------------------------------
-- 5. VISITE
-- ------------------------------------------------------------
WITH animal_ref AS (
  SELECT a.id, a.nome, p.email
  FROM animali a
  JOIN proprietari p ON a.proprietario_id = p.id
)
INSERT INTO visite (data_ora_visita, data_ora_fine_visita, animale_id, prenotazione_id)
VALUES
  ('2024-01-10 00:00:00+00'::timestamptz, '2024-01-10 00:30:00+00'::timestamptz,
   (SELECT id FROM animal_ref WHERE nome='Briciola' AND email='marco.rossi@email.it'), NULL),
  ('2024-01-12 00:00:00+00'::timestamptz, '2024-01-12 01:00:00+00'::timestamptz,
   (SELECT id FROM animal_ref WHERE nome='Rex' AND email='f.bianchi@gmail.com'), NULL),
  ('2024-01-15 00:00:00+00'::timestamptz, '2024-01-15 00:45:00+00'::timestamptz,
   (SELECT id FROM animal_ref WHERE nome='Fido' AND email='g.ricci@email.it'), NULL),
  ('2024-01-18 00:00:00+00'::timestamptz, '2024-01-18 02:00:00+00'::timestamptz,
   (SELECT id FROM animal_ref WHERE nome='Luna' AND email='f.bianchi@gmail.com'), NULL),
  ('2024-01-22 00:00:00+00'::timestamptz, '2024-01-22 01:00:00+00'::timestamptz,
   (SELECT id FROM animal_ref WHERE nome='Tigre' AND email='r.esposito@gmail.com'), NULL),
  ('2024-01-25 00:00:00+00'::timestamptz, '2024-01-25 00:30:00+00'::timestamptz,
   (SELECT id FROM animal_ref WHERE nome='Birillo' AND email='p.manzoni@libero.it'), NULL),
  ('2024-01-29 00:00:00+00'::timestamptz, '2024-01-29 00:45:00+00'::timestamptz,
   (SELECT id FROM animal_ref WHERE nome='Zeus' AND email='f.lombardi@email.it'), NULL),
  ('2024-02-02 00:00:00+00'::timestamptz, '2024-02-02 01:00:00+00'::timestamptz,
   (SELECT id FROM animal_ref WHERE nome='Micio' AND email='anna.ferrari@yahoo.it'), NULL),
  ('2024-02-07 00:00:00+00'::timestamptz, '2024-02-07 01:15:00+00'::timestamptz,
   (SELECT id FROM animal_ref WHERE nome='Cioccolata' AND email='e.galli@email.it'), NULL),
  ('2024-02-12 00:00:00+00'::timestamptz, '2024-02-12 01:15:00+00'::timestamptz,
   (SELECT id FROM animal_ref WHERE nome='Artù' AND email='s.marchetti@gmail.com'), NULL),
  ('2024-02-15 00:00:00+00'::timestamptz, '2024-02-15 01:30:00+00'::timestamptz,
   (SELECT id FROM animal_ref WHERE nome='Pallina' AND email='l.colombo@libero.it'), NULL),
  ('2024-02-19 00:00:00+00'::timestamptz, '2024-02-19 00:30:00+00'::timestamptz,
   (SELECT id FROM animal_ref WHERE nome='Neve' AND email='maria.conti@gmail.com'), NULL),
  ('2024-02-22 00:00:00+00'::timestamptz, '2024-02-22 00:30:00+00'::timestamptz,
   (SELECT id FROM animal_ref WHERE nome='Oscar' AND email='c.ferretti@email.it'), NULL),
  ('2024-02-26 00:00:00+00'::timestamptz, '2024-02-26 01:00:00+00'::timestamptz,
   (SELECT id FROM animal_ref WHERE nome='Stella' AND email='v.caruso@gmail.com'), NULL),
  ('2024-03-01 00:00:00+00'::timestamptz, '2024-03-01 00:30:00+00'::timestamptz,
   (SELECT id FROM animal_ref WHERE nome='Briciola' AND email='marco.rossi@email.it'), NULL),
  ('2024-03-05 00:00:00+00'::timestamptz, '2024-03-05 00:45:00+00'::timestamptz,
   (SELECT id FROM animal_ref WHERE nome='Charlie' AND email='e.galli@email.it'), NULL),
  ('2024-03-08 00:00:00+00'::timestamptz, '2024-03-08 00:30:00+00'::timestamptz,
   (SELECT id FROM animal_ref WHERE nome='Mochi' AND email='marco.rossi@email.it'), NULL),
  ('2024-03-12 00:00:00+00'::timestamptz, '2024-03-12 00:30:00+00'::timestamptz,
   (SELECT id FROM animal_ref WHERE nome='Lilly' AND email='g.ricci@email.it'), NULL),
  ('2024-03-15 00:00:00+00'::timestamptz, '2024-03-15 03:00:00+00'::timestamptz,
   (SELECT id FROM animal_ref WHERE nome='Fido' AND email='g.ricci@email.it'), NULL),
  ('2024-03-19 00:00:00+00'::timestamptz, '2024-03-19 00:45:00+00'::timestamptz,
   (SELECT id FROM animal_ref WHERE nome='Mia' AND email='g.barbieri@yahoo.it'), NULL),
  ('2024-03-22 00:00:00+00'::timestamptz, '2024-03-22 00:45:00+00'::timestamptz,
   (SELECT id FROM animal_ref WHERE nome='Rex' AND email='f.bianchi@gmail.com'), NULL),
  ('2024-03-26 00:00:00+00'::timestamptz, '2024-03-26 00:30:00+00'::timestamptz,
   (SELECT id FROM animal_ref WHERE nome='Fiocco' AND email='a.moretti@libero.it'), NULL),
  ('2024-04-02 00:00:00+00'::timestamptz, '2024-04-02 00:30:00+00'::timestamptz,
   (SELECT id FROM animal_ref WHERE nome='Puffo' AND email='a.moretti@libero.it'), NULL),
  ('2024-04-09 00:00:00+00'::timestamptz, '2024-04-09 00:30:00+00'::timestamptz,
   (SELECT id FROM animal_ref WHERE nome='Luna' AND email='f.bianchi@gmail.com'), NULL),
  ('2024-04-16 00:00:00+00'::timestamptz, '2024-04-16 00:30:00+00'::timestamptz,
   (SELECT id FROM animal_ref WHERE nome='Zeus' AND email='f.lombardi@email.it'), NULL)
ON CONFLICT DO NOTHING;  -- no unique constraint, but safe to skip if duplicate

-- ------------------------------------------------------------
-- 6. VISITA_PRESTAZIONI
-- ------------------------------------------------------------
WITH visit_ref AS (
  SELECT v.id, a.nome, p.email, v.data_ora_visita
  FROM visite v
  JOIN animali a ON v.animale_id = a.id
  JOIN proprietari p ON a.proprietario_id = p.id
)
INSERT INTO visita_prestazioni (visita_id, prestazione_id)
VALUES
  ((SELECT id FROM visit_ref WHERE nome='Briciola' AND email='marco.rossi@email.it' AND data_ora_visita='2024-01-10 00:00:00+00'::timestamptz),
   (SELECT id FROM prestazioni WHERE nome_prestazione='Controllo annuale')),
  ((SELECT id FROM visit_ref WHERE nome='Rex' AND email='f.bianchi@gmail.com' AND data_ora_visita='2024-01-12 00:00:00+00'::timestamptz),
   (SELECT id FROM prestazioni WHERE nome_prestazione='Visita urgente')),
  ((SELECT id FROM visit_ref WHERE nome='Fido' AND email='g.ricci@email.it' AND data_ora_visita='2024-01-15 00:00:00+00'::timestamptz),
   (SELECT id FROM prestazioni WHERE nome_prestazione='Controllo annuale')),
  ((SELECT id FROM visit_ref WHERE nome='Fido' AND email='g.ricci@email.it' AND data_ora_visita='2024-01-15 00:00:00+00'::timestamptz),
   (SELECT id FROM prestazioni WHERE nome_prestazione='Vaccinazione')),
  ((SELECT id FROM visit_ref WHERE nome='Luna' AND email='f.bianchi@gmail.com' AND data_ora_visita='2024-01-18 00:00:00+00'::timestamptz),
   (SELECT id FROM prestazioni WHERE nome_prestazione='Chirurgia')),
  ((SELECT id FROM visit_ref WHERE nome='Tigre' AND email='r.esposito@gmail.com' AND data_ora_visita='2024-01-22 00:00:00+00'::timestamptz),
   (SELECT id FROM prestazioni WHERE nome_prestazione='Visita urgente')),
  ((SELECT id FROM visit_ref WHERE nome='Birillo' AND email='p.manzoni@libero.it' AND data_ora_visita='2024-01-25 00:00:00+00'::timestamptz),
   (SELECT id FROM prestazioni WHERE nome_prestazione='Controllo peso')),
  ((SELECT id FROM visit_ref WHERE nome='Zeus' AND email='f.lombardi@email.it' AND data_ora_visita='2024-01-29 00:00:00+00'::timestamptz),
   (SELECT id FROM prestazioni WHERE nome_prestazione='Controllo annuale')),
  ((SELECT id FROM visit_ref WHERE nome='Micio' AND email='anna.ferrari@yahoo.it' AND data_ora_visita='2024-02-02 00:00:00+00'::timestamptz),
   (SELECT id FROM prestazioni WHERE nome_prestazione='Dermatologia')),
  ((SELECT id FROM visit_ref WHERE nome='Cioccolata' AND email='e.galli@email.it' AND data_ora_visita='2024-02-07 00:00:00+00'::timestamptz),
   (SELECT id FROM prestazioni WHERE nome_prestazione='Ecografia')),
  ((SELECT id FROM visit_ref WHERE nome='Cioccolata' AND email='e.galli@email.it' AND data_ora_visita='2024-02-07 00:00:00+00'::timestamptz),
   (SELECT id FROM prestazioni WHERE nome_prestazione='Malattia infettiva')),
  ((SELECT id FROM visit_ref WHERE nome='Artù' AND email='s.marchetti@gmail.com' AND data_ora_visita='2024-02-12 00:00:00+00'::timestamptz),
   (SELECT id FROM prestazioni WHERE nome_prestazione='Visita urgente')),
  ((SELECT id FROM visit_ref WHERE nome='Artù' AND email='s.marchetti@gmail.com' AND data_ora_visita='2024-02-12 00:00:00+00'::timestamptz),
   (SELECT id FROM prestazioni WHERE nome_prestazione='Visita neurologica')),
  ((SELECT id FROM visit_ref WHERE nome='Pallina' AND email='l.colombo@libero.it' AND data_ora_visita='2024-02-15 00:00:00+00'::timestamptz),
   (SELECT id FROM prestazioni WHERE nome_prestazione='Visita ortopedica')),
  ((SELECT id FROM visit_ref WHERE nome='Pallina' AND email='l.colombo@libero.it' AND data_ora_visita='2024-02-15 00:00:00+00'::timestamptz),
   (SELECT id FROM prestazioni WHERE nome_prestazione='Visita neurologica')),
  ((SELECT id FROM visit_ref WHERE nome='Neve' AND email='maria.conti@gmail.com' AND data_ora_visita='2024-02-19 00:00:00+00'::timestamptz),
   (SELECT id FROM prestazioni WHERE nome_prestazione='Controllo semestrale')),
  ((SELECT id FROM visit_ref WHERE nome='Oscar' AND email='c.ferretti@email.it' AND data_ora_visita='2024-02-22 00:00:00+00'::timestamptz),
   (SELECT id FROM prestazioni WHERE nome_prestazione='Controllo post-op')),
  ((SELECT id FROM visit_ref WHERE nome='Stella' AND email='v.caruso@gmail.com' AND data_ora_visita='2024-02-26 00:00:00+00'::timestamptz),
   (SELECT id FROM prestazioni WHERE nome_prestazione='Otorinolaringoiatria')),
  ((SELECT id FROM visit_ref WHERE nome='Stella' AND email='v.caruso@gmail.com' AND data_ora_visita='2024-02-26 00:00:00+00'::timestamptz),
   (SELECT id FROM prestazioni WHERE nome_prestazione='Malattia infettiva')),
  ((SELECT id FROM visit_ref WHERE nome='Briciola' AND email='marco.rossi@email.it' AND data_ora_visita='2024-03-01 00:00:00+00'::timestamptz),
   (SELECT id FROM prestazioni WHERE nome_prestazione='Controllo annuale')),
  ((SELECT id FROM visit_ref WHERE nome='Charlie' AND email='e.galli@email.it' AND data_ora_visita='2024-03-05 00:00:00+00'::timestamptz),
   (SELECT id FROM prestazioni WHERE nome_prestazione='Visita ortopedica')),
  ((SELECT id FROM visit_ref WHERE nome='Mochi' AND email='marco.rossi@email.it' AND data_ora_visita='2024-03-08 00:00:00+00'::timestamptz),
   (SELECT id FROM prestazioni WHERE nome_prestazione='Controllo annuale')),
  ((SELECT id FROM visit_ref WHERE nome='Lilly' AND email='g.ricci@email.it' AND data_ora_visita='2024-03-12 00:00:00+00'::timestamptz),
   (SELECT id FROM prestazioni WHERE nome_prestazione='Controllo semestrale')),
  ((SELECT id FROM visit_ref WHERE nome='Lilly' AND email='g.ricci@email.it' AND data_ora_visita='2024-03-12 00:00:00+00'::timestamptz),
   (SELECT id FROM prestazioni WHERE nome_prestazione='Vaccinazione')),
  ((SELECT id FROM visit_ref WHERE nome='Fido' AND email='g.ricci@email.it' AND data_ora_visita='2024-03-15 00:00:00+00'::timestamptz),
   (SELECT id FROM prestazioni WHERE nome_prestazione='Chirurgia')),
  ((SELECT id FROM visit_ref WHERE nome='Mia' AND email='g.barbieri@yahoo.it' AND data_ora_visita='2024-03-19 00:00:00+00'::timestamptz),
   (SELECT id FROM prestazioni WHERE nome_prestazione='Controllo annuale')),
  ((SELECT id FROM visit_ref WHERE nome='Mia' AND email='g.barbieri@yahoo.it' AND data_ora_visita='2024-03-19 00:00:00+00'::timestamptz),
   (SELECT id FROM prestazioni WHERE nome_prestazione='Vaccinazione')),
  ((SELECT id FROM visit_ref WHERE nome='Rex' AND email='f.bianchi@gmail.com' AND data_ora_visita='2024-03-22 00:00:00+00'::timestamptz),
   (SELECT id FROM prestazioni WHERE nome_prestazione='Controllo post-op')),
  ((SELECT id FROM visit_ref WHERE nome='Fiocco' AND email='a.moretti@libero.it' AND data_ora_visita='2024-03-26 00:00:00+00'::timestamptz),
   (SELECT id FROM prestazioni WHERE nome_prestazione='Prima visita')),
  ((SELECT id FROM visit_ref WHERE nome='Puffo' AND email='a.moretti@libero.it' AND data_ora_visita='2024-04-02 00:00:00+00'::timestamptz),
   (SELECT id FROM prestazioni WHERE nome_prestazione='Prima visita')),
  ((SELECT id FROM visit_ref WHERE nome='Luna' AND email='f.bianchi@gmail.com' AND data_ora_visita='2024-04-09 00:00:00+00'::timestamptz),
   (SELECT id FROM prestazioni WHERE nome_prestazione='Controllo post-op')),
  ((SELECT id FROM visit_ref WHERE nome='Zeus' AND email='f.lombardi@email.it' AND data_ora_visita='2024-04-16 00:00:00+00'::timestamptz),
   (SELECT id FROM prestazioni WHERE nome_prestazione='Controllo annuale'))
ON CONFLICT (visita_id, prestazione_id) DO NOTHING;

-- ------------------------------------------------------------
-- 7. DIARIO CLINICO
-- ------------------------------------------------------------
WITH visit_ref AS (
  SELECT v.id, a.nome, p.email, v.data_ora_visita
  FROM visite v
  JOIN animali a ON v.animale_id = a.id
  JOIN proprietari p ON a.proprietario_id = p.id
)
INSERT INTO diario_clinico (sintomi, diagnosi, trattamento_terapia, note, note_private, visita_id)
VALUES
  ('Controllo routine', NULL, 'Vaccinazione polivalente', NULL, NULL,
   (SELECT id FROM visit_ref WHERE nome='Briciola' AND email='marco.rossi@email.it' AND data_ora_visita='2024-01-10 00:00:00+00'::timestamptz)),
  ('Zoppia arto posteriore dx', NULL, 'Rx arto, anti-infiammatori', 'Rx allegato alla cartella', NULL,
   (SELECT id FROM visit_ref WHERE nome='Rex' AND email='f.bianchi@gmail.com' AND data_ora_visita='2024-01-12 00:00:00+00'::timestamptz)),
  ('Controllo peso e dentizione', NULL, 'Pulizia denti professionale', NULL, NULL,
   (SELECT id FROM visit_ref WHERE nome='Fido' AND email='g.ricci@email.it' AND data_ora_visita='2024-01-15 00:00:00+00'::timestamptz)),
  (NULL, 'Sterilizzazione programmata', 'Ovariectomia', 'Decorso regolare', NULL,
   (SELECT id FROM visit_ref WHERE nome='Luna' AND email='f.bianchi@gmail.com' AND data_ora_visita='2024-01-18 00:00:00+00'::timestamptz)),
  ('Vomito persistente', NULL, 'Fluidoterapia, antiemetico', NULL, NULL,
   (SELECT id FROM visit_ref WHERE nome='Tigre' AND email='r.esposito@gmail.com' AND data_ora_visita='2024-01-22 00:00:00+00'::timestamptz)),
  ('Sovrappeso', NULL, 'Piano dietetico', 'Peso: 13,1 kg', NULL,
   (SELECT id FROM visit_ref WHERE nome='Birillo' AND email='p.manzoni@libero.it' AND data_ora_visita='2024-01-25 00:00:00+00'::timestamptz)),
  ('Richiamo annuale', NULL, 'Polivalente + antirabbico', NULL, NULL,
   (SELECT id FROM visit_ref WHERE nome='Zeus' AND email='f.lombardi@email.it' AND data_ora_visita='2024-01-29 00:00:00+00'::timestamptz)),
  ('Alopecia localizzata', NULL, 'Esame micologico, antifungino', NULL, NULL,
   (SELECT id FROM visit_ref WHERE nome='Micio' AND email='anna.ferrari@yahoo.it' AND data_ora_visita='2024-02-02 00:00:00+00'::timestamptz)),
  (NULL, 'Controllo gravidanza', 'Ecografia addominale', '4 cuccioli attesi', NULL,
   (SELECT id FROM visit_ref WHERE nome='Cioccolata' AND email='e.galli@email.it' AND data_ora_visita='2024-02-07 00:00:00+00'::timestamptz)),
  ('Ingestione corpo estraneo', NULL, 'Rx addome, emesi indotta', NULL, NULL,
   (SELECT id FROM visit_ref WHERE nome='Artù' AND email='s.marchetti@gmail.com' AND data_ora_visita='2024-02-12 00:00:00+00'::timestamptz)),
  ('Difficoltà deambulazione', NULL, 'Rx colonna, cortisone', 'Riposo 2 settimane', NULL,
   (SELECT id FROM visit_ref WHERE nome='Pallina' AND email='l.colombo@libero.it' AND data_ora_visita='2024-02-15 00:00:00+00'::timestamptz)),
  ('Prima vaccinazione', NULL, 'Trivalente felina', NULL, NULL,
   (SELECT id FROM visit_ref WHERE nome='Neve' AND email='maria.conti@gmail.com' AND data_ora_visita='2024-02-19 00:00:00+00'::timestamptz)),
  (NULL, 'Follow-up sterilizzazione', 'Rimozione punti', NULL, NULL,
   (SELECT id FROM visit_ref WHERE nome='Oscar' AND email='c.ferretti@email.it' AND data_ora_visita='2024-02-22 00:00:00+00'::timestamptz)),
  (NULL, 'Monitoraggio FIV', 'Esami ematochimici', 'Condizioni stabili', NULL,
   (SELECT id FROM visit_ref WHERE nome='Stella' AND email='v.caruso@gmail.com' AND data_ora_visita='2024-02-26 00:00:00+00'::timestamptz)),
  ('Visita di routine', NULL, NULL, NULL, NULL,
   (SELECT id FROM visit_ref WHERE nome='Briciola' AND email='marco.rossi@email.it' AND data_ora_visita='2024-03-01 00:00:00+00'::timestamptz)),
  ('Otite esterna ricorrente', NULL, 'Pulizia auricolare, antibiotico', 'Terza recidiva in 1 anno', NULL,
   (SELECT id FROM visit_ref WHERE nome='Charlie' AND email='e.galli@email.it' AND data_ora_visita='2024-03-05 00:00:00+00'::timestamptz)),
  ('Richiamo annuale', NULL, 'Trivalente felina', NULL, NULL,
   (SELECT id FROM visit_ref WHERE nome='Mochi' AND email='marco.rossi@email.it' AND data_ora_visita='2024-03-08 00:00:00+00'::timestamptz)),
  ('Unghie + visita generale', NULL, 'Taglio unghie', NULL, NULL,
   (SELECT id FROM visit_ref WHERE nome='Lilly' AND email='g.ricci@email.it' AND data_ora_visita='2024-03-12 00:00:00+00'::timestamptz)),
  (NULL, 'Ernia inguinale', 'Intervento chirurgico', 'Decorso ottimale', NULL,
   (SELECT id FROM visit_ref WHERE nome='Fido' AND email='g.ricci@email.it' AND data_ora_visita='2024-03-15 00:00:00+00'::timestamptz)),
  ('Visita + antiparassitario', NULL, 'Vaccino + spot-on antiparassitario', NULL, NULL,
   (SELECT id FROM visit_ref WHERE nome='Mia' AND email='g.barbieri@yahoo.it' AND data_ora_visita='2024-03-19 00:00:00+00'::timestamptz)),
  (NULL, 'Follow-up zoppia', 'Fisioterapia consigliata', 'Miglioramento evidente', NULL,
   (SELECT id FROM visit_ref WHERE nome='Rex' AND email='f.bianchi@gmail.com' AND data_ora_visita='2024-03-22 00:00:00+00'::timestamptz)),
  ('Nuovo paziente', NULL, 'Visita completa, peso, parassiti', NULL, NULL,
   (SELECT id FROM visit_ref WHERE nome='Fiocco' AND email='a.moretti@libero.it' AND data_ora_visita='2024-03-26 00:00:00+00'::timestamptz)),
  ('Nuovo paziente', NULL, 'Visita completa coniglio', NULL, NULL,
   (SELECT id FROM visit_ref WHERE nome='Puffo' AND email='a.moretti@libero.it' AND data_ora_visita='2024-04-02 00:00:00+00'::timestamptz)),
  (NULL, 'Follow-up ovariectomia', 'Controllo cicatrice', 'Guarigione completa', NULL,
   (SELECT id FROM visit_ref WHERE nome='Luna' AND email='f.bianchi@gmail.com' AND data_ora_visita='2024-04-09 00:00:00+00'::timestamptz)),
  ('Visita di routine', NULL, NULL, 'Tutto nella norma', NULL,
   (SELECT id FROM visit_ref WHERE nome='Zeus' AND email='f.lombardi@email.it' AND data_ora_visita='2024-04-16 00:00:00+00'::timestamptz))
ON CONFLICT (visita_id) DO NOTHING;

-- ------------------------------------------------------------
-- 8. FATTURE
-- ------------------------------------------------------------
WITH visit_ref AS (
  SELECT v.id, a.nome, p.email, v.data_ora_visita, p.id as proprietario_id,
         p.indirizzo, p.citta, COALESCE(p.codice_fiscale, '0000000000000000') as cf
  FROM visite v
  JOIN animali a ON v.animale_id = a.id
  JOIN proprietari p ON a.proprietario_id = p.id
)
INSERT INTO fatture (numero_fattura, data_emissione, tipo_fattura, codice_fiscale_cliente, indirizzo_cliente, citta_cliente, importo_totale, metodo_pagamento, note, dettaglio_servizi, pagata, proprietario_id, visita_id)
SELECT
  'FATT-2024-001',
  vr.data_ora_visita,
  'Semplificata',
  vr.cf,
  vr.indirizzo,
  vr.citta,
  45.00,
  NULL,
  NULL,
  'Controllo annuale',
  true,
  vr.proprietario_id,
  vr.id
FROM visit_ref vr
WHERE vr.nome='Briciola' AND vr.email='marco.rossi@email.it' AND vr.data_ora_visita='2024-01-10 00:00:00+00'::timestamptz
ON CONFLICT (numero_fattura) DO NOTHING;

INSERT INTO fatture (numero_fattura, data_emissione, tipo_fattura, codice_fiscale_cliente, indirizzo_cliente, citta_cliente, importo_totale, metodo_pagamento, note, dettaglio_servizi, pagata, proprietario_id, visita_id)
SELECT
  'FATT-2024-002',
  vr.data_ora_visita,
  'Semplificata',
  vr.cf,
  vr.indirizzo,
  vr.citta,
  85.00,
  NULL,
  NULL,
  'Visita ortopedica',
  true,
  vr.proprietario_id,
  vr.id
FROM visit_ref vr
WHERE vr.nome='Rex' AND vr.email='f.bianchi@gmail.com' AND vr.data_ora_visita='2024-01-12 00:00:00+00'::timestamptz
ON CONFLICT (numero_fattura) DO NOTHING;

INSERT INTO fatture (numero_fattura, data_emissione, tipo_fattura, codice_fiscale_cliente, indirizzo_cliente, citta_cliente, importo_totale, metodo_pagamento, note, dettaglio_servizi, pagata, proprietario_id, visita_id)
SELECT
  'FATT-2024-003',
  vr.data_ora_visita,
  'Semplificata',
  vr.cf,
  vr.indirizzo,
  vr.citta,
  60.00,
  NULL,
  NULL,
  'Controllo annuale',
  true,
  vr.proprietario_id,
  vr.id
FROM visit_ref vr
WHERE vr.nome='Fido' AND vr.email='g.ricci@email.it' AND vr.data_ora_visita='2024-01-15 00:00:00+00'::timestamptz
ON CONFLICT (numero_fattura) DO NOTHING;

INSERT INTO fatture (numero_fattura, data_emissione, tipo_fattura, codice_fiscale_cliente, indirizzo_cliente, citta_cliente, importo_totale, metodo_pagamento, note, dettaglio_servizi, pagata, proprietario_id, visita_id)
SELECT
  'FATT-2024-004',
  vr.data_ora_visita,
  'Semplificata',
  vr.cf,
  vr.indirizzo,
  vr.citta,
  220.00,
  NULL,
  NULL,
  'Chirurgia',
  true,
  vr.proprietario_id,
  vr.id
FROM visit_ref vr
WHERE vr.nome='Luna' AND vr.email='f.bianchi@gmail.com' AND vr.data_ora_visita='2024-01-18 00:00:00+00'::timestamptz
ON CONFLICT (numero_fattura) DO NOTHING;

INSERT INTO fatture (numero_fattura, data_emissione, tipo_fattura, codice_fiscale_cliente, indirizzo_cliente, citta_cliente, importo_totale, metodo_pagamento, note, dettaglio_servizi, pagata, proprietario_id, visita_id)
SELECT
  'FATT-2024-005',
  vr.data_ora_visita,
  'Semplificata',
  vr.cf,
  vr.indirizzo,
  vr.citta,
  70.00,
  NULL,
  NULL,
  'Visita urgente',
  true,
  vr.proprietario_id,
  vr.id
FROM visit_ref vr
WHERE vr.nome='Tigre' AND vr.email='r.esposito@gmail.com' AND vr.data_ora_visita='2024-01-22 00:00:00+00'::timestamptz
ON CONFLICT (numero_fattura) DO NOTHING;

INSERT INTO fatture (numero_fattura, data_emissione, tipo_fattura, codice_fiscale_cliente, indirizzo_cliente, citta_cliente, importo_totale, metodo_pagamento, note, dettaglio_servizi, pagata, proprietario_id, visita_id)
SELECT
  'FATT-2024-006',
  vr.data_ora_visita,
  'Semplificata',
  vr.cf,
  vr.indirizzo,
  vr.citta,
  35.00,
  NULL,
  NULL,
  'Controllo peso',
  true,
  vr.proprietario_id,
  vr.id
FROM visit_ref vr
WHERE vr.nome='Birillo' AND vr.email='p.manzoni@libero.it' AND vr.data_ora_visita='2024-01-25 00:00:00+00'::timestamptz
ON CONFLICT (numero_fattura) DO NOTHING;

INSERT INTO fatture (numero_fattura, data_emissione, tipo_fattura, codice_fiscale_cliente, indirizzo_cliente, citta_cliente, importo_totale, metodo_pagamento, note, dettaglio_servizi, pagata, proprietario_id, visita_id)
SELECT
  'FATT-2024-007',
  vr.data_ora_visita,
  'Semplificata',
  vr.cf,
  vr.indirizzo,
  vr.citta,
  50.00,
  NULL,
  NULL,
  'Vaccinazione',
  true,
  vr.proprietario_id,
  vr.id
FROM visit_ref vr
WHERE vr.nome='Zeus' AND vr.email='f.lombardi@email.it' AND vr.data_ora_visita='2024-01-29 00:00:00+00'::timestamptz
ON CONFLICT (numero_fattura) DO NOTHING;

INSERT INTO fatture (numero_fattura, data_emissione, tipo_fattura, codice_fiscale_cliente, indirizzo_cliente, citta_cliente, importo_totale, metodo_pagamento, note, dettaglio_servizi, pagata, proprietario_id, visita_id)
SELECT
  'FATT-2024-008',
  vr.data_ora_visita,
  'Semplificata',
  vr.cf,
  vr.indirizzo,
  vr.citta,
  75.00,
  NULL,
  NULL,
  'Dermatologia',
  true,
  vr.proprietario_id,
  vr.id
FROM visit_ref vr
WHERE vr.nome='Micio' AND vr.email='anna.ferrari@yahoo.it' AND vr.data_ora_visita='2024-02-02 00:00:00+00'::timestamptz
ON CONFLICT (numero_fattura) DO NOTHING;

INSERT INTO fatture (numero_fattura, data_emissione, tipo_fattura, codice_fiscale_cliente, indirizzo_cliente, citta_cliente, importo_totale, metodo_pagamento, note, dettaglio_servizi, pagata, proprietario_id, visita_id)
SELECT
  'FATT-2024-009',
  vr.data_ora_visita,
  'Semplificata',
  vr.cf,
  vr.indirizzo,
  vr.citta,
  90.00,
  NULL,
  NULL,
  'Ecografia',
  true,
  vr.proprietario_id,
  vr.id
FROM visit_ref vr
WHERE vr.nome='Cioccolata' AND vr.email='e.galli@email.it' AND vr.data_ora_visita='2024-02-07 00:00:00+00'::timestamptz
ON CONFLICT (numero_fattura) DO NOTHING;

INSERT INTO fatture (numero_fattura, data_emissione, tipo_fattura, codice_fiscale_cliente, indirizzo_cliente, citta_cliente, importo_totale, metodo_pagamento, note, dettaglio_servizi, pagata, proprietario_id, visita_id)
SELECT
  'FATT-2024-010',
  vr.data_ora_visita,
  'Semplificata',
  vr.cf,
  vr.indirizzo,
  vr.citta,
  95.00,
  NULL,
  NULL,
  'Visita urgente',
  true,
  vr.proprietario_id,
  vr.id
FROM visit_ref vr
WHERE vr.nome='Artù' AND vr.email='s.marchetti@gmail.com' AND vr.data_ora_visita='2024-02-12 00:00:00+00'::timestamptz
ON CONFLICT (numero_fattura) DO NOTHING;

INSERT INTO fatture (numero_fattura, data_emissione, tipo_fattura, codice_fiscale_cliente, indirizzo_cliente, citta_cliente, importo_totale, metodo_pagamento, note, dettaglio_servizi, pagata, proprietario_id, visita_id)
SELECT
  'FATT-2024-011',
  vr.data_ora_visita,
  'Semplificata',
  vr.cf,
  vr.indirizzo,
  vr.citta,
  110.00,
  NULL,
  NULL,
  'Visita neurologica',
  true,
  vr.proprietario_id,
  vr.id
FROM visit_ref vr
WHERE vr.nome='Pallina' AND vr.email='l.colombo@libero.it' AND vr.data_ora_visita='2024-02-15 00:00:00+00'::timestamptz
ON CONFLICT (numero_fattura) DO NOTHING;

INSERT INTO fatture (numero_fattura, data_emissione, tipo_fattura, codice_fiscale_cliente, indirizzo_cliente, citta_cliente, importo_totale, metodo_pagamento, note, dettaglio_servizi, pagata, proprietario_id, visita_id)
SELECT
  'FATT-2024-012',
  vr.data_ora_visita,
  'Semplificata',
  vr.cf,
  vr.indirizzo,
  vr.citta,
  40.00,
  NULL,
  NULL,
  'Vaccinazione',
  true,
  vr.proprietario_id,
  vr.id
FROM visit_ref vr
WHERE vr.nome='Neve' AND vr.email='maria.conti@gmail.com' AND vr.data_ora_visita='2024-02-19 00:00:00+00'::timestamptz
ON CONFLICT (numero_fattura) DO NOTHING;

INSERT INTO fatture (numero_fattura, data_emissione, tipo_fattura, codice_fiscale_cliente, indirizzo_cliente, citta_cliente, importo_totale, metodo_pagamento, note, dettaglio_servizi, pagata, proprietario_id, visita_id)
SELECT
  'FATT-2024-013',
  vr.data_ora_visita,
  'Semplificata',
  vr.cf,
  vr.indirizzo,
  vr.citta,
  30.00,
  NULL,
  NULL,
  'Controllo post-op',
  true,
  vr.proprietario_id,
  vr.id
FROM visit_ref vr
WHERE vr.nome='Oscar' AND vr.email='c.ferretti@email.it' AND vr.data_ora_visita='2024-02-22 00:00:00+00'::timestamptz
ON CONFLICT (numero_fattura) DO NOTHING;

INSERT INTO fatture (numero_fattura, data_emissione, tipo_fattura, codice_fiscale_cliente, indirizzo_cliente, citta_cliente, importo_totale, metodo_pagamento, note, dettaglio_servizi, pagata, proprietario_id, visita_id)
SELECT
  'FATT-2024-014',
  vr.data_ora_visita,
  'Semplificata',
  vr.cf,
  vr.indirizzo,
  vr.citta,
  65.00,
  NULL,
  NULL,
  'Malattia infettiva',
  true,
  vr.proprietario_id,
  vr.id
FROM visit_ref vr
WHERE vr.nome='Stella' AND vr.email='v.caruso@gmail.com' AND vr.data_ora_visita='2024-02-26 00:00:00+00'::timestamptz
ON CONFLICT (numero_fattura) DO NOTHING;

INSERT INTO fatture (numero_fattura, data_emissione, tipo_fattura, codice_fiscale_cliente, indirizzo_cliente, citta_cliente, importo_totale, metodo_pagamento, note, dettaglio_servizi, pagata, proprietario_id, visita_id)
SELECT
  'FATT-2024-015',
  vr.data_ora_visita,
  'Semplificata',
  vr.cf,
  vr.indirizzo,
  vr.citta,
  35.00,
  NULL,
  NULL,
  'Controllo semestrale',
  true,
  vr.proprietario_id,
  vr.id
FROM visit_ref vr
WHERE vr.nome='Briciola' AND vr.email='marco.rossi@email.it' AND vr.data_ora_visita='2024-03-01 00:00:00+00'::timestamptz
ON CONFLICT (numero_fattura) DO NOTHING;

INSERT INTO fatture (numero_fattura, data_emissione, tipo_fattura, codice_fiscale_cliente, indirizzo_cliente, citta_cliente, importo_totale, metodo_pagamento, note, dettaglio_servizi, pagata, proprietario_id, visita_id)
SELECT
  'FATT-2024-016',
  vr.data_ora_visita,
  'Semplificata',
  vr.cf,
  vr.indirizzo,
  vr.citta,
  55.00,
  NULL,
  NULL,
  'Otorinolaringoiatria',
  true,
  vr.proprietario_id,
  vr.id
FROM visit_ref vr
WHERE vr.nome='Charlie' AND vr.email='e.galli@email.it' AND vr.data_ora_visita='2024-03-05 00:00:00+00'::timestamptz
ON CONFLICT (numero_fattura) DO NOTHING;

INSERT INTO fatture (numero_fattura, data_emissione, tipo_fattura, codice_fiscale_cliente, indirizzo_cliente, citta_cliente, importo_totale, metodo_pagamento, note, dettaglio_servizi, pagata, proprietario_id, visita_id)
SELECT
  'FATT-2024-017',
  vr.data_ora_visita,
  'Semplificata',
  vr.cf,
  vr.indirizzo,
  vr.citta,
  40.00,
  NULL,
  NULL,
  'Vaccinazione',
  true,
  vr.proprietario_id,
  vr.id
FROM visit_ref vr
WHERE vr.nome='Mochi' AND vr.email='marco.rossi@email.it' AND vr.data_ora_visita='2024-03-08 00:00:00+00'::timestamptz
ON CONFLICT (numero_fattura) DO NOTHING;

INSERT INTO fatture (numero_fattura, data_emissione, tipo_fattura, codice_fiscale_cliente, indirizzo_cliente, citta_cliente, importo_totale, metodo_pagamento, note, dettaglio_servizi, pagata, proprietario_id, visita_id)
SELECT
  'FATT-2024-018',
  vr.data_ora_visita,
  'Semplificata',
  vr.cf,
  vr.indirizzo,
  vr.citta,
  25.00,
  NULL,
  NULL,
  'Controllo annuale',
  true,
  vr.proprietario_id,
  vr.id
FROM visit_ref vr
WHERE vr.nome='Lilly' AND vr.email='g.ricci@email.it' AND vr.data_ora_visita='2024-03-12 00:00:00+00'::timestamptz
ON CONFLICT (numero_fattura) DO NOTHING;

INSERT INTO fatture (numero_fattura, data_emissione, tipo_fattura, codice_fiscale_cliente, indirizzo_cliente, citta_cliente, importo_totale, metodo_pagamento, note, dettaglio_servizi, pagata, proprietario_id, visita_id)
SELECT
  'FATT-2024-019',
  vr.data_ora_visita,
  'Semplificata',
  vr.cf,
  vr.indirizzo,
  vr.citta,
  280.00,
  NULL,
  NULL,
  'Chirurgia',
  true,
  vr.proprietario_id,
  vr.id
FROM visit_ref vr
WHERE vr.nome='Fido' AND vr.email='g.ricci@email.it' AND vr.data_ora_visita='2024-03-15 00:00:00+00'::timestamptz
ON CONFLICT (numero_fattura) DO NOTHING;

INSERT INTO fatture (numero_fattura, data_emissione, tipo_fattura, codice_fiscale_cliente, indirizzo_cliente, citta_cliente, importo_totale, metodo_pagamento, note, dettaglio_servizi, pagata, proprietario_id, visita_id)
SELECT
  'FATT-2024-020',
  vr.data_ora_visita,
  'Semplificata',
  vr.cf,
  vr.indirizzo,
  vr.citta,
  55.00,
  NULL,
  NULL,
  'Controllo annuale',
  true,
  vr.proprietario_id,
  vr.id
FROM visit_ref vr
WHERE vr.nome='Mia' AND vr.email='g.barbieri@yahoo.it' AND vr.data_ora_visita='2024-03-19 00:00:00+00'::timestamptz
ON CONFLICT (numero_fattura) DO NOTHING;

INSERT INTO fatture (numero_fattura, data_emissione, tipo_fattura, codice_fiscale_cliente, indirizzo_cliente, citta_cliente, importo_totale, metodo_pagamento, note, dettaglio_servizi, pagata, proprietario_id, visita_id)
SELECT
  'FATT-2024-021',
  vr.data_ora_visita,
  'Semplificata',
  vr.cf,
  vr.indirizzo,
  vr.citta,
  50.00,
  NULL,
  NULL,
  'Visita ortopedica',
  true,
  vr.proprietario_id,
  vr.id
FROM visit_ref vr
WHERE vr.nome='Rex' AND vr.email='f.bianchi@gmail.com' AND vr.data_ora_visita='2024-03-22 00:00:00+00'::timestamptz
ON CONFLICT (numero_fattura) DO NOTHING;

INSERT INTO fatture (numero_fattura, data_emissione, tipo_fattura, codice_fiscale_cliente, indirizzo_cliente, citta_cliente, importo_totale, metodo_pagamento, note, dettaglio_servizi, pagata, proprietario_id, visita_id)
SELECT
  'FATT-2024-022',
  vr.data_ora_visita,
  'Semplificata',
  vr.cf,
  vr.indirizzo,
  vr.citta,
  45.00,
  NULL,
  NULL,
  'Prima visita',
  true,
  vr.proprietario_id,
  vr.id
FROM visit_ref vr
WHERE vr.nome='Fiocco' AND vr.email='a.moretti@libero.it' AND vr.data_ora_visita='2024-03-26 00:00:00+00'::timestamptz
ON CONFLICT (numero_fattura) DO NOTHING;

INSERT INTO fatture (numero_fattura, data_emissione, tipo_fattura, codice_fiscale_cliente, indirizzo_cliente, citta_cliente, importo_totale, metodo_pagamento, note, dettaglio_servizi, pagata, proprietario_id, visita_id)
SELECT
  'FATT-2024-023',
  vr.data_ora_visita,
  'Semplificata',
  vr.cf,
  vr.indirizzo,
  vr.citta,
  40.00,
  NULL,
  NULL,
  'Prima visita',
  true,
  vr.proprietario_id,
  vr.id
FROM visit_ref vr
WHERE vr.nome='Puffo' AND vr.email='a.moretti@libero.it' AND vr.data_ora_visita='2024-04-02 00:00:00+00'::timestamptz
ON CONFLICT (numero_fattura) DO NOTHING;

INSERT INTO fatture (numero_fattura, data_emissione, tipo_fattura, codice_fiscale_cliente, indirizzo_cliente, citta_cliente, importo_totale, metodo_pagamento, note, dettaglio_servizi, pagata, proprietario_id, visita_id)
SELECT
  'FATT-2024-024',
  vr.data_ora_visita,
  'Semplificata',
  vr.cf,
  vr.indirizzo,
  vr.citta,
  30.00,
  NULL,
  NULL,
  'Controllo post-op',
  true,
  vr.proprietario_id,
  vr.id
FROM visit_ref vr
WHERE vr.nome='Luna' AND vr.email='f.bianchi@gmail.com' AND vr.data_ora_visita='2024-04-09 00:00:00+00'::timestamptz
ON CONFLICT (numero_fattura) DO NOTHING;

INSERT INTO fatture (numero_fattura, data_emissione, tipo_fattura, codice_fiscale_cliente, indirizzo_cliente, citta_cliente, importo_totale, metodo_pagamento, note, dettaglio_servizi, pagata, proprietario_id, visita_id)
SELECT
  'FATT-2024-025',
  vr.data_ora_visita,
  'Semplificata',
  vr.cf,
  vr.indirizzo,
  vr.citta,
  35.00,
  NULL,
  NULL,
  'Controllo semestrale',
  true,
  vr.proprietario_id,
  vr.id
FROM visit_ref vr
WHERE vr.nome='Zeus' AND vr.email='f.lombardi@email.it' AND vr.data_ora_visita='2024-04-16 00:00:00+00'::timestamptz
ON CONFLICT (numero_fattura) DO NOTHING;

COMMIT;