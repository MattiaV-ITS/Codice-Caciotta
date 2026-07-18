package it.codicecaciotta.iltuoveterinario.repositories;

import it.codicecaciotta.iltuoveterinario.models.Prestazione;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface PrestazioneRepository extends JpaRepository<Prestazione, Long> {
    // Cerca per nome prestazione
    Optional<Prestazione> findByNomePrestazione(String nomePrestazione);
}
