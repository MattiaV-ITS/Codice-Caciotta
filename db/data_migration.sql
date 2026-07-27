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
   (SELECT id FROM prop WHERE email='anna.ferrari@yahoo.it'), NULL, 'SANO'),
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
SELECT al.id, v.tipo_vaccino, v.data_somministrazione, v.data_scadenza, v.lotto, v.note
FROM (VALUES
  ('Briciola', 'marco.rossi@email.it', 'Polivalente cane (DHPPI)', '2024-01-10'::date, '2025-01-10'::date, 'LOT-2024-0011', NULL),
  ('Briciola', 'marco.rossi@email.it', 'Antirabbico', '2024-01-10'::date, '2027-01-10'::date, 'LOT-2024-0012', 'Validità 3 anni'),
  ('Rex', 'f.bianchi@gmail.com', 'Polivalente cane (DHPPI)', '2023-03-15'::date, '2024-03-15'::date, 'LOT-2023-0045', 'Richiamo non ancora effettuato'),
  ('Rex', 'f.bianchi@gmail.com', 'Antirabbico', '2023-03-15'::date, '2026-03-15'::date, 'LOT-2023-0046', NULL),
  ('Luna', 'f.bianchi@gmail.com', 'Trivalente felina (HCP)', '2024-01-18'::date, '2025-01-18'::date, 'LOT-2024-0031', NULL),
  ('Luna', 'f.bianchi@gmail.com', 'Leucemia felina (FeLV)', '2024-01-18'::date, '2025-01-18'::date, 'LOT-2024-0032', NULL),
  ('Micio', 'anna.ferrari@yahoo.it', 'Trivalente felina (HCP)', '2023-04-22'::date, '2024-04-22'::date, 'LOT-2023-0078', 'Proprietaria contattata via WhatsApp'),
  ('Fido', 'g.ricci@email.it', 'Polivalente cane (DHPPI)', '2024-01-15'::date, '2025-01-15'::date, 'LOT-2024-0019', NULL),
  ('Fido', 'g.ricci@email.it', 'Antirabbico', '2024-01-15'::date, '2027-01-15'::date, 'LOT-2024-0020', NULL),
  ('Fido', 'g.ricci@email.it', 'Leishmaniosi', '2024-01-15'::date, '2025-01-15'::date, 'LOT-2024-0021', 'Zona a rischio'),
  ('Neve', 'maria.conti@gmail.com', 'Trivalente felina (HCP)', '2024-02-19'::date, '2025-02-19'::date, 'LOT-2024-0041', 'Prima vaccinazione'),
  ('Birillo', 'p.manzoni@libero.it', 'Polivalente cane (DHPPI)', '2023-05-20'::date, '2024-05-20'::date, 'LOT-2023-0099', NULL),
  ('Cioccolata', 'e.galli@email.it', 'Polivalente cane (DHPPI)', '2023-06-07'::date, '2024-06-07'::date, 'LOT-2023-0102', NULL),
  ('Cioccolata', 'e.galli@email.it', 'Antirabbico', '2023-06-07'::date, '2026-06-07'::date, 'LOT-2023-0103', NULL),
  ('Tigre', 'r.esposito@gmail.com', 'Trivalente felina (HCP)', '2023-03-14'::date, '2024-03-14'::date, 'LOT-2023-0061', NULL),
  ('Oscar', 'c.ferretti@email.it', 'Polivalente cane (DHPPI)', '2023-08-10'::date, '2024-08-10'::date, 'LOT-2023-0121', NULL),
  ('Puffo', 'a.moretti@libero.it', 'Trivalente felina (HCP)', '2024-02-26'::date, '2025-02-26'::date, 'LOT-2024-0051', NULL),
  ('Stella', 'v.caruso@gmail.com', 'Polivalente cane (DHPPI)', '2024-01-29'::date, '2025-01-29'::date, 'LOT-2024-0022', NULL),
  ('Stella', 'v.caruso@gmail.com', 'Antirabbico', '2024-01-29'::date, '2027-01-29'::date, 'LOT-2024-0023', NULL),
  ('Zeus', 'f.lombardi@email.it', 'Trivalente felina (HCP)', '2024-03-19'::date, '2025-03-19'::date, 'LOT-2024-0062', NULL),
  ('Mia', 'g.barbieri@yahoo.it', 'Polivalente cane (DHPPI)', '2023-11-10'::date, '2024-11-10'::date, 'LOT-2023-0155', NULL),
  ('Mia', 'g.barbieri@yahoo.it', 'Antirabbico', '2023-11-10'::date, '2026-11-10'::date, 'LOT-2023-0156', NULL),
  ('Artù', 's.marchetti@gmail.com', 'Trivalente felina (HCP)', '2024-03-08'::date, '2025-03-08'::date, 'LOT-2024-0058', NULL),
  ('Mochi', 'marco.rossi@email.it', 'Polivalente cane (DHPPI)', '2023-04-25'::date, '2024-04-25'::date, 'LOT-2023-0088', NULL),
  ('Lilly', 'g.ricci@email.it', 'Polivalente cane (DHPPI)', '2023-07-12'::date, '2024-07-12'::date, 'LOT-2023-0112', NULL)
) AS v(nome, email, tipo_vaccino, data_somministrazione, data_scadenza, lotto, note)
JOIN animal_lookup al ON al.nome = v.nome AND al.email = v.email
WHERE NOT EXISTS (
  SELECT 1 FROM vaccinazioni v2
  WHERE v2.animale_id = al.id
    AND v2.tipo_vaccino = v.tipo_vaccino
    AND v2.data_somministrazione = v.data_somministrazione
);

-- ------------------------------------------------------------
-- 4. PRESTAZIONI
-- ------------------------------------------------------------
INSERT INTO prestazioni (nome_prestazione, descrizione, durata_stimata, costo_base, aliquota_iva, stato, colore)
VALUES
  ('Controllo annuale', 'Visita di controllo annuale', 30, 45.00, 22, true, '#4299E1'),
  ('Visita ortopedica', 'Visita specialistica ortopedica', 30, 85.00, 22, true, '#9F7AEA'),
  ('Chirurgia', 'Intervento chirurgico', 120, 220.00, 22, true, '#ED8936'),
  ('Visita urgente', 'Visita per problemi urgenti', 30, 70.00, 22, true, '#F56565'),
  ('Controllo peso', 'Controllo del peso e dieta', 30, 35.00, 22, true, '#48BB78'),
  ('Vaccinazione', 'Somministrazione vaccini', 30, 35.00, 22, true, '#48BB78'),
  ('Dermatologia', 'Visita specialistica dermatologica', 30, 65.00, 22, true, '#ED64A6'),
  ('Ecografia', 'Esame ecografico', 30, 95.00, 22, true, '#63B3ED'),
  ('Visita neurologica', 'Visita specialistica neurologica', 30, 90.00, 22, true, '#2B6CB0'),
  ('Controllo post-op', 'Controllo post-operatorio', 30, 50.00, 22, true, '#38B2AC'),
  ('Malattia infettiva', 'Visita per malattie infettive', 30, 75.00, 22, true, '#EF4444'),
  ('Controllo semestrale', 'Visita di controllo semestrale', 30, 40.00, 22, true, '#3182CE'),
  ('Otorinolaringoiatria', 'Visita specialistica ORL', 30, 60.00, 22, true, '#805AD5'),
  ('Prima visita', 'Prima visita per nuovo paziente', 30, 40.00, 22, true, '#2C7A7B')
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
SELECT v.data_ora, v.data_ora_fine, al.id, NULL
FROM (VALUES
  ('2024-01-10 00:00:00+00'::timestamptz, '2024-01-10 00:30:00+00'::timestamptz, 'Briciola', 'marco.rossi@email.it'),
  ('2024-01-12 00:00:00+00'::timestamptz, '2024-01-12 01:00:00+00'::timestamptz, 'Rex', 'f.bianchi@gmail.com'),
  ('2024-01-15 00:00:00+00'::timestamptz, '2024-01-15 00:45:00+00'::timestamptz, 'Fido', 'g.ricci@email.it'),
  ('2024-01-18 00:00:00+00'::timestamptz, '2024-01-18 02:00:00+00'::timestamptz, 'Luna', 'f.bianchi@gmail.com'),
  ('2024-01-22 00:00:00+00'::timestamptz, '2024-01-22 01:00:00+00'::timestamptz, 'Tigre', 'r.esposito@gmail.com'),
  ('2024-01-25 00:00:00+00'::timestamptz, '2024-01-25 00:30:00+00'::timestamptz, 'Birillo', 'p.manzoni@libero.it'),
  ('2024-01-29 00:00:00+00'::timestamptz, '2024-01-29 00:45:00+00'::timestamptz, 'Zeus', 'f.lombardi@email.it'),
  ('2024-02-02 00:00:00+00'::timestamptz, '2024-02-02 01:00:00+00'::timestamptz, 'Micio', 'anna.ferrari@yahoo.it'),
  ('2024-02-07 00:00:00+00'::timestamptz, '2024-02-07 01:15:00+00'::timestamptz, 'Cioccolata', 'e.galli@email.it'),
  ('2024-02-12 00:00:00+00'::timestamptz, '2024-02-12 01:15:00+00'::timestamptz, 'Artù', 's.marchetti@gmail.com'),
  ('2024-02-15 00:00:00+00'::timestamptz, '2024-02-15 01:30:00+00'::timestamptz, 'Pallina', 'l.colombo@libero.it'),
  ('2024-02-19 00:00:00+00'::timestamptz, '2024-02-19 00:30:00+00'::timestamptz, 'Neve', 'maria.conti@gmail.com'),
  ('2024-02-22 00:00:00+00'::timestamptz, '2024-02-22 00:30:00+00'::timestamptz, 'Oscar', 'c.ferretti@email.it'),
  ('2024-02-26 00:00:00+00'::timestamptz, '2024-02-26 01:00:00+00'::timestamptz, 'Stella', 'v.caruso@gmail.com'),
  ('2024-03-01 00:00:00+00'::timestamptz, '2024-03-01 00:30:00+00'::timestamptz, 'Briciola', 'marco.rossi@email.it'),
  ('2024-03-05 00:00:00+00'::timestamptz, '2024-03-05 00:45:00+00'::timestamptz, 'Charlie', 'e.galli@email.it'),
  ('2024-03-08 00:00:00+00'::timestamptz, '2024-03-08 00:30:00+00'::timestamptz, 'Mochi', 'marco.rossi@email.it'),
  ('2024-03-12 00:00:00+00'::timestamptz, '2024-03-12 00:30:00+00'::timestamptz, 'Lilly', 'g.ricci@email.it'),
  ('2024-03-15 00:00:00+00'::timestamptz, '2024-03-15 03:00:00+00'::timestamptz, 'Fido', 'g.ricci@email.it'),
  ('2024-03-19 00:00:00+00'::timestamptz, '2024-03-19 00:45:00+00'::timestamptz, 'Mia', 'g.barbieri@yahoo.it'),
  ('2024-03-22 00:00:00+00'::timestamptz, '2024-03-22 00:45:00+00'::timestamptz, 'Rex', 'f.bianchi@gmail.com'),
  ('2024-03-26 00:00:00+00'::timestamptz, '2024-03-26 00:30:00+00'::timestamptz, 'Fiocco', 'a.moretti@libero.it'),
  ('2024-04-02 00:00:00+00'::timestamptz, '2024-04-02 00:30:00+00'::timestamptz, 'Puffo', 'a.moretti@libero.it'),
  ('2024-04-09 00:00:00+00'::timestamptz, '2024-04-09 00:30:00+00'::timestamptz, 'Luna', 'f.bianchi@gmail.com'),
  ('2024-04-16 00:00:00+00'::timestamptz, '2024-04-16 00:30:00+00'::timestamptz, 'Zeus', 'f.lombardi@email.it')
) AS v(data_ora, data_ora_fine, nome_animale, email_prop)
JOIN animal_ref al ON al.nome = v.nome_animale AND al.email = v.email_prop
WHERE NOT EXISTS (
  SELECT 1 FROM visite v2
  WHERE v2.animale_id = al.id
    AND v2.data_ora_visita = v.data_ora
);

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
SELECT vr.id, p.id
FROM (VALUES
  ('Briciola', 'marco.rossi@email.it', '2024-01-10 00:00:00+00'::timestamptz, 'Controllo annuale'),
  ('Rex', 'f.bianchi@gmail.com', '2024-01-12 00:00:00+00'::timestamptz, 'Visita urgente'),
  ('Fido', 'g.ricci@email.it', '2024-01-15 00:00:00+00'::timestamptz, 'Controllo annuale'),
  ('Fido', 'g.ricci@email.it', '2024-01-15 00:00:00+00'::timestamptz, 'Vaccinazione'),
  ('Luna', 'f.bianchi@gmail.com', '2024-01-18 00:00:00+00'::timestamptz, 'Chirurgia'),
  ('Tigre', 'r.esposito@gmail.com', '2024-01-22 00:00:00+00'::timestamptz, 'Visita urgente'),
  ('Birillo', 'p.manzoni@libero.it', '2024-01-25 00:00:00+00'::timestamptz, 'Controllo peso'),
  ('Zeus', 'f.lombardi@email.it', '2024-01-29 00:00:00+00'::timestamptz, 'Controllo annuale'),
  ('Micio', 'anna.ferrari@yahoo.it', '2024-02-02 00:00:00+00'::timestamptz, 'Dermatologia'),
  ('Cioccolata', 'e.galli@email.it', '2024-02-07 00:00:00+00'::timestamptz, 'Ecografia'),
  ('Cioccolata', 'e.galli@email.it', '2024-02-07 00:00:00+00'::timestamptz, 'Malattia infettiva'),
  ('Artù', 's.marchetti@gmail.com', '2024-02-12 00:00:00+00'::timestamptz, 'Visita urgente'),
  ('Artù', 's.marchetti@gmail.com', '2024-02-12 00:00:00+00'::timestamptz, 'Visita neurologica'),
  ('Pallina', 'l.colombo@libero.it', '2024-02-15 00:00:00+00'::timestamptz, 'Visita ortopedica'),
  ('Pallina', 'l.colombo@libero.it', '2024-02-15 00:00:00+00'::timestamptz, 'Visita neurologica'),
  ('Neve', 'maria.conti@gmail.com', '2024-02-19 00:00:00+00'::timestamptz, 'Controllo semestrale'),
  ('Oscar', 'c.ferretti@email.it', '2024-02-22 00:00:00+00'::timestamptz, 'Controllo post-op'),
  ('Stella', 'v.caruso@gmail.com', '2024-02-26 00:00:00+00'::timestamptz, 'Otorinolaringoiatria'),
  ('Stella', 'v.caruso@gmail.com', '2024-02-26 00:00:00+00'::timestamptz, 'Malattia infettiva'),
  ('Briciola', 'marco.rossi@email.it', '2024-03-01 00:00:00+00'::timestamptz, 'Controllo annuale'),
  ('Charlie', 'e.galli@email.it', '2024-03-05 00:00:00+00'::timestamptz, 'Visita ortopedica'),
  ('Mochi', 'marco.rossi@email.it', '2024-03-08 00:00:00+00'::timestamptz, 'Controllo annuale'),
  ('Lilly', 'g.ricci@email.it', '2024-03-12 00:00:00+00'::timestamptz, 'Controllo semestrale'),
  ('Lilly', 'g.ricci@email.it', '2024-03-12 00:00:00+00'::timestamptz, 'Vaccinazione'),
  ('Fido', 'g.ricci@email.it', '2024-03-15 00:00:00+00'::timestamptz, 'Chirurgia'),
  ('Mia', 'g.barbieri@yahoo.it', '2024-03-19 00:00:00+00'::timestamptz, 'Controllo annuale'),
  ('Mia', 'g.barbieri@yahoo.it', '2024-03-19 00:00:00+00'::timestamptz, 'Vaccinazione'),
  ('Rex', 'f.bianchi@gmail.com', '2024-03-22 00:00:00+00'::timestamptz, 'Controllo post-op'),
  ('Fiocco', 'a.moretti@libero.it', '2024-03-26 00:00:00+00'::timestamptz, 'Prima visita'),
  ('Puffo', 'a.moretti@libero.it', '2024-04-02 00:00:00+00'::timestamptz, 'Prima visita'),
  ('Luna', 'f.bianchi@gmail.com', '2024-04-09 00:00:00+00'::timestamptz, 'Controllo post-op'),
  ('Zeus', 'f.lombardi@email.it', '2024-04-16 00:00:00+00'::timestamptz, 'Controllo annuale')
) AS v(nome_animale, email_prop, data_ora_visita, nome_prestazione)
JOIN visit_ref vr ON vr.nome = v.nome_animale AND vr.email = v.email_prop AND vr.data_ora_visita = v.data_ora_visita
JOIN prestazioni p ON p.nome_prestazione = v.nome_prestazione
WHERE NOT EXISTS (
  SELECT 1 FROM visita_prestazioni vp
  WHERE vp.visita_id = vr.id AND vp.prestazione_id = p.id
);

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
SELECT d.sintomi, d.diagnosi, d.trattamento_terapia, d.note, d.note_private, vr.id
FROM (VALUES
  ('Controllo routine', NULL, 'Vaccinazione polivalente', NULL, NULL, 'Briciola', 'marco.rossi@email.it', '2024-01-10 00:00:00+00'::timestamptz),
  ('Zoppia arto posteriore dx', NULL, 'Rx arto, anti-infiammatori', 'Rx allegato alla cartella', NULL, 'Rex', 'f.bianchi@gmail.com', '2024-01-12 00:00:00+00'::timestamptz),
  ('Controllo peso e dentizione', NULL, 'Pulizia denti professionale', NULL, NULL, 'Fido', 'g.ricci@email.it', '2024-01-15 00:00:00+00'::timestamptz),
  (NULL, 'Sterilizzazione programmata', 'Ovariectomia', 'Decorso regolare', NULL, 'Luna', 'f.bianchi@gmail.com', '2024-01-18 00:00:00+00'::timestamptz),
  ('Vomito persistente', NULL, 'Fluidoterapia, antiemetico', NULL, NULL, 'Tigre', 'r.esposito@gmail.com', '2024-01-22 00:00:00+00'::timestamptz),
  ('Sovrappeso', NULL, 'Piano dietetico', 'Peso: 13,1 kg', NULL, 'Birillo', 'p.manzoni@libero.it', '2024-01-25 00:00:00+00'::timestamptz),
  ('Richiamo annuale', NULL, 'Polivalente + antirabbico', NULL, NULL, 'Zeus', 'f.lombardi@email.it', '2024-01-29 00:00:00+00'::timestamptz),
  ('Alopecia localizzata', NULL, 'Esame micologico, antifungino', NULL, NULL, 'Micio', 'anna.ferrari@yahoo.it', '2024-02-02 00:00:00+00'::timestamptz),
  (NULL, 'Controllo gravidanza', 'Ecografia addominale', '4 cuccioli attesi', NULL, 'Cioccolata', 'e.galli@email.it', '2024-02-07 00:00:00+00'::timestamptz),
  ('Ingestione corpo estraneo', NULL, 'Rx addome, emesi indotta', NULL, NULL, 'Artù', 's.marchetti@gmail.com', '2024-02-12 00:00:00+00'::timestamptz),
  ('Difficoltà deambulazione', NULL, 'Rx colonna, cortisone', 'Riposo 2 settimane', NULL, 'Pallina', 'l.colombo@libero.it', '2024-02-15 00:00:00+00'::timestamptz),
  ('Prima vaccinazione', NULL, 'Trivalente felina', NULL, NULL, 'Neve', 'maria.conti@gmail.com', '2024-02-19 00:00:00+00'::timestamptz),
  (NULL, 'Follow-up sterilizzazione', 'Rimozione punti', NULL, NULL, 'Oscar', 'c.ferretti@email.it', '2024-02-22 00:00:00+00'::timestamptz),
  (NULL, 'Monitoraggio FIV', 'Esami ematochimici', 'Condizioni stabili', NULL, 'Stella', 'v.caruso@gmail.com', '2024-02-26 00:00:00+00'::timestamptz),
  ('Visita di routine', NULL, NULL, NULL, NULL, 'Briciola', 'marco.rossi@email.it', '2024-03-01 00:00:00+00'::timestamptz),
  ('Otite esterna ricorrente', NULL, 'Pulizia auricolare, antibiotico', 'Terza recidiva in 1 anno', NULL, 'Charlie', 'e.galli@email.it', '2024-03-05 00:00:00+00'::timestamptz),
  ('Richiamo annuale', NULL, 'Trivalente felina', NULL, NULL, 'Mochi', 'marco.rossi@email.it', '2024-03-08 00:00:00+00'::timestamptz),
  ('Unghie + visita generale', NULL, 'Taglio unghie', NULL, NULL, 'Lilly', 'g.ricci@email.it', '2024-03-12 00:00:00+00'::timestamptz),
  (NULL, 'Ernia inguinale', 'Intervento chirurgico', 'Decorso ottimale', NULL, 'Fido', 'g.ricci@email.it', '2024-03-15 00:00:00+00'::timestamptz),
  ('Visita + antiparassitario', NULL, 'Vaccino + spot-on antiparassitario', NULL, NULL, 'Mia', 'g.barbieri@yahoo.it', '2024-03-19 00:00:00+00'::timestamptz),
  (NULL, 'Follow-up zoppia', 'Fisioterapia consigliata', 'Miglioramento evidente', NULL, 'Rex', 'f.bianchi@gmail.com', '2024-03-22 00:00:00+00'::timestamptz),
  ('Nuovo paziente', NULL, 'Visita completa, peso, parassiti', NULL, NULL, 'Fiocco', 'a.moretti@libero.it', '2024-03-26 00:00:00+00'::timestamptz),
  ('Nuovo paziente', NULL, 'Visita completa coniglio', NULL, NULL, 'Puffo', 'a.moretti@libero.it', '2024-04-02 00:00:00+00'::timestamptz),
  (NULL, 'Follow-up ovariectomia', 'Controllo cicatrice', 'Guarigione completa', NULL, 'Luna', 'f.bianchi@gmail.com', '2024-04-09 00:00:00+00'::timestamptz),
  ('Visita di routine', NULL, NULL, 'Tutto nella norma', NULL, 'Zeus', 'f.lombardi@email.it', '2024-04-16 00:00:00+00'::timestamptz)
) AS d(sintomi, diagnosi, trattamento_terapia, note, note_private, nome_animale, email_prop, data_ora_visita)
JOIN visit_ref vr ON vr.nome = d.nome_animale AND vr.email = d.email_prop AND vr.data_ora_visita = d.data_ora_visita
WHERE NOT EXISTS (
  SELECT 1 FROM diario_clinico dc WHERE dc.visita_id = vr.id
);

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