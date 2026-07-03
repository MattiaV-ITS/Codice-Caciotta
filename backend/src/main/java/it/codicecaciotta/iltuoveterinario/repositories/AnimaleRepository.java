package it.codicecaciotta.iltuoveterinario.repositories;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import it.codicecaciotta.iltuoveterinario.models.Animale;
import java.util.List;


public interface AnimaleRepository extends JpaRepository<Animale, Long> {
    Page<Animale> findBySpecie(String specie, Pageable pageable);
    Page<Animale> findBySpecieIgnoreCase(String specie, Pageable pageable);
    Page<Animale> findBySpecieNotInIgnoreCase(List<String> specie, Pageable pageable);
    Page<Animale> findByStato(String stato, Pageable pageable);
    
    // Ricerca completa per nome animale, microchip, o nome/cognome proprietario
    @Query("SELECT a FROM Animale a LEFT JOIN FETCH a.proprietario WHERE " +
           "LOWER(a.nome) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
           "LOWER(a.microchip) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
           "LOWER(a.proprietario.nome) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
           "LOWER(a.proprietario.cognome) LIKE LOWER(CONCAT('%', :searchTerm, '%'))")
    Page<Animale> searchComprehensive(@Param("searchTerm") String searchTerm, Pageable pageable);
}
