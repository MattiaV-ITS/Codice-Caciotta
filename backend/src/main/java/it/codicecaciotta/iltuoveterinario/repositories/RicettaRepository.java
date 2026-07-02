package it.codicecaciotta.iltuoveterinario.repositories;

import org.springframework.data.jpa.repository.JpaRepository;

import it.codicecaciotta.iltuoveterinario.models.Ricetta;

public interface RicettaRepository extends JpaRepository<Ricetta, Long> {

}
