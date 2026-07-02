package it.codicecaciotta.iltuoveterinario.repositories;

import it.codicecaciotta.iltuoveterinario.models.Visita;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface VisitaRepository extends JpaRepository<Visita, Long> {
    
    // Trova tutte le visite effettuate da un determinato animale
    List<Visita> findByAnimaleId(Long animaleId);
    
    // Trova la visita associata a una specifica prenotazione (se presente)
    Optional<Visita> findByPrenotazioneId(Long prenotazioneId);
    
    // Filtra le visite in base allo stato (es. 'Pianificata', 'In corso', 'Completata')
    List<Visita> findByStato(String stato);
}