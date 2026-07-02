package it.codicecaciotta.iltuoveterinario.repositories;

import it.codicecaciotta.iltuoveterinario.models.PrenotazionePrestazione;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface PrenotazionePrestazioneRepository extends JpaRepository<PrenotazionePrestazione, Long> {
    // Trova tutte le prestazioni associate a una specifica prenotazione
    List<PrenotazionePrestazione> findByPrenotazioneId(Long prenotazioneId);
}