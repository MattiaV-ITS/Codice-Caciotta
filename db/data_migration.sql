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

-- TODO: cambiare stato a SANO o a stato congruente con le note generali (es. FIV positivo -> MALATO)
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