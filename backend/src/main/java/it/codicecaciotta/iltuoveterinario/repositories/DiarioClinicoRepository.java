package it.codicecaciotta.iltuoveterinario.repositories;

import it.codicecaciotta.iltuoveterinario.models.DiarioClinico;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface DiarioClinicoRepository extends JpaRepository<DiarioClinico, Long> {
    // Ottieni il diario clinico partendo dall'ID della visita relazionata (@OneToOne)
    Optional<DiarioClinico> findByVisitaId(Long visitaId);
}