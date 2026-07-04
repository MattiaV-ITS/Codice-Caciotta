-- Proprietari
INSERT INTO proprietari (id, codice_fiscale, nome, cognome, email, telefono, indirizzo, citta, data_registrazione, stato)
VALUES (1, NULL, 'Marco', 'Rossi', 'marco.rossi@email.it', '335 1234567', 'Via Roma 12', 'Bergamo', '2019-03-15', TRUE);

INSERT INTO proprietari (id, codice_fiscale, nome, cognome, email, telefono, indirizzo, citta, data_registrazione, stato)
VALUES (2, NULL, 'Francesca', 'Bianchi', 'f.bianchi@gmail.com', '347 2345678', 'Via Garibaldi 5', 'Bergamo Alta', '2019-07-22', FALSE);

INSERT INTO proprietari (id, codice_fiscale, nome, cognome, email, telefono, indirizzo, citta, data_registrazione, stato)
VALUES (3, NULL, 'Luigi', 'Colombo', 'l.colombo@libero.it', '328 3456789', 'Via Manzoni 33', 'Sorisole', '2019-11-10', TRUE);

INSERT INTO proprietari (id, codice_fiscale, nome, cognome, email, telefono, indirizzo, citta, data_registrazione, stato)
VALUES (4, NULL, 'Anna', 'Ferrari', 'anna.ferrari@yahoo.it', '339 4567890', 'Piazza Vecchia 1', 'Bergamo Alta', '2020-02-05', TRUE);

INSERT INTO proprietari (id, codice_fiscale, nome, cognome, email, telefono, indirizzo, citta, data_registrazione, stato)
VALUES (5, NULL, 'Giorgio', 'Ricci', 'g.ricci@email.it', '366 5678901', 'Via Tasso 8', 'Bergamo', '2020-04-18', TRUE);

INSERT INTO proprietari (id, codice_fiscale, nome, cognome, email, telefono, indirizzo, citta, data_registrazione, stato)
VALUES (6, NULL, 'Maria', 'Conti', 'maria.conti@gmail.com', '351 6789012', 'Via Pignolo 44', 'Bergamo', '2020-06-30', TRUE);

INSERT INTO proprietari (id, codice_fiscale, nome, cognome, email, telefono, indirizzo, citta, data_registrazione, stato)
VALUES (7, NULL, 'Paolo', 'Manzoni', 'p.manzoni@libero.it', '342 7890123', 'Via Borgo Palazzo 17', 'Bergamo', '2020-09-12', TRUE);

INSERT INTO proprietari (id, codice_fiscale, nome, cognome, email, telefono, indirizzo, citta, data_registrazione, stato)
VALUES (8, NULL, 'Elena', 'Galli', 'e.galli@email.it', '333 8901234', 'Via S. Tomaso 9', 'Bergamo Alta', '2021-01-25', TRUE);

INSERT INTO proprietari (id, codice_fiscale, nome, cognome, email, telefono, indirizzo, citta, data_registrazione, stato)
VALUES (9, NULL, 'Roberto', 'Esposito', 'r.esposito@gmail.com', '370 9012345', 'Via Zambonate 22', 'Bergamo', '2021-03-08', TRUE);

INSERT INTO proprietari (id, codice_fiscale, nome, cognome, email, telefono, indirizzo, citta, data_registrazione, stato)
VALUES (10, NULL, 'Chiara', 'Ferretti', 'c.ferretti@email.it', '348 0123456', 'Viale Papa Giovanni 15', 'Bergamo', '2021-05-19', TRUE);

INSERT INTO proprietari (id, codice_fiscale, nome, cognome, email, telefono, indirizzo, citta, data_registrazione, stato)
VALUES (11, NULL, 'Antonio', 'Moretti', 'a.moretti@libero.it', '335 1234568', 'Via Tiraboschi 6', 'Bergamo', '2021-08-02', TRUE);

INSERT INTO proprietari (id, codice_fiscale, nome, cognome, email, telefono, indirizzo, citta, data_registrazione, stato)
VALUES (12, NULL, 'Valentina', 'Caruso', 'v.caruso@gmail.com', '347 2345679', 'Via Quarenghi 11', 'Bergamo', '2021-10-14', TRUE);

INSERT INTO proprietari (id, codice_fiscale, nome, cognome, email, telefono, indirizzo, citta, data_registrazione, stato)
VALUES (13, NULL, 'Francesco', 'Lombardi', 'f.lombardi@email.it', '328 3456780', 'Via Moroni 28', 'Bergamo', '2021-12-27', TRUE);

INSERT INTO proprietari (id, codice_fiscale, nome, cognome, email, telefono, indirizzo, citta, data_registrazione, stato)
VALUES (14, NULL, 'Giulia', 'Barbieri', 'g.barbieri@yahoo.it', '339 4567891', 'Via Camozzi 3', 'Bergamo', '2022-02-09', TRUE);

INSERT INTO proprietari (id, codice_fiscale, nome, cognome, email, telefono, indirizzo, citta, data_registrazione, stato)
VALUES (15, NULL, 'Stefano', 'Marchetti', 's.marchetti@gmail.com', '366 5678902', 'Via Angelo Mai 19', 'Bergamo Alta', '2022-04-21', TRUE);

-- Animali //TODO: correggere stato salute
INSERT INTO animali (id, nome, specie, razza, data_di_nascita, sesso, peso, microchip, taglia, colore_mantello, sterilizzato, gruppo_sanguigno, allergie, patologie, stato, note_generali, proprietario_id)
VALUES (1,'Briciola','Cane','Labrador','2017-05-12','F',28.5,'380260040123456',NULL,NULL,FALSE,NULL,NULL,NULL,'SANO',NULL,1);

INSERT INTO animali (id, nome, specie, razza, data_di_nascita, sesso, peso, microchip, taglia, colore_mantello, sterilizzato, gruppo_sanguigno, allergie, patologie, stato, note_generali, proprietario_id)
VALUES (2,'Rex','Cane','Pastore Tedesco','2018-09-03','M',34,'380260040234567',NULL,NULL,FALSE,NULL,'Allergia al pollame',NULL,'IN_CURA',NULL,2);

INSERT INTO animali (id, nome, specie, razza, data_di_nascita, sesso, peso, microchip, taglia, colore_mantello, sterilizzato, gruppo_sanguigno, allergie, patologie, stato, note_generali, proprietario_id)
VALUES (3,'Luna','Gatto','Europeo Comune','2020-02-17','F',4.2,'380260040345678',NULL,NULL,FALSE,NULL,NULL,NULL,'DECEDUTO',NULL,2);

INSERT INTO animali (id, nome, specie, razza, data_di_nascita, sesso, peso, microchip, taglia, colore_mantello, sterilizzato, gruppo_sanguigno, allergie, patologie, stato, note_generali, proprietario_id)
VALUES (4,'Pallina','Cane','Bassotto','2016-11-28','F',9.1,'380260040456789',NULL,NULL,FALSE,NULL,NULL,'Problemi alla schiena','MALATO',NULL,3);

INSERT INTO animali (id, nome, specie, razza, data_di_nascita, sesso, peso, microchip, taglia, colore_mantello, sterilizzato, gruppo_sanguigno, allergie, patologie, stato, note_generali, proprietario_id)
VALUES (5,'Micio','Gatto','Persiano','2019-04-06','M',5.8,'380260040567890',NULL,NULL,FALSE,NULL,NULL,NULL,'SANO',NULL,4);

INSERT INTO animali (id, nome, specie, razza, data_di_nascita, sesso, peso, microchip, taglia, colore_mantello, sterilizzato, gruppo_sanguigno, allergie, patologie, stato, note_generali, proprietario_id)
VALUES (6,'Fido','Cane','Golden Retriever','2018-08-14','M',31.2,'380260040678901',NULL,NULL,FALSE,NULL,NULL,NULL,'SANO',NULL,5);

INSERT INTO animali (id, nome, specie, razza, data_di_nascita, sesso, peso, microchip, taglia, colore_mantello, sterilizzato, gruppo_sanguigno, allergie, patologie, stato, note_generali, proprietario_id)
VALUES (7,'Neve','Gatto','Siamese','2021-01-22','F',3.9,'380260040789012',NULL,NULL,FALSE,NULL,NULL,NULL,'SANO',NULL,6);

INSERT INTO animali (id, nome, specie, razza, data_di_nascita, sesso, peso, microchip, taglia, colore_mantello, sterilizzato, gruppo_sanguigno, allergie, patologie, stato, note_generali, proprietario_id)
VALUES (8,'Birillo','Cane','Beagle','2017-06-09','M',12.4,'380260040890123',NULL,NULL,FALSE,NULL,NULL,'Tendenza all''obesità','SANO',NULL,7);

INSERT INTO animali (id, nome, specie, razza, data_di_nascita, sesso, peso, microchip, taglia, colore_mantello, sterilizzato, gruppo_sanguigno, allergie, patologie, stato, note_generali, proprietario_id)
VALUES (9,'Cioccolata','Cane','Labrador','2019-03-30','F',26,'380260040901234',NULL,NULL,FALSE,NULL,NULL,NULL,'SANO',NULL,8);

INSERT INTO animali (id, nome, specie, razza, data_di_nascita, sesso, peso, microchip, taglia, colore_mantello, sterilizzato, gruppo_sanguigno, allergie, patologie, stato, note_generali, proprietario_id)
VALUES (10,'Tigre','Gatto','Maine Coon','2018-10-11','M',7.3,'380260041012345',NULL,NULL,FALSE,NULL,NULL,NULL,'SANO',NULL,9);

INSERT INTO animali (id, nome, specie, razza, data_di_nascita, sesso, peso, microchip, taglia, colore_mantello, sterilizzato, gruppo_sanguigno, allergie, patologie, stato, note_generali, proprietario_id)
VALUES (11,'Oscar','Cane','Boxer','2020-07-05','M',29.5,'380260041123456',NULL,NULL,FALSE,NULL,NULL,NULL,'SANO',NULL,10);

INSERT INTO animali (id, nome, specie, razza, data_di_nascita, sesso, peso, microchip, taglia, colore_mantello, sterilizzato, gruppo_sanguigno, allergie, patologie, stato, note_generali, proprietario_id)
VALUES (12,'Puffo','Coniglio','Nano Olandese','2021-12-18','M',1.4,NULL,NULL,NULL,FALSE,NULL,NULL,NULL,'SANO',NULL,11);

INSERT INTO animali (id, nome, specie, razza, data_di_nascita, sesso, peso, microchip, taglia, colore_mantello, sterilizzato, gruppo_sanguigno, allergie, patologie, stato, note_generali, proprietario_id)
VALUES (13,'Stella','Gatto','Europeo Comune','2019-05-24','F',3.6,'380260041234567',NULL,NULL,FALSE,NULL,'FIV positivo',NULL,'SANO',NULL,12);

INSERT INTO animali (id, nome, specie, razza, data_di_nascita, sesso, peso, microchip, taglia, colore_mantello, sterilizzato, gruppo_sanguigno, allergie, patologie, stato, note_generali, proprietario_id)
VALUES (14,'Zeus','Cane','Rottweiler','2017-02-02','M',44,'380260041345678',NULL,NULL,FALSE,NULL,NULL,NULL,'SANO',NULL,13);

INSERT INTO animali (id, nome, specie, razza, data_di_nascita, sesso, peso, microchip, taglia, colore_mantello, sterilizzato, gruppo_sanguigno, allergie, patologie, stato, note_generali, proprietario_id)
VALUES (15,'Mia','Gatto','Ragdoll','2020-09-16','F',5.1,'380260041456789',NULL,NULL,FALSE,NULL,NULL,NULL,'SANO',NULL,14);

INSERT INTO animali (id, nome, specie, razza, data_di_nascita, sesso, peso, microchip, taglia, colore_mantello, sterilizzato, gruppo_sanguigno, allergie, patologie, stato, note_generali, proprietario_id)
VALUES (16,'Artù','Cane','Border Collie','2018-11-07','M',18.7,'380260041567890',NULL,NULL,FALSE,NULL,NULL,NULL,'SANO',NULL,15);

INSERT INTO animali (id, nome, specie, razza, data_di_nascita, sesso, peso, microchip, taglia, colore_mantello, sterilizzato, gruppo_sanguigno, allergie, patologie, stato, note_generali, proprietario_id)
VALUES (17,'Mochi','Gatto','Birmano','2021-06-29','M',4.4,'380260041678901',NULL,NULL,FALSE,NULL,NULL,NULL,'SANO',NULL,1);

INSERT INTO animali (id, nome, specie, razza, data_di_nascita, sesso, peso, microchip, taglia, colore_mantello, sterilizzato, gruppo_sanguigno, allergie, patologie, stato, note_generali, proprietario_id)
VALUES (18,'Lilly','Cane','Barboncino','2020-03-13','F',5.2,'380260041789012',NULL,NULL,FALSE,NULL,NULL,NULL,'SANO',NULL,5);

INSERT INTO animali (id, nome, specie, razza, data_di_nascita, sesso, peso, microchip, taglia, colore_mantello, sterilizzato, gruppo_sanguigno, allergie, patologie, stato, note_generali, proprietario_id)
VALUES (19,'Charlie','Cane','Cocker Spaniel','2019-08-25','M',11.8,'380260041890123',NULL,NULL,FALSE,NULL,NULL,'Otite cronica','SANO',NULL,8);

INSERT INTO animali (id, nome, specie, razza, data_di_nascita, sesso, peso, microchip, taglia, colore_mantello, sterilizzato, gruppo_sanguigno, allergie, patologie, stato, note_generali, proprietario_id)
VALUES (20,'Fiocco','Coniglio','Ariete','2022-01-04','F',2.1,NULL,NULL,NULL,FALSE,NULL,NULL,NULL,'SANO',NULL,11);
