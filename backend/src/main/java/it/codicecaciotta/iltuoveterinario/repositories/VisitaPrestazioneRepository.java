package it.codicecaciotta.iltuoveterinario.repositories;

import it.codicecaciotta.iltuoveterinario.models.VisitaPrestazione;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface VisitaPrestazioneRepository extends JpaRepository<VisitaPrestazione, Long> {
    
    // Trova tutte le prestazioni (con dettagli farmaco/lotto) eseguite in una specifica visita
    List<VisitaPrestazione> findByVisitaId(Long visitaId);
    
    // Trova lo storico di tutte le volte che una specifica prestazione è stata eseguita nelle visite
    List<VisitaPrestazione> findByPrestazioneId(Long prestazioneId);
}