package it.codicecaciotta.iltuoveterinario.repositories;

import it.codicecaciotta.iltuoveterinario.models.Animale;
import it.codicecaciotta.iltuoveterinario.models.Vaccinazione;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;

public interface VaccinazioneRepository extends JpaRepository<Vaccinazione, Long> {

    Page<Vaccinazione> findByAnimaleId(Long animaleId, Pageable pageable);

    java.util.List<Vaccinazione> findByAnimaleOrderByDataScadenzaAsc(Animale animale);

    //TODO: Ricerca per dataSomministrazione
    // Ricerca completa per tipoVaccino, lotto, note e nome animale
    @Query("""
        SELECT v FROM Vaccinazione v
        WHERE LOWER(v.tipoVaccino) LIKE LOWER(CONCAT('%', :search, '%'))
           OR LOWER(v.lotto) LIKE LOWER(CONCAT('%', :search, '%'))
           OR LOWER(v.animale.nome) LIKE LOWER(CONCAT('%', :search, '%'))
    """)
    Page<Vaccinazione> searchComprehensive(@Param("search") String search, Pageable pageable);

    @Query("""
        SELECT v FROM Vaccinazione v
        WHERE (
            (v.dataScadenza IS NULL AND :stato = 'SCADUTO') OR
            (v.dataScadenza IS NOT NULL AND
                CASE
                    WHEN :stato = 'SCADUTO' AND v.dataScadenza < CURRENT_DATE THEN TRUE
                    WHEN :stato = 'PROSSIMO' AND v.dataScadenza BETWEEN CURRENT_DATE AND DATEADD(day, 30, CURRENT_DATE) THEN TRUE
                    WHEN :stato = 'VALIDO' AND v.dataScadenza > DATEADD(day, 30, CURRENT_DATE) THEN TRUE
                    ELSE FALSE
                END
            )
        )
    """)
    Page<Vaccinazione> findByStato(@Param("stato") String stato, Pageable pageable);

    // Stats methods
    @Query("SELECT COUNT(v) FROM Vaccinazione v WHERE v.dataScadenza > DATEADD(day, 30, CURRENT_DATE)")
    long countValide();

    @Query("SELECT COUNT(v) FROM Vaccinazione v WHERE v.dataScadenza BETWEEN CURRENT_DATE AND DATEADD(day, 30, CURRENT_DATE)")
    long countProssime();

    @Query("SELECT COUNT(v) FROM Vaccinazione v WHERE v.dataScadenza < CURRENT_DATE OR v.dataScadenza IS NULL")
    long countScadute();
}
