package it.codicecaciotta.iltuoveterinario.repositories;

import org.springframework.data.jpa.repository.JpaRepository;

import it.codicecaciotta.iltuoveterinario.models.PrenotazionePrestazione;

public interface PrenotazionePrestazioneRepository extends JpaRepository<PrenotazionePrestazione, Long> {

}
