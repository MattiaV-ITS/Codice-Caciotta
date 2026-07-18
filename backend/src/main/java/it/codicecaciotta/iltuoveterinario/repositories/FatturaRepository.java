package it.codicecaciotta.iltuoveterinario.repositories;

import it.codicecaciotta.iltuoveterinario.models.Fattura;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface FatturaRepository extends JpaRepository<Fattura, Long> {
    Optional<Fattura> findByNumeroFattura(String numeroFattura);
    List<Fattura> findByVisitaId(Long visitaId);
}