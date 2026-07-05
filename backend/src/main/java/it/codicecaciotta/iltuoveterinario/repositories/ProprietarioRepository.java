package it.codicecaciotta.iltuoveterinario.repositories;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import it.codicecaciotta.iltuoveterinario.models.Proprietario;


public interface ProprietarioRepository extends JpaRepository<Proprietario, Long> {

    // Ricerca completa per nome, cognome, telefono, email, codice fiscale o città
    @Query("SELECT a FROM Proprietario a LEFT JOIN FETCH a.animali WHERE " +
           "LOWER(a.nome) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
           "LOWER(a.cognome) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
           "LOWER(a.telefono) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
           "LOWER(a.email) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
           "LOWER(a.codiceFiscale) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
           "LOWER(a.citta) LIKE LOWER(CONCAT('%', :searchTerm, '%'))")
    Page<Proprietario> searchComprehensive(@Param("searchTerm") String searchTerm, Pageable pageable);
    
    Page<Proprietario> findByStato(Boolean stato, Pageable pageable);

    @Query("SELECT COUNT(p) FROM Proprietario p WHERE p.stato = true")
    long countAttivi();

    @Query("SELECT COUNT(p) FROM Proprietario p WHERE p.stato = false")
    long countInattivi();
}