package it.codicecaciotta.iltuoveterinario.repositories;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import it.codicecaciotta.iltuoveterinario.models.Animale;
import java.util.List;


public interface AnimaleRepository extends JpaRepository<Animale, Long> {
    Page<Animale> findBySpecie(String specie, Pageable pageable);
    Page<Animale> findBySpecieIgnoreCase(String specie, Pageable pageable);
    Page<Animale> findBySpecieNotInIgnoreCase(List<String> specie, Pageable pageable);
    Page<Animale> findByStato(String stato, Pageable pageable);
    
    // Ricerca completa per nome animale, microchip, o nome/cognome proprietario
    Page<Animale> findByNomeContainingOrMicrochipContainingOrProprietario_NomeContainingOrProprietario_CognomeContaining(
        String nome, String microchip, String proprietarioNome, String proprietarioCognome, Pageable pageable);
    
    // Ricerca completa case-insensitive per nome animale, microchip, o nome/cognome proprietario
    Page<Animale> findByNomeContainingIgnoreCaseOrMicrochipContainingIgnoreCaseOrProprietario_NomeContainingIgnoreCaseOrProprietario_CognomeContainingIgnoreCase(
        String nome, String microchip, String proprietarioNome, String proprietarioCognome, Pageable pageable);
}
