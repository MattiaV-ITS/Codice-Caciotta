package it.codicecaciotta.iltuoveterinario.repositories;

import it.codicecaciotta.iltuoveterinario.models.OrarioBloccato;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

public interface OrarioBloccatoRepository extends JpaRepository<OrarioBloccato, Long> {

    // Find blocked times by specific date
    List<OrarioBloccato> findByData(LocalDate data);

    // Find blocked times in a date range
    @Query("SELECT o FROM OrarioBloccato o WHERE o.data BETWEEN :startDate AND :endDate ORDER BY o.data, o.oraInizio")
    List<OrarioBloccato> findByDataBetween(LocalDate startDate, LocalDate endDate);

    // Find all blocked times ordered by date and start time
    List<OrarioBloccato> findAllByOrderByDataAscOraInizioAsc();

    // Check if a time slot is already blocked
    boolean existsByDataAndOraInizioLessThanAndOraFineGreaterThan(
        LocalDate data, LocalTime oraInizio, LocalTime oraFine);

    // Find blocked times by date and ensure they don't overlap with existing ones
    @Query("SELECT o FROM OrarioBloccato o WHERE o.data = :data AND " +
           "((o.oraInizio <= :oraFine AND o.oraFine >= :oraInizio))")
    List<OrarioBloccato> findOverlappingBlockedTimes(
        LocalDate data, LocalTime oraInizio, LocalTime oraFine);
}