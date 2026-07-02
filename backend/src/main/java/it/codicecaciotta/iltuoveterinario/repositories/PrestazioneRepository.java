package it.codicecaciotta.iltuoveterinario.repositories;

import it.codicecaciotta.iltuoveterinario.models.Prestazione;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface PrestazioneRepository extends JpaRepository<Prestazione, Long> {
    // Cerca per codice prestazione univoco
    Optional<Prestazione> findByCodicePrestazione(String codicePrestazione);
}