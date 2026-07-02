package it.codicecaciotta.iltuoveterinario.repositories;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import it.codicecaciotta.iltuoveterinario.models.Proprietario;


public interface ProprietarioRepository extends JpaRepository<Proprietario, Long> {
    Page<Proprietario> findByNomeContainingOrCognomeContainingOrTelefonoContainingOrEmailContainingOrCodiceFiscaleContaining(
        String nome, String cognome, String telefono, String email, String codiceFiscale, Pageable pageable);
    
    // Ricerca completa case-insensitive
    Page<Proprietario> findByNomeContainingIgnoreCaseOrCognomeContainingIgnoreCaseOrTelefonoContainingIgnoreCaseOrEmailContainingIgnoreCaseOrCodiceFiscaleContainingIgnoreCase(
        String nome, String cognome, String telefono, String email, String codiceFiscale, Pageable pageable);
    
    Page<Proprietario> findByCitta(String citta, Pageable pageable);
}