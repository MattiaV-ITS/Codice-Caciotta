-- ============================================================
-- 1. PROPRIETARI — inserimento diretto
-- ============================================================

INSERT INTO proprietari (nome, cognome, email, telefono, indirizzo, citta, data_registrazione, stato)
VALUES
('Marco','Rossi','marco.rossi@email.it','335 1234567','Via Roma 12','Bergamo', to_date('15/03/2019','DD/MM/YYYY'), true),
('Francesca','Bianchi','f.bianchi@gmail.com','347 2345678','Via Garibaldi 5','Bergamo Alta', to_date('22/07/2019','DD/MM/YYYY'), false), --TODO: cambiare a true
('Luigi','Colombo','l.colombo@libero.it','328 3456789','Via Manzoni 33','Sorisole', to_date('10/11/2019','DD/MM/YYYY'), true),
('Anna','Ferrari','anna.ferrari@yahoo.it','339 4567890','Piazza Vecchia 1','Bergamo Alta', to_date('05/02/2020','DD/MM/YYYY'), true),
('Giorgio','Ricci','g.ricci@email.it','366 5678901','Via Tasso 8','Bergamo', to_date('18/04/2020','DD/MM/YYYY'), true),
('Maria','Conti','maria.conti@gmail.com','351 6789012','Via Pignolo 44','Bergamo', to_date('30/06/2020','DD/MM/YYYY'), true),
('Paolo','Manzoni','p.manzoni@libero.it','342 7890123','Via Borgo Palazzo 17','Bergamo', to_date('12/09/2020','DD/MM/YYYY'), true),
('Elena','Galli','e.galli@email.it','333 8901234','Via S. Tomaso 9','Bergamo Alta', to_date('25/01/2021','DD/MM/YYYY'), true),
('Roberto','Esposito','r.esposito@gmail.com','370 9012345','Via Zambonate 22','Bergamo', to_date('08/03/2021','DD/MM/YYYY'), true),
('Chiara','Ferretti','c.ferretti@email.it','348 0123456','Viale Papa Giovanni 15','Bergamo', to_date('19/05/2021','DD/MM/YYYY'), true),
('Antonio','Moretti','a.moretti@libero.it','335 1234568','Via Tiraboschi 6','Bergamo', to_date('02/08/2021','DD/MM/YYYY'), true),
('Valentina','Caruso','v.caruso@gmail.com','347 2345679','Via Quarenghi 11','Bergamo', to_date('14/10/2021','DD/MM/YYYY'), true),
('Francesco','Lombardi','f.lombardi@email.it','328 3456780','Via Moroni 28','Bergamo', to_date('27/12/2021','DD/MM/YYYY'), true),
('Giulia','Barbieri','g.barbieri@yahoo.it','339 4567891','Via Camozzi 3','Bergamo', to_date('09/02/2022','DD/MM/YYYY'), true),
('Stefano','Marchetti','s.marchetti@gmail.com','366 5678902','Via Angelo Mai 19','Bergamo Alta', to_date('21/04/2022','DD/MM/YYYY'), true)
ON CONFLICT (email) DO NOTHING;

-- ============================================================
-- 2. ANIMALI — mapping tramite nome+cognome
-- ============================================================

INSERT INTO animali (nome, specie, razza, data_di_nascita, sesso, peso, microchip, proprietario_id, note_generali, stato)
VALUES
('Briciola','Cane','Labrador', to_date('12/05/2017','DD/MM/YYYY'),'F',28.5,'380260040123456',
    (SELECT id FROM proprietari WHERE nome='Marco' AND cognome='Rossi'),
    NULL, 'SANO'),

('Rex','Cane','Pastore Tedesco', to_date('03/09/2018','DD/MM/YYYY'),'M',34,'380260040234567',
    (SELECT id FROM proprietari WHERE nome='Francesca' AND cognome='Bianchi'),
    'Allergia al pollame', 'MALATO'),

('Luna','Gatto','Europeo Comune', to_date('17/02/2020','DD/MM/YYYY'),'F',4.2,'380260040345678',
    (SELECT id FROM proprietari WHERE nome='Francesca' AND cognome='Bianchi'),
    NULL, 'SANO'),

('Pallina','Cane','Bassotto', to_date('28/11/2016','DD/MM/YYYY'),'F',9.1,'380260040456789',
    (SELECT id FROM proprietari WHERE nome='Luigi' AND cognome='Colombo'),
    'Problemi alla schiena', 'IN_CURA'),

('Micio','Gatto','Persiano', to_date('06/04/2019','DD/MM/YYYY'),'M',5.8,'380260040567890',
    (SELECT id FROM proprietari WHERE nome='Anna' AND cognome='Ferrari'),
    NULL, 'DECEDUTO'),

('Fido','Cane','Golden Retriever', to_date('14/08/2018','DD/MM/YYYY'),'M',31.2,'380260040678901',
    (SELECT id FROM proprietari WHERE nome='Giorgio' AND cognome='Ricci'),
    NULL, 'SANO'),

('Neve','Gatto','Siamese', to_date('22/01/2021','DD/MM/YYYY'),'F',3.9,'380260040789012',
    (SELECT id FROM proprietari WHERE nome='Maria' AND cognome='Conti'),
    NULL, 'SANO'),

('Birillo','Cane','Beagle', to_date('09/06/2017','DD/MM/YYYY'),'M',12.4,'380260040890123',
    (SELECT id FROM proprietari WHERE nome='Paolo' AND cognome='Manzoni'),
    'Tendenza all''obesità', 'SANO'),

('Cioccolata','Cane','Labrador', to_date('30/03/2019','DD/MM/YYYY'),'F',26,'380260040901234',
    (SELECT id FROM proprietari WHERE nome='Elena' AND cognome='Galli'),
    NULL, 'SANO'),

('Tigre','Gatto','Maine Coon', to_date('11/10/2018','DD/MM/YYYY'),'M',7.3,'380260041012345',
    (SELECT id FROM proprietari WHERE nome='Roberto' AND cognome='Esposito'),
    NULL, 'SANO'),

('Oscar','Cane','Boxer', to_date('05/07/2020','DD/MM/YYYY'),'M',29.5,'380260041123456',
    (SELECT id FROM proprietari WHERE nome='Chiara' AND cognome='Ferretti'),
    NULL, 'SANO'),

('Puffo','Coniglio','Nano Olandese', to_date('18/12/2021','DD/MM/YYYY'),'M',1.4,NULL,
    (SELECT id FROM proprietari WHERE nome='Antonio' AND cognome='Moretti'),
    NULL, 'SANO'),

('Stella','Gatto','Europeo Comune', to_date('24/05/2019','DD/MM/YYYY'),'F',3.6,'380260041234567',
    (SELECT id FROM proprietari WHERE nome='Valentina' AND cognome='Caruso'),
    'FIV positivo', 'SANO'),

('Zeus','Cane','Rottweiler', to_date('02/02/2017','DD/MM/YYYY'),'M',44,'380260041345678',
    (SELECT id FROM proprietari WHERE nome='Francesco' AND cognome='Lombardi'),
    NULL, 'SANO'),

('Mia','Gatto','Ragdoll', to_date('16/09/2020','DD/MM/YYYY'),'F',5.1,'380260041456789',
    (SELECT id FROM proprietari WHERE nome='Giulia' AND cognome='Barbieri'),
    NULL, 'SANO'),

('Artù','Cane','Border Collie', to_date('07/11/2018','DD/MM/YYYY'),'M',18.7,'380260041567890',
    (SELECT id FROM proprietari WHERE nome='Stefano' AND cognome='Marchetti'),
    NULL, 'SANO'),

('Mochi','Gatto','Birmano', to_date('29/06/2021','DD/MM/YYYY'),'M',4.4,'380260041678901',
    (SELECT id FROM proprietari WHERE nome='Marco' AND cognome='Rossi'),
    NULL, 'SANO'),

('Lilly','Cane','Barboncino', to_date('13/03/2020','DD/MM/YYYY'),'F',5.2,'380260041789012',
    (SELECT id FROM proprietari WHERE nome='Giorgio' AND cognome='Ricci'),
    NULL, 'SANO'),

('Charlie','Cane','Cocker Spaniel', to_date('25/08/2019','DD/MM/YYYY'),'M',11.8,'380260041890123',
    (SELECT id FROM proprietari WHERE nome='Elena' AND cognome='Galli'),
    'Otite cronica', 'SANO'),

('Fiocco','Coniglio','Ariete', to_date('04/01/2022','DD/MM/YYYY'),'F',2.1,NULL,
    (SELECT id FROM proprietari WHERE nome='Antonio' AND cognome='Moretti'),
    NULL, 'SANO')
ON CONFLICT (microchip) DO NOTHING;

-- ============================================================
-- 3. VACCINAZIONI — lookup dinamico animale_id
-- ============================================================

INSERT INTO vaccinazioni (animale_id, tipo_vaccino, data_somministrazione, data_scadenza, lotto, note)
VALUES
(
    (SELECT a.id FROM animali a
     JOIN proprietari p ON a.proprietario_id = p.id
     WHERE a.nome='Briciola' AND p.nome='Marco' AND p.cognome='Rossi'),
    'Polivalente cane (DHPPI)', to_date('10/01/2024','DD/MM/YYYY'),
    to_date('10/01/2025','DD/MM/YYYY'), 'LOT-2024-0011', NULL
),
(
    (SELECT a.id FROM animali a
     JOIN proprietari p ON a.proprietario_id = p.id
     WHERE a.nome='Briciola' AND p.nome='Marco' AND p.cognome='Rossi'),
    'Antirabbico', to_date('10/01/2024','DD/MM/YYYY'),
    to_date('10/01/2027','DD/MM/YYYY'), 'LOT-2024-0012', 'Validità 3 anni'
),

(
    (SELECT a.id FROM animali a
     JOIN proprietari p ON a.proprietario_id = p.id
     WHERE a.nome='Rex' AND p.nome='Francesca' AND p.cognome='Bianchi'),
    'Polivalente cane (DHPPI)', to_date('15/03/2023','DD/MM/YYYY'),
    to_date('15/03/2024','DD/MM/YYYY'), 'LOT-2023-0045', 'Richiamo non ancora effettuato'
),
(
    (SELECT a.id FROM animali a
     JOIN proprietari p ON a.proprietario_id = p.id
     WHERE a.nome='Rex' AND p.nome='Francesca' AND p.cognome='Bianchi'),
    'Antirabbico', to_date('15/03/2023','DD/MM/YYYY'),
    to_date('15/03/2026','DD/MM/YYYY'), 'LOT-2023-0046', NULL
),

(
    (SELECT a.id FROM animali a
     JOIN proprietari p ON a.proprietario_id = p.id
     WHERE a.nome='Luna' AND p.nome='Francesca' AND p.cognome='Bianchi'),
    'Trivalente felina (HCP)', to_date('18/01/2024','DD/MM/YYYY'),
    to_date('18/01/2025','DD/MM/YYYY'), 'LOT-2024-0031', NULL
),
(
    (SELECT a.id FROM animali a
     JOIN proprietari p ON a.proprietario_id = p.id
     WHERE a.nome='Luna' AND p.nome='Francesca' AND p.cognome='Bianchi'),
    'Leucemia felina (FeLV)', to_date('18/01/2024','DD/MM/YYYY'),
    to_date('18/01/2025','DD/MM/YYYY'), 'LOT-2024-0032', NULL
),

(
    (SELECT a.id FROM animali a
     JOIN proprietari p ON a.proprietario_id = p.id
     WHERE a.nome='Micio' AND p.nome='Anna' AND p.cognome='Ferrari'),
    'Trivalente felina (HCP)', to_date('22/04/2023','DD/MM/YYYY'),
    to_date('22/04/2024','DD/MM/YYYY'), 'LOT-2023-0078', 'Proprietaria contattata via WhatsApp'
),

(
    (SELECT a.id FROM animali a
     JOIN proprietari p ON a.proprietario_id = p.id
     WHERE a.nome='Fido' AND p.nome='Giorgio' AND p.cognome='Ricci'),
    'Polivalente cane (DHPPI)', to_date('15/01/2024','DD/MM/YYYY'),
    to_date('15/01/2025','DD/MM/YYYY'), 'LOT-2024-0019', NULL
),
(
    (SELECT a.id FROM animali a
     JOIN proprietari p ON a.proprietario_id = p.id
     WHERE a.nome='Fido' AND p.nome='Giorgio' AND p.cognome='Ricci'),
    'Antirabbico', to_date('15/01/2024','DD/MM/YYYY'),
    to_date('15/01/2027','DD/MM/YYYY'), 'LOT-2024-0020', NULL
),
(
    (SELECT a.id FROM animali a
     JOIN proprietari p ON a.proprietario_id = p.id
     WHERE a.nome='Fido' AND p.nome='Giorgio' AND p.cognome='Ricci'),
    'Leishmaniosi', to_date('15/01/2024','DD/MM/YYYY'),
    to_date('15/01/2025','DD/MM/YYYY'), 'LOT-2024-0021', 'Zona a rischio'
),

(
    (SELECT a.id FROM animali a
     JOIN proprietari p ON a.proprietario_id = p.id
     WHERE a.nome='Neve' AND p.nome='Maria' AND p.cognome='Conti'),
    'Trivalente felina (HCP)', to_date('19/02/2024','DD/MM/YYYY'),
    to_date('19/02/2025','DD/MM/YYYY'), 'LOT-2024-0041', 'Prima vaccinazione'
),

(
    (SELECT a.id FROM animali a
     JOIN proprietari p ON a.proprietario_id = p.id
     WHERE a.nome='Birillo' AND p.nome='Paolo' AND p.cognome='Manzoni'),
    'Polivalente cane (DHPPI)', to_date('20/05/2023','DD/MM/YYYY'),
    to_date('20/05/2024','DD/MM/YYYY'), 'LOT-2023-0099', NULL
),

(
    (SELECT a.id FROM animali a
     JOIN proprietari p ON a.proprietario_id = p.id
     WHERE a.nome='Cioccolata' AND p.nome='Elena' AND p.cognome='Galli'),
    'Polivalente cane (DHPPI)', to_date('07/06/2023','DD/MM/YYYY'),
    to_date('07/06/2024','DD/MM/YYYY'), 'LOT-2023-0102', NULL
),
(
    (SELECT a.id FROM animali a
     JOIN proprietari p ON a.proprietario_id = p.id
     WHERE a.nome='Cioccolata' AND p.nome='Elena' AND p.cognome='Galli'),
    'Antirabbico', to_date('07/06/2023','DD/MM/YYYY'),
    to_date('07/06/2026','DD/MM/YYYY'), 'LOT-2023-0103', NULL
),

(
    (SELECT a.id FROM animali a
     JOIN proprietari p ON a.proprietario_id = p.id
     WHERE a.nome='Tigre' AND p.nome='Roberto' AND p.cognome='Esposito'),
    'Trivalente felina (HCP)', to_date('14/03/2023','DD/MM/YYYY'),
    to_date('14/03/2024','DD/MM/YYYY'), 'LOT-2023-0061', NULL
),

(
    (SELECT a.id FROM animali a
     JOIN proprietari p ON a.proprietario_id = p.id
     WHERE a.nome='Oscar' AND p.nome='Chiara' AND p.cognome='Ferretti'),
    'Polivalente cane (DHPPI)', to_date('10/08/2023','DD/MM/YYYY'),
    to_date('10/08/2024','DD/MM/YYYY'), 'LOT-2023-0121', NULL
),

(
    (SELECT a.id FROM animali a
     JOIN proprietari p ON a.proprietario_id = p.id
     WHERE a.nome='Puffo' AND p.nome='Antonio' AND p.cognome='Moretti'),
    'Trivalente felina (HCP)', to_date('26/02/2024','DD/MM/YYYY'),
    to_date('26/02/2025','DD/MM/YYYY'), 'LOT-2024-0051', NULL
),

(
    (SELECT a.id FROM animali a
     JOIN proprietari p ON a.proprietario_id = p.id
     WHERE a.nome='Stella' AND p.nome='Valentina' AND p.cognome='Caruso'),
    'Polivalente cane (DHPPI)', to_date('29/01/2024','DD/MM/YYYY'),
    to_date('29/01/2025','DD/MM/YYYY'), 'LOT-2024-0022', NULL
),
(
    (SELECT a.id FROM animali a
     JOIN proprietari p ON a.proprietario_id = p.id
     WHERE a.nome='Stella' AND p.nome='Valentina' AND p.cognome='Caruso'),
    'Antirabbico', to_date('29/01/2024','DD/MM/YYYY'),
    to_date('29/01/2027','DD/MM/YYYY'), 'LOT-2024-0023', NULL
),

(
    (SELECT a.id FROM animali a
     JOIN proprietari p ON a.proprietario_id = p.id
     WHERE a.nome='Zeus' AND p.nome='Francesco' AND p.cognome='Lombardi'),
    'Trivalente felina (HCP)', to_date('19/03/2024','DD/MM/YYYY'),
    to_date('19/03/2025','DD/MM/YYYY'), 'LOT-2024-0062', NULL
),

(
    (SELECT a.id FROM animali a
     JOIN proprietari p ON a.proprietario_id = p.id
     WHERE a.nome='Mia' AND p.nome='Giulia' AND p.cognome='Barbieri'),
    'Polivalente cane (DHPPI)', to_date('10/11/2023','DD/MM/YYYY'),
    to_date('10/11/2024','DD/MM/YYYY'), 'LOT-2023-0155', NULL
),
(
    (SELECT a.id FROM animali a
     JOIN proprietari p ON a.proprietario_id = p.id
     WHERE a.nome='Mia' AND p.nome='Giulia' AND p.cognome='Barbieri'),
    'Antirabbico', to_date('10/11/2023','DD/MM/YYYY'),
    to_date('10/11/2026','DD/MM/YYYY'), 'LOT-2023-0156', NULL
),

(
    (SELECT a.id FROM animali a
     JOIN proprietari p ON a.proprietario_id = p.id
     WHERE a.nome='Artù' AND p.nome='Stefano' AND p.cognome='Marchetti'),
    'Trivalente felina (HCP)', to_date('08/03/2024','DD/MM/YYYY'),
    to_date('08/03/2025','DD/MM/YYYY'), 'LOT-2024-0058', NULL
),

(
    (SELECT a.id FROM animali a
     JOIN proprietari p ON a.proprietario_id = p.id
     WHERE a.nome='Mochi' AND p.nome='Marco' AND p.cognome='Rossi'),
    'Polivalente cane (DHPPI)', to_date('25/04/2023','DD/MM/YYYY'),
    to_date('25/04/2024','DD/MM/YYYY'), 'LOT-2023-0088', NULL
),

(
    (SELECT a.id FROM animali a
     JOIN proprietari p ON a.proprietario_id = p.id
     WHERE a.nome='Lilly' AND p.nome='Giorgio' AND p.cognome='Ricci'),
    'Polivalente cane (DHPPI)', to_date('12/07/2023','DD/MM/YYYY'),
    to_date('12/07/2024','DD/MM/YYYY'), 'LOT-2023-0112', NULL
);

-- ============================================================
-- PRESTAZIONI — creazione prestazioni basate sui tipi visita
-- ============================================================

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
('Prima visita', 'Prima visita per nuovo paziente', 30, 40.00, 22, 'Disponibile', '#2C7A7B');

-- ============================================================
-- VISITE — lookup dinamico proprietario_id e animale_id con prestazioni
-- ============================================================

INSERT INTO visite (data_ora_visita, data_ora_fine_visita, animale_id, prenotazione_id) VALUES
('2024-01-10T00:00:00', '2024-01-10T00:30:00',
 (SELECT a.id FROM animali a JOIN proprietari p ON a.proprietario_id=p.id
  WHERE a.nome='Briciola' AND p.nome='Marco' AND p.cognome='Rossi' LIMIT 1), NULL),

('2024-01-12T00:00:00', '2024-01-12T01:00:00',
 (SELECT a.id FROM animali a JOIN proprietari p ON a.proprietario_id=p.id
  WHERE a.nome='Rex' AND p.nome='Francesca' AND p.cognome='Bianchi' LIMIT 1), NULL),

('2024-01-15T00:00:00', '2024-01-15T00:45:00',
 (SELECT a.id FROM animali a JOIN proprietari p ON a.proprietario_id=p.id
  WHERE a.nome='Fido' AND p.nome='Giorgio' AND p.cognome='Ricci' LIMIT 1), NULL),

('2024-01-18T00:00:00', '2024-01-18T02:00:00',
 (SELECT a.id FROM animali a JOIN proprietari p ON a.proprietario_id=p.id
  WHERE a.nome='Luna' AND p.nome='Francesca' AND p.cognome='Bianchi' LIMIT 1), NULL),

('2024-01-22T00:00:00', '2024-01-22T01:00:00',
 (SELECT a.id FROM animali a JOIN proprietari p ON a.proprietario_id=p.id
  WHERE a.nome='Tigre' AND p.nome='Roberto' AND p.cognome='Esposito' LIMIT 1), NULL),

('2024-01-25T00:00:00', '2024-01-25T00:30:00',
 (SELECT a.id FROM animali a JOIN proprietari p ON a.proprietario_id=p.id
  WHERE a.nome='Birillo' AND p.nome='Paolo' AND p.cognome='Manzoni' LIMIT 1), NULL),

('2024-01-29T00:00:00', '2024-01-29T00:45:00',
 (SELECT a.id FROM animali a JOIN proprietari p ON a.proprietario_id=p.id
  WHERE a.nome='Zeus' AND p.nome='Francesco' AND p.cognome='Lombardi' LIMIT 1), NULL),

('2024-02-02T00:00:00', '2024-02-02T01:00:00',
 (SELECT a.id FROM animali a JOIN proprietari p ON a.proprietario_id=p.id
  WHERE a.nome='Micio' AND p.nome='Anna' AND p.cognome='Ferrari' LIMIT 1), NULL),

('2024-02-07T00:00:00', '2024-02-07T01:15:00',
 (SELECT a.id FROM animali a JOIN proprietari p ON a.proprietario_id=p.id
  WHERE a.nome='Cioccolata' AND p.nome='Elena' AND p.cognome='Galli' LIMIT 1), NULL),

('2024-02-12T00:00:00', '2024-02-12T01:15:00',
 (SELECT a.id FROM animali a JOIN proprietari p ON a.proprietario_id=p.id
  WHERE a.nome='Artù' AND p.nome='Stefano' AND p.cognome='Marchetti' LIMIT 1), NULL),

('2024-02-15T00:00:00', '2024-02-15T01:30:00',
 (SELECT a.id FROM animali a JOIN proprietari p ON a.proprietario_id=p.id
  WHERE a.nome='Pallina' AND p.nome='Luigi' AND p.cognome='Colombo' LIMIT 1), NULL),

('2024-02-19T00:00:00', '2024-02-19T00:30:00',
 (SELECT a.id FROM animali a JOIN proprietari p ON a.proprietario_id=p.id
  WHERE a.nome='Neve' AND p.nome='Maria' AND p.cognome='Conti' LIMIT 1), NULL),

('2024-02-22T00:00:00', '2024-02-22T00:30:00',
 (SELECT a.id FROM animali a JOIN proprietari p ON a.proprietario_id=p.id
  WHERE a.nome='Oscar' AND p.nome='Chiara' AND p.cognome='Ferretti' LIMIT 1), NULL),

('2024-02-26T00:00:00', '2024-02-26T01:00:00',
 (SELECT a.id FROM animali a JOIN proprietari p ON a.proprietario_id=p.id
  WHERE a.nome='Stella' AND p.nome='Valentina' AND p.cognome='Caruso' LIMIT 1), NULL),

('2024-03-01T00:00:00', '2024-03-01T00:30:00',
 (SELECT a.id FROM animali a JOIN proprietari p ON a.proprietario_id=p.id
  WHERE a.nome='Briciola' AND p.nome='Marco' AND p.cognome='Rossi' LIMIT 1), NULL),

('2024-03-05T00:00:00', '2024-03-05T00:45:00',
 (SELECT a.id FROM animali a JOIN proprietari p ON a.proprietario_id=p.id
  WHERE a.nome='Charlie' AND p.nome='Elena' AND p.cognome='Galli' LIMIT 1), NULL),

('2024-03-08T00:00:00', '2024-03-08T00:30:00',
 (SELECT a.id FROM animali a JOIN proprietari p ON a.proprietario_id=p.id
  WHERE a.nome='Mochi' AND p.nome='Marco' AND p.cognome='Rossi' LIMIT 1), NULL),

('2024-03-12T00:00:00', '2024-03-12T00:30:00',
 (SELECT a.id FROM animali a JOIN proprietari p ON a.proprietario_id=p.id
  WHERE a.nome='Lilly' AND p.nome='Giorgio' AND p.cognome='Ricci' LIMIT 1), NULL),

('2024-03-15T00:00:00', '2024-03-15T03:00:00',
 (SELECT a.id FROM animali a JOIN proprietari p ON a.proprietario_id=p.id
  WHERE a.nome='Fido' AND p.nome='Giorgio' AND p.cognome='Ricci' LIMIT 1), NULL),

('2024-03-19T00:00:00', '2024-03-19T00:45:00',
 (SELECT a.id FROM animali a JOIN proprietari p ON a.proprietario_id=p.id
  WHERE a.nome='Mia' AND p.nome='Giulia' AND p.cognome='Barbieri' LIMIT 1), NULL),

('2024-03-22T00:00:00', '2024-03-22T00:45:00',
 (SELECT a.id FROM animali a JOIN proprietari p ON a.proprietario_id=p.id
  WHERE a.nome='Rex' AND p.nome='Francesca' AND p.cognome='Bianchi' LIMIT 1), NULL),

('2024-03-26T00:00:00', '2024-03-26T00:30:00',
 (SELECT a.id FROM animali a JOIN proprietari p ON a.proprietario_id=p.id
  WHERE a.nome='Fiocco' AND p.nome='Antonio' AND p.cognome='Moretti' LIMIT 1), NULL),

('2024-04-02T00:00:00', '2024-04-02T00:30:00',
 (SELECT a.id FROM animali a JOIN proprietari p ON a.proprietario_id=p.id
  WHERE a.nome='Puffo' AND p.nome='Antonio' AND p.cognome='Moretti' LIMIT 1), NULL),

('2024-04-09T00:00:00', '2024-04-09T00:30:00',
 (SELECT a.id FROM animali a JOIN proprietari p ON a.proprietario_id=p.id
  WHERE a.nome='Luna' AND p.nome='Francesca' AND p.cognome='Bianchi' LIMIT 1), NULL),

('2024-04-16T00:00:00', '2024-04-16T00:30:00',
 (SELECT a.id FROM animali a JOIN proprietari p ON a.proprietario_id=p.id
  WHERE a.nome='Zeus' AND p.nome='Francesco' AND p.cognome='Lombardi' LIMIT 1), NULL);

-- ============================================================
-- VISITA_PRESTAZIONI — associazione prestazioni alle visite
-- ============================================================

-- Visita Briciola 10/01/2024 - Controllo annuale
INSERT INTO visita_prestazioni (visita_id, prestazione_id)
VALUES (
    (SELECT v.id FROM visite v JOIN animali a ON v.animale_id=a.id JOIN proprietari p ON a.proprietario_id=p.id
     WHERE a.nome='Briciola' AND p.nome='Marco' AND p.cognome='Rossi' AND v.data_ora_visita='2024-01-10T00:00:00' LIMIT 1),
    (SELECT id FROM prestazioni WHERE nome_prestazione='Controllo annuale' LIMIT 1)
);

-- Visita Rex 12/01/2024 - Visita urgente
INSERT INTO visita_prestazioni (visita_id, prestazione_id)
VALUES (
    (SELECT v.id FROM visite v JOIN animali a ON v.animale_id=a.id JOIN proprietari p ON a.proprietario_id=p.id
     WHERE a.nome='Rex' AND p.nome='Francesca' AND p.cognome='Bianchi' AND v.data_ora_visita='2024-01-12T00:00:00' LIMIT 1),
    (SELECT id FROM prestazioni WHERE nome_prestazione='Visita urgente' LIMIT 1)
);

-- Visita Fido 15/01/2024 - Controllo annuale + Vaccinazione
INSERT INTO visita_prestazioni (visita_id, prestazione_id)
VALUES (
    (SELECT v.id FROM visite v JOIN animali a ON v.animale_id=a.id JOIN proprietari p ON a.proprietario_id=p.id
     WHERE a.nome='Fido' AND p.nome='Giorgio' AND p.cognome='Ricci' AND v.data_ora_visita='2024-01-15T00:00:00' LIMIT 1),
    (SELECT id FROM prestazioni WHERE nome_prestazione='Controllo annuale' LIMIT 1)
),
(
    (SELECT v.id FROM visite v JOIN animali a ON v.animale_id=a.id JOIN proprietari p ON a.proprietario_id=p.id
     WHERE a.nome='Fido' AND p.nome='Giorgio' AND p.cognome='Ricci' AND v.data_ora_visita='2024-01-15T00:00:00' LIMIT 1),
    (SELECT id FROM prestazioni WHERE nome_prestazione='Vaccinazione' LIMIT 1)
);

-- Visita Luna 18/01/2024 - Chirurgia
INSERT INTO visita_prestazioni (visita_id, prestazione_id)
VALUES (
    (SELECT v.id FROM visite v JOIN animali a ON v.animale_id=a.id JOIN proprietari p ON a.proprietario_id=p.id
     WHERE a.nome='Luna' AND p.nome='Francesca' AND p.cognome='Bianchi' AND v.data_ora_visita='2024-01-18T00:00:00' LIMIT 1),
    (SELECT id FROM prestazioni WHERE nome_prestazione='Chirurgia' LIMIT 1)
);

-- Visita Tigre 22/01/2024 - Visita urgente
INSERT INTO visita_prestazioni (visita_id, prestazione_id)
VALUES (
    (SELECT v.id FROM visite v JOIN animali a ON v.animale_id=a.id JOIN proprietari p ON a.proprietario_id=p.id
     WHERE a.nome='Tigre' AND p.nome='Roberto' AND p.cognome='Esposito' AND v.data_ora_visita='2024-01-22T00:00:00' LIMIT 1),
    (SELECT id FROM prestazioni WHERE nome_prestazione='Visita urgente' LIMIT 1)
);

-- Visita Birillo 25/01/2024 - Controllo peso
INSERT INTO visita_prestazioni (visita_id, prestazione_id)
VALUES (
    (SELECT v.id FROM visite v JOIN animali a ON v.animale_id=a.id JOIN proprietari p ON a.proprietario_id=p.id
     WHERE a.nome='Birillo' AND p.nome='Paolo' AND p.cognome='Manzoni' AND v.data_ora_visita='2024-01-25T00:00:00' LIMIT 1),
    (SELECT id FROM prestazioni WHERE nome_prestazione='Controllo peso' LIMIT 1)
);

-- Visita Zeus 29/01/2024 - Controllo annuale
INSERT INTO visita_prestazioni (visita_id, prestazione_id)
VALUES (
    (SELECT v.id FROM visite v JOIN animali a ON v.animale_id=a.id JOIN proprietari p ON a.proprietario_id=p.id
     WHERE a.nome='Zeus' AND p.nome='Francesco' AND p.cognome='Lombardi' AND v.data_ora_visita='2024-01-29T00:00:00' LIMIT 1),
    (SELECT id FROM prestazioni WHERE nome_prestazione='Controllo annuale' LIMIT 1)
);

-- Visita Micio 02/02/2024 - Dermatologia
INSERT INTO visita_prestazioni (visita_id, prestazione_id)
VALUES (
    (SELECT v.id FROM visite v JOIN animali a ON v.animale_id=a.id JOIN proprietari p ON a.proprietario_id=p.id
     WHERE a.nome='Micio' AND p.nome='Anna' AND p.cognome='Ferrari' AND v.data_ora_visita='2024-02-02T00:00:00' LIMIT 1),
    (SELECT id FROM prestazioni WHERE nome_prestazione='Dermatologia' LIMIT 1)
);

-- Visita Cioccolata 07/02/2024 - Ecografia + Malattia infettiva
INSERT INTO visita_prestazioni (visita_id, prestazione_id)
VALUES (
    (SELECT v.id FROM visite v JOIN animali a ON v.animale_id=a.id JOIN proprietari p ON a.proprietario_id=p.id
     WHERE a.nome='Cioccolata' AND p.nome='Elena' AND p.cognome='Galli' AND v.data_ora_visita='2024-02-07T00:00:00' LIMIT 1),
    (SELECT id FROM prestazioni WHERE nome_prestazione='Ecografia' LIMIT 1)
),
(
    (SELECT v.id FROM visite v JOIN animali a ON v.animale_id=a.id JOIN proprietari p ON a.proprietario_id=p.id
     WHERE a.nome='Cioccolata' AND p.nome='Elena' AND p.cognome='Galli' AND v.data_ora_visita='2024-02-07T00:00:00' LIMIT 1),
    (SELECT id FROM prestazioni WHERE nome_prestazione='Malattia infettiva' LIMIT 1)
);

-- Visita Artù 12/02/2024 - Visita urgente + Visita neurologica
INSERT INTO visita_prestazioni (visita_id, prestazione_id)
VALUES (
    (SELECT v.id FROM visite v JOIN animali a ON v.animale_id=a.id JOIN proprietari p ON a.proprietario_id=p.id
     WHERE a.nome='Artù' AND p.nome='Stefano' AND p.cognome='Marchetti' AND v.data_ora_visita='2024-02-12T00:00:00' LIMIT 1),
    (SELECT id FROM prestazioni WHERE nome_prestazione='Visita urgente' LIMIT 1)
),
(
    (SELECT v.id FROM visite v JOIN animali a ON v.animale_id=a.id JOIN proprietari p ON a.proprietario_id=p.id
     WHERE a.nome='Artù' AND p.nome='Stefano' AND p.cognome='Marchetti' AND v.data_ora_visita='2024-02-12T00:00:00' LIMIT 1),
    (SELECT id FROM prestazioni WHERE nome_prestazione='Visita neurologica' LIMIT 1)
);

-- Visita Pallina 15/02/2024 - Visita ortopedica + Visita neurologica
INSERT INTO visita_prestazioni (visita_id, prestazione_id)
VALUES (
    (SELECT v.id FROM visite v JOIN animali a ON v.animale_id=a.id JOIN proprietari p ON a.proprietario_id=p.id
     WHERE a.nome='Pallina' AND p.nome='Luigi' AND p.cognome='Colombo' AND v.data_ora_visita='2024-02-15T00:00:00' LIMIT 1),
    (SELECT id FROM prestazioni WHERE nome_prestazione='Visita ortopedica' LIMIT 1)
),
(
    (SELECT v.id FROM visite v JOIN animali a ON v.animale_id=a.id JOIN proprietari p ON a.proprietario_id=p.id
     WHERE a.nome='Pallina' AND p.nome='Luigi' AND p.cognome='Colombo' AND v.data_ora_visita='2024-02-15T00:00:00' LIMIT 1),
    (SELECT id FROM prestazioni WHERE nome_prestazione='Visita neurologica' LIMIT 1)
);

-- Visita Neve 19/02/2024 - Controllo semestrale
INSERT INTO visita_prestazioni (visita_id, prestazione_id)
VALUES (
    (SELECT v.id FROM visite v JOIN animali a ON v.animale_id=a.id JOIN proprietari p ON a.proprietario_id=p.id
     WHERE a.nome='Neve' AND p.nome='Maria' AND p.cognome='Conti' AND v.data_ora_visita='2024-02-19T00:00:00' LIMIT 1),
    (SELECT id FROM prestazioni WHERE nome_prestazione='Controllo semestrale' LIMIT 1)
);

-- Visita Oscar 22/02/2024 - Controllo post-op
INSERT INTO visita_prestazioni (visita_id, prestazione_id)
VALUES (
    (SELECT v.id FROM visite v JOIN animali a ON v.animale_id=a.id JOIN proprietari p ON a.proprietario_id=p.id
     WHERE a.nome='Oscar' AND p.nome='Chiara' AND p.cognome='Ferretti' AND v.data_ora_visita='2024-02-22T00:00:00' LIMIT 1),
    (SELECT id FROM prestazioni WHERE nome_prestazione='Controllo post-op' LIMIT 1)
);

-- Visita Stella 26/02/2024 - Otorinolaringoiatria + Malattia infettiva
INSERT INTO visita_prestazioni (visita_id, prestazione_id)
VALUES (
    (SELECT v.id FROM visite v JOIN animali a ON v.animale_id=a.id JOIN proprietari p ON a.proprietario_id=p.id
     WHERE a.nome='Stella' AND p.nome='Valentina' AND p.cognome='Caruso' AND v.data_ora_visita='2024-02-26T00:00:00' LIMIT 1),
    (SELECT id FROM prestazioni WHERE nome_prestazione='Otorinolaringoiatria' LIMIT 1)
),
(
    (SELECT v.id FROM visite v JOIN animali a ON v.animale_id=a.id JOIN proprietari p ON a.proprietario_id=p.id
     WHERE a.nome='Stella' AND p.nome='Valentina' AND p.cognome='Caruso' AND v.data_ora_visita='2024-02-26T00:00:00' LIMIT 1),
    (SELECT id FROM prestazioni WHERE nome_prestazione='Malattia infettiva' LIMIT 1)
);

-- Visita Briciola 01/03/2024 - Controllo annuale
INSERT INTO visita_prestazioni (visita_id, prestazione_id)
VALUES (
    (SELECT v.id FROM visite v JOIN animali a ON v.animale_id=a.id JOIN proprietari p ON a.proprietario_id=p.id
     WHERE a.nome='Briciola' AND p.nome='Marco' AND p.cognome='Rossi' AND v.data_ora_visita='2024-03-01T00:00:00' LIMIT 1),
    (SELECT id FROM prestazioni WHERE nome_prestazione='Controllo annuale' LIMIT 1)
);

-- Visita Charlie 05/03/2024 - Visita ortopedica
INSERT INTO visita_prestazioni (visita_id, prestazione_id)
VALUES (
    (SELECT v.id FROM visite v JOIN animali a ON v.animale_id=a.id JOIN proprietari p ON a.proprietario_id=p.id
     WHERE a.nome='Charlie' AND p.nome='Elena' AND p.cognome='Galli' AND v.data_ora_visita='2024-03-05T00:00:00' LIMIT 1),
    (SELECT id FROM prestazioni WHERE nome_prestazione='Visita ortopedica' LIMIT 1)
);

-- Visita Mochi 08/03/2024 - Controllo annuale
INSERT INTO visita_prestazioni (visita_id, prestazione_id)
VALUES (
    (SELECT v.id FROM visite v JOIN animali a ON v.animale_id=a.id JOIN proprietari p ON a.proprietario_id=p.id
     WHERE a.nome='Mochi' AND p.nome='Marco' AND p.cognome='Rossi' AND v.data_ora_visita='2024-03-08T00:00:00' LIMIT 1),
    (SELECT id FROM prestazioni WHERE nome_prestazione='Controllo annuale' LIMIT 1)
);

-- Visita Lilly 12/03/2024 - Controllo semestrale + Vaccinazione
INSERT INTO visita_prestazioni (visita_id, prestazione_id)
VALUES (
    (SELECT v.id FROM visite v JOIN animali a ON v.animale_id=a.id JOIN proprietari p ON a.proprietario_id=p.id
     WHERE a.nome='Lilly' AND p.nome='Giorgio' AND p.cognome='Ricci' AND v.data_ora_visita='2024-03-12T00:00:00' LIMIT 1),
    (SELECT id FROM prestazioni WHERE nome_prestazione='Controllo semestrale' LIMIT 1)
),
(
    (SELECT v.id FROM visite v JOIN animali a ON v.animale_id=a.id JOIN proprietari p ON a.proprietario_id=p.id
     WHERE a.nome='Lilly' AND p.nome='Giorgio' AND p.cognome='Ricci' AND v.data_ora_visita='2024-03-12T00:00:00' LIMIT 1),
    (SELECT id FROM prestazioni WHERE nome_prestazione='Vaccinazione' LIMIT 1)
);

-- Visita Fido 15/03/2024 - Chirurgia
INSERT INTO visita_prestazioni (visita_id, prestazione_id)
VALUES (
    (SELECT v.id FROM visite v JOIN animali a ON v.animale_id=a.id JOIN proprietari p ON a.proprietario_id=p.id
     WHERE a.nome='Fido' AND p.nome='Giorgio' AND p.cognome='Ricci' AND v.data_ora_visita='2024-03-15T00:00:00' LIMIT 1),
    (SELECT id FROM prestazioni WHERE nome_prestazione='Chirurgia' LIMIT 1)
);

-- Visita Mia 19/03/2024 - Controllo annuale + Vaccinazione
INSERT INTO visita_prestazioni (visita_id, prestazione_id)
VALUES (
    (SELECT v.id FROM visite v JOIN animali a ON v.animale_id=a.id JOIN proprietari p ON a.proprietario_id=p.id
     WHERE a.nome='Mia' AND p.nome='Giulia' AND p.cognome='Barbieri' AND v.data_ora_visita='2024-03-19T00:00:00' LIMIT 1),
    (SELECT id FROM prestazioni WHERE nome_prestazione='Controllo annuale' LIMIT 1)
),
(
    (SELECT v.id FROM visite v JOIN animali a ON v.animale_id=a.id JOIN proprietari p ON a.proprietario_id=p.id
     WHERE a.nome='Mia' AND p.nome='Giulia' AND p.cognome='Barbieri' AND v.data_ora_visita='2024-03-19T00:00:00' LIMIT 1),
    (SELECT id FROM prestazioni WHERE nome_prestazione='Vaccinazione' LIMIT 1)
);

-- Visita Rex 22/03/2024 - Controllo post-op
INSERT INTO visita_prestazioni (visita_id, prestazione_id)
VALUES (
    (SELECT v.id FROM visite v JOIN animali a ON v.animale_id=a.id JOIN proprietari p ON a.proprietario_id=p.id
     WHERE a.nome='Rex' AND p.nome='Francesca' AND p.cognome='Bianchi' AND v.data_ora_visita='2024-03-22T00:00:00' LIMIT 1),
    (SELECT id FROM prestazioni WHERE nome_prestazione='Controllo post-op' LIMIT 1)
);

-- Visita Fiocco 26/03/2024 - Prima visita
INSERT INTO visita_prestazioni (visita_id, prestazione_id)
VALUES (
    (SELECT v.id FROM visite v JOIN animali a ON v.animale_id=a.id JOIN proprietari p ON a.proprietario_id=p.id
     WHERE a.nome='Fiocco' AND p.nome='Antonio' AND p.cognome='Moretti' AND v.data_ora_visita='2024-03-26T00:00:00' LIMIT 1),
    (SELECT id FROM prestazioni WHERE nome_prestazione='Prima visita' LIMIT 1)
);

-- Visita Puffo 02/04/2024 - Prima visita
INSERT INTO visita_prestazioni (visita_id, prestazione_id)
VALUES (
    (SELECT v.id FROM visite v JOIN animali a ON v.animale_id=a.id JOIN proprietari p ON a.proprietario_id=p.id
     WHERE a.nome='Puffo' AND p.nome='Antonio' AND p.cognome='Moretti' AND v.data_ora_visita='2024-04-02T00:00:00' LIMIT 1),
    (SELECT id FROM prestazioni WHERE nome_prestazione='Prima visita' LIMIT 1)
);

-- Visita Luna 09/04/2024 - Controllo post-op
INSERT INTO visita_prestazioni (visita_id, prestazione_id)
VALUES (
    (SELECT v.id FROM visite v JOIN animali a ON v.animale_id=a.id JOIN proprietari p ON a.proprietario_id=p.id
     WHERE a.nome='Luna' AND p.nome='Francesca' AND p.cognome='Bianchi' AND v.data_ora_visita='2024-04-09T00:00:00' LIMIT 1),
    (SELECT id FROM prestazioni WHERE nome_prestazione='Controllo post-op' LIMIT 1)
);

-- Visita Zeus 16/04/2024 - Controllo annuale
INSERT INTO visita_prestazioni (visita_id, prestazione_id)
VALUES (
    (SELECT v.id FROM visite v JOIN animali a ON v.animale_id=a.id JOIN proprietari p ON a.proprietario_id=p.id
     WHERE a.nome='Zeus' AND p.nome='Francesco' AND p.cognome='Lombardi' AND v.data_ora_visita='2024-04-16T00:00:00' LIMIT 1),
    (SELECT id FROM prestazioni WHERE nome_prestazione='Controllo annuale' LIMIT 1)
);

-- ============================================================
-- DIARIO CLINICO — lookup dinamico proprietario_id e animale_id e scomposizione Visite
-- ============================================================

INSERT INTO diario_clinico (sintomi, diagnosi, trattamento_terapia, note, note_private, visita_id) VALUES
('Controllo routine', NULL, 'Vaccinazione polivalente', NULL, NULL,
 (SELECT v.id FROM visite v JOIN animali a ON v.animale_id=a.id JOIN proprietari p ON a.proprietario_id=p.id
  WHERE a.nome='Briciola' AND p.nome='Marco' AND p.cognome='Rossi'
    AND v.data_ora_visita='2024-01-10T00:00:00' LIMIT 1)),

('Zoppia arto posteriore dx', NULL, 'Rx arto, anti-infiammatori', 'Rx allegato alla cartella', NULL,
 (SELECT v.id FROM visite v JOIN animali a ON v.animale_id=a.id JOIN proprietari p ON a.proprietario_id=p.id
  WHERE a.nome='Rex' AND p.nome='Francesca' AND p.cognome='Bianchi'
    AND v.data_ora_visita='2024-01-12T00:00:00' LIMIT 1)),

('Controllo peso e dentizione', NULL, 'Pulizia denti professionale', NULL, NULL,
 (SELECT v.id FROM visite v JOIN animali a ON v.animale_id=a.id JOIN proprietari p ON a.proprietario_id=p.id
  WHERE a.nome='Fido' AND p.nome='Giorgio' AND p.cognome='Ricci'
    AND v.data_ora_visita='2024-01-15T00:00:00' LIMIT 1)),

(NULL, 'Sterilizzazione programmata', 'Ovariectomia', 'Decorso regolare', NULL,
 (SELECT v.id FROM visite v JOIN animali a ON v.animale_id=a.id JOIN proprietari p ON a.proprietario_id=p.id
  WHERE a.nome='Luna' AND p.nome='Francesca' AND p.cognome='Bianchi'
    AND v.data_ora_visita='2024-01-18T00:00:00' LIMIT 1)),

('Vomito persistente', NULL, 'Fluidoterapia, antiemetico', NULL, NULL,
 (SELECT v.id FROM visite v JOIN animali a ON v.animale_id=a.id JOIN proprietari p ON a.proprietario_id=p.id
  WHERE a.nome='Tigre' AND p.nome='Roberto' AND p.cognome='Esposito'
    AND v.data_ora_visita='2024-01-22T00:00:00' LIMIT 1)),

('Sovrappeso', NULL, 'Piano dietetico', 'Peso: 13,1 kg', NULL,
 (SELECT v.id FROM visite v JOIN animali a ON v.animale_id=a.id JOIN proprietari p ON a.proprietario_id=p.id
  WHERE a.nome='Birillo' AND p.nome='Paolo' AND p.cognome='Manzoni'
    AND v.data_ora_visita='2024-01-25T00:00:00' LIMIT 1)),

('Richiamo annuale', NULL, 'Polivalente + antirabbico', NULL, NULL,
 (SELECT v.id FROM visite v JOIN animali a ON v.animale_id=a.id JOIN proprietari p ON a.proprietario_id=p.id
  WHERE a.nome='Zeus' AND p.nome='Francesco' AND p.cognome='Lombardi'
    AND v.data_ora_visita='2024-01-29T00:00:00' LIMIT 1)),

('Alopecia localizzata', NULL, 'Esame micologico, antifungino', NULL, NULL,
 (SELECT v.id FROM visite v JOIN animali a ON v.animale_id=a.id JOIN proprietari p ON a.proprietario_id=p.id
  WHERE a.nome='Micio' AND p.nome='Anna' AND p.cognome='Ferrari'
    AND v.data_ora_visita='2024-02-02T00:00:00' LIMIT 1)),

(NULL, 'Controllo gravidanza', 'Ecografia addominale', '4 cuccioli attesi', NULL,
 (SELECT v.id FROM visite v JOIN animali a ON v.animale_id=a.id JOIN proprietari p ON a.proprietario_id=p.id
  WHERE a.nome='Cioccolata' AND p.nome='Elena' AND p.cognome='Galli'
    AND v.data_ora_visita='2024-02-07T00:00:00' LIMIT 1)),

('Ingestione corpo estraneo', NULL, 'Rx addome, emesi indotta', NULL, NULL,
 (SELECT v.id FROM visite v JOIN animali a ON v.animale_id=a.id JOIN proprietari p ON a.proprietario_id=p.id
  WHERE a.nome='Artù' AND p.nome='Stefano' AND p.cognome='Marchetti'
    AND v.data_ora_visita='2024-02-12T00:00:00' LIMIT 1)),

('Difficoltà deambulazione', NULL, 'Rx colonna, cortisone', 'Riposo 2 settimane', NULL,
 (SELECT v.id FROM visite v JOIN animali a ON v.animale_id=a.id JOIN proprietari p ON a.proprietario_id=p.id
  WHERE a.nome='Pallina' AND p.nome='Luigi' AND p.cognome='Colombo'
    AND v.data_ora_visita='2024-02-15T00:00:00' LIMIT 1)),

('Prima vaccinazione', NULL, 'Trivalente felina', NULL, NULL,
 (SELECT v.id FROM visite v JOIN animali a ON v.animale_id=a.id JOIN proprietari p ON a.proprietario_id=p.id
  WHERE a.nome='Neve' AND p.nome='Maria' AND p.cognome='Conti'
    AND v.data_ora_visita='2024-02-19T00:00:00' LIMIT 1)),

(NULL, 'Follow-up sterilizzazione', 'Rimozione punti', NULL, NULL,
 (SELECT v.id FROM visite v JOIN animali a ON v.animale_id=a.id JOIN proprietari p ON a.proprietario_id=p.id
  WHERE a.nome='Oscar' AND p.nome='Chiara' AND p.cognome='Ferretti'
    AND v.data_ora_visita='2024-02-22T00:00:00' LIMIT 1)),

(NULL, 'Monitoraggio FIV', 'Esami ematochimici', 'Condizioni stabili', NULL,
 (SELECT v.id FROM visite v JOIN animali a ON v.animale_id=a.id JOIN proprietari p ON a.proprietario_id=p.id
  WHERE a.nome='Stella' AND p.nome='Valentina' AND p.cognome='Caruso'
    AND v.data_ora_visita='2024-02-26T00:00:00' LIMIT 1)),

('Visita di routine', NULL, NULL, NULL, NULL,
 (SELECT v.id FROM visite v JOIN animali a ON v.animale_id=a.id JOIN proprietari p ON a.proprietario_id=p.id
  WHERE a.nome='Briciola' AND p.nome='Marco' AND p.cognome='Rossi'
    AND v.data_ora_visita='2024-03-01T00:00:00' LIMIT 1)),

('Otite esterna ricorrente', NULL, 'Pulizia auricolare, antibiotico', 'Terza recidiva in 1 anno', NULL,
 (SELECT v.id FROM visite v JOIN animali a ON v.animale_id=a.id JOIN proprietari p ON a.proprietario_id=p.id
  WHERE a.nome='Charlie' AND p.nome='Elena' AND p.cognome='Galli'
    AND v.data_ora_visita='2024-03-05T00:00:00' LIMIT 1)),

('Richiamo annuale', NULL, 'Trivalente felina', NULL, NULL,
 (SELECT v.id FROM visite v JOIN animali a ON v.animale_id=a.id JOIN proprietari p ON a.proprietario_id=p.id
  WHERE a.nome='Mochi' AND p.nome='Marco' AND p.cognome='Rossi'
    AND v.data_ora_visita='2024-03-08T00:00:00' LIMIT 1)),

('Unghie + visita generale', NULL, 'Taglio unghie', NULL, NULL,
 (SELECT v.id FROM visite v JOIN animali a ON v.animale_id=a.id JOIN proprietari p ON a.proprietario_id=p.id
  WHERE a.nome='Lilly' AND p.nome='Giorgio' AND p.cognome='Ricci'
    AND v.data_ora_visita='2024-03-12T00:00:00' LIMIT 1)),

(NULL, 'Ernia inguinale', 'Intervento chirurgico', 'Decorso ottimale', NULL,
 (SELECT v.id FROM visite v JOIN animali a ON v.animale_id=a.id JOIN proprietari p ON a.proprietario_id=p.id
  WHERE a.nome='Fido' AND p.nome='Giorgio' AND p.cognome='Ricci'
    AND v.data_ora_visita='2024-03-15T00:00:00' LIMIT 1)),

('Visita + antiparassitario', NULL, 'Vaccino + spot-on antiparassitario', NULL, NULL,
 (SELECT v.id FROM visite v JOIN animali a ON v.animale_id=a.id JOIN proprietari p ON a.proprietario_id=p.id
  WHERE a.nome='Mia' AND p.nome='Giulia' AND p.cognome='Barbieri'
    AND v.data_ora_visita='2024-03-19T00:00:00' LIMIT 1)),

(NULL, 'Follow-up zoppia', 'Fisioterapia consigliata', 'Miglioramento evidente', NULL,
 (SELECT v.id FROM visite v JOIN animali a ON v.animale_id=a.id JOIN proprietari p ON a.proprietario_id=p.id
  WHERE a.nome='Rex' AND p.nome='Francesca' AND p.cognome='Bianchi'
    AND v.data_ora_visita='2024-03-22T00:00:00' LIMIT 1)),

('Nuovo paziente', NULL, 'Visita completa, peso, parassiti', NULL, NULL,
 (SELECT v.id FROM visite v JOIN animali a ON v.animale_id=a.id JOIN proprietari p ON a.proprietario_id=p.id
  WHERE a.nome='Fiocco' AND p.nome='Antonio' AND p.cognome='Moretti'
    AND v.data_ora_visita='2024-03-26T00:00:00' LIMIT 1)),

('Nuovo paziente', NULL, 'Visita completa coniglio', NULL, NULL,
 (SELECT v.id FROM visite v JOIN animali a ON v.animale_id=a.id JOIN proprietari p ON a.proprietario_id=p.id
  WHERE a.nome='Puffo' AND p.nome='Antonio' AND p.cognome='Moretti'
    AND v.data_ora_visita='2024-04-02T00:00:00' LIMIT 1)),

(NULL, 'Follow-up ovariectomia', 'Controllo cicatrice', 'Guarigione completa', NULL,
 (SELECT v.id FROM visite v JOIN animali a ON v.animale_id=a.id JOIN proprietari p ON a.proprietario_id=p.id
  WHERE a.nome='Luna' AND p.nome='Francesca' AND p.cognome='Bianchi'
    AND v.data_ora_visita='2024-04-09T00:00:00' LIMIT 1)),

('Visita di routine', NULL, NULL, 'Tutto nella norma', NULL,
 (SELECT v.id FROM visite v JOIN animali a ON v.animale_id=a.id JOIN proprietari p ON a.proprietario_id=p.id
  WHERE a.nome='Zeus' AND p.nome='Francesco' AND p.cognome='Lombardi'
    AND v.data_ora_visita='2024-04-16T00:00:00' LIMIT 1));

-- ============================================================
-- FATTURE — creazione fatture per ogni visita con importo dalla CSV
-- ============================================================

INSERT INTO fatture (numero_fattura, data_emissione, tipo_fattura, codice_fiscale_cliente, indirizzo_cliente, citta_cliente, importo_totale, metodo_pagamento, note, dettaglio_servizi, pagata, proprietario_id, visita_id)
SELECT
    'FATT-2024-001',
    v.data_ora_visita,
    'Semplificata',
    COALESCE(p.codice_fiscale, '0000000000000000'),
    p.indirizzo,
    p.citta,
    45.00,
    NULL,
    NULL,
    'Controllo annuale',
    true,
    p.id,
    v.id
FROM visite v
JOIN animali a ON v.animale_id = a.id
JOIN proprietari p ON a.proprietario_id = p.id
WHERE a.nome='Briciola' AND p.nome='Marco' AND p.cognome='Rossi' AND v.data_ora_visita='2024-01-10T00:00:00'
LIMIT 1;

INSERT INTO fatture (numero_fattura, data_emissione, tipo_fattura, codice_fiscale_cliente, indirizzo_cliente, citta_cliente, importo_totale, metodo_pagamento, note, dettaglio_servizi, pagata, proprietario_id, visita_id)
SELECT
    'FATT-2024-002',
    v.data_ora_visita,
    'Semplificata',
    COALESCE(p.codice_fiscale, '0000000000000000'),
    p.indirizzo,
    p.citta,
    85.00,
    NULL,
    NULL,
    'Visita ortopedica',
    true,
    p.id,
    v.id
FROM visite v
JOIN animali a ON v.animale_id = a.id
JOIN proprietari p ON a.proprietario_id = p.id
WHERE a.nome='Rex' AND p.nome='Francesca' AND p.cognome='Bianchi' AND v.data_ora_visita='2024-01-12T00:00:00'
LIMIT 1;

INSERT INTO fatture (numero_fattura, data_emissione, tipo_fattura, codice_fiscale_cliente, indirizzo_cliente, citta_cliente, importo_totale, metodo_pagamento, note, dettaglio_servizi, pagata, proprietario_id, visita_id)
SELECT
    'FATT-2024-003',
    v.data_ora_visita,
    'Semplificata',
    COALESCE(p.codice_fiscale, '0000000000000000'),
    p.indirizzo,
    p.citta,
    60.00,
    NULL,
    NULL,
    'Controllo annuale',
    true,
    p.id,
    v.id
FROM visite v
JOIN animali a ON v.animale_id = a.id
JOIN proprietari p ON a.proprietario_id = p.id
WHERE a.nome='Fido' AND p.nome='Giorgio' AND p.cognome='Ricci' AND v.data_ora_visita='2024-01-15T00:00:00'
LIMIT 1;

INSERT INTO fatture (numero_fattura, data_emissione, tipo_fattura, codice_fiscale_cliente, indirizzo_cliente, citta_cliente, importo_totale, metodo_pagamento, note, dettaglio_servizi, pagata, proprietario_id, visita_id)
SELECT
    'FATT-2024-004',
    v.data_ora_visita,
    'Semplificata',
    COALESCE(p.codice_fiscale, '0000000000000000'),
    p.indirizzo,
    p.citta,
    220.00,
    NULL,
    NULL,
    'Chirurgia',
    true,
    p.id,
    v.id
FROM visite v
JOIN animali a ON v.animale_id = a.id
JOIN proprietari p ON a.proprietario_id = p.id
WHERE a.nome='Luna' AND p.nome='Francesca' AND p.cognome='Bianchi' AND v.data_ora_visita='2024-01-18T00:00:00'
LIMIT 1;

INSERT INTO fatture (numero_fattura, data_emissione, tipo_fattura, codice_fiscale_cliente, indirizzo_cliente, citta_cliente, importo_totale, metodo_pagamento, note, dettaglio_servizi, pagata, proprietario_id, visita_id)
SELECT
    'FATT-2024-005',
    v.data_ora_visita,
    'Semplificata',
    COALESCE(p.codice_fiscale, '0000000000000000'),
    p.indirizzo,
    p.citta,
    70.00,
    NULL,
    NULL,
    'Visita urgente',
    true,
    p.id,
    v.id
FROM visite v
JOIN animali a ON v.animale_id = a.id
JOIN proprietari p ON a.proprietario_id = p.id
WHERE a.nome='Tigre' AND p.nome='Roberto' AND p.cognome='Esposito' AND v.data_ora_visita='2024-01-22T00:00:00'
LIMIT 1;

INSERT INTO fatture (numero_fattura, data_emissione, tipo_fattura, codice_fiscale_cliente, indirizzo_cliente, citta_cliente, importo_totale, metodo_pagamento, note, dettaglio_servizi, pagata, proprietario_id, visita_id)
SELECT
    'FATT-2024-006',
    v.data_ora_visita,
    'Semplificata',
    COALESCE(p.codice_fiscale, '0000000000000000'),
    p.indirizzo,
    p.citta,
    35.00,
    NULL,
    NULL,
    'Controllo peso',
    true,
    p.id,
    v.id
FROM visite v
JOIN animali a ON v.animale_id = a.id
JOIN proprietari p ON a.proprietario_id = p.id
WHERE a.nome='Birillo' AND p.nome='Paolo' AND p.cognome='Manzoni' AND v.data_ora_visita='2024-01-25T00:00:00'
LIMIT 1;

INSERT INTO fatture (numero_fattura, data_emissione, tipo_fattura, codice_fiscale_cliente, indirizzo_cliente, citta_cliente, importo_totale, metodo_pagamento, note, dettaglio_servizi, pagata, proprietario_id, visita_id)
SELECT
    'FATT-2024-007',
    v.data_ora_visita,
    'Semplificata',
    COALESCE(p.codice_fiscale, '0000000000000000'),
    p.indirizzo,
    p.citta,
    50.00,
    NULL,
    NULL,
    'Vaccinazione',
    true,
    p.id,
    v.id
FROM visite v
JOIN animali a ON v.animale_id = a.id
JOIN proprietari p ON a.proprietario_id = p.id
WHERE a.nome='Zeus' AND p.nome='Francesco' AND p.cognome='Lombardi' AND v.data_ora_visita='2024-01-29T00:00:00'
LIMIT 1;

INSERT INTO fatture (numero_fattura, data_emissione, tipo_fattura, codice_fiscale_cliente, indirizzo_cliente, citta_cliente, importo_totale, metodo_pagamento, note, dettaglio_servizi, pagata, proprietario_id, visita_id)
SELECT
    'FATT-2024-008',
    v.data_ora_visita,
    'Semplificata',
    COALESCE(p.codice_fiscale, '0000000000000000'),
    p.indirizzo,
    p.citta,
    75.00,
    NULL,
    NULL,
    'Dermatologia',
    true,
    p.id,
    v.id
FROM visite v
JOIN animali a ON v.animale_id = a.id
JOIN proprietari p ON a.proprietario_id = p.id
WHERE a.nome='Micio' AND p.nome='Anna' AND p.cognome='Ferrari' AND v.data_ora_visita='2024-02-02T00:00:00'
LIMIT 1;

INSERT INTO fatture (numero_fattura, data_emissione, tipo_fattura, codice_fiscale_cliente, indirizzo_cliente, citta_cliente, importo_totale, metodo_pagamento, note, dettaglio_servizi, pagata, proprietario_id, visita_id)
SELECT
    'FATT-2024-009',
    v.data_ora_visita,
    'Semplificata',
    COALESCE(p.codice_fiscale, '0000000000000000'),
    p.indirizzo,
    p.citta,
    90.00,
    NULL,
    NULL,
    'Ecografia',
    true,
    p.id,
    v.id
FROM visite v
JOIN animali a ON v.animale_id = a.id
JOIN proprietari p ON a.proprietario_id = p.id
WHERE a.nome='Cioccolata' AND p.nome='Elena' AND p.cognome='Galli' AND v.data_ora_visita='2024-02-07T00:00:00'
LIMIT 1;

INSERT INTO fatture (numero_fattura, data_emissione, tipo_fattura, codice_fiscale_cliente, indirizzo_cliente, citta_cliente, importo_totale, metodo_pagamento, note, dettaglio_servizi, pagata, proprietario_id, visita_id)
SELECT
    'FATT-2024-010',
    v.data_ora_visita,
    'Semplificata',
    COALESCE(p.codice_fiscale, '0000000000000000'),
    p.indirizzo,
    p.citta,
    95.00,
    NULL,
    NULL,
    'Visita urgente',
    true,
    p.id,
    v.id
FROM visite v
JOIN animali a ON v.animale_id = a.id
JOIN proprietari p ON a.proprietario_id = p.id
WHERE a.nome='Artù' AND p.nome='Stefano' AND p.cognome='Marchetti' AND v.data_ora_visita='2024-02-12T00:00:00'
LIMIT 1;

INSERT INTO fatture (numero_fattura, data_emissione, tipo_fattura, codice_fiscale_cliente, indirizzo_cliente, citta_cliente, importo_totale, metodo_pagamento, note, dettaglio_servizi, pagata, proprietario_id, visita_id)
SELECT
    'FATT-2024-011',
    v.data_ora_visita,
    'Semplificata',
    COALESCE(p.codice_fiscale, '0000000000000000'),
    p.indirizzo,
    p.citta,
    110.00,
    NULL,
    NULL,
    'Visita neurologica',
    true,
    p.id,
    v.id
FROM visite v
JOIN animali a ON v.animale_id = a.id
JOIN proprietari p ON a.proprietario_id = p.id
WHERE a.nome='Pallina' AND p.nome='Luigi' AND p.cognome='Colombo' AND v.data_ora_visita='2024-02-15T00:00:00'
LIMIT 1;

INSERT INTO fatture (numero_fattura, data_emissione, tipo_fattura, codice_fiscale_cliente, indirizzo_cliente, citta_cliente, importo_totale, metodo_pagamento, note, dettaglio_servizi, pagata, proprietario_id, visita_id)
SELECT
    'FATT-2024-012',
    v.data_ora_visita,
    'Semplificata',
    COALESCE(p.codice_fiscale, '0000000000000000'),
    p.indirizzo,
    p.citta,
    40.00,
    NULL,
    NULL,
    'Vaccinazione',
    true,
    p.id,
    v.id
FROM visite v
JOIN animali a ON v.animale_id = a.id
JOIN proprietari p ON a.proprietario_id = p.id
WHERE a.nome='Neve' AND p.nome='Maria' AND p.cognome='Conti' AND v.data_ora_visita='2024-02-19T00:00:00'
LIMIT 1;

INSERT INTO fatture (numero_fattura, data_emissione, tipo_fattura, codice_fiscale_cliente, indirizzo_cliente, citta_cliente, importo_totale, metodo_pagamento, note, dettaglio_servizi, pagata, proprietario_id, visita_id)
SELECT
    'FATT-2024-013',
    v.data_ora_visita,
    'Semplificata',
    COALESCE(p.codice_fiscale, '0000000000000000'),
    p.indirizzo,
    p.citta,
    30.00,
    NULL,
    NULL,
    'Controllo post-op',
    true,
    p.id,
    v.id
FROM visite v
JOIN animali a ON v.animale_id = a.id
JOIN proprietari p ON a.proprietario_id = p.id
WHERE a.nome='Oscar' AND p.nome='Chiara' AND p.cognome='Ferretti' AND v.data_ora_visita='2024-02-22T00:00:00'
LIMIT 1;

INSERT INTO fatture (numero_fattura, data_emissione, tipo_fattura, codice_fiscale_cliente, indirizzo_cliente, citta_cliente, importo_totale, metodo_pagamento, note, dettaglio_servizi, pagata, proprietario_id, visita_id)
SELECT
    'FATT-2024-014',
    v.data_ora_visita,
    'Semplificata',
    COALESCE(p.codice_fiscale, '0000000000000000'),
    p.indirizzo,
    p.citta,
    65.00,
    NULL,
    NULL,
    'Malattia infettiva',
    true,
    p.id,
    v.id
FROM visite v
JOIN animali a ON v.animale_id = a.id
JOIN proprietari p ON a.proprietario_id = p.id
WHERE a.nome='Stella' AND p.nome='Valentina' AND p.cognome='Caruso' AND v.data_ora_visita='2024-02-26T00:00:00'
LIMIT 1;

INSERT INTO fatture (numero_fattura, data_emissione, tipo_fattura, codice_fiscale_cliente, indirizzo_cliente, citta_cliente, importo_totale, metodo_pagamento, note, dettaglio_servizi, pagata, proprietario_id, visita_id)
SELECT
    'FATT-2024-015',
    v.data_ora_visita,
    'Semplificata',
    COALESCE(p.codice_fiscale, '0000000000000000'),
    p.indirizzo,
    p.citta,
    35.00,
    NULL,
    NULL,
    'Controllo semestrale',
    true,
    p.id,
    v.id
FROM visite v
JOIN animali a ON v.animale_id = a.id
JOIN proprietari p ON a.proprietario_id = p.id
WHERE a.nome='Briciola' AND p.nome='Marco' AND p.cognome='Rossi' AND v.data_ora_visita='2024-03-01T00:00:00'
LIMIT 1;

INSERT INTO fatture (numero_fattura, data_emissione, tipo_fattura, codice_fiscale_cliente, indirizzo_cliente, citta_cliente, importo_totale, metodo_pagamento, note, dettaglio_servizi, pagata, proprietario_id, visita_id)
SELECT
    'FATT-2024-016',
    v.data_ora_visita,
    'Semplificata',
    COALESCE(p.codice_fiscale, '0000000000000000'),
    p.indirizzo,
    p.citta,
    55.00,
    NULL,
    NULL,
    'Otorinolaringoiatria',
    true,
    p.id,
    v.id
FROM visite v
JOIN animali a ON v.animale_id = a.id
JOIN proprietari p ON a.proprietario_id = p.id
WHERE a.nome='Charlie' AND p.nome='Elena' AND p.cognome='Galli' AND v.data_ora_visita='2024-03-05T00:00:00'
LIMIT 1;

INSERT INTO fatture (numero_fattura, data_emissione, tipo_fattura, codice_fiscale_cliente, indirizzo_cliente, citta_cliente, importo_totale, metodo_pagamento, note, dettaglio_servizi, pagata, proprietario_id, visita_id)
SELECT
    'FATT-2024-017',
    v.data_ora_visita,
    'Semplificata',
    COALESCE(p.codice_fiscale, '0000000000000000'),
    p.indirizzo,
    p.citta,
    40.00,
    NULL,
    NULL,
    'Vaccinazione',
    true,
    p.id,
    v.id
FROM visite v
JOIN animali a ON v.animale_id = a.id
JOIN proprietari p ON a.proprietario_id = p.id
WHERE a.nome='Mochi' AND p.nome='Marco' AND p.cognome='Rossi' AND v.data_ora_visita='2024-03-08T00:00:00'
LIMIT 1;

INSERT INTO fatture (numero_fattura, data_emissione, tipo_fattura, codice_fiscale_cliente, indirizzo_cliente, citta_cliente, importo_totale, metodo_pagamento, note, dettaglio_servizi, pagata, proprietario_id, visita_id)
SELECT
    'FATT-2024-018',
    v.data_ora_visita,
    'Semplificata',
    COALESCE(p.codice_fiscale, '0000000000000000'),
    p.indirizzo,
    p.citta,
    25.00,
    NULL,
    NULL,
    'Controllo annuale',
    true,
    p.id,
    v.id
FROM visite v
JOIN animali a ON v.animale_id = a.id
JOIN proprietari p ON a.proprietario_id = p.id
WHERE a.nome='Lilly' AND p.nome='Giorgio' AND p.cognome='Ricci' AND v.data_ora_visita='2024-03-12T00:00:00'
LIMIT 1;

INSERT INTO fatture (numero_fattura, data_emissione, tipo_fattura, codice_fiscale_cliente, indirizzo_cliente, citta_cliente, importo_totale, metodo_pagamento, note, dettaglio_servizi, pagata, proprietario_id, visita_id)
SELECT
    'FATT-2024-019',
    v.data_ora_visita,
    'Semplificata',
    COALESCE(p.codice_fiscale, '0000000000000000'),
    p.indirizzo,
    p.citta,
    280.00,
    NULL,
    NULL,
    'Chirurgia',
    true,
    p.id,
    v.id
FROM visite v
JOIN animali a ON v.animale_id = a.id
JOIN proprietari p ON a.proprietario_id = p.id
WHERE a.nome='Fido' AND p.nome='Giorgio' AND p.cognome='Ricci' AND v.data_ora_visita='2024-03-15T00:00:00'
LIMIT 1;

INSERT INTO fatture (numero_fattura, data_emissione, tipo_fattura, codice_fiscale_cliente, indirizzo_cliente, citta_cliente, importo_totale, metodo_pagamento, note, dettaglio_servizi, pagata, proprietario_id, visita_id)
SELECT
    'FATT-2024-020',
    v.data_ora_visita,
    'Semplificata',
    COALESCE(p.codice_fiscale, '0000000000000000'),
    p.indirizzo,
    p.citta,
    55.00,
    NULL,
    NULL,
    'Controllo annuale',
    true,
    p.id,
    v.id
FROM visite v
JOIN animali a ON v.animale_id = a.id
JOIN proprietari p ON a.proprietario_id = p.id
WHERE a.nome='Mia' AND p.nome='Giulia' AND p.cognome='Barbieri' AND v.data_ora_visita='2024-03-19T00:00:00'
LIMIT 1;

INSERT INTO fatture (numero_fattura, data_emissione, tipo_fattura, codice_fiscale_cliente, indirizzo_cliente, citta_cliente, importo_totale, metodo_pagamento, note, dettaglio_servizi, pagata, proprietario_id, visita_id)
SELECT
    'FATT-2024-021',
    v.data_ora_visita,
    'Semplificata',
    COALESCE(p.codice_fiscale, '0000000000000000'),
    p.indirizzo,
    p.citta,
    50.00,
    NULL,
    NULL,
    'Visita ortopedica',
    true,
    p.id,
    v.id
FROM visite v
JOIN animali a ON v.animale_id = a.id
JOIN proprietari p ON a.proprietario_id = p.id
WHERE a.nome='Rex' AND p.nome='Francesca' AND p.cognome='Bianchi' AND v.data_ora_visita='2024-03-22T00:00:00'
LIMIT 1;

INSERT INTO fatture (numero_fattura, data_emissione, tipo_fattura, codice_fiscale_cliente, indirizzo_cliente, citta_cliente, importo_totale, metodo_pagamento, note, dettaglio_servizi, pagata, proprietario_id, visita_id)
SELECT
    'FATT-2024-022',
    v.data_ora_visita,
    'Semplificata',
    COALESCE(p.codice_fiscale, '0000000000000000'),
    p.indirizzo,
    p.citta,
    45.00,
    NULL,
    NULL,
    'Prima visita',
    true,
    p.id,
    v.id
FROM visite v
JOIN animali a ON v.animale_id = a.id
JOIN proprietari p ON a.proprietario_id = p.id
WHERE a.nome='Fiocco' AND p.nome='Antonio' AND p.cognome='Moretti' AND v.data_ora_visita='2024-03-26T00:00:00'
LIMIT 1;

INSERT INTO fatture (numero_fattura, data_emissione, tipo_fattura, codice_fiscale_cliente, indirizzo_cliente, citta_cliente, importo_totale, metodo_pagamento, note, dettaglio_servizi, pagata, proprietario_id, visita_id)
SELECT
    'FATT-2024-023',
    v.data_ora_visita,
    'Semplificata',
    COALESCE(p.codice_fiscale, '0000000000000000'),
    p.indirizzo,
    p.citta,
    40.00,
    NULL,
    NULL,
    'Prima visita',
    true,
    p.id,
    v.id
FROM visite v
JOIN animali a ON v.animale_id = a.id
JOIN proprietari p ON a.proprietario_id = p.id
WHERE a.nome='Puffo' AND p.nome='Antonio' AND p.cognome='Moretti' AND v.data_ora_visita='2024-04-02T00:00:00'
LIMIT 1;

INSERT INTO fatture (numero_fattura, data_emissione, tipo_fattura, codice_fiscale_cliente, indirizzo_cliente, citta_cliente, importo_totale, metodo_pagamento, note, dettaglio_servizi, pagata, proprietario_id, visita_id)
SELECT
    'FATT-2024-024',
    v.data_ora_visita,
    'Semplificata',
    COALESCE(p.codice_fiscale, '0000000000000000'),
    p.indirizzo,
    p.citta,
    30.00,
    NULL,
    NULL,
    'Controllo post-op',
    true,
    p.id,
    v.id
FROM visite v
JOIN animali a ON v.animale_id = a.id
JOIN proprietari p ON a.proprietario_id = p.id
WHERE a.nome='Luna' AND p.nome='Francesca' AND p.cognome='Bianchi' AND v.data_ora_visita='2024-04-09T00:00:00'
LIMIT 1;

INSERT INTO fatture (numero_fattura, data_emissione, tipo_fattura, codice_fiscale_cliente, indirizzo_cliente, citta_cliente, importo_totale, metodo_pagamento, note, dettaglio_servizi, pagata, proprietario_id, visita_id)
SELECT
    'FATT-2024-025',
    v.data_ora_visita,
    'Semplificata',
    COALESCE(p.codice_fiscale, '0000000000000000'),
    p.indirizzo,
    p.citta,
    35.00,
    NULL,
    NULL,
    'Controllo semestrale',
    true,
    p.id,
    v.id
FROM visite v
JOIN animali a ON v.animale_id = a.id
JOIN proprietari p ON a.proprietario_id = p.id
WHERE a.nome='Zeus' AND p.nome='Francesco' AND p.cognome='Lombardi' AND v.data_ora_visita='2024-04-16T00:00:00'
LIMIT 1;