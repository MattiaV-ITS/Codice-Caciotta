package it.codicecaciotta.iltuoveterinario.repositories;

import it.codicecaciotta.iltuoveterinario.models.Animale;
import it.codicecaciotta.iltuoveterinario.models.Vaccinazione;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface VaccinazioneRepository extends JpaRepository<Vaccinazione, Long> {

    Page<Vaccinazione> findByAnimaleId(Long animaleId, Pageable pageable);

    java.util.List<Vaccinazione> findByAnimaleOrderByDataScadenzaAsc(Animale animale);

    @Query("""
        SELECT v FROM Vaccinazione v
        WHERE LOWER(v.tipoVaccino) LIKE LOWER(CONCAT('%', :search, '%'))
           OR LOWER(v.lotto) LIKE LOWER(CONCAT('%', :search, '%'))
           OR LOWER(v.note) LIKE LOWER(CONCAT('%', :search, '%'))
           OR LOWER(v.animale.nome) LIKE LOWER(CONCAT('%', :search, '%'))
    """)
    Page<Vaccinazione> searchComprehensive(@Param("search") String search, Pageable pageable);
}
