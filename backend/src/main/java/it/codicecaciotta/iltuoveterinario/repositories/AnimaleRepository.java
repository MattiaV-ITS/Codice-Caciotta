package it.codicecaciotta.iltuoveterinario.repositories;

import it.codicecaciotta.iltuoveterinario.models.Animale;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface AnimaleRepository extends JpaRepository<Animale, Long> {
    // Trova un animale tramite microchip (essendo univoco)
    Optional<Animale> findByMicrochip(String microchip);
    
    // Trova tutti gli animali di un determinato proprietario
    List<Animale> findByProprietarioId(Long proprietarioId);
}