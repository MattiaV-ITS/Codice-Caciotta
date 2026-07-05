package it.codicecaciotta.iltuoveterinario.repositories;

import it.codicecaciotta.iltuoveterinario.models.Animale;
import it.codicecaciotta.iltuoveterinario.models.Vaccinazione;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.time.LocalDate;
import java.util.List;

public interface VaccinazioneRepository extends JpaRepository<Vaccinazione, Long> {

    List<Vaccinazione> findByAnimale(Animale animale);

    List<Vaccinazione> findByAnimaleOrderByDataScadenzaAsc(Animale animale);

    List<Vaccinazione> findByDataScadenzaBefore(LocalDate data);

    List<Vaccinazione> findByAnimaleAndDataScadenzaBefore(Animale animale, LocalDate data);

    List<Vaccinazione> findByTipoVaccino(String tipoVaccino);

    List<Vaccinazione> findByAnimaleAndTipoVaccino(Animale animale, String tipoVaccino);

    @Query("SELECT COUNT(v) FROM Vaccinazione v WHERE v.dataScadenza > CURRENT_DATE")
    Long countValide();

    @Query("SELECT COUNT(v) FROM Vaccinazione v WHERE v.dataScadenza < CURRENT_DATE")
    Long countScadute();

    @Query(value = "SELECT COUNT(*) FROM vaccinazione v " +
            "WHERE v.data_scadenza BETWEEN CURRENT_DATE AND CURRENT_DATE + INTERVAL '30 days'", nativeQuery = true)
    Long countInScadenza();

}