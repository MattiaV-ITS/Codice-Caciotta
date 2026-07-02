package it.codicecaciotta.iltuoveterinario.repositories;

import it.codicecaciotta.iltuoveterinario.models.Ricetta;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface RicettaRepository extends JpaRepository<Ricetta, Long> {
    Optional<Ricetta> findByCodiceRicetta(String codiceRicetta);
}