package it.codicecaciotta.iltuoveterinario.repositories;

import it.codicecaciotta.iltuoveterinario.models.Prestazione;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;

import java.math.BigDecimal;
import java.util.Optional;

public interface PrestazioneRepository
        extends JpaRepository<Prestazione, Long>,
                JpaSpecificationExecutor<Prestazione> {

    Optional<Prestazione> findByNomePrestazione(String nomePrestazione);

    long countByStato(Boolean stato);

    @Query("SELECT AVG(p.costoBase) FROM Prestazione p")
    BigDecimal averageCostoBase();

    @Query("SELECT AVG(p.durataStimata) FROM Prestazione p")
    Double averageDurataStimata();
}