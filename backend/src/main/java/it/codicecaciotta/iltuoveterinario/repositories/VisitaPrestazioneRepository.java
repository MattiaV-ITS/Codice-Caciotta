package it.codicecaciotta.iltuoveterinario.repositories;

import org.springframework.data.jpa.repository.JpaRepository;

import it.codicecaciotta.iltuoveterinario.models.VisitaPrestazione;

public interface VisitaPrestazioneRepository extends JpaRepository<VisitaPrestazione, Long> {

}
