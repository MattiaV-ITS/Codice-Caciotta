package it.codicecaciotta.iltuoveterinario.repositories;

import org.springframework.data.jpa.repository.JpaRepository;

import it.codicecaciotta.iltuoveterinario.models.Prenotazione;

public interface PrenotazioneRepository extends JpaRepository<Prenotazione, Long> {

}
