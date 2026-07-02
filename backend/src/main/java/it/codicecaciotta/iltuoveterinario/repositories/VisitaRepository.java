package it.codicecaciotta.iltuoveterinario.repositories;

import org.springframework.data.jpa.repository.JpaRepository;

import it.codicecaciotta.iltuoveterinario.models.Visita;

public interface VisitaRepository extends JpaRepository<Visita, Long> {

}
