package it.codicecaciotta.iltuoveterinario.repositories;

import it.codicecaciotta.iltuoveterinario.models.Prenotazione;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface PrenotazioneRepository extends JpaRepository<Prenotazione, Long> {
    
    @EntityGraph(attributePaths = {"animale", "proprietario", "visita"})
    @Query("SELECT p FROM Prenotazione p")
    List<Prenotazione> findAllWithRelationships();
    
    @EntityGraph(attributePaths = {"animale", "proprietario", "visita"})
    @Query("SELECT p FROM Prenotazione p WHERE p.id = ?1")
    Optional<Prenotazione> findByIdWithRelationships(Long id);
    
    @EntityGraph(attributePaths = {"animale", "proprietario", "visita"})
    List<Prenotazione> findByProprietarioId(Long proprietarioId);
    
    @EntityGraph(attributePaths = {"animale", "proprietario", "visita"})
    List<Prenotazione> findByAnimaleId(Long animaleId);
    
    @EntityGraph(attributePaths = {"animale", "proprietario", "visita"})
    List<Prenotazione> findByDataOraAppuntamentoBetween(LocalDateTime start, LocalDateTime end);
}
