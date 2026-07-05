package it.codicecaciotta.iltuoveterinario.repositories;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import it.codicecaciotta.iltuoveterinario.models.Proprietario;


public interface ProprietarioRepository extends JpaRepository<Proprietario, Long> {
    // Ricerca completa case-insensitive
    Page<Proprietario> findByNomeContainingIgnoreCaseOrCognomeContainingIgnoreCaseOrTelefonoContainingIgnoreCaseOrEmailContainingIgnoreCaseOrCodiceFiscaleContainingIgnoreCase(
        String nome, String cognome, String telefono, String email, String codiceFiscale, Pageable pageable);
    
    Page<Proprietario> findByCitta(String citta, Pageable pageable);
    
    Page<Proprietario> findByStato(Boolean stato, Pageable pageable);

    @Query("SELECT COUNT(p) FROM Proprietario p WHERE p.stato = true")
    long countAttivi();

    @Query("SELECT COUNT(p) FROM Proprietario p WHERE p.stato = false")
    long countInattivi();
}